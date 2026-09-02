import { afterEach, describe, expect, it, vi } from 'vitest';

import { BotApiTelegramClient } from './telegram-api';

describe('BotApiTelegramClient', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('serializes inline buttons as Telegram reply markup', async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, result: { message_id: 321 } }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);
    const client = new BotApiTelegramClient('example-token');

    await expect(
      client.sendMessage(123456789, 'Текст сообщения', [
        [{ text: 'Открыть', url: 'https://example.com' }],
      ]),
    ).resolves.toBe(321);

    expect(fetchMock).toHaveBeenCalledWith(
      'https://api.telegram.org/botexample-token/sendMessage',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          chat_id: 123456789,
          text: 'Текст сообщения',
          reply_markup: {
            inline_keyboard: [[{ text: 'Открыть', url: 'https://example.com' }]],
          },
        }),
      }),
    );
  });
});
