import { describe, expect, it, vi } from 'vitest';

import type { TelegramFunnel } from './types';
import { startTelegramDeliveryWorker } from './worker';

describe('startTelegramDeliveryWorker', () => {
  it('drains all currently due batches before waiting for the next poll', async () => {
    const funnel: TelegramFunnel = {
      acceptStart: vi.fn(),
      runDueBatch: vi.fn().mockResolvedValueOnce(2).mockResolvedValueOnce(1).mockResolvedValueOnce(0),
    };

    const worker = startTelegramDeliveryWorker({ funnel, pollIntervalMs: 60_000 });

    await vi.waitFor(() => expect(funnel.runDueBatch).toHaveBeenCalledTimes(3));
    await worker.stop();
  });
});
