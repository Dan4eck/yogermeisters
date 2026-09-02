import type { TelegramFunnel } from './types';

interface TelegramDeliveryWorkerDependencies {
  readonly funnel: TelegramFunnel;
  readonly pollIntervalMs: number;
  readonly logError?: (message: string) => void;
}

export interface TelegramDeliveryWorker {
  wake(): void;
  stop(): Promise<void>;
}

export function startTelegramDeliveryWorker(
  dependencies: TelegramDeliveryWorkerDependencies,
): TelegramDeliveryWorker {
  let stopped = false;
  let running = false;
  let runRequested = false;
  let timer: NodeJS.Timeout | undefined;
  let currentRun = Promise.resolve();

  const schedulePoll = (): void => {
    if (stopped) {
      return;
    }
    timer = setTimeout(requestRun, dependencies.pollIntervalMs);
  };

  const drain = async (): Promise<void> => {
    running = true;
    try {
      while (runRequested && !stopped) {
        runRequested = false;
        while (!stopped && (await dependencies.funnel.runDueBatch()) > 0) {}
      }
    } catch (error) {
      dependencies.logError?.(error instanceof Error ? error.message : 'Unknown Telegram delivery worker error');
    } finally {
      running = false;
      schedulePoll();
    }
  };

  function requestRun(): void {
    if (stopped) {
      return;
    }
    runRequested = true;
    if (timer) {
      clearTimeout(timer);
      timer = undefined;
    }
    if (!running) {
      currentRun = drain();
    }
  }

  requestRun();

  return {
    wake: requestRun,
    async stop(): Promise<void> {
      stopped = true;
      if (timer) {
        clearTimeout(timer);
      }
      await currentRun;
    },
  };
}
