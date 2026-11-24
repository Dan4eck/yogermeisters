import { and, asc, desc, eq, inArray, lt, lte, ne, notExists, or, sql } from 'drizzle-orm';
import { alias } from 'drizzle-orm/pg-core';

import type { CmsScenarioButton, TelegramMediaType, TelegramParseMode } from '@shared/cms';

import { collectInitialAutoSteps } from '../server/cms-repository';
import type { Database } from '../server/db/client';
import {
  telegramBroadcastDeliveries,
  telegramBroadcasts,
  telegramDeliveries,
  telegramFunnelEnrollments,
  telegramMediaAssets,
  telegramScenarios,
  telegramScenarioSteps,
  telegramSubscribers,
  telegramUpdates,
} from '../server/db/schema';
import { TelegramApiError, TelegramTransportError } from './telegram-api';
import type {
  TelegramCallbackInput,
  TelegramClient,
  TelegramFunnel,
  TelegramInlineButton,
  TelegramStartInput,
} from './types';

const SCENARIO_CALLBACK_PREFIX = 'sc:';
const PROCESSING_LEASE_MS = 5 * 60_000;
const BATCH_SIZE = 20;
const MAX_ATTEMPTS = 5;
const priorDelivery = alias(telegramDeliveries, 'prior_cms_delivery');

export interface DynamicBotMediaEnv {
  readonly meditationAudio?: string;
  readonly nidraAudio?: string;
}

export interface DynamicBotRouterDependencies {
  readonly database: Database;
  readonly fallbackFunnel: TelegramFunnel;
  readonly telegramClient: TelegramClient;
  readonly mediaEnv?: DynamicBotMediaEnv;
  readonly logError?: (message: string) => void;
  readonly now?: () => Date;
}

export function createDynamicBotRouter(dependencies: DynamicBotRouterDependencies): TelegramFunnel {
  const { database, fallbackFunnel, telegramClient, mediaEnv, logError } = dependencies;
  const now = dependencies.now ?? (() => new Date());

  return {
    async acceptStart(input: TelegramStartInput): Promise<void> {
      await handleCmsStart(database, input, now());
    },

    async acceptCallback(input: TelegramCallbackInput): Promise<void> {
      if (input.data.startsWith(SCENARIO_CALLBACK_PREFIX)) {
        await handleDynamicScenarioCallback(database, input, now());
        try {
          await telegramClient.answerCallbackQuery?.(input.callbackId);
        } catch (error) {
          logError?.(error instanceof Error ? error.message : 'Could not acknowledge scenario button');
        }
        return;
      }
      if (fallbackFunnel.acceptCallback) {
        await fallbackFunnel.acceptCallback(input);
      }
    },

    async runDueBatch(): Promise<number> {
      const [fallbackCount, scenarioCount, broadcastCount] = await Promise.all([
        fallbackFunnel.runDueBatch(),
        runDynamicScenarioBatch(database, telegramClient, now, mediaEnv, logError),
        runBroadcastBatch(database, telegramClient, now, mediaEnv, logError),
      ]);
      return fallbackCount + scenarioCount + broadcastCount;
    },
  };
}

