import express, { Router, type RequestHandler } from 'express';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { retreatSeedData, type RetreatSeed, type RetreatUpdate } from '../shared/retreats';

import type { AdminRepository, CourseAccessChangeResult, CourseClient } from './admin-repository';
import { createApp } from './app';
import { createDevelopmentAuthentication, createLogoutHandler, createUnavailableAuthentication } from './auth';
import type { CourseRepository, GoogleProfileInput } from './course-repository';
import type { AuthenticatedUser, CourseDetails, CourseSummary, LessonMedia } from './types';

const user: AuthenticatedUser = {
  id: '13c9c4b8-2e6f-4f68-9dd2-1b73f82ca924',
  email: 'student@example.com',
  name: 'Student',
  avatarUrl: null,
  role: 'student',
};

const adminUser: AuthenticatedUser = {
  ...user,
  id: 'a5e71d92-414a-4c5c-9261-600c108bfd0e',
  email: 'admin@example.com',
  name: 'Admin',
  role: 'admin',
};

const adminApiKey = 'test-admin-api-key-with-at-least-32-characters';

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
      lessons: [{
        slug: 'lesson-1',
        title: 'Lesson 1',
        description: '',
        sortOrder: 1,
        mediaAvailable: true,
        completed: false,
      }],
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

  async getPublishedLessonMedia(): Promise<LessonMedia | null> {
    return this.media;
  }

  async completeLessonForUser(): Promise<boolean> {
    return this.hasAccess;
  }
}

class FakeAdminRepository implements AdminRepository {
  readonly grantCourseAccess = vi.fn<(
    courseSlug: string,
    email: string,
  ) => Promise<CourseAccessChangeResult>>().mockResolvedValue('changed');
  readonly revokeCourseAccess = vi.fn<(
    courseSlug: string,
    userId: string,
  ) => Promise<CourseAccessChangeResult>>().mockResolvedValue('changed');
  readonly updateRetreat = vi.fn<(slug: string, update: RetreatUpdate) => Promise<RetreatSeed | null>>(async (
    slug,
    update,
  ) => {
    const retreat = retreatSeedData.find((item) => item.slug === slug);
    return retreat ? { ...retreat, ...update } : null;
  });

  async listCourseClients(courseSlug: string): Promise<readonly CourseClient[] | null> {
    return courseSlug === course.slug
      ? [{
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        grantedAt: new Date('2026-01-01T00:00:00Z'),
      }]
      : null;
  }

  async listRetreats(): Promise<readonly RetreatSeed[]> {
    return retreatSeedData;
  }
}

const mockAuthentication: RequestHandler = (req, _res, next) => {
  const testUser = req.get('x-test-user');
  if (testUser === 'active' || testUser === 'admin') {
    req.user = testUser === 'admin' ? adminUser : user;
    req.isAuthenticated = () => true;
  } else {
    req.isAuthenticated = () => false;
  }
  next();
};

