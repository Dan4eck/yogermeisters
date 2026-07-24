import express, { type Express, type NextFunction, type Request, type RequestHandler, type Response, Router } from 'express';

import type { CourseRepository } from './course-repository';
import type { MediaSigner } from './storage/selectel';
import { StorageConfigurationError } from './storage/selectel';

export interface AppDependencies {
  readonly repository?: CourseRepository;
  readonly mediaSigner?: MediaSigner;
  readonly authMiddleware?: readonly RequestHandler[];
  readonly authRouter?: Router;
  readonly logError?: (message: string) => void;
}

export function createApp(dependencies: AppDependencies = {}): Express {
  const app = express();
  app.set('trust proxy', 1);
  app.use(express.json({ limit: '100kb' }));

  for (const middleware of dependencies.authMiddleware ?? []) {
    app.use(middleware);
  }

  app.get('/healthz', (_req, res) => {
    res.status(200).json({ ok: true });
  });

  if (dependencies.authRouter) {
    app.use('/auth', dependencies.authRouter);
  } else {
    const authRouter = Router();
    authRouter.get('/google', unavailableAuth);
    authRouter.get('/google/callback', unavailableAuth);
    authRouter.post('/logout', (_req, res) => res.status(204).end());
    app.use('/auth', authRouter);
  }

  app.get('/api/me', requireUser, (req, res) => {
    res.json({ user: req.user });
  });

  app.get(
    '/api/courses',
    requireUser,
    asyncRoute(async (req, res) => {
      const repository = requireRepository(dependencies.repository);
      const courses = await repository.listCoursesForUser(req.user!.id);
      res.set('Cache-Control', 'private, no-store').json({ courses });
    }),
  );

  app.get(
    '/api/courses/:slug',
    requireUser,
    asyncRoute(async (req, res) => {
      const repository = requireRepository(dependencies.repository);
      const course = await repository.getCourseForUser(req.user!.id, req.params.slug);
      if (!course) {
        res.status(403).json({ code: 'course_access_denied', message: 'You do not have access to this course' });
        return;
      }
      res.set('Cache-Control', 'private, no-store').json({ course });
    }),
  );

  app.put(
    '/api/courses/:slug/lessons/:lessonSlug/completion',
    requireUser,
    asyncRoute(async (req, res) => {
      const repository = requireRepository(dependencies.repository);
      const completed = await repository.completeLessonForUser(
        req.user!.id,
        req.params.slug,
        req.params.lessonSlug,
      );
      if (!completed) {
        res.status(403).json({ code: 'course_access_denied', message: 'You do not have access to this lesson' });
        return;
      }

      res.status(204).end();
    }),
  );

  app.get(
    '/api/courses/:slug/intro-media',
    requireUser,
    asyncRoute(async (req, res) => {
      const repository = requireRepository(dependencies.repository);
      const media = await repository.getCourseIntroMediaForUser(req.user!.id, req.params.slug);
      if (!media) {
        res.status(403).json({ code: 'course_access_denied', message: 'You do not have access to this course' });
        return;
      }
      if (!media.objectKey) {
        res.status(409).json({ code: 'media_not_ready', message: 'Intro media has not been uploaded' });
        return;
      }

      await sendSignedMedia(res, dependencies.mediaSigner, media.objectKey);
    }),
  );

  app.get(
    '/api/courses/:slug/lessons/:lessonSlug/media',
    requireUser,
    asyncRoute(async (req, res) => {
      const repository = requireRepository(dependencies.repository);
      const media = await repository.getLessonMediaForUser(req.user!.id, req.params.slug, req.params.lessonSlug);
      if (!media) {
        res.status(403).json({ code: 'course_access_denied', message: 'You do not have access to this lesson' });
        return;
      }
      if (!media.objectKey) {
        res.status(409).json({ code: 'media_not_ready', message: 'Media has not been uploaded for this lesson' });
        return;
      }
      await sendSignedMedia(res, dependencies.mediaSigner, media.objectKey);
    }),
  );

  app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown server error';
    dependencies.logError?.(errorMessage);
    if (res.headersSent) {
      return;
    }

    if (error instanceof StorageConfigurationError) {
      res.status(503).json({ code: 'storage_not_configured', message: error.message });
      return;
    }
    if (error instanceof ServiceConfigurationError) {
      res.status(503).json({ code: 'service_not_configured', message: error.message });
      return;
    }

    const message = error instanceof URIError ? 'Malformed request path' : 'Internal Server Error';
    const status = error instanceof URIError ? 400 : 500;
    res.status(status).json({ message });
  });

  return app;
}

function requireUser(req: Request, res: Response, next: NextFunction): void {
  if (!req.isAuthenticated?.() || !req.user) {
    res.status(401).json({ code: 'unauthorized', message: 'Authentication required' });
    return;
  }
  next();
}

function unavailableAuth(_req: Request, res: Response): void {
  res.status(503).json({ code: 'auth_not_configured', message: 'Authentication is not configured' });
}

function requireRepository(repository: CourseRepository | undefined): CourseRepository {
  if (!repository) {
    throw new ServiceConfigurationError('Database is not configured');
  }
  return repository;
}

function asyncRoute(
  handler: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): RequestHandler {
  return (req, res, next) => {
    void handler(req, res, next).catch(next);
  };
}

class ServiceConfigurationError extends Error {}

function getMediaKind(objectKey: string): 'audio' | 'video' {
  return /\.(?:mp3|m4a|aac|ogg|wav)$/i.test(objectKey) ? 'audio' : 'video';
}

async function sendSignedMedia(
  res: Response,
  mediaSigner: MediaSigner | undefined,
  objectKey: string,
): Promise<void> {
  if (!mediaSigner) {
    throw new StorageConfigurationError();
  }

  const signedMedia = await mediaSigner.createDownloadUrl(objectKey);
  res.set('Cache-Control', 'private, no-store').json({
    ...signedMedia,
    kind: getMediaKind(objectKey),
  });
}
