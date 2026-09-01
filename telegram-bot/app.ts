import { timingSafeEqual } from 'crypto';

import express, { type Express, type NextFunction, type Request, type Response } from 'express';

import { TelegramApiError } from './telegram-api';
import type { TelegramClient, TelegramSubscriberRepository, TelegramUserProfile } from './types';

const MEDITATION_CONTENT_KEY = 'welcome_meditation_v1';
const TEST_CONTENT_KEY = 'welcome_test_v1';

interface TelegramBotAppDependencies {
  readonly repository: TelegramSubscriberRepository;
  readonly telegramClient: TelegramClient;
  readonly webhookSecret: string;
  readonly meditationAudio?: string;
  readonly meditationCaption?: string;
  readonly testMessage: string;
  readonly logError?: (message: string) => void;
}

interface TelegramUpdate {
  readonly update_id?: unknown;
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
        await handleStart(start.profile, start.startPayload, dependencies);
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

async function handleStart(
  profile: TelegramUserProfile,
  startPayload: string | undefined,
  dependencies: TelegramBotAppDependencies,
): Promise<void> {
  const subscriber = await dependencies.repository.upsertFromStart(profile, startPayload);
  const contentKey = dependencies.meditationAudio ? MEDITATION_CONTENT_KEY : TEST_CONTENT_KEY;
  const claim = await dependencies.repository.claimDelivery(subscriber.id, contentKey);
  if (claim === 'already_sent') {
    return;
  }
  if (claim === 'in_progress') {
    throw new Error('Meditation delivery is already in progress');
  }

  try {
    const messageId = dependencies.meditationAudio
      ? await dependencies.telegramClient.sendAudio(
          profile.chatId,
          dependencies.meditationAudio,
          dependencies.meditationCaption,
        )
      : await dependencies.telegramClient.sendMessage(profile.chatId, dependencies.testMessage);
    await dependencies.repository.markDeliverySent(subscriber.id, contentKey, messageId);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown Telegram delivery error';
    await dependencies.repository.markDeliveryFailed(subscriber.id, contentKey, message);
    if (error instanceof TelegramApiError && (error.status === 403 || error.errorCode === 403)) {
      await dependencies.repository.markBlocked(subscriber.id);
      return;
    }
    throw error;
  }
}

function parseStartUpdate(update: TelegramUpdate): { profile: TelegramUserProfile; startPayload?: string } | undefined {
  const message = update.message;
  const text = typeof message?.text === 'string' ? message.text : undefined;
  const match = text?.match(/^\/start(?:@[A-Za-z0-9_]+)?(?:\s+([^\s]{1,255}))?\s*$/);
  if (!match || message?.chat?.type !== 'private' || message.from?.is_bot === true) {
    return undefined;
  }

  const telegramUserId = readSafeInteger(message.from?.id);
  const chatId = readSafeInteger(message.chat.id);
  const firstName = readRequiredString(message.from?.first_name);
  if (telegramUserId === undefined || chatId === undefined || firstName === undefined) {
    return undefined;
  }

  return {
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
