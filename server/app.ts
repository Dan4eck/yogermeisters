import { createHash, timingSafeEqual } from 'crypto';

import express, { type Express, type NextFunction, type Request, type RequestHandler, type Response, Router } from 'express';

import { getRetreatRecordBySlug, listRetreatRecords } from '@shared/retreats';

import type { AdminRepository, CourseAccessChangeResult } from './admin-repository';
import {
  parseClientEmail,
  parseRetreatLanguage,
  parseRetreatUpdate,
  parseRetreatView,
  parseUserId,
  RequestValidationError,
} from './admin-validation';
import type { CmsRepository } from './cms-repository';
import {
  parseBroadcastInput,
  parseBroadcastLaunchInput,
  parseBroadcastTestInput,
  parseManualEnrollInput,
  parseMediaUpload,
  parseScenarioInput,
  parseUserRoleUpdate,
  parseUuid,
} from './cms-validation';
import type { CourseRepository } from './course-repository';
import type { MediaSigner } from './storage/selectel';
import { StorageConfigurationError } from './storage/selectel';

export interface AppDependencies {
  readonly repository?: CourseRepository;
  readonly adminRepository?: AdminRepository;
  readonly cmsRepository?: CmsRepository;
  readonly adminApiKey?: string;
  readonly mediaSigner?: MediaSigner;
  readonly authMiddleware?: readonly RequestHandler[];
  readonly authRouter?: Router;
  readonly logError?: (message: string) => void;
}

