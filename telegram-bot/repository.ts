import { and, asc, eq, inArray, lt, lte, or, sql } from 'drizzle-orm';

import { telegramDeliveries, telegramSubscribers } from '../server/db/schema';
import type { Database } from '../server/db/client';
import { FOLLOW_UP_CONTENT_KEY } from './content';
import type {
  DeliveryClaimResult,
  ScheduledTelegramDelivery,
  TelegramSubscriberRecord,
  TelegramSubscriberRepository,
  TelegramUserProfile,
} from './types';

export class DrizzleTelegramSubscriberRepository implements TelegramSubscriberRepository {
  constructor(private readonly database: Database) {}

  async upsertFromStart(profile: TelegramUserProfile, startPayload?: string): Promise<TelegramSubscriberRecord> {
    const now = new Date();
    const [subscriber] = await this.database
      .insert(telegramSubscribers)
      .values({
        telegramUserId: profile.telegramUserId,
        chatId: profile.chatId,
        username: profile.username,
        firstName: profile.firstName,
        lastName: profile.lastName,
        languageCode: profile.languageCode,
        firstStartPayload: startPayload,
        latestStartPayload: startPayload,
        status: 'active',
        lastInteractionAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: telegramSubscribers.telegramUserId,
        set: {
          chatId: profile.chatId,
          username: profile.username,
          firstName: profile.firstName,
          lastName: profile.lastName,
          languageCode: profile.languageCode,
          latestStartPayload: startPayload,
          status: 'active',
          lastInteractionAt: now,
          blockedAt: null,
          updatedAt: now,
        },
      })
      .returning({ id: telegramSubscribers.id });

    return subscriber;
  }

  async claimDelivery(subscriberId: string, contentKey: string): Promise<DeliveryClaimResult> {
    const inserted = await this.database
      .insert(telegramDeliveries)
      .values({ subscriberId, contentKey })
      .onConflictDoNothing()
      .returning({ id: telegramDeliveries.id });
    if (inserted.length > 0) {
      return 'claimed';
    }

    const retryBefore = new Date(Date.now() - 60_000);
    const retried = await this.database
      .update(telegramDeliveries)
      .set({
        status: 'pending',
        attempts: sql`${telegramDeliveries.attempts} + 1`,
        lastError: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(telegramDeliveries.subscriberId, subscriberId),
          eq(telegramDeliveries.contentKey, contentKey),
          or(
            eq(telegramDeliveries.status, 'failed'),
            and(eq(telegramDeliveries.status, 'pending'), lt(telegramDeliveries.updatedAt, retryBefore)),
          ),
        ),
      )
      .returning({ id: telegramDeliveries.id });
    if (retried.length > 0) {
      return 'claimed';
    }

    const [delivery] = await this.database
      .select({ status: telegramDeliveries.status })
      .from(telegramDeliveries)
      .where(and(eq(telegramDeliveries.subscriberId, subscriberId), eq(telegramDeliveries.contentKey, contentKey)))
      .limit(1);
    return delivery?.status === 'sent' ? 'already_sent' : 'in_progress';
  }

  async markDeliverySent(subscriberId: string, contentKey: string, telegramMessageId: number): Promise<void> {
    await this.database
      .update(telegramDeliveries)
      .set({
        status: 'sent',
        telegramMessageId,
        sentAt: new Date(),
        lastError: null,
        updatedAt: new Date(),
      })
      .where(and(eq(telegramDeliveries.subscriberId, subscriberId), eq(telegramDeliveries.contentKey, contentKey)));
  }

  async markMeditationSentAndScheduleFollowUp(
    subscriberId: string,
    meditationContentKey: string,
    telegramMessageId: number,
    followUpContentKey: string,
    scheduledAt: Date,
  ): Promise<void> {
    await this.database.transaction(async (transaction) => {
      await transaction
        .update(telegramDeliveries)
        .set({
          status: 'sent',
          telegramMessageId,
          sentAt: new Date(),
          lastError: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(telegramDeliveries.subscriberId, subscriberId),
            eq(telegramDeliveries.contentKey, meditationContentKey),
          ),
        );
      await transaction
        .insert(telegramDeliveries)
        .values({
          subscriberId,
          contentKey: followUpContentKey,
          status: 'pending',
          attempts: 0,
          scheduledAt,
        })
        .onConflictDoNothing();
    });
  }

  async markDeliveryFailed(subscriberId: string, contentKey: string, errorMessage: string): Promise<void> {
    await this.database
      .update(telegramDeliveries)
      .set({ status: 'failed', lastError: errorMessage.slice(0, 2_000), updatedAt: new Date() })
      .where(and(eq(telegramDeliveries.subscriberId, subscriberId), eq(telegramDeliveries.contentKey, contentKey)));
  }

  async claimDueDeliveries(limit: number): Promise<readonly ScheduledTelegramDelivery[]> {
    return this.database.transaction(async (transaction) => {
      const retryBefore = new Date(Date.now() - 5 * 60_000);
      await transaction
        .update(telegramDeliveries)
        .set({ status: 'pending', updatedAt: new Date() })
        .where(and(eq(telegramDeliveries.status, 'processing'), lt(telegramDeliveries.updatedAt, retryBefore)));

      const deliveries = await transaction
        .select({
          id: telegramDeliveries.id,
          subscriberId: telegramDeliveries.subscriberId,
          chatId: telegramSubscribers.chatId,
          attempts: telegramDeliveries.attempts,
        })
        .from(telegramDeliveries)
        .innerJoin(telegramSubscribers, eq(telegramSubscribers.id, telegramDeliveries.subscriberId))
        .where(
          and(
            eq(telegramDeliveries.status, 'pending'),
            eq(telegramDeliveries.contentKey, FOLLOW_UP_CONTENT_KEY),
            lte(telegramDeliveries.scheduledAt, new Date()),
            eq(telegramSubscribers.status, 'active'),
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
          updatedAt: new Date(),
        })
        .where(inArray(telegramDeliveries.id, deliveries.map((delivery) => delivery.id)));

      return deliveries.map((delivery) => ({ ...delivery, attempts: delivery.attempts + 1 }));
    });
  }

  async markScheduledDeliverySent(deliveryId: string, telegramMessageId: number): Promise<void> {
    await this.database
      .update(telegramDeliveries)
      .set({
        status: 'sent',
        telegramMessageId,
        sentAt: new Date(),
        lastError: null,
        updatedAt: new Date(),
      })
      .where(eq(telegramDeliveries.id, deliveryId));
  }

  async rescheduleDelivery(deliveryId: string, errorMessage: string, scheduledAt: Date): Promise<void> {
    await this.database
      .update(telegramDeliveries)
      .set({
        status: 'pending',
        scheduledAt,
        lastError: errorMessage.slice(0, 2_000),
        updatedAt: new Date(),
      })
      .where(eq(telegramDeliveries.id, deliveryId));
  }

  async markScheduledDeliveryFailed(deliveryId: string, errorMessage: string): Promise<void> {
    await this.database
      .update(telegramDeliveries)
      .set({ status: 'failed', lastError: errorMessage.slice(0, 2_000), updatedAt: new Date() })
      .where(eq(telegramDeliveries.id, deliveryId));
  }

  async markBlocked(subscriberId: string): Promise<void> {
    await this.database
      .update(telegramSubscribers)
      .set({ status: 'blocked', blockedAt: new Date(), updatedAt: new Date() })
      .where(eq(telegramSubscribers.id, subscriberId));
  }
}
