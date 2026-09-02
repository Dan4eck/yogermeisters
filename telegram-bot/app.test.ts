import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { createTelegramBotApp } from './app';
import type { TelegramFunnel } from './types';

function createFunnel(): TelegramFunnel {
  return {
    acceptStart: vi.fn().mockResolvedValue(undefined),
    runDueBatch: vi.fn().mockResolvedValue(0),
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
    const funnel = createFunnel();
    const app = createTelegramBotApp({ funnel, webhookSecret: 'secret' });

    await request(app).post('/telegram/webhook').send(startUpdate).expect(401);

    expect(funnel.acceptStart).not.toHaveBeenCalled();
  });

  it('persists a start update and wakes the delivery worker', async () => {
    const funnel = createFunnel();
    const notifyWork = vi.fn();
    const app = createTelegramBotApp({ funnel, webhookSecret: 'secret', notifyWork });

    await request(app)
      .post('/telegram/webhook')
      .set('X-Telegram-Bot-Api-Secret-Token', 'secret')
      .send(startUpdate)
      .expect(204);

    expect(funnel.acceptStart).toHaveBeenCalledWith({
      updateId: 100,
      profile: {
        telegramUserId: 123456789,
        chatId: 123456789,
        firstName: 'Анна',
        lastName: 'Иванова',
        username: 'anna_yoga',
        languageCode: 'ru',
      },
      startPayload: 'instagram_reels_01',
    });
    expect(notifyWork).toHaveBeenCalledOnce();
  });

  it('ignores messages other than start', async () => {
    const funnel = createFunnel();
    const app = createTelegramBotApp({ funnel, webhookSecret: 'secret' });

    await request(app)
      .post('/telegram/webhook')
      .set('X-Telegram-Bot-Api-Secret-Token', 'secret')
      .send({ ...startUpdate, message: { ...startUpdate.message, text: 'Привет' } })
      .expect(204);

    expect(funnel.acceptStart).not.toHaveBeenCalled();
  });

  it('ignores invalid deep-link payloads', async () => {
    const funnel = createFunnel();
    const app = createTelegramBotApp({ funnel, webhookSecret: 'secret' });

    await request(app)
      .post('/telegram/webhook')
      .set('X-Telegram-Bot-Api-Secret-Token', 'secret')
      .send({ ...startUpdate, message: { ...startUpdate.message, text: '/start invalid.payload' } })
      .expect(204);

    expect(funnel.acceptStart).not.toHaveBeenCalled();
  });
});