async function handleCmsStart(
  database: Database,
  input: TelegramStartInput,
  currentTime: Date,
): Promise<void> {
  const payload = input.startPayload;

  await database.transaction(async (tx) => {
    const acceptedUpdate = await tx
      .insert(telegramUpdates)
      .values({ updateId: input.updateId })
      .onConflictDoNothing()
      .returning({ updateId: telegramUpdates.updateId });
    if (acceptedUpdate.length === 0) {
      return;
    }

    const [subscriber] = await tx
      .insert(telegramSubscribers)
      .values({
        telegramUserId: input.profile.telegramUserId,
        chatId: input.profile.chatId,
        username: input.profile.username,
        firstName: input.profile.firstName,
        lastName: input.profile.lastName,
        languageCode: input.profile.languageCode,
        firstStartPayload: payload,
        latestStartPayload: payload,
        status: 'active',
        lastInteractionAt: currentTime,
        updatedAt: currentTime,
      })
      .onConflictDoUpdate({
        target: telegramSubscribers.telegramUserId,
        set: {
          chatId: input.profile.chatId,
          username: input.profile.username,
          firstName: input.profile.firstName,
          lastName: input.profile.lastName,
          languageCode: input.profile.languageCode,
          latestStartPayload: payload,
          status: 'active',
          lastInteractionAt: currentTime,
          blockedAt: null,
          updatedAt: currentTime,
        },
      })
      .returning({ id: telegramSubscribers.id });

    const [scenario] = payload
      ? await tx
          .select()
          .from(telegramScenarios)
          .where(and(eq(telegramScenarios.startPayload, payload), eq(telegramScenarios.status, 'active')))
          .limit(1)
      : await tx
          .select()
          .from(telegramScenarios)
          .where(and(eq(telegramScenarios.isDefault, true), eq(telegramScenarios.status, 'active')))
          .limit(1);

    if (!scenario) {
      return;
    }

    const funnelKey = `scenario:${scenario.slug}`;
    if (scenario.restartOnStart) {
      await tx
        .update(telegramFunnelEnrollments)
        .set({ status: 'cancelled', updatedAt: currentTime })
        .where(
          and(
            eq(telegramFunnelEnrollments.subscriberId, subscriber.id),
            eq(telegramFunnelEnrollments.funnelKey, funnelKey),
            eq(telegramFunnelEnrollments.funnelVersion, 'cms'),
            eq(telegramFunnelEnrollments.status, 'active'),
          ),
        );
    } else {
      const [existing] = await tx
        .select({ id: telegramFunnelEnrollments.id })
        .from(telegramFunnelEnrollments)
        .where(
          and(
            eq(telegramFunnelEnrollments.subscriberId, subscriber.id),
            eq(telegramFunnelEnrollments.funnelKey, funnelKey),
            eq(telegramFunnelEnrollments.funnelVersion, 'cms'),
          ),
        )
        .limit(1);
      if (existing) {
        return;
      }
    }

    const steps = await tx
      .select()
      .from(telegramScenarioSteps)
      .where(eq(telegramScenarioSteps.scenarioId, scenario.id))
      .orderBy(asc(telegramScenarioSteps.stepOrder));

    const [enrollment] = await tx
      .insert(telegramFunnelEnrollments)
      .values({
        subscriberId: subscriber.id,
        funnelKey,
        funnelVersion: 'cms',
        startedAt: currentTime,
      })
      .returning({ id: telegramFunnelEnrollments.id, startedAt: telegramFunnelEnrollments.startedAt });

    if (enrollment) {
      const initialSteps = collectInitialAutoSteps(steps);
      if (initialSteps.length > 0) {
        await tx.insert(telegramDeliveries).values(
          initialSteps.map((step, index) => ({
            enrollmentId: enrollment.id,
            contentKey: step.stepKey,
            stepOrder: index,
            scheduledAt: new Date(enrollment.startedAt.getTime() + step.delayMinutes * 60_000),
          })),
        );
      }
    }
  });
}

