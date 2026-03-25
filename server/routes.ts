import type { Express } from 'express';
import type { Server } from 'http';
import { z } from 'zod';

import { retreatLanguageSchema, updateRetreatStatusSchema } from '@shared/schema';
import {
  type RetreatLanguage,
  type RetreatView,
} from '@shared/retreat-content';
import { listRetreats, updateRetreatStatus } from './retreats';

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  void httpServer;

  app.get("/healthz", (_req, res) => {
    res.status(200).json({ ok: true });
  });

  app.get('/api/retreats', async (req, res, next) => {
    try {
      const viewParam = typeof req.query.view === 'string' ? req.query.view : 'upcoming';
      const languageParam = typeof req.query.language === 'string' ? req.query.language : 'en';
      const view = z.enum(['upcoming', 'archive', 'all']).parse(viewParam) as RetreatView;
      const language = retreatLanguageSchema.parse(languageParam) as RetreatLanguage;
      const today = new Date().toISOString().slice(0, 10);
      const retreats = await listRetreats({ language, view, today });

      res.status(200).json({
        view,
        language,
        retreats,
      });
    } catch (error) {
      next(error);
    }
  });

  app.patch('/api/retreats/:id/status', async (req, res, next) => {
    try {
      const retreatId = z.coerce.number().int().positive().parse(req.params.id);
      const body = updateRetreatStatusSchema.parse(req.body);
      const retreat = await updateRetreatStatus(retreatId, body.status);

      if (!retreat) {
        res.status(404).json({ message: 'Retreat not found' });
        return;
      }

      res.status(200).json({ retreat });
    } catch (error) {
      next(error);
    }
  });

  // Return a proper API 404 instead of falling through to the SPA index.html.
  app.use("/api", (_req, res) => {
    res.status(404).json({ message: "API route not found" });
  });

  return httpServer;
}
