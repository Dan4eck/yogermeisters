import express, { Router, type RequestHandler } from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { createApp } from './app';
import { createDevelopmentAuthentication, createLogoutHandler, createUnavailableAuthentication } from './auth';
import type { CourseRepository, GoogleProfileInput } from './course-repository';
import type { AuthenticatedUser, CourseDetails, CourseSummary, LessonMedia } from './types';

const user: AuthenticatedUser = {
  id: 'user-1',
  email: 'student@example.com',
  name: 'Student',
  avatarUrl: null,
  role: 'student',
};

const course: CourseDetails = {
  slug: 'the-yoga-method',
  title: 'the yoga method',
  description: 'Course description',
  completedLessons: 0,
  totalLessons: 1,
  progressPercent: 0,
  introAvailable: true,
  modules: [
    {
      title: 'Module 1',
      sortOrder: 1,
      lessons: [{ slug: 'lesson-1', title: 'Lesson 1', description: '', sortOrder: 1, completed: false }],
    },
  ],
};

class FakeRepository implements CourseRepository {
  constructor(
    private readonly hasAccess: boolean,
    private readonly media: LessonMedia = { objectKey: 'courses/the-yoga-method/lesson-1.mp4' },
  ) {}

  async findUserById(): Promise<AuthenticatedUser | null> {
    return user;
  }

  async findUserByEmail(): Promise<AuthenticatedUser | null> {
    return user;
  }

  async upsertGoogleUser(_profile: GoogleProfileInput): Promise<AuthenticatedUser> {
    return user;
  }

  async listCoursesForUser(): Promise<readonly CourseSummary[]> {
    return this.hasAccess ? [course] : [];
  }

  async getCourseForUser(): Promise<CourseDetails | null> {
    return this.hasAccess ? course : null;
  }

  async getCourseIntroMediaForUser(): Promise<LessonMedia | null> {
    return this.hasAccess ? { objectKey: 'yoger-intro.mp4' } : null;
  }

  async getLessonMediaForUser(): Promise<LessonMedia | null> {
    return this.hasAccess ? this.media : null;
  }

  async completeLessonForUser(): Promise<boolean> {
    return this.hasAccess;
  }
}

const mockAuthentication: RequestHandler = (req, _res, next) => {
  if (req.get('x-test-user') === 'active') {
    req.user = user;
    req.isAuthenticated = () => true;
  } else {
    req.isAuthenticated = () => false;
  }
  next();
};