async function handleDynamicScenarioCallback(
  database: Database,
  input: TelegramCallbackInput,
  currentTime: Date,
): Promise<void> {
  const parts = input.data.split(':');
  if (parts.length !== 3 || parts[0] !== 'sc') return;
  const [, scenarioPrefix, targetStepKey] = parts;
  if (!scenarioPrefix || !targetStepKey) return;

  await database.transaction(async (tx) => {
    const accepted = await tx
      .insert(telegramUpdates)
      .values({ updateId: input.updateId })
      .onConflictDoNothing()
      .returning({ updateId: telegramUpdates.updateId });
    if (accepted.length === 0) return;

    const matchingScenarios = await tx
      .select()
      .from(telegramScenarios)
      .where(eq(telegramScenarios.status, 'active'));

    const scenario = matchingScenarios.find((item) => item.id.startsWith(scenarioPrefix));
    if (!scenario) return;

    const funnelKey = `scenario:${scenario.slug}`;
    const [enrollment] = await tx
      .select({
        id: telegramFunnelEnrollments.id,
        subscriberId: telegramSubscribers.id,
      })
      .from(telegramFunnelEnrollments)
      .innerJoin(telegramSubscribers, eq(telegramSubscribers.id, telegramFunnelEnrollments.subscriberId))
      .where(
        and(
          eq(telegramSubscribers.telegramUserId, input.telegramUserId),
          eq(telegramSubscribers.chatId, input.chatId),
          eq(telegramSubscribers.status, 'active'),
          eq(telegramFunnelEnrollments.funnelKey, funnelKey),
          eq(telegramFunnelEnrollments.funnelVersion, 'cms'),
          eq(telegramFunnelEnrollments.status, 'active'),
        ),
      )
      .for('update', { of: telegramFunnelEnrollments });

    if (!enrollment) return;

    const steps = await tx
      .select()
      .from(telegramScenarioSteps)
      .where(eq(telegramScenarioSteps.scenarioId, scenario.id))
      .orderBy(asc(telegramScenarioSteps.stepOrder));

    const targetIndex = steps.findIndex((step) => step.stepKey === targetStepKey);
    if (targetIndex < 0) return;

    const stepsToQueue: typeof steps = [steps[targetIndex]];
    for (let i = targetIndex + 1; i < steps.length; i += 1) {
      if (steps[i].triggerType !== 'delay') break;
      stepsToQueue.push(steps[i]);
    }

    await tx
      .update(telegramSubscribers)
      .set({ lastInteractionAt: currentTime, updatedAt: currentTime })
      .where(eq(telegramSubscribers.id, enrollment.subscriberId));

    const existing = await tx
      .select({ contentKey: telegramDeliveries.contentKey, stepOrder: telegramDeliveries.stepOrder })
      .from(telegramDeliveries)
      .where(eq(telegramDeliveries.enrollmentId, enrollment.id))
      .orderBy(desc(telegramDeliveries.stepOrder));

    const existingKeys = new Set(existing.map((item) => item.contentKey));
    const freshSteps = stepsToQueue.filter((step) => !existingKeys.has(step.stepKey));
    if (freshSteps.length === 0) return;

    const baseOrder = existing[0]?.stepOrder ?? -1;
    await tx.insert(telegramDeliveries).values(
      freshSteps.map((step, idx) => ({
        enrollmentId: enrollment.id,
        contentKey: step.stepKey,
        stepOrder: baseOrder + idx + 1,
        scheduledAt: new Date(currentTime.getTime() + (idx === 0 ? 0 : step.delayMinutes * 60_000)),
      })),
    );
  });
}

