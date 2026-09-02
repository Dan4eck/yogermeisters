import 'dotenv/config';

import { createServer } from 'http';

import { createTelegramBotApp } from './app';
import { readTelegramBotConfig } from './config';
import { createMeditationFunnelPlan } from './content';
import { createTelegramFunnel } from './funnel';
import { DrizzleTelegramFunnelStore } from './repository';
import { BotApiTelegramClient } from './telegram-api';
import { startTelegramDeliveryWorker } from './worker';
import { createDatabase } from '../server/db/client';

const WORKER_POLL_INTERVAL_MS = 15_000;

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
  const store = new DrizzleTelegramFunnelStore(database.db);
  const plan = createMeditationFunnelPlan(config.meditationAudio);
  const funnel = createTelegramFunnel({
    store,
    telegramClient,
    plan,
    logError: (message) => log(message, 'error'),
  });
  const deliveryWorker = startTelegramDeliveryWorker({
    funnel,
    pollIntervalMs: WORKER_POLL_INTERVAL_MS,
    logError: (message) => log(message, 'delivery-error'),
  });
  const app = createTelegramBotApp({
    funnel,
    webhookSecret: config.webhookSecret,
    notifyWork: deliveryWorker.wake,
    logError: (message) => log(message, 'error'),
  });
  const server = createServer(app);

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

  let shuttingDown = false;
  const shutdown = (): void => {
    if (shuttingDown) {
      return;
    }
    shuttingDown = true;
    const forceExit = setTimeout(() => process.exit(1), 15_000);
    forceExit.unref();
    const closeServer = new Promise<void>((resolve) => server.close(() => resolve()));
    void Promise.all([closeServer, deliveryWorker.stop()])
      .then(() => database.pool.end())
      .then(() => process.exit(0))
      .catch((error: unknown) => {
        log(error instanceof Error ? error.message : 'Unknown shutdown error', 'shutdown-error');
        process.exit(1);
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
