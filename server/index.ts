import 'dotenv/config';

import { createServer } from 'http';

import { createApp } from './app';
import { DrizzleAdminRepository } from './admin-repository';
import { createAuthentication, createDevelopmentAuthentication, createUnavailableAuthentication } from './auth';
import { readRuntimeConfig } from './config';
import { DrizzleCourseRepository } from './course-repository';
import { createDatabase } from './db/client';
import { serveStatic } from './static';
import { createSelectelMediaSigner, type MediaSigner, StorageConfigurationError } from './storage/selectel';

export function log(message: string, source = 'express'): void {
  const formattedTime = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit',
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

async function startServer(): Promise<void> {
  const config = readRuntimeConfig();
  const database = config.databaseUrl ? createDatabase(config.databaseUrl) : undefined;
  const repository = database ? new DrizzleCourseRepository(database.db) : undefined;
  const adminRepository = database ? new DrizzleAdminRepository(database.db) : undefined;
  const authentication = database && repository
    ? shouldUseDevelopmentAuthentication(config)
      ? createDevelopmentAuthentication(repository, config.developmentAuthEmail!)
      : createAuthentication(config, database.pool, repository)
    : createUnavailableAuthentication();

  let mediaSigner: MediaSigner | undefined;
  try {
    mediaSigner = createSelectelMediaSigner(config);
  } catch (error) {
    if (!(error instanceof StorageConfigurationError)) {
      throw error;
    }
  }

  const app = createApp({
    repository,
    adminRepository,
    adminApiKey: config.adminApiKey,
    mediaSigner,
    authMiddleware: authentication.middleware,
    authRouter: authentication.router,
    logError: (message) => log(message, 'error'),
  });
  const httpServer = createServer(app);

  httpServer.on('clientError', (error, socket) => {
    log(`client error: ${error.message}`, 'http');
    if (socket.writable) {
      socket.end('HTTP/1.1 400 Bad Request\r\n\r\n');
    }
  });

  if (process.env.NODE_ENV === 'production') {
    serveStatic(app);
  } else {
    const { setupVite } = await import('./vite');
    await setupVite(httpServer, app);
  }

  const port = Number.parseInt(process.env.PORT || '3001', 10);
  httpServer.listen(port, '0.0.0.0', () => {
    log(`serving on port ${port}`);
  });
}

function shouldUseDevelopmentAuthentication(config: ReturnType<typeof readRuntimeConfig>): boolean {
  if (process.env.NODE_ENV !== 'development' || !config.developmentAuthEmail) {
    return false;
  }

  const hostname = new URL(config.appUrl).hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

void startServer().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown startup error';
  log(message, 'startup-error');
  process.exit(1);
});