describe('cabinet API', () => {
  it('returns health status', async () => {
    const response = await request(createApp()).get('/healthz');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ ok: true });
  });

  it.each(['/api/me', '/api/courses'])('returns 401 for %s without a session', async (path) => {
    const response = await request(createApp({ authMiddleware: [mockAuthentication] })).get(path);
    expect(response.status).toBe(401);
    expect(response.body.code).toBe('unauthorized');
  });

  it('returns 401 when completing a lesson without a session', async () => {
    const response = await request(createApp({ authMiddleware: [mockAuthentication] }))
      .put('/api/courses/the-yoga-method/lessons/lesson-1/completion');

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('unauthorized');
  });

  it('returns the user and active courses for an authenticated student', async () => {
    const app = createApp({ repository: new FakeRepository(true), authMiddleware: [mockAuthentication] });
    const meResponse = await request(app).get('/api/me').set('x-test-user', 'active');
    const coursesResponse = await request(app).get('/api/courses').set('x-test-user', 'active');

    expect(meResponse.status).toBe(200);
    expect(meResponse.body.user.email).toBe(user.email);
    expect(coursesResponse.status).toBe(200);
    expect(coursesResponse.body.courses).toHaveLength(1);
  });

  it('returns 403 when course access is missing or revoked', async () => {
    const app = createApp({ repository: new FakeRepository(false), authMiddleware: [mockAuthentication] });
    const response = await request(app).get('/api/courses/the-yoga-method').set('x-test-user', 'active');

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('course_access_denied');
  });

  it('signs a private object key only after the access check', async () => {
    const createDownloadUrl = vi.fn().mockResolvedValue({
      url: 'https://private.example/signed-object',
      expiresIn: 900,
    });
    const app = createApp({
      repository: new FakeRepository(true),
      mediaSigner: { createDownloadUrl },
      authMiddleware: [mockAuthentication],
    });
    const response = await request(app)
      .get('/api/courses/the-yoga-method/lessons/lesson-1/media')
      .set('x-test-user', 'active');

    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      url: 'https://private.example/signed-object',
      expiresIn: 900,
      kind: 'video',
    });
    expect(response.headers['cache-control']).toBe('private, no-store');
    expect(createDownloadUrl).toHaveBeenCalledWith('courses/the-yoga-method/lesson-1.mp4');
  });

  it('signs the course intro only for a student with access', async () => {
    const createDownloadUrl = vi.fn().mockResolvedValue({
      url: 'https://private.example/signed-intro',
      expiresIn: 900,
    });
    const app = createApp({
      repository: new FakeRepository(true),
      mediaSigner: { createDownloadUrl },
      authMiddleware: [mockAuthentication],
    });
    const response = await request(app)
      .get('/api/courses/the-yoga-method/intro-media')
      .set('x-test-user', 'active');

    expect(response.status).toBe(200);
    expect(response.body.kind).toBe('video');
    expect(createDownloadUrl).toHaveBeenCalledWith('yoger-intro.mp4');
  });

  it('identifies an audio lesson for the client player', async () => {
    const app = createApp({
      repository: new FakeRepository(true, { objectKey: 'nidra-f.mp3' }),
      mediaSigner: {
        createDownloadUrl: vi.fn().mockResolvedValue({
          url: 'https://private.example/signed-audio',
          expiresIn: 900,
        }),
      },
      authMiddleware: [mockAuthentication],
    });
    const response = await request(app)
      .get('/api/courses/the-yoga-method/lessons/lesson-1/media')
      .set('x-test-user', 'active');

    expect(response.status).toBe(200);
    expect(response.body.kind).toBe('audio');
  });

  it('does not sign media when access is missing', async () => {
    const createDownloadUrl = vi.fn();
    const app = createApp({
      repository: new FakeRepository(false),
      mediaSigner: { createDownloadUrl },
      authMiddleware: [mockAuthentication],
    });
    const response = await request(app)
      .get('/api/courses/the-yoga-method/lessons/lesson-1/media')
      .set('x-test-user', 'active');

    expect(response.status).toBe(403);
    expect(createDownloadUrl).not.toHaveBeenCalled();
  });

  it('returns a safe 503 when private storage is not configured', async () => {
    const app = createApp({ repository: new FakeRepository(true), authMiddleware: [mockAuthentication] });
    const response = await request(app)
      .get('/api/courses/the-yoga-method/lessons/lesson-1/media')
      .set('x-test-user', 'active');

    expect(response.status).toBe(503);
    expect(response.body).toEqual({
      code: 'storage_not_configured',
      message: 'Private media storage is not configured',
    });
    expect(JSON.stringify(response.body)).not.toContain('media_object_key');
  });

  it('marks an accessible lesson as completed', async () => {
    const repository = new FakeRepository(true);
    const completeLessonForUser = vi.spyOn(repository, 'completeLessonForUser');
    const app = createApp({ repository, authMiddleware: [mockAuthentication] });
    const response = await request(app)
      .put('/api/courses/the-yoga-method/lessons/lesson-1/completion')
      .set('x-test-user', 'active');

    expect(response.status).toBe(204);
    expect(completeLessonForUser).toHaveBeenCalledWith(user.id, 'the-yoga-method', 'lesson-1');
  });

  it('does not mark a lesson as completed without course access', async () => {
    const app = createApp({ repository: new FakeRepository(false), authMiddleware: [mockAuthentication] });
    const response = await request(app)
      .put('/api/courses/the-yoga-method/lessons/lesson-1/completion')
      .set('x-test-user', 'active');

    expect(response.status).toBe(403);
    expect(response.body.code).toBe('course_access_denied');
  });
});

describe('authentication setup', () => {
  it('uses the configured development user without Google OAuth', async () => {
    const repository = new FakeRepository(true);
    const authentication = createDevelopmentAuthentication(repository, user.email);
    const app = createApp({
      repository,
      authMiddleware: authentication.middleware,
      authRouter: authentication.router,
    });

    const response = await request(app).get('/api/me');

    expect(response.status).toBe(200);
    expect(response.body.user.email).toBe(user.email);
  });

  it('reports missing OAuth configuration without exposing environment values', async () => {
    const authentication = createUnavailableAuthentication();
    const response = await request(createApp({ authRouter: authentication.router })).get('/auth/google');

    expect(response.status).toBe(503);
    expect(response.body.code).toBe('auth_not_configured');
  });

  it('logs out and destroys the server session', async () => {
    const destroy = vi.fn((callback: (error?: Error) => void) => callback());
    const logout = vi.fn((callback: (error?: Error) => void) => callback());
    const middleware: RequestHandler = (req, _res, next) => {
      req.logout = logout;
      Object.assign(req, { session: { destroy } });
      next();
    };
    const authRouter = Router();
    authRouter.post('/logout', createLogoutHandler());
    const app = express();
    app.use(middleware);
    app.use('/auth', authRouter);

    const response = await request(app).post('/auth/logout');
    expect(response.status).toBe(204);
    expect(logout).toHaveBeenCalledOnce();
    expect(destroy).toHaveBeenCalledOnce();
  });
});
