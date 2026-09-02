import { TelegramApiError, TelegramTransportError } from './telegram-api';
import type {
  ScheduledTelegramDelivery,
  TelegramClient,
  TelegramFunnel,
  TelegramFunnelPlan,
  TelegramFunnelStore,
  TelegramStartInput,
} from './types';

const DEFAULT_BATCH_SIZE = 25;
const DEFAULT_MAX_ATTEMPTS = 5;
const DELIVERY_CONCURRENCY = 4;

interface TelegramFunnelDependencies {
  readonly store: TelegramFunnelStore;
  readonly telegramClient: TelegramClient;
  readonly plan: TelegramFunnelPlan;
  readonly batchSize?: number;
  readonly maxAttempts?: number;
  readonly now?: () => Date;
  readonly logError?: (message: string) => void;
}

export function createTelegramFunnel(dependencies: TelegramFunnelDependencies): TelegramFunnel {
  const contentByKey = new Map(dependencies.plan.steps.map((step) => [step.contentKey, step.content]));
  const contentKeys = Array.from(contentByKey.keys());
  const batchSize = dependencies.batchSize ?? DEFAULT_BATCH_SIZE;
  const maxAttempts = dependencies.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const now = dependencies.now ?? (() => new Date());

  if (dependencies.plan.steps.length === 0) {
    throw new Error('Telegram funnel must contain at least one step');
  }
  if (contentKeys.length !== dependencies.plan.steps.length) {
    throw new Error('Telegram funnel content keys must be unique');
  }
  if (dependencies.plan.steps.some((step) => step.delayMs < 0)) {
    throw new Error('Telegram funnel delays cannot be negative');
  }

  return {
    async acceptStart(input: TelegramStartInput): Promise<void> {
      await dependencies.store.enrollFromStart(input, dependencies.plan);
    },

    async runDueBatch(): Promise<number> {
      const deliveries = await dependencies.store.claimDueDeliveries(dependencies.plan, batchSize);
      for (let index = 0; index < deliveries.length; index += DELIVERY_CONCURRENCY) {
        await Promise.all(
          deliveries
            .slice(index, index + DELIVERY_CONCURRENCY)
            .map((delivery) => deliver(delivery)),
        );
      }
      return deliveries.length;
    },
  };

  async function deliver(delivery: ScheduledTelegramDelivery): Promise<void> {
    const content = contentByKey.get(delivery.contentKey);
    if (!content) {
      await dependencies.store.completeDelivery(delivery.id, delivery.subscriberId, {
        status: 'failed',
        errorMessage: `Unknown Telegram funnel content: ${delivery.contentKey}`,
      });
      return;
    }

    let telegramMessageId: number;
    try {
      telegramMessageId =
        content.type === 'audio'
          ? await dependencies.telegramClient.sendAudio(
              delivery.chatId,
              content.audio,
              content.caption,
              content.title,
            )
          : await dependencies.telegramClient.sendMessage(delivery.chatId, content.text, content.buttons);
    } catch (error) {
      await handleTelegramFailure(delivery, error);
      return;
    }

    try {
      await dependencies.store.completeDelivery(delivery.id, delivery.subscriberId, {
        status: 'sent',
        telegramMessageId,
      });
    } catch (error) {
      dependencies.logError?.(
        formatDeliveryError(delivery, error, 'Telegram message sent but database confirmation failed'),
      );
      throw error;
    }
  }

  async function handleTelegramFailure(delivery: ScheduledTelegramDelivery, error: unknown): Promise<void> {
    const errorMessage = error instanceof Error ? error.message : 'Unknown Telegram delivery error';
    if (error instanceof TelegramTransportError) {
      await dependencies.store.completeDelivery(delivery.id, delivery.subscriberId, {
        status: 'ambiguous',
        errorMessage,
      });
      return;
    }

    if (error instanceof TelegramApiError && (error.status === 403 || error.errorCode === 403)) {
      await dependencies.store.completeDelivery(delivery.id, delivery.subscriberId, {
        status: 'failed',
        errorMessage,
        blockSubscriber: true,
      });
      return;
    }

    if (error instanceof TelegramApiError && error.status >= 400 && error.status < 500 && error.status !== 429) {
      await dependencies.store.completeDelivery(delivery.id, delivery.subscriberId, {
        status: 'failed',
        errorMessage,
      });
      return;
    }

    if (!(error instanceof TelegramApiError)) {
      await dependencies.store.completeDelivery(delivery.id, delivery.subscriberId, {
        status: 'ambiguous',
        errorMessage,
      });
      return;
    }

    if (delivery.attempts >= maxAttempts) {
      await dependencies.store.completeDelivery(delivery.id, delivery.subscriberId, {
        status: 'failed',
        errorMessage,
      });
      return;
    }

    const retryDelayMs = error.retryAfterSeconds
      ? error.retryAfterSeconds * 1_000
      : Math.min(5 * 2 ** (delivery.attempts - 1), 30) * 60_000;
    await dependencies.store.completeDelivery(delivery.id, delivery.subscriberId, {
      status: 'retry',
      errorMessage,
      scheduledAt: new Date(now().getTime() + retryDelayMs),
    });
  }
}

function formatDeliveryError(
  delivery: ScheduledTelegramDelivery,
  error: unknown,
  context: string,
): string {
  const message = error instanceof Error ? error.message : 'Unknown database error';
  return `${context}; delivery=${delivery.id}; content=${delivery.contentKey}; error=${message}`;
}
