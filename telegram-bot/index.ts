import 'dotenv/config';

import { createServer } from 'http';

import { createTelegramBotApp } from './app';
import { readTelegramBotConfig } from './config';
import { DrizzleTelegramSubscriberRepository } from './repository';
import { BotApiTelegramClient } from './telegram-api';
import { startFollowUpWorker } from './worker';
import { createDatabase } from '../server/db/client';

function log(message: string, source = 'telegram-bot'): void {
  const formattedTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}

async function startTelegramBot(): Promise<void> {
  const config = readTelegramBotConfig();
  const database = createDatabase(config.databaseUrl);
  const telegramClient = new BotApiTelegramClient(config.token);
  const repository = new DrizzleTelegramSubscriberRepository(database.db);
  const app = createTelegramBotApp({
    repository,
    telegramClient,
    webhookSecret: config.webhookSecret,
    meditationAudio: config.meditationAudio,
    meditationCaption: config.meditationCaption,
    testMessage: config.testMessage,
    followUpDelayMs: config.followUpDelayMs,
    logError: (message) => log(message, 'error'),
  });
  const server = createServer(app);
  const followUpWorker = startFollowUpWorker({
    repository,
    telegramClient,
    message: config.followUpMessage,
    pollIntervalMs: config.workerPollIntervalMs,
    logError: (message) => log(message, 'follow-up-error'),
  });

  server.on('clientError', (error, socket) => {
    log(`client error: ${error.message}`, 'http');
    if (socket.writable) {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    }
  });

  await new Promise<void>((resolve, reject) => {
    server.once('error', reject);
    server.listen(config.port, '0.0.0.0', () => {
      server.off('error', reject);
      resolve();
    });
  });
  log(`serving on port ${config.port}`);

  if (config.webhookUrl) {
    await telegramClient.setWebhook(config.webhookUrl, config.webhookSecret);
    log(`webhook registered at ${config.webhookUrl}`);
  }

  const shutdown = (): void => {
    server.close(() => {
      void followUpWorker
        .stop()
        .then(() => database.pool.end())
        .finally(() => process.exit(0));
    });
  };
  process.once('SIGTERM', shutdown);
  process.once('SIGINT', shutdown);
}

void startTelegramBot().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown startup error';
  log(message, 'startup-error');
  process.exit(1);
});