async function runDynamicScenarioBatch(
  database: Database,
  telegramClient: TelegramClient,
  now: () => Date,
  mediaEnv?: DynamicBotMediaEnv,
  logError?: (message: string) => void,
): Promise<number> {
  const claimed = await database.transaction(async (tx) => {
    const currentTime = now();
    const retryBefore = new Date(currentTime.getTime() - PROCESSING_LEASE_MS);

    const cmsEnrollmentIds = tx
      .select({ id: telegramFunnelEnrollments.id })
      .from(telegramFunnelEnrollments)
      .where(eq(telegramFunnelEnrollments.funnelVersion, 'cms'));

    await tx
      .update(telegramDeliveries)
      .set({
        status: 'ambiguous',
        lastError: 'Delivery worker stopped while Telegram request may have been in flight',
        updatedAt: currentTime,
      })
      .where(
        and(
          eq(telegramDeliveries.status, 'processing'),
          inArray(telegramDeliveries.enrollmentId, cmsEnrollmentIds),
          lt(telegramDeliveries.updatedAt, retryBefore),
        ),
      );

    const rows = await tx
      .select({
        id: telegramDeliveries.id,
        enrollmentId: telegramDeliveries.enrollmentId,
        subscriberId: telegramFunnelEnrollments.subscriberId,
        funnelKey: telegramFunnelEnrollments.funnelKey,
        chatId: telegramSubscribers.chatId,
        contentKey: telegramDeliveries.contentKey,
        attempts: telegramDeliveries.attempts,
      })
      .from(telegramDeliveries)
      .innerJoin(telegramFunnelEnrollments, eq(telegramFunnelEnrollments.id, telegramDeliveries.enrollmentId))
      .innerJoin(telegramSubscribers, eq(telegramSubscribers.id, telegramFunnelEnrollments.subscriberId))
      .where(
        and(
          eq(telegramDeliveries.status, 'pending'),
          lte(telegramDeliveries.scheduledAt, currentTime),
          eq(telegramFunnelEnrollments.funnelVersion, 'cms'),
          eq(telegramFunnelEnrollments.status, 'active'),
          eq(telegramSubscribers.status, 'active'),
          notExists(
            tx
              .select({ id: priorDelivery.id })
              .from(priorDelivery)
              .where(
                and(
                  eq(priorDelivery.enrollmentId, telegramDeliveries.enrollmentId),
                  lt(priorDelivery.stepOrder, telegramDeliveries.stepOrder),
                  ne(priorDelivery.status, 'sent'),
                ),
              ),
          ),
        ),
      )
      .orderBy(asc(telegramDeliveries.scheduledAt))
      .limit(BATCH_SIZE)
      .for('update', { of: telegramDeliveries, skipLocked: true });

    if (rows.length === 0) return [];

    await tx
      .update(telegramDeliveries)
      .set({
        status: 'processing',
        attempts: sql`${telegramDeliveries.attempts} + 1`,
        updatedAt: currentTime,
      })
      .where(inArray(telegramDeliveries.id, rows.map((row) => row.id)));

    return rows.map((row) => ({ ...row, attempts: row.attempts + 1 }));
  });

  if (claimed.length === 0) return 0;

  for (const delivery of claimed) {
    try {
      const slug = delivery.funnelKey.startsWith('scenario:') ? delivery.funnelKey.slice('scenario:'.length) : '';
      const [scenario] = await database
        .select()
        .from(telegramScenarios)
        .where(eq(telegramScenarios.slug, slug))
        .limit(1);

      if (!scenario) {
        await completeScenarioDelivery(database, delivery.id, delivery.subscriberId, {
          status: 'failed',
          errorMessage: `Scenario not found: ${delivery.funnelKey}`,
        }, now());
        continue;
      }

      const [step] = await database
        .select()
        .from(telegramScenarioSteps)
        .where(
          and(
            eq(telegramScenarioSteps.scenarioId, scenario.id),
            eq(telegramScenarioSteps.stepKey, delivery.contentKey),
          ),
        )
        .limit(1);

      if (!step) {
        await completeScenarioDelivery(database, delivery.id, delivery.subscriberId, {
          status: 'failed',
          errorMessage: `Scenario step not found: ${delivery.contentKey}`,
        }, now());
        continue;
      }

      const buttons = buildScenarioInlineButtons(scenario.id, step.buttons);
      const telegramMessageId = await sendRichTelegramMessage({
        database,
        telegramClient,
        chatId: delivery.chatId,
        text: step.messageText,
        parseMode: step.parseMode,
        mediaAssetId: step.mediaAssetId,
        mediaUrl: step.mediaUrl,
        mediaType: step.mediaType,
        mediaEnv,
        buttons,
      });

      const hasInteractiveButtons = step.buttons.some((row) => row.some((button) => Boolean(button.nextStepKey)));
      await completeScenarioDelivery(
        database,
        delivery.id,
        delivery.subscriberId,
        { status: 'sent', telegramMessageId, keepEnrollmentOpen: hasInteractiveButtons },
        now(),
      );
    } catch (error) {
      await handleDeliveryFailure(
        error,
        delivery.attempts,
        now(),
        async (outcome) => completeScenarioDelivery(database, delivery.id, delivery.subscriberId, outcome, now()),
        logError,
      );
    }
  }

  return claimed.length;
}

