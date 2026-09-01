import type { TelegramClient } from './types';

interface TelegramApiResponse<T> {
  readonly ok: boolean;
  readonly result?: T;
  readonly error_code?: number;
  readonly description?: string;
}

interface TelegramMessageResult {
  readonly message_id: number;
}

export class TelegramApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errorCode?: number,
  ) {
    super(message);
    this.name = 'TelegramApiError';
  }
}

export class BotApiTelegramClient implements TelegramClient {
  private readonly apiUrl: string;

  constructor(token: string) {
    this.apiUrl = `https://api.telegram.org/bot${token}`;
  }

  async sendAudio(chatId: number, audio: string, caption?: string): Promise<number> {
    const result = await this.call<TelegramMessageResult>('sendAudio', {
      chat_id: chatId,
      audio,
      caption,
    });
    return result.message_id;
  }

  async sendMessage(chatId: number, text: string): Promise<number> {
    const result = await this.call<TelegramMessageResult>('sendMessage', {
      chat_id: chatId,
      text,
    });
    return result.message_id;
  }

  async setWebhook(url: string, secretToken: string): Promise<void> {
    await this.call<boolean>('setWebhook', {
      url,
      secret_token: secretToken,
      allowed_updates: ['message'],
      drop_pending_updates: false,
    });
  }

  private async call<T>(method: string, body: Record<string, unknown>): Promise<T> {
    const response = await fetch(`${this.apiUrl}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(15_000),
    });
    const payload = (await response.json()) as TelegramApiResponse<T>;
    if (!response.ok || !payload.ok || payload.result === undefined) {
      throw new TelegramApiError(
        payload.description || `Telegram API request failed with status ${response.status}`,
        response.status,
        payload.error_code,
      );
    }
    return payload.result;
  }
}