export function createApp(dependencies: AppDependencies = {}): Express {
  const app = express();
  const requireAdmin = createAdminAuthorization(dependencies.adminApiKey);
  const standardJson = express.json({ limit: '100kb' });
  const mediaUploadJson = express.json({ limit: '8mb' });
  app.set('trust proxy', 1);
  app.use((req, res, next) => {
    if (req.path === '/api/admin/bot/media' && req.method === 'POST') {
      mediaUploadJson(req, res, next);
      return;
    }
    standardJson(req, res, next);
  });

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
    '/api/free-lesson/media',
    requireUser,
    asyncRoute(async (_req, res) => {
      const repository = requireRepository(dependencies.repository);
      const media = await repository.getPublishedLessonMedia('the-yoga-method', 'module-1-lesson-3');
      if (!media) {
        res.status(404).json({ code: 'free_lesson_not_found', message: 'Free lesson not found' });
        return;
      }
      if (!media.objectKey) {
        res.status(409).json({ code: 'media_not_ready', message: 'Free lesson media has not been uploaded' });
        return;
      }

      await sendSignedMedia(res, dependencies.mediaSigner, media.objectKey);
    }),
  );

  app.get(
    '/api/retreats',
    asyncRoute(async (req, res) => {
      const repository = requireAdminRepository(dependencies.adminRepository);
      const language = parseRetreatLanguage(req.query.language);
      const view = parseRetreatView(req.query.view);
      const response = listRetreatRecords(await repository.listRetreats(), view, language);
      res.set('Cache-Control', 'public, max-age=60').json(response);
    }),
  );

  app.get(
    '/api/retreats/:slug',
    asyncRoute(async (req, res) => {
      const repository = requireAdminRepository(dependencies.adminRepository);
      const language = parseRetreatLanguage(req.query.language);
      const retreat = getRetreatRecordBySlug(await repository.listRetreats(), req.params.slug, language);
      if (!retreat) {
        res.status(404).json({ code: 'retreat_not_found', message: 'Retreat not found' });
        return;
      }
      res.set('Cache-Control', 'public, max-age=60').json({ retreat });
    }),
  );

  app.get(
    '/api/admin/courses/:slug/clients',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const repository = requireAdminRepository(dependencies.adminRepository);
      const clients = await repository.listCourseClients(req.params.slug);
      if (!clients) {
        res.status(404).json({ code: 'course_not_found', message: 'Course not found' });
        return;
      }
      res.set('Cache-Control', 'private, no-store').json({ clients });
    }),
  );

  app.post(
    '/api/admin/courses/:slug/clients',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const repository = requireAdminRepository(dependencies.adminRepository);
      const result = await repository.grantCourseAccess(req.params.slug, parseClientEmail(req.body));
      if (sendCourseAccessError(res, result)) {
        return;
      }
      res.status(204).end();
    }),
  );

  app.delete(
    '/api/admin/courses/:slug/clients/:userId',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const repository = requireAdminRepository(dependencies.adminRepository);
      const result = await repository.revokeCourseAccess(req.params.slug, parseUserId(req.params.userId));
      if (sendCourseAccessError(res, result)) {
        return;
      }
      res.status(204).end();
    }),
  );

  app.get(
    '/api/admin/retreats',
    requireAdmin,
    asyncRoute(async (_req, res) => {
      const repository = requireAdminRepository(dependencies.adminRepository);
      const retreats = await repository.listRetreats();
      res.set('Cache-Control', 'private, no-store').json({ retreats });
    }),
  );

  app.patch(
    '/api/admin/retreats/:slug',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const repository = requireAdminRepository(dependencies.adminRepository);
      const retreat = await repository.updateRetreat(req.params.slug, parseRetreatUpdate(req.body));
      if (!retreat) {
        res.status(404).json({ code: 'retreat_not_found', message: 'Retreat not found' });
        return;
      }
      res.set('Cache-Control', 'private, no-store').json({ retreat });
    }),
  );

  app.get(
    '/api/admin/cms/overview',
    requireAdmin,
    asyncRoute(async (_req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const overview = await cms.getOverview();
      res.set('Cache-Control', 'private, no-store').json({ overview });
    }),
  );

  app.get(
    '/api/admin/bot/subscribers',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const status = req.query.status === 'active' || req.query.status === 'blocked' ? req.query.status : undefined;
      const subscribers = await cms.listSubscribers({
        search: typeof req.query.search === 'string' ? req.query.search : undefined,
        status,
        funnelKey: typeof req.query.funnelKey === 'string' && req.query.funnelKey ? req.query.funnelKey : undefined,
        source: typeof req.query.source === 'string' && req.query.source ? req.query.source : undefined,
        language: typeof req.query.language === 'string' && req.query.language ? req.query.language : undefined,
      });
      res.set('Cache-Control', 'private, no-store').json({ subscribers });
    }),
  );

  app.get(
    '/api/admin/bot/subscribers/:id',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const subscriber = await cms.getSubscriberDetail(parseUuid(req.params.id, 'subscriberId'));
      if (!subscriber) {
        res.status(404).json({ code: 'subscriber_not_found', message: 'Subscriber not found' });
        return;
      }
      res.set('Cache-Control', 'private, no-store').json({ subscriber });
    }),
  );

  app.post(
    '/api/admin/bot/subscribers/:id/enroll',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const subscriberId = parseUuid(req.params.id, 'subscriberId');
      const { scenarioId } = parseManualEnrollInput(req.body);
      const result = await cms.enrollSubscriberInScenario(subscriberId, scenarioId);
      if (result === 'subscriber_not_found' || result === 'scenario_not_found') {
        res.status(404).json({ code: result, message: 'Subscriber or scenario not found' });
        return;
      }
      if (result === 'subscriber_blocked' || result === 'scenario_inactive') {
        res.status(409).json({ code: result, message: 'Subscriber is blocked or scenario is not active' });
        return;
      }
      res.status(204).end();
    }),
  );

  app.post(
    '/api/admin/bot/media',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const asset = await cms.createMediaAsset(parseMediaUpload(req.body));
      res.set('Cache-Control', 'private, no-store').status(201).json({ asset });
    }),
  );

  app.get(
    '/api/admin/bot/media/:id',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const binary = await cms.getMediaAssetBinary(parseUuid(req.params.id, 'mediaId'));
      if (!binary) {
        res.status(404).json({ code: 'media_not_found', message: 'Media asset not found' });
        return;
      }
      res
        .set('Cache-Control', 'private, max-age=3600')
        .set('Content-Type', binary.mimeType)
        .send(binary.buffer);
    }),
  );

  app.get(
    '/api/admin/bot/broadcasts',
    requireAdmin,
    asyncRoute(async (_req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const broadcasts = await cms.listBroadcasts();
      res.set('Cache-Control', 'private, no-store').json({ broadcasts });
    }),
  );

  app.post(
    '/api/admin/bot/broadcasts',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const broadcast = await cms.createBroadcast(parseBroadcastInput(req.body), req.user?.id);
      res.set('Cache-Control', 'private, no-store').status(201).json({ broadcast });
    }),
  );

  app.patch(
    '/api/admin/bot/broadcasts/:id',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const result = await cms.updateBroadcast(parseUuid(req.params.id, 'broadcastId'), parseBroadcastInput(req.body));
      if (result === null) {
        res.status(404).json({ code: 'broadcast_not_found', message: 'Broadcast not found' });
        return;
      }
      if (result === 'not_editable') {
        res.status(409).json({ code: 'broadcast_not_editable', message: 'Only draft or scheduled broadcasts can be edited' });
        return;
      }
      res.set('Cache-Control', 'private, no-store').json({ broadcast: result });
    }),
  );

  app.delete(
    '/api/admin/bot/broadcasts/:id',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const result = await cms.deleteOrCancelBroadcast(parseUuid(req.params.id, 'broadcastId'));
      if (result === 'not_found') {
        res.status(404).json({ code: 'broadcast_not_found', message: 'Broadcast not found' });
        return;
      }
      res.set('Cache-Control', 'private, no-store').json({ result });
    }),
  );

  app.post(
    '/api/admin/bot/broadcasts/:id/test',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const result = await cms.enqueueTestBroadcast(
        parseUuid(req.params.id, 'broadcastId'),
        parseBroadcastTestInput(req.body),
      );
      if (result === 'not_found') {
        res.status(404).json({ code: 'broadcast_not_found', message: 'Broadcast not found' });
        return;
      }
      res.set('Cache-Control', 'private, no-store').json(result);
    }),
  );

  app.post(
    '/api/admin/bot/broadcasts/:id/launch',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const { scheduledAt } = parseBroadcastLaunchInput(req.body);
      const result = await cms.launchBroadcast(parseUuid(req.params.id, 'broadcastId'), scheduledAt);
      if (result === 'not_found') {
        res.status(404).json({ code: 'broadcast_not_found', message: 'Broadcast not found' });
        return;
      }
      if (result === 'already_launched' || result === 'no_recipients') {
        res.status(409).json({ code: result, message: result === 'no_recipients' ? 'No active recipients match this filter' : 'Broadcast was already launched' });
        return;
      }
      res.set('Cache-Control', 'private, no-store').json(result);
    }),
  );

  app.get(
    '/api/admin/bot/broadcasts/:id/deliveries',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const deliveries = await cms.listBroadcastDeliveries(parseUuid(req.params.id, 'broadcastId'));
      if (!deliveries) {
        res.status(404).json({ code: 'broadcast_not_found', message: 'Broadcast not found' });
        return;
      }
      res.set('Cache-Control', 'private, no-store').json({ deliveries });
    }),
  );

  app.get(
    '/api/admin/bot/scenarios',
    requireAdmin,
    asyncRoute(async (_req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const scenarios = await cms.listScenarios();
      res.set('Cache-Control', 'private, no-store').json({ scenarios });
    }),
  );

  app.post(
    '/api/admin/bot/scenarios',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const result = await cms.createScenario(parseScenarioInput(req.body));
      if (result === 'duplicate_payload') {
        res.status(409).json({ code: 'duplicate_payload', message: 'A scenario with this deep-link payload already exists' });
        return;
      }
      res.set('Cache-Control', 'private, no-store').status(201).json({ scenario: result });
    }),
  );

  app.patch(
    '/api/admin/bot/scenarios/:id',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const result = await cms.updateScenario(parseUuid(req.params.id, 'scenarioId'), parseScenarioInput(req.body));
      if (result === null) {
        res.status(404).json({ code: 'scenario_not_found', message: 'Scenario not found' });
        return;
      }
      if (result === 'duplicate_payload') {
        res.status(409).json({ code: 'duplicate_payload', message: 'A scenario with this deep-link payload already exists' });
        return;
      }
      res.set('Cache-Control', 'private, no-store').json({ scenario: result });
    }),
  );

  app.delete(
    '/api/admin/bot/scenarios/:id',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const result = await cms.deleteScenario(parseUuid(req.params.id, 'scenarioId'));
      if (result === 'not_found') {
        res.status(404).json({ code: 'scenario_not_found', message: 'Scenario not found' });
        return;
      }
      if (result === 'active_cannot_delete') {
        res.status(409).json({ code: 'scenario_active', message: 'Archive or pause the scenario before deleting it' });
        return;
      }
      res.status(204).end();
    }),
  );

  app.get(
    '/api/admin/courses',
    requireAdmin,
    asyncRoute(async (_req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const courses = await cms.listAdminCourses();
      res.set('Cache-Control', 'private, no-store').json({ courses });
    }),
  );

  app.get(
    '/api/admin/courses/:slug/clients-progress',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const clients = await cms.listCourseClientsWithProgress(req.params.slug);
      if (!clients) {
        res.status(404).json({ code: 'course_not_found', message: 'Course not found' });
        return;
      }
      res.set('Cache-Control', 'private, no-store').json({ clients });
    }),
  );

  app.get(
    '/api/admin/users',
    requireAdmin,
    asyncRoute(async (_req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const users = await cms.listTeamUsers();
      res.set('Cache-Control', 'private, no-store').json({ users });
    }),
  );

  app.patch(
    '/api/admin/users/:userId/role',
    requireAdmin,
    asyncRoute(async (req, res) => {
      const cms = requireCmsRepository(dependencies.cmsRepository);
      const userId = parseUserId(req.params.userId);
      const role = parseUserRoleUpdate(req.body);
      if (req.user?.id === userId && role !== 'admin') {
        res.status(409).json({ code: 'cannot_demote_self', message: 'You cannot remove admin access from yourself' });
        return;
      }
      const result = await cms.updateUserRole(userId, role);
      if (result === 'not_found') {
        res.status(404).json({ code: 'user_not_found', message: 'User not found' });
        return;
      }
      res.status(204).end();
    }),
  );

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
    if (error instanceof RequestValidationError) {
      res.status(400).json({ code: 'invalid_request', message: error.message });
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

function createAdminAuthorization(adminApiKey: string | undefined): RequestHandler {
  return (req, res, next) => {
    if (req.isAuthenticated?.() && req.user?.role === 'admin') {
      next();
      return;
    }

    const bearerToken = readBearerToken(req.get('authorization'));
    if (bearerToken && adminApiKey && apiKeysMatch(bearerToken, adminApiKey)) {
      next();
      return;
    }
    if (bearerToken) {
      res.status(401).json({ code: 'invalid_api_key', message: 'The API key is invalid' });
      return;
    }
    if (req.isAuthenticated?.() && req.user) {
      res.status(403).json({ code: 'admin_required', message: 'Administrator access required' });
      return;
    }
    res.status(401).json({ code: 'unauthorized', message: 'Authentication or an API key is required' });
  };
}

function readBearerToken(authorization: string | undefined): string | null {
  if (!authorization) {
    return null;
  }
  const match = /^Bearer ([^\s]+)$/.exec(authorization);
  return match?.[1] ?? null;
}

function apiKeysMatch(provided: string, configured: string): boolean {
  const providedDigest = createHash('sha256').update(provided).digest();
  const configuredDigest = createHash('sha256').update(configured).digest();
  return timingSafeEqual(providedDigest, configuredDigest);
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

function requireAdminRepository(repository: AdminRepository | undefined): AdminRepository {
  if (!repository) {
    throw new ServiceConfigurationError('Database is not configured');
  }
  return repository;
}

function requireCmsRepository(repository: CmsRepository | undefined): CmsRepository {
  if (!repository) {
    throw new ServiceConfigurationError('Database is not configured');
  }
  return repository;
}

function sendCourseAccessError(res: Response, result: CourseAccessChangeResult): boolean {
  if (result === 'changed') {
    return false;
  }
  if (result === 'course_not_found') {
    res.status(404).json({ code: result, message: 'Course not found' });
    return true;
  }
  res.status(404).json({ code: result, message: 'Active course access not found' });
  return true;
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
