import { and, asc, eq, inArray, lt, lte, ne, notExists, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import type { Database } from '../server/db/client';
import {
  telegramDeliveries,
  telegramFunnelEnrollments,
  telegramSubscribers,
  telegramUpdates,
} from '../server/db/schema';
import type {
  DeliveryCompletion,
  ScheduledTelegramDelivery,
  TelegramFunnelPlan,
  TelegramFunnelStore,
  TelegramStartInput,
} from './types';

const PROCESSING_LEASE_MS = 5 * 60_000;
const priorTelegramDelivery = alias(telegramDeliveries, 'prior_telegram_delivery');

export class DrizzleTelegramFunnelStore implements TelegramFunnelStore {
  constructor(private readonly database: Database) {}

  async enrollFromStart(
    input: TelegramStartInput,
    plan: TelegramFunnelPlan,
  ): Promise<'enrolled' | 'duplicate_update'> {
    return this.database.transaction(async (transaction) => {
      const acceptedUpdate = await transaction
        .insert(telegramUpdates)
        .values({ updateId: input.updateId })
        .onConflictDoNothing()
        .returning({ updateId: telegramUpdates.updateId });
      if (acceptedUpdate.length === 0) {
        return 'duplicate_update';
      }

      const now = new Date();
      const [subscriber] = await transaction
        .insert(telegramSubscribers)
        .values({
          telegramUserId: input.profile.telegramUserId,
          chatId: input.profile.chatId,
          username: input.profile.username,
          firstName: input.profile.firstName,
          lastName: input.profile.lastName,
          languageCode: input.profile.languageCode,
          firstStartPayload: input.startPayload,
          latestStartPayload: input.startPayload,
          status: 'active',
          lastInteractionAt: now,
          updatedAt: now,
        })
        .onConflictDoUpdate({
          target: telegramSubscribers.telegramUserId,
          set: {
            chatId: input.profile.chatId,
            username: input.profile.username,
            firstName: input.profile.firstName,
            lastName: input.profile.lastName,
            languageCode: input.profile.languageCode,
            latestStartPayload: input.startPayload,
            status: 'active',
            lastInteractionAt: now,
            blockedAt: null,
            updatedAt: now,
          },
        })
        .returning({ id: telegramSubscribers.id });

      const [newEnrollment] = await transaction
        .insert(telegramFunnelEnrollments)
        .values({
          subscriberId: subscriber.id,
          funnelKey: plan.key,
          funnelVersion: plan.version,
          startedAt: now,
        })
        .onConflictDoNothing()
        .returning({
          id: telegramFunnelEnrollments.id,
          startedAt: telegramFunnelEnrollments.startedAt,
        });

      if (newEnrollment) {
        await transaction
          .insert(telegramDeliveries)
          .values(
            plan.steps.map((step, stepOrder) => ({
              enrollmentId: newEnrollment.id,
              contentKey: step.contentKey,
              stepOrder,
              scheduledAt: new Date(newEnrollment.startedAt.getTime() + step.delayMs),
            })),
          );
      }

      return 'enrolled';
    });
  }

  async claimDueDeliveries(
    plan: TelegramFunnelPlan,
    limit: number,
  ): Promise<readonly ScheduledTelegramDelivery[]> {
    const contentKeys = plan.steps.map((step) => step.contentKey);
    if (contentKeys.length === 0) {
      return [];
    }

    return this.database.transaction(async (transaction) => {
      const now = new Date();
      const retryBefore = new Date(now.getTime() - PROCESSING_LEASE_MS);
      const planEnrollmentIds = transaction
        .select({ id: telegramFunnelEnrollments.id })
        .from(telegramFunnelEnrollments)
        .where(
          and(
            eq(telegramFunnelEnrollments.funnelKey, plan.key),
            eq(telegramFunnelEnrollments.funnelVersion, plan.version),
          ),
        );
      await transaction
        .update(telegramDeliveries)
        .set({
          status: 'ambiguous',
          lastError: 'Delivery worker stopped while Telegram request may have been in flight',
          updatedAt: now,
        })
        .where(
          and(
            eq(telegramDeliveries.status, 'processing'),
            inArray(telegramDeliveries.enrollmentId, planEnrollmentIds),
            inArray(telegramDeliveries.contentKey, [...contentKeys]),
            lt(telegramDeliveries.updatedAt, retryBefore),
          ),
        );

      const deliveries = await transaction
        .select({
          id: telegramDeliveries.id,
          subscriberId: telegramFunnelEnrollments.subscriberId,
          chatId: telegramSubscribers.chatId,
          contentKey: telegramDeliveries.contentKey,
          attempts: telegramDeliveries.attempts,
        })
        .from(telegramDeliveries)
        .innerJoin(
          telegramFunnelEnrollments,
          eq(telegramFunnelEnrollments.id, telegramDeliveries.enrollmentId),
        )
        .innerJoin(telegramSubscribers, eq(telegramSubscribers.id, telegramFunnelEnrollments.subscriberId))
        .where(
          and(
            eq(telegramDeliveries.status, 'pending'),
            inArray(telegramDeliveries.contentKey, [...contentKeys]),
            lte(telegramDeliveries.scheduledAt, now),
            eq(telegramFunnelEnrollments.funnelKey, plan.key),
            eq(telegramFunnelEnrollments.funnelVersion, plan.version),
            eq(telegramFunnelEnrollments.status, 'active'),
            eq(telegramSubscribers.status, 'active'),
            notExists(
              transaction
                .select({ id: priorTelegramDelivery.id })
                .from(priorTelegramDelivery)
                .where(
                  and(
                    eq(priorTelegramDelivery.enrollmentId, telegramDeliveries.enrollmentId),
                    lt(priorTelegramDelivery.stepOrder, telegramDeliveries.stepOrder),
                    ne(priorTelegramDelivery.status, 'sent'),
                  ),
                ),
            ),
          ),
        )
        .orderBy(asc(telegramDeliveries.scheduledAt))
        .limit(limit)
        .for('update', { of: telegramDeliveries, skipLocked: true });
      if (deliveries.length === 0) {
        return [];
      }

      await transaction
        .update(telegramDeliveries)
        .set({
          status: 'processing',
          attempts: sql`${telegramDeliveries.attempts} + 1`,
          updatedAt: now,
        })
        .where(inArray(telegramDeliveries.id, deliveries.map((delivery) => delivery.id)));

      return deliveries.map((delivery) => ({ ...delivery, attempts: delivery.attempts + 1 }));
    });
  }

  async completeDelivery(
    deliveryId: string,
    subscriberId: string,
    completion: DeliveryCompletion,
  ): Promise<void> {
    await this.database.transaction(async (transaction) => {
      const now = new Date();
      const errorMessage = 'errorMessage' in completion ? completion.errorMessage.slice(0, 2_000) : null;
      const values =
        completion.status === 'sent'
          ? {
              status: 'sent' as const,
              telegramMessageId: completion.telegramMessageId,
              sentAt: now,
              lastError: null,
              updatedAt: now,
            }
          : completion.status === 'retry'
            ? {
                status: 'pending' as const,
                scheduledAt: completion.scheduledAt,
                lastError: errorMessage,
                updatedAt: now,
              }
            : {
                status: completion.status,
                lastError: errorMessage,
                updatedAt: now,
              };

      const [delivery] = await transaction
        .update(telegramDeliveries)
        .set(values)
        .where(and(eq(telegramDeliveries.id, deliveryId), eq(telegramDeliveries.status, 'processing')))
        .returning({ enrollmentId: telegramDeliveries.enrollmentId });
      if (!delivery) {
        throw new Error(`Telegram delivery ${deliveryId} is no longer processing`);
      }

      if (completion.status === 'failed' && completion.blockSubscriber) {
        await transaction
          .update(telegramSubscribers)
          .set({ status: 'blocked', blockedAt: now, updatedAt: now })
          .where(eq(telegramSubscribers.id, subscriberId));
      }

      if (completion.status === 'sent') {
        const [unfinishedDelivery] = await transaction
          .select({ id: telegramDeliveries.id })
          .from(telegramDeliveries)
          .where(
            and(
              eq(telegramDeliveries.enrollmentId, delivery.enrollmentId),
              ne(telegramDeliveries.status, 'sent'),
            ),
          )
          .limit(1);
        if (!unfinishedDelivery) {
          await transaction
            .update(telegramFunnelEnrollments)
            .set({ status: 'completed', completedAt: now, updatedAt: now })
            .where(eq(telegramFunnelEnrollments.id, delivery.enrollmentId));
        }
      }
    });
  }
}