async function runBroadcastBatch(
  database: Database,
  telegramClient: TelegramClient,
  now: () => Date,
  mediaEnv?: DynamicBotMediaEnv,
  logError?: (message: string) => void,
): Promise<number> {
  const claimed = await database.transaction(async (tx) => {
    const currentTime = now();
    const retryBefore = new Date(currentTime.getTime() - PROCESSING_LEASE_MS);

    await tx
      .update(telegramBroadcastDeliveries)
      .set({
        status: 'ambiguous',
        lastError: 'Delivery worker stopped while Telegram request may have been in flight',
        updatedAt: currentTime,
      })
      .where(
        and(
          eq(telegramBroadcastDeliveries.status, 'processing'),
          lt(telegramBroadcastDeliveries.updatedAt, retryBefore),
        ),
      );

    const rows = await tx
      .select({
        id: telegramBroadcastDeliveries.id,
        broadcastId: telegramBroadcastDeliveries.broadcastId,
        subscriberId: telegramBroadcastDeliveries.subscriberId,
        isTest: telegramBroadcastDeliveries.isTest,
        attempts: telegramBroadcastDeliveries.attempts,
        chatId: telegramSubscribers.chatId,
        broadcastStatus: telegramBroadcasts.status,
      })
      .from(telegramBroadcastDeliveries)
      .innerJoin(telegramBroadcasts, eq(telegramBroadcasts.id, telegramBroadcastDeliveries.broadcastId))
      .innerJoin(telegramSubscribers, eq(telegramSubscribers.id, telegramBroadcastDeliveries.subscriberId))
      .where(
        and(
          eq(telegramBroadcastDeliveries.status, 'pending'),
          lte(telegramBroadcastDeliveries.scheduledAt, currentTime),
          eq(telegramSubscribers.status, 'active'),
          or(
            eq(telegramBroadcastDeliveries.isTest, true),
            inArray(telegramBroadcasts.status, ['scheduled', 'sending']),
          ),
        ),
      )
      .orderBy(asc(telegramBroadcastDeliveries.scheduledAt))
      .limit(BATCH_SIZE)
      .for('update', { of: telegramBroadcastDeliveries, skipLocked: true });

    if (rows.length === 0) return [];

    await tx
      .update(telegramBroadcastDeliveries)
      .set({
        status: 'processing',
        attempts: sql`${telegramBroadcastDeliveries.attempts} + 1`,
        updatedAt: currentTime,
      })
      .where(inArray(telegramBroadcastDeliveries.id, rows.map((row) => row.id)));

    const scheduledBroadcastIds = Array.from(
      new Set(rows.filter((row) => !row.isTest && row.broadcastStatus === 'scheduled').map((row) => row.broadcastId)),
    );
    if (scheduledBroadcastIds.length > 0) {
      await tx
        .update(telegramBroadcasts)
        .set({ status: 'sending', startedAt: currentTime, updatedAt: currentTime })
        .where(inArray(telegramBroadcasts.id, scheduledBroadcastIds));
    }

    return rows.map((row) => ({ ...row, attempts: row.attempts + 1 }));
  });

  if (claimed.length === 0) return 0;

  const touchedBroadcastIds = new Set<string>();

  for (const delivery of claimed) {
    if (!delivery.isTest) {
      touchedBroadcastIds.add(delivery.broadcastId);
    }

    try {
      const [broadcast] = await database
        .select()
        .from(telegramBroadcasts)
        .where(eq(telegramBroadcasts.id, delivery.broadcastId))
        .limit(1);

      if (!broadcast) {
        await completeBroadcastDelivery(database, delivery.id, delivery.subscriberId, {
          status: 'failed',
          errorMessage: 'Broadcast record not found',
        }, now());
        continue;
      }

      const buttons: readonly (readonly TelegramInlineButton[])[] = broadcast.buttons.map((row) =>
        row.map((btn) => ({ text: btn.text, url: btn.url })),
      );

      const telegramMessageId = await sendRichTelegramMessage({
        database,
        telegramClient,
        chatId: delivery.chatId,
        text: broadcast.messageText,
        parseMode: broadcast.parseMode,
        mediaAssetId: broadcast.mediaAssetId,
        mediaUrl: broadcast.mediaUrl,
        mediaType: broadcast.mediaType,
        mediaEnv,
        buttons,
      });

      await completeBroadcastDelivery(
        database,
        delivery.id,
        delivery.subscriberId,
        { status: 'sent', telegramMessageId },
        now(),
      );
    } catch (error) {
      await handleDeliveryFailure(
        error,
        delivery.attempts,
        now(),
        async (outcome) => completeBroadcastDelivery(database, delivery.id, delivery.subscriberId, outcome, now()),
        logError,
      );
    }
  }

  for (const broadcastId of Array.from(touchedBroadcastIds)) {
    await finalizeBroadcastIfDone(database, broadcastId, now());
  }

  return claimed.length;
}

