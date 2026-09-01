import { describe, expect, it, vi } from 'vitest';

import { TelegramApiError } from './telegram-api';
import type { TelegramClient, TelegramSubscriberRepository } from './types';
import { runFollowUpBatch } from './worker';

function createDependencies(sendError?: Error): {
  readonly repository: TelegramSubscriberRepository;
  readonly telegramClient: TelegramClient;
} {
  return {
    repository: {
      upsertFromStart: vi.fn(),
      claimDelivery: vi.fn(),
      markDeliverySent: vi.fn(),
      markMeditationSentAndScheduleFollowUp: vi.fn(),
      markDeliveryFailed: vi.fn(),
      claimDueDeliveries: vi.fn().mockResolvedValue([
        { id: 'delivery-id', subscriberId: 'subscriber-id', chatId: 123456789, attempts: 1 },
      ]),
      markScheduledDeliverySent: vi.fn(),
      rescheduleDelivery: vi.fn(),
      markScheduledDeliveryFailed: vi.fn(),
      markBlocked: vi.fn(),
    },
    telegramClient: {
      sendAudio: vi.fn(),
      sendMessage: sendError
        ? vi.fn().mockRejectedValue(sendError)
        : vi.fn().mockResolvedValue(321),
      setWebhook: vi.fn(),
    },
  };
}

describe('runFollowUpBatch', () => {
  it('sends due follow-ups and marks them delivered', async () => {
    const dependencies = createDependencies();

    await runFollowUpBatch({
      ...dependencies,
      message: 'Сообщение после практики',
      pollIntervalMs: 15_000,
    });

    expect(dependencies.telegramClient.sendMessage).toHaveBeenCalledWith(
      123456789,
      'Сообщение после практики',
    );
    expect(dependencies.repository.markScheduledDeliverySent).toHaveBeenCalledWith('delivery-id', 321);
  });

  it('reschedules temporary delivery failures', async () => {
    const dependencies = createDependencies(new Error('Temporary network error'));

    await runFollowUpBatch({
      ...dependencies,
      message: 'Сообщение после практики',
      pollIntervalMs: 15_000,
    });

    expect(dependencies.repository.rescheduleDelivery).toHaveBeenCalledWith(
      'delivery-id',
      'Temporary network error',
      expect.any(Date),
    );
    expect(dependencies.repository.markScheduledDeliveryFailed).not.toHaveBeenCalled();
  });

  it('marks blocked subscribers without retrying', async () => {
    const dependencies = createDependencies(new TelegramApiError('Forbidden', 403, 403));

    await runFollowUpBatch({
      ...dependencies,
      message: 'Сообщение после практики',
      pollIntervalMs: 15_000,
    });

    expect(dependencies.repository.markBlocked).toHaveBeenCalledWith('subscriber-id');
    expect(dependencies.repository.markScheduledDeliveryFailed).toHaveBeenCalledWith('delivery-id', 'Forbidden');
    expect(dependencies.repository.rescheduleDelivery).not.toHaveBeenCalled();
  });
});
