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

it('supports callback buttons, callback acknowledgements, video and webhook callback subscriptions', async () => {
  const fetchMock = vi.fn().mockResolvedValue({
    ok: true, status: 200, json: async (): Promise<unknown> => ({ ok: true, result: { message_id: 10 } }),
  });
  vi.stubGlobal('fetch', fetchMock);
  try {
    const client = new BotApiTelegramClient('test-token');
    await client.sendMessage(123, 'Вопрос', [[{ text: 'Ответ', callback_data: 'pp1:state:0' }]]);
    await expect(client.sendVideo(123, 'new-video')).resolves.toBe(10);
    await client.answerCallbackQuery('callback-1');
    await client.setWebhook('https://example.com/webhook', 'secret');
    const bodies = fetchMock.mock.calls.map((call) => JSON.parse(call[1].body as string));
    expect(bodies[0].reply_markup.inline_keyboard).toEqual([[{ text: 'Ответ', callback_data: 'pp1:state:0' }]]);
    expect(bodies[1]).toEqual({ chat_id: 123, video: 'new-video' });
    expect(bodies[2]).toEqual({ callback_query_id: 'callback-1' });
    expect(bodies[3].allowed_updates).toEqual(['message', 'callback_query']);
  } finally {
    vi.unstubAllGlobals();
  }
});
