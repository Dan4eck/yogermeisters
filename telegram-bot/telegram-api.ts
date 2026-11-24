import type { TelegramClient, TelegramInlineButton, TelegramPhotoUploadResult } from './types';

interface TelegramApiResponse<T> {
  readonly ok: boolean;
  readonly result?: T;
  readonly error_code?: number;
  readonly description?: string;
  readonly parameters?: {
    readonly retry_after?: number;
  };
}

interface TelegramMessageResult {
  readonly message_id: number;
  readonly photo?: readonly { readonly file_id: string }[];
}

export class TelegramApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly errorCode?: number,
    readonly retryAfterSeconds?: number,
  ) {
    super(message);
    this.name = 'TelegramApiError';
  }
}

export class TelegramTransportError extends Error {
  constructor(
    message: string,
    readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'TelegramTransportError';
  }
}

export class BotApiTelegramClient implements TelegramClient {
  private readonly apiUrl: string;

  constructor(token: string) {
    this.apiUrl = `https://api.telegram.org/bot${token}`;
  }

  async sendVideo(
    chatId: number,
    video: string,
    caption?: string,
    buttons?: readonly (readonly TelegramInlineButton[])[],
    parseMode?: 'HTML',
  ): Promise<number> {
    const result = await this.call<TelegramMessageResult>('sendVideo', {
      chat_id: chatId,
      video,
      caption,
      ...(parseMode ? { parse_mode: parseMode } : {}),
      ...(buttons && buttons.length > 0 ? { reply_markup: { inline_keyboard: buttons } } : {}),
    });
    return result.message_id;
  }

  async sendPhoto(
    chatId: number,
    photo: string,
    caption?: string,
    buttons?: readonly (readonly TelegramInlineButton[])[],
    parseMode?: 'HTML',
  ): Promise<number> {
    const result = await this.call<TelegramMessageResult>('sendPhoto', {
      chat_id: chatId,
      photo,
      caption,
      ...(parseMode ? { parse_mode: parseMode } : {}),
      ...(buttons && buttons.length > 0 ? { reply_markup: { inline_keyboard: buttons } } : {}),
    });
    return result.message_id;
  }

  async sendPhotoBuffer(
    chatId: number,
    buffer: Buffer,
    filename: string,
    mimeType: string,
    caption?: string,
    buttons?: readonly (readonly TelegramInlineButton[])[],
    parseMode?: 'HTML',
  ): Promise<TelegramPhotoUploadResult> {
    const form = new FormData();
    form.append('chat_id', String(chatId));
    form.append('photo', new Blob([new Uint8Array(buffer)], { type: mimeType }), filename);
    if (caption) form.append('caption', caption);
    if (parseMode) form.append('parse_mode', parseMode);
    if (buttons && buttons.length > 0) {
      form.append('reply_markup', JSON.stringify({ inline_keyboard: buttons }));
    }
    const result = await this.callMultipart<TelegramMessageResult>('sendPhoto', form);
    const largestPhoto = result.photo && result.photo.length > 0 ? result.photo[result.photo.length - 1] : undefined;
    return {
      messageId: result.message_id,
      fileId: largestPhoto?.file_id,
    };
  }

  async answerCallbackQuery(callbackId: string): Promise<void> {
    await this.call<boolean>('answerCallbackQuery', { callback_query_id: callbackId });
  }

  async sendAudio(
    chatId: number,
    audio: string,
    caption?: string,
    title?: string,
    buttons?: readonly (readonly TelegramInlineButton[])[],
    parseMode?: 'HTML',
  ): Promise<number> {
    const result = await this.call<TelegramMessageResult>('sendAudio', {
      chat_id: chatId,
      audio,
      caption,
      title,
      ...(parseMode ? { parse_mode: parseMode } : {}),
      ...(buttons && buttons.length > 0 ? { reply_markup: { inline_keyboard: buttons } } : {}),
    });
    return result.message_id;
  }

  async sendMessage(
    chatId: number,
    text: string,
    buttons?: readonly (readonly TelegramInlineButton[])[],
    parseMode?: 'HTML',
  ): Promise<number> {
    const result = await this.call<TelegramMessageResult>('sendMessage', {
      chat_id: chatId,
      text,
      ...(parseMode ? { parse_mode: parseMode } : {}),
      ...(buttons && buttons.length > 0 ? { reply_markup: { inline_keyboard: buttons } } : {}),
    });
    return result.message_id;
  }

  async setWebhook(url: string, secretToken: string): Promise<void> {
    await this.call<boolean>('setWebhook', {
      url,
      secret_token: secretToken,
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: false,
    });
  }

  private async call<T>(method: string, body: Record<string, unknown>): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.apiUrl}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(15_000),
      });
    } catch (error) {
      throw new TelegramTransportError(`Telegram ${method} request did not return a response`, error);
    }

    let payload: TelegramApiResponse<T>;
    try {
      payload = (await response.json()) as TelegramApiResponse<T>;
    } catch (error) {
      if (!response.ok) {
        throw new TelegramApiError(`Telegram API request failed with status ${response.status}`, response.status);
      }
      throw new TelegramTransportError(`Telegram ${method} returned an unreadable response`, error);
    }
    if (!response.ok || !payload.ok || payload.result === undefined) {
      throw new TelegramApiError(
        payload.description || `Telegram API request failed with status ${response.status}`,
        response.status,
        payload.error_code,
        payload.parameters?.retry_after,
      );
    }
    return payload.result;
  }

  private async callMultipart<T>(method: string, body: FormData): Promise<T> {
    let response: Response;
    try {
      response = await fetch(`${this.apiUrl}/${method}`, {
        method: 'POST',
        body,
        signal: AbortSignal.timeout(30_000),
      });
    } catch (error) {
      throw new TelegramTransportError(`Telegram ${method} request did not return a response`, error);
    }

    let payload: TelegramApiResponse<T>;
    try {
      payload = (await response.json()) as TelegramApiResponse<T>;
    } catch (error) {
      if (!response.ok) {
        throw new TelegramApiError(`Telegram API request failed with status ${response.status}`, response.status);
      }
      throw new TelegramTransportError(`Telegram ${method} returned an unreadable response`, error);
    }
    if (!response.ok || !payload.ok || payload.result === undefined) {
      throw new TelegramApiError(
        payload.description || `Telegram API request failed with status ${response.status}`,
        response.status,
        payload.error_code,
        payload.parameters?.retry_after,
      );
    }
    return payload.result;
  }
}