async function sendRichTelegramMessage(params: {
  readonly database: Database;
  readonly telegramClient: TelegramClient;
  readonly chatId: number;
  readonly text: string;
  readonly parseMode: TelegramParseMode;
  readonly mediaAssetId: string | null;
  readonly mediaUrl: string | null;
  readonly mediaType: TelegramMediaType | null;
  readonly mediaEnv?: DynamicBotMediaEnv;
  readonly buttons: readonly (readonly TelegramInlineButton[])[];
}): Promise<number> {
  const { database, telegramClient, chatId, text, mediaAssetId, mediaUrl, mediaType, mediaEnv, buttons } = params;
  const parseMode = params.parseMode === 'HTML' ? 'HTML' : undefined;
  const keyboard = buttons.length > 0 ? buttons : undefined;

  if (mediaAssetId) {
    const [asset] = await database
      .select()
      .from(telegramMediaAssets)
      .where(eq(telegramMediaAssets.id, mediaAssetId))
      .limit(1);

    if (!asset) {
      throw new Error(`Media asset ${mediaAssetId} not found`);
    }

    if (asset.telegramFileId && telegramClient.sendPhoto) {
      return telegramClient.sendPhoto(chatId, asset.telegramFileId, text, keyboard, parseMode);
    }

    if (!telegramClient.sendPhotoBuffer) {
      throw new Error('Telegram photo upload client is unavailable');
    }

    const uploaded = await telegramClient.sendPhotoBuffer(
      chatId,
      Buffer.from(asset.dataBase64, 'base64'),
      asset.filename,
      asset.mimeType,
      text,
      keyboard,
      parseMode,
    );

    if (uploaded.fileId) {
      await database
        .update(telegramMediaAssets)
        .set({ telegramFileId: uploaded.fileId })
        .where(eq(telegramMediaAssets.id, asset.id));
    }

    return uploaded.messageId;
  }

  const resolvedMediaUrl = resolveMediaPlaceholder(mediaUrl, mediaEnv);
  if (resolvedMediaUrl) {
    if (mediaType === 'audio') {
      return telegramClient.sendAudio(chatId, resolvedMediaUrl, text, undefined, keyboard, parseMode);
    }
    if (mediaType === 'video') {
      if (!telegramClient.sendVideo) throw new Error('Telegram video client is unavailable');
      return telegramClient.sendVideo(chatId, resolvedMediaUrl, text, keyboard, parseMode);
    }
    if (!telegramClient.sendPhoto) throw new Error('Telegram photo client is unavailable');
    return telegramClient.sendPhoto(chatId, resolvedMediaUrl, text, keyboard, parseMode);
  }

  return telegramClient.sendMessage(chatId, text, keyboard, parseMode);
}

function resolveMediaPlaceholder(mediaUrl: string | null, mediaEnv?: DynamicBotMediaEnv): string | null {
  if (!mediaUrl) return null;
  if (mediaUrl === 'env:MEDITATION_AUDIO') return mediaEnv?.meditationAudio ?? null;
  if (mediaUrl === 'env:PERSONAL_PRACTICE_NIDRA_AUDIO') return mediaEnv?.nidraAudio ?? null;
  return mediaUrl;
}

function buildScenarioInlineButtons(
  scenarioId: string,
  buttons: readonly (readonly CmsScenarioButton[])[],
): readonly (readonly TelegramInlineButton[])[] {
  const prefix = scenarioId.slice(0, 8);
  return buttons.map((row) =>
    row.map((btn): TelegramInlineButton => {
      if (btn.url) {
        return { text: btn.text, url: btn.url };
      }
      return { text: btn.text, callback_data: `${SCENARIO_CALLBACK_PREFIX}${prefix}:${btn.nextStepKey}` };
    }),
  );
}

type FailureOutcome =
  | { readonly status: 'sent'; readonly telegramMessageId: number; readonly keepEnrollmentOpen?: boolean }
  | { readonly status: 'retry'; readonly errorMessage: string; readonly scheduledAt: Date }
  | { readonly status: 'failed'; readonly errorMessage: string; readonly blockSubscriber?: boolean }
  | { readonly status: 'ambiguous'; readonly errorMessage: string };

async function handleDeliveryFailure(
  error: unknown,
  attempts: number,
  currentTime: Date,
  commit: (outcome: FailureOutcome) => Promise<void>,
  logError?: (message: string) => void,
): Promise<void> {
  const errorMessage = error instanceof Error ? error.message : 'Unknown Telegram delivery error';
  if (error instanceof TelegramTransportError) {
    await commit({ status: 'ambiguous', errorMessage });
    return;
  }
  if (error instanceof TelegramApiError && (error.status === 403 || error.errorCode === 403)) {
    await commit({ status: 'failed', errorMessage, blockSubscriber: true });
    return;
  }
  if (error instanceof TelegramApiError && error.status >= 400 && error.status < 500 && error.status !== 429) {
    await commit({ status: 'failed', errorMessage });
    return;
  }
  if (!(error instanceof TelegramApiError)) {
    logError?.(errorMessage);
    await commit({ status: 'ambiguous', errorMessage });
    return;
  }
  if (attempts >= MAX_ATTEMPTS) {
    await commit({ status: 'failed', errorMessage });
    return;
  }
  const retryDelayMs = error.retryAfterSeconds
    ? error.retryAfterSeconds * 1_000
    : Math.min(5 * 2 ** (attempts - 1), 30) * 60_000;
  await commit({
    status: 'retry',
    errorMessage,
    scheduledAt: new Date(currentTime.getTime() + retryDelayMs),
  });
}