describe('admin API', () => {
  it('serves localized retreat data publicly from the repository', async () => {
    const app = createApp({ adminRepository: new FakeAdminRepository() });
    const retreat = retreatSeedData[0];

    const listResponse = await request(app).get('/api/retreats?language=ru&view=all');
    const detailResponse = await request(app).get(`/api/retreats/${retreat.slug}?language=ru`);

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.language).toBe('ru');
    expect(listResponse.body.retreats).toHaveLength(retreatSeedData.length);
    expect(detailResponse.status).toBe(200);
    expect(detailResponse.body.retreat.title).toBe(retreat.translations?.ru?.title);
  });

  it('requires an authenticated administrator', async () => {
    const app = createApp({
      adminRepository: new FakeAdminRepository(),
      authMiddleware: [mockAuthentication],
    });

    const unauthenticated = await request(app).get('/api/admin/retreats');
    const student = await request(app).get('/api/admin/retreats').set('x-test-user', 'active');

    expect(unauthenticated.status).toBe(401);
    expect(student.status).toBe(403);
    expect(student.body.code).toBe('admin_required');
  });

  it('authorizes every admin route with the configured bearer key', async () => {
    const adminRepository = new FakeAdminRepository();
    const app = createApp({ adminRepository, adminApiKey });
    const authorization = `Bearer ${adminApiKey}`;

    const retreatsResponse = await request(app)
      .get('/api/admin/retreats')
      .set('authorization', authorization);
    const updateResponse = await request(app)
      .patch(`/api/admin/retreats/${retreatSeedData[0].slug}`)
      .set('authorization', authorization)
      .send({ price: '€820' });
    const clientsResponse = await request(app)
      .get(`/api/admin/courses/${course.slug}/clients`)
      .set('authorization', authorization);
    const grantResponse = await request(app)
      .post(`/api/admin/courses/${course.slug}/clients`)
      .set('authorization', authorization)
      .send({ email: user.email });
    const revokeResponse = await request(app)
      .delete(`/api/admin/courses/${course.slug}/clients/${user.id}`)
      .set('authorization', authorization);

    expect(retreatsResponse.status).toBe(200);
    expect(updateResponse.status).toBe(200);
    expect(clientsResponse.status).toBe(200);
    expect(grantResponse.status).toBe(204);
    expect(revokeResponse.status).toBe(204);
  });

  it('rejects an invalid bearer key', async () => {
    const app = createApp({
      adminRepository: new FakeAdminRepository(),
      adminApiKey,
    });

    const response = await request(app)
      .get('/api/admin/retreats')
      .set('authorization', 'Bearer wrong-key');

    expect(response.status).toBe(401);
    expect(response.body.code).toBe('invalid_api_key');
  });

  it('lists course clients and grants and revokes access', async () => {
    const adminRepository = new FakeAdminRepository();
    const app = createApp({ adminRepository, authMiddleware: [mockAuthentication] });
    const newClientEmail = 'new-student@example.com';

    const listResponse = await request(app)
      .get(`/api/admin/courses/${course.slug}/clients`)
      .set('x-test-user', 'admin');
    const grantResponse = await request(app)
      .post(`/api/admin/courses/${course.slug}/clients`)
      .set('x-test-user', 'admin')
      .send({ email: 'NEW-STUDENT@example.com' });
    const revokeResponse = await request(app)
      .delete(`/api/admin/courses/${course.slug}/clients/${user.id}`)
      .set('x-test-user', 'admin');

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.clients[0].email).toBe(user.email);
    expect(grantResponse.status).toBe(204);
    expect(adminRepository.grantCourseAccess).toHaveBeenCalledWith(course.slug, newClientEmail);
    expect(revokeResponse.status).toBe(204);
    expect(adminRepository.revokeCourseAccess).toHaveBeenCalledWith(course.slug, user.id);
  });

  it('lists and updates existing retreats without allowing their identity to change', async () => {
    const adminRepository = new FakeAdminRepository();
    const app = createApp({ adminRepository, authMiddleware: [mockAuthentication] });
    const retreat = retreatSeedData[0];

    const listResponse = await request(app)
      .get('/api/admin/retreats')
      .set('x-test-user', 'admin');
    const updateResponse = await request(app)
      .patch(`/api/admin/retreats/${retreat.slug}`)
      .set('x-test-user', 'admin')
      .send({ title: 'Updated retreat wording', price: '€810' });
    const identityUpdateResponse = await request(app)
      .patch(`/api/admin/retreats/${retreat.slug}`)
      .set('x-test-user', 'admin')
      .send({ slug: 'replacement-retreat' });

    expect(listResponse.status).toBe(200);
    expect(listResponse.body.retreats).toHaveLength(retreatSeedData.length);
    expect(updateResponse.status).toBe(200);
    expect(updateResponse.body.retreat.title).toBe('Updated retreat wording');
    expect(adminRepository.updateRetreat).toHaveBeenCalledWith(retreat.slug, {
      title: 'Updated retreat wording',
      price: '€810',
    });
    expect(identityUpdateResponse.status).toBe(400);
    expect(identityUpdateResponse.body.code).toBe('invalid_request');
  });

  it('does not expose endpoints for creating or deleting retreats', async () => {
    const app = createApp({
      adminRepository: new FakeAdminRepository(),
      authMiddleware: [mockAuthentication],
    });

    const createResponse = await request(app)
      .post('/api/admin/retreats')
      .set('x-test-user', 'admin')
      .send(retreatSeedData[0]);
    const deleteResponse = await request(app)
      .delete(`/api/admin/retreats/${retreatSeedData[0].slug}`)
      .set('x-test-user', 'admin');

    expect(createResponse.status).toBe(404);
    expect(deleteResponse.status).toBe(404);
  });

  it('validates client email and retreat content before calling the repository', async () => {
    const adminRepository = new FakeAdminRepository();
    const app = createApp({ adminRepository, authMiddleware: [mockAuthentication] });

    const emailResponse = await request(app)
      .post(`/api/admin/courses/${course.slug}/clients`)
      .set('x-test-user', 'admin')
      .send({ email: 'not-an-email' });
    const retreatResponse = await request(app)
      .patch(`/api/admin/retreats/${retreatSeedData[0].slug}`)
      .set('x-test-user', 'admin')
      .send({ startDate: 'tomorrow' });

    expect(emailResponse.status).toBe(400);
    expect(retreatResponse.status).toBe(400);
    expect(adminRepository.grantCourseAccess).not.toHaveBeenCalled();
    expect(adminRepository.updateRetreat).not.toHaveBeenCalled();
  });
});

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

  it('opens the free lesson for any authenticated user without course access', async () => {
    const createDownloadUrl = vi.fn().mockResolvedValue({
      url: 'https://private.example/free-lesson',
      expiresIn: 900,
    });
    const app = createApp({
      repository: new FakeRepository(false, { objectKey: 'yoger-1505.mp4' }),
      mediaSigner: { createDownloadUrl },
      authMiddleware: [mockAuthentication],
    });

    const unauthenticated = await request(app).get('/api/free-lesson/media');
    const authenticated = await request(app).get('/api/free-lesson/media').set('x-test-user', 'active');

    expect(unauthenticated.status).toBe(401);
    expect(authenticated.status).toBe(200);
    expect(authenticated.body.kind).toBe('video');
    expect(createDownloadUrl).toHaveBeenCalledWith('yoger-1505.mp4');
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

  it('returns to the free lesson after development sign-in and rejects external redirects', async () => {
    const authentication = createDevelopmentAuthentication(new FakeRepository(true), user.email);
    const app = createApp({ authRouter: authentication.router });

    const freeLessonResponse = await request(app).get('/auth/google?next=%2Fcabinet%2Ffree-lesson');
    const unsafeResponse = await request(app).get('/auth/google?next=https%3A%2F%2Fevil.example');

    expect(freeLessonResponse.status).toBe(302);
    expect(freeLessonResponse.headers.location).toBe('/cabinet/free-lesson');
    expect(unsafeResponse.headers.location).toBe('/cabinet');
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
