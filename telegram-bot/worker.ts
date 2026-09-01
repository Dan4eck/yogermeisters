import { TelegramApiError } from './telegram-api';
import type { ScheduledTelegramDelivery, TelegramClient, TelegramSubscriberRepository } from './types';

const MAX_DELIVERY_ATTEMPTS = 5;
const DELIVERY_BATCH_SIZE = 25;

interface FollowUpWorkerDependencies {
  readonly repository: TelegramSubscriberRepository;
  readonly telegramClient: TelegramClient;
  readonly message: string;
  readonly pollIntervalMs: number;
  readonly logError?: (message: string) => void;
}

export interface FollowUpWorker {
  stop(): Promise<void>;
}

export function startFollowUpWorker(dependencies: FollowUpWorkerDependencies): FollowUpWorker {
  let stopped = false;
  let timer: NodeJS.Timeout | undefined;
  let currentRun = Promise.resolve();

  const scheduleNextRun = (): void => {
    if (stopped) {
      return;
    }
    timer = setTimeout(() => {
      currentRun = runFollowUpBatch(dependencies)
        .catch((error: unknown) => {
          dependencies.logError?.(error instanceof Error ? error.message : 'Unknown follow-up worker error');
        })
        .finally(scheduleNextRun);
    }, dependencies.pollIntervalMs);
  };

  currentRun = runFollowUpBatch(dependencies)
    .catch((error: unknown) => {
      dependencies.logError?.(error instanceof Error ? error.message : 'Unknown follow-up worker error');
    })
    .finally(scheduleNextRun);

  return {
    async stop(): Promise<void> {
      stopped = true;
      if (timer) {
        clearTimeout(timer);
      }
      await currentRun;
    },
  };
}

export async function runFollowUpBatch(dependencies: FollowUpWorkerDependencies): Promise<void> {
  const deliveries = await dependencies.repository.claimDueDeliveries(DELIVERY_BATCH_SIZE);
  await Promise.all(deliveries.map((delivery) => deliverFollowUp(delivery, dependencies)));
}

async function deliverFollowUp(
  delivery: ScheduledTelegramDelivery,
  dependencies: FollowUpWorkerDependencies,
): Promise<void> {
  try {
    const messageId = await dependencies.telegramClient.sendMessage(delivery.chatId, dependencies.message);
    await dependencies.repository.markScheduledDeliverySent(delivery.id, messageId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown follow-up delivery error';
    if (error instanceof TelegramApiError && (error.status === 403 || error.errorCode === 403)) {
      await dependencies.repository.markBlocked(delivery.subscriberId);
      await dependencies.repository.markScheduledDeliveryFailed(delivery.id, message);
      return;
    }
    if (delivery.attempts >= MAX_DELIVERY_ATTEMPTS) {
      await dependencies.repository.markScheduledDeliveryFailed(delivery.id, message);
      return;
    }
    const retryDelayMinutes = Math.min(5 * 2 ** (delivery.attempts - 1), 30);
    await dependencies.repository.rescheduleDelivery(
      delivery.id,
      message,
      new Date(Date.now() + retryDelayMinutes * 60_000),
    );
  }
}
