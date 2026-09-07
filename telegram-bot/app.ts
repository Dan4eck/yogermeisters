import { timingSafeEqual } from 'crypto';

import express, { type Express, type NextFunction, type Request, type Response } from 'express';

import type { TelegramCallbackInput, TelegramFunnel, TelegramUserProfile } from './types';

interface TelegramBotAppDependencies {
  readonly funnel: TelegramFunnel;
  readonly webhookSecret: string;
  readonly notifyWork?: () => void;
  readonly logError?: (message: string) => void;
}

interface TelegramUpdate {
  readonly update_id?: unknown;
  readonly callback_query?: {
    readonly id?: unknown;
    readonly data?: unknown;
    readonly from?: { readonly id?: unknown; readonly is_bot?: unknown };
    readonly message?: { readonly chat?: { readonly id?: unknown; readonly type?: unknown } };
  };
  readonly message?: {
    readonly text?: unknown;
    readonly chat?: {
      readonly id?: unknown;
      readonly type?: unknown;
    };
    readonly from?: {
      readonly id?: unknown;
      readonly is_bot?: unknown;
      readonly first_name?: unknown;
      readonly last_name?: unknown;
      readonly username?: unknown;
      readonly language_code?: unknown;
    };
  };
}

export function createTelegramBotApp(dependencies: TelegramBotAppDependencies): Express {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '100kb' }));

  app.get('/healthz', (_req, res) => {
    res.status(200).json({ ok: true, service: 'telegram-bot' });
  });

  app.post('/telegram/webhook', async (req, res, next) => {
    if (!isAuthorizedWebhook(req.get('X-Telegram-Bot-Api-Secret-Token'), dependencies.webhookSecret)) {
      res.status(401).json({ code: 'unauthorized', message: 'Invalid webhook secret' });
      return;
    }

    try {
      const start = parseStartUpdate(req.body as TelegramUpdate);
      if (start) {
        await dependencies.funnel.acceptStart(start);
        dependencies.notifyWork?.();
      }
      const callback = parseCallbackUpdate(req.body as TelegramUpdate);
      if (callback && dependencies.funnel.acceptCallback) {
        await dependencies.funnel.acceptCallback(callback);
        dependencies.notifyWork?.();
      }
      res.status(204).end();
    } catch (error) {
      next(error);
    }
  });

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const message = error instanceof Error ? error.message : 'Unknown Telegram bot error';
    dependencies.logError?.(message);
    res.status(502).json({ code: 'telegram_update_failed', message: 'Could not process Telegram update' });
  });

  return app;
}

function parseStartUpdate(
  update: TelegramUpdate,
): { updateId: number; profile: TelegramUserProfile; startPayload?: string } | undefined {
  const message = update.message;
  const text = typeof message?.text === 'string' ? message.text : undefined;
  const match = text?.match(/^\/start(?:@[A-Za-z0-9_]+)?(?:\s+([A-Za-z0-9_-]{1,64}))?\s*$/);
  if (!match || message?.chat?.type !== 'private' || message.from?.is_bot === true) {
    return undefined;
  }

  const updateId = readSafeInteger(update.update_id);
  const telegramUserId = readSafeInteger(message.from?.id);
  const chatId = readSafeInteger(message.chat.id);
  const firstName = readRequiredString(message.from?.first_name);
  if (updateId === undefined || telegramUserId === undefined || chatId === undefined || firstName === undefined) {
    return undefined;
  }

  return {
    updateId,
    profile: {
      telegramUserId,
      chatId,
      firstName,
      lastName: readOptionalString(message.from?.last_name),
      username: readOptionalString(message.from?.username),
      languageCode: readOptionalString(message.from?.language_code),
    },
    startPayload: match[1],
  };
}

function isAuthorizedWebhook(receivedSecret: string | undefined, expectedSecret: string): boolean {
  if (!receivedSecret) {
    return false;
  }
  const received = Buffer.from(receivedSecret);
  const expected = Buffer.from(expectedSecret);
  return received.length === expected.length && timingSafeEqual(received, expected);
}

function readSafeInteger(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isSafeInteger(value) ? value : undefined;
}

function readRequiredString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value.slice(0, 255) : undefined;
}

function readOptionalString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value.slice(0, 255) : undefined;
}

function parseCallbackUpdate(update: TelegramUpdate): TelegramCallbackInput | undefined {
  const callback = update.callback_query;
  if (!callback || callback.from?.is_bot === true || callback.message?.chat?.type !== 'private') return undefined;
  const updateId = readSafeInteger(update.update_id);
  const telegramUserId = readSafeInteger(callback.from?.id);
  const chatId = readSafeInteger(callback.message.chat.id);
  if (updateId === undefined || telegramUserId === undefined || chatId === undefined ||
    typeof callback.id !== 'string' || !callback.id || typeof callback.data !== 'string' ||
    Buffer.byteLength(callback.data, 'utf8') > 64) return undefined;
  return { updateId, telegramUserId, chatId, callbackId: callback.id, data: callback.data };
}
