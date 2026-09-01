import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { createTelegramBotApp } from './app';
import type { DeliveryClaimResult, TelegramClient, TelegramSubscriberRepository } from './types';

function createDependencies(claimDelivery: DeliveryClaimResult = 'claimed'): {
  readonly repository: TelegramSubscriberRepository;
  readonly telegramClient: TelegramClient;
} {
  return {
    repository: {
      upsertFromStart: vi.fn().mockResolvedValue({ id: 'subscriber-id' }),
      claimDelivery: vi.fn().mockResolvedValue(claimDelivery),
      markDeliverySent: vi.fn().mockResolvedValue(undefined),
      markMeditationSentAndScheduleFollowUp: vi.fn().mockResolvedValue(undefined),
      markDeliveryFailed: vi.fn().mockResolvedValue(undefined),
      claimDueDeliveries: vi.fn().mockResolvedValue([]),
      markScheduledDeliverySent: vi.fn().mockResolvedValue(undefined),
      rescheduleDelivery: vi.fn().mockResolvedValue(undefined),
      markScheduledDeliveryFailed: vi.fn().mockResolvedValue(undefined),
      markBlocked: vi.fn().mockResolvedValue(undefined),
    },
    telegramClient: {
      sendAudio: vi.fn().mockResolvedValue(456),
      sendMessage: vi.fn().mockResolvedValue(789),
      setWebhook: vi.fn().mockResolvedValue(undefined),
    },
  };
}

const startUpdate = {
  update_id: 100,
  message: {
    text: '/start instagram_reels_01',
    chat: { id: 123456789, type: 'private' },
    from: {
      id: 123456789,
      is_bot: false,
      first_name: 'Анна',
      last_name: 'Иванова',
      username: 'anna_yoga',
      language_code: 'ru',
    },
  },
};

describe('createTelegramBotApp', () => {
  it('rejects requests without the Telegram webhook secret', async () => {
    const dependencies = createDependencies();
    const app = createTelegramBotApp({
      ...dependencies,
      webhookSecret: 'secret',
      meditationAudio: 'audio-file-id',
      testMessage: 'Тестовое сообщение',
      followUpDelayMs: 30 * 60_000,
    });

    await request(app).post('/telegram/webhook').send(startUpdate).expect(401);
    expect(dependencies.repository.upsertFromStart).not.toHaveBeenCalled();
  });

  it('stores the subscriber and sends the meditation after start', async () => {
    const dependencies = createDependencies();
    const app = createTelegramBotApp({
      ...dependencies,
      webhookSecret: 'secret',
      meditationAudio: 'audio-file-id',
      meditationCaption: 'Ваша медитация',
      testMessage: 'Тестовое сообщение',
      followUpDelayMs: 30 * 60_000,
    });

    await request(app)
      .post('/telegram/webhook')
      .set('X-Telegram-Bot-Api-Secret-Token', 'secret')
      .send(startUpdate)
      .expect(204);

    expect(dependencies.repository.upsertFromStart).toHaveBeenCalledWith(
      {
        telegramUserId: 123456789,
        chatId: 123456789,
        firstName: 'Анна',
        lastName: 'Иванова',
        username: 'anna_yoga',
        languageCode: 'ru',
      },
      'instagram_reels_01',
    );
    expect(dependencies.telegramClient.sendAudio).toHaveBeenCalledWith(
      123456789,
      'audio-file-id',
      'Ваша медитация',
    );
    expect(dependencies.repository.markMeditationSentAndScheduleFollowUp).toHaveBeenCalledWith(
      'subscriber-id',
      'welcome_meditation_v1',
      456,
      'meditation_follow_up_v1',
      expect.any(Date),
    );
  });

  it('does not send the meditation twice for the same Telegram update', async () => {
    const dependencies = createDependencies('already_sent');
    const app = createTelegramBotApp({
      ...dependencies,
      webhookSecret: 'secret',
      meditationAudio: 'audio-file-id',
      testMessage: 'Тестовое сообщение',
      followUpDelayMs: 30 * 60_000,
    });

    await request(app)
      .post('/telegram/webhook')
      .set('X-Telegram-Bot-Api-Secret-Token', 'secret')
      .send(startUpdate)
      .expect(204);

    expect(dependencies.repository.upsertFromStart).toHaveBeenCalledOnce();
    expect(dependencies.telegramClient.sendAudio).not.toHaveBeenCalled();
    expect(dependencies.repository.markMeditationSentAndScheduleFollowUp).not.toHaveBeenCalled();
  });

  it('does not restart the pipeline for a later start activation', async () => {
    const dependencies = createDependencies();
    vi.mocked(dependencies.repository.claimDelivery)
      .mockResolvedValueOnce('claimed')
      .mockResolvedValueOnce('already_sent');
    const app = createTelegramBotApp({
      ...dependencies,
      webhookSecret: 'secret',
      meditationAudio: 'audio-file-id',
      testMessage: 'Тестовое сообщение',
      followUpDelayMs: 30 * 60_000,
    });

    await request(app)
      .post('/telegram/webhook')
      .set('X-Telegram-Bot-Api-Secret-Token', 'secret')
      .send(startUpdate)
      .expect(204);
    await request(app)
      .post('/telegram/webhook')
      .set('X-Telegram-Bot-Api-Secret-Token', 'secret')
      .send({ ...startUpdate, update_id: 101 })
      .expect(204);

    expect(dependencies.repository.claimDelivery).toHaveBeenNthCalledWith(
      1,
      'subscriber-id',
      'welcome_meditation_v1',
    );
    expect(dependencies.repository.claimDelivery).toHaveBeenNthCalledWith(
      2,
      'subscriber-id',
      'welcome_meditation_v1',
    );
    expect(dependencies.telegramClient.sendAudio).toHaveBeenCalledOnce();
    expect(dependencies.repository.markMeditationSentAndScheduleFollowUp).toHaveBeenCalledOnce();
  });

  it('ignores messages other than start', async () => {
    const dependencies = createDependencies();
    const app = createTelegramBotApp({
      ...dependencies,
      webhookSecret: 'secret',
      meditationAudio: 'audio-file-id',
      testMessage: 'Тестовое сообщение',
      followUpDelayMs: 30 * 60_000,
    });

    await request(app)
      .post('/telegram/webhook')
      .set('X-Telegram-Bot-Api-Secret-Token', 'secret')
      .send({ ...startUpdate, message: { ...startUpdate.message, text: 'Привет' } })
      .expect(204);

    expect(dependencies.repository.upsertFromStart).not.toHaveBeenCalled();
  });

  it('sends a separate placeholder delivery in test mode', async () => {
    const dependencies = createDependencies();
    const app = createTelegramBotApp({
      ...dependencies,
      webhookSecret: 'secret',
      testMessage: 'Тестовый бот работает',
      followUpDelayMs: 30 * 60_000,
    });

    await request(app)
      .post('/telegram/webhook')
      .set('X-Telegram-Bot-Api-Secret-Token', 'secret')
      .send(startUpdate)
      .expect(204);

    expect(dependencies.telegramClient.sendMessage).toHaveBeenCalledWith(
      123456789,
      'Тестовый бот работает',
    );
    expect(dependencies.telegramClient.sendAudio).not.toHaveBeenCalled();
    expect(dependencies.repository.markDeliverySent).toHaveBeenCalledWith(
      'subscriber-id',
      'welcome_test_v1',
      789,
    );
    expect(dependencies.repository.markMeditationSentAndScheduleFollowUp).not.toHaveBeenCalled();
  });
});
