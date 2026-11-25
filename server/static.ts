import fs from 'fs';
import path from 'path';

import express, { type Express, type NextFunction, type Request, type Response } from 'express';

import type { AdminRepository } from './admin-repository';
import { injectPageMeta, resolvePageMeta } from './page-meta';

export function serveStatic(
  app: Express,
  repository?: AdminRepository,
  distPath: string = path.resolve(__dirname, 'public'),
): void {
  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
  }

  const template = fs.readFileSync(path.resolve(distPath, 'index.html'), 'utf-8');
  app.use(express.static(distPath, { index: false }));

  app.use('*', (req: Request, res: Response, next: NextFunction): void => {
    const pathname = req.originalUrl.split('?')[0] || '/';
    void resolvePageMeta(pathname, repository)
      .then((meta): void => {
        res.set('Cache-Control', 'public, max-age=0').type('html')
          .send(injectPageMeta(template, meta, getBaseUrl(req), pathname));
      })
      .catch(next);
  });
}

function getBaseUrl(req: Request): string {
  const forwardedProto = req.get('x-forwarded-proto')?.split(',')[0]?.trim();
  const proto = forwardedProto || req.protocol;
  return `${proto}://${req.get('host')}`;
}