async function completeScenarioDelivery(
  database: Database,
  deliveryId: string,
  subscriberId: string,
  outcome: FailureOutcome,
  currentTime: Date,
): Promise<void> {
  await database.transaction(async (tx) => {
    const errorMessage = 'errorMessage' in outcome ? outcome.errorMessage.slice(0, 2_000) : null;
    const values = outcome.status === 'sent'
      ? {
          status: 'sent' as const,
          telegramMessageId: outcome.telegramMessageId,
          sentAt: currentTime,
          lastError: null,
          updatedAt: currentTime,
        }
      : outcome.status === 'retry'
        ? {
            status: 'pending' as const,
            scheduledAt: outcome.scheduledAt,
            lastError: errorMessage,
            updatedAt: currentTime,
          }
        : {
            status: outcome.status,
            lastError: errorMessage,
            updatedAt: currentTime,
          };

    const [updated] = await tx
      .update(telegramDeliveries)
      .set(values)
      .where(and(eq(telegramDeliveries.id, deliveryId), eq(telegramDeliveries.status, 'processing')))
      .returning({ enrollmentId: telegramDeliveries.enrollmentId });

    if (!updated) return;

    if (outcome.status === 'failed' && outcome.blockSubscriber) {
      await tx
        .update(telegramSubscribers)
        .set({ status: 'blocked', blockedAt: currentTime, updatedAt: currentTime })
        .where(eq(telegramSubscribers.id, subscriberId));
    }

    if (outcome.status === 'sent' && !outcome.keepEnrollmentOpen) {
      const [unfinished] = await tx
        .select({ id: telegramDeliveries.id })
        .from(telegramDeliveries)
        .where(and(eq(telegramDeliveries.enrollmentId, updated.enrollmentId), ne(telegramDeliveries.status, 'sent')))
        .limit(1);

      if (!unfinished) {
        await tx
          .update(telegramFunnelEnrollments)
          .set({ status: 'completed', completedAt: currentTime, updatedAt: currentTime })
          .where(eq(telegramFunnelEnrollments.id, updated.enrollmentId));
      }
    }
  });
}

async function completeBroadcastDelivery(
  database: Database,
  deliveryId: string,
  subscriberId: string,
  outcome: FailureOutcome,
  currentTime: Date,
): Promise<void> {
  await database.transaction(async (tx) => {
    const errorMessage = 'errorMessage' in outcome ? outcome.errorMessage.slice(0, 2_000) : null;
    const values = outcome.status === 'sent'
      ? {
          status: 'sent' as const,
          telegramMessageId: outcome.telegramMessageId,
          sentAt: currentTime,
          lastError: null,
          updatedAt: currentTime,
        }
      : outcome.status === 'retry'
        ? {
            status: 'pending' as const,
            scheduledAt: outcome.scheduledAt,
            lastError: errorMessage,
            updatedAt: currentTime,
          }
        : {
            status: outcome.status,
            lastError: errorMessage,
            updatedAt: currentTime,
          };

    await tx
      .update(telegramBroadcastDeliveries)
      .set(values)
      .where(and(eq(telegramBroadcastDeliveries.id, deliveryId), eq(telegramBroadcastDeliveries.status, 'processing')));

    if (outcome.status === 'failed' && outcome.blockSubscriber) {
      await tx
        .update(telegramSubscribers)
        .set({ status: 'blocked', blockedAt: currentTime, updatedAt: currentTime })
        .where(eq(telegramSubscribers.id, subscriberId));
    }
  });
}

async function finalizeBroadcastIfDone(database: Database, broadcastId: string, currentTime: Date): Promise<void> {
  const [remaining] = await database
    .select({ id: telegramBroadcastDeliveries.id })
    .from(telegramBroadcastDeliveries)
    .where(
      and(
        eq(telegramBroadcastDeliveries.broadcastId, broadcastId),
        eq(telegramBroadcastDeliveries.isTest, false),
        inArray(telegramBroadcastDeliveries.status, ['pending', 'processing']),
      ),
    )
    .limit(1);

  if (!remaining) {
    await database
      .update(telegramBroadcasts)
      .set({ status: 'completed', completedAt: currentTime, updatedAt: currentTime })
      .where(and(eq(telegramBroadcasts.id, broadcastId), eq(telegramBroadcasts.status, 'sending')));
  }
}
