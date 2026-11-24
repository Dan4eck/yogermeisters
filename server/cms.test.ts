import { describe, expect, it, vi } from 'vitest';
import request from 'supertest';

import type { CmsOverview, CmsScenarioRecord, CmsBroadcastRecord } from '@shared/cms';

import { createApp } from './app';
import type { CmsRepository } from './cms-repository';
import {
  parseBroadcastInput,
  parseMediaUpload,
  parseScenarioInput,
} from './cms-validation';

const ADMIN_KEY = 'a'.repeat(32);

function createMockCmsRepository(overrides: Partial<CmsRepository> = {}): CmsRepository {
  const overview: CmsOverview = {
    botUsername: 'yogermeisters_bot',
    subscribers: { total: 13, active: 12, blocked: 1, joinedLast7d: 1, joinedLast30d: 1 },
    broadcasts: { total: 1, completed: 1, activeOrScheduled: 0, messagesSent: 12 },
    scenarios: { total: 2, active: 2 },
    courses: { totalCourses: 1, totalUsers: 10, totalAdmins: 2, activeCourseAccesses: 5 },
    filterOptions: {
      funnels: ['welcome_meditation', 'personal_practice'],
      sources: ['personal_practice_v1'],
      languages: ['ru', 'en'],
    },
  };

  return {
    getOverview: vi.fn(async () => overview),
    listSubscribers: vi.fn(async () => []),
    getSubscriberDetail: vi.fn(async () => null),
    enrollSubscriberInScenario: vi.fn(async () => 'enrolled'),
    createMediaAsset: vi.fn(async (upload) => ({
      id: '11111111-1111-4111-8111-111111111111',
      filename: upload.filename,
      mimeType: upload.mimeType,
      sizeBytes: upload.sizeBytes,
      previewUrl: '/api/admin/bot/media/11111111-1111-4111-8111-111111111111',
      hasTelegramFileId: false,
      createdAt: new Date().toISOString(),
    })),
    getMediaAssetBinary: vi.fn(async () => null),
    listBroadcasts: vi.fn(async () => []),
    createBroadcast: vi.fn(async (input): Promise<CmsBroadcastRecord> => ({
      id: '22222222-2222-4222-8222-222222222222',
      title: input.title,
      messageText: input.messageText,
      parseMode: input.parseMode ?? 'HTML',
      mediaAssetId: input.mediaAssetId ?? null,
      mediaPreviewUrl: null,
      mediaUrl: input.mediaUrl ?? null,
      mediaType: input.mediaType ?? null,
      buttons: input.buttons ?? [],
      targetType: input.targetType,
      targetFilter: input.targetFilter ?? {},
      status: 'draft',
      scheduledAt: input.scheduledAt ?? null,
      startedAt: null,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: { total: 0, pending: 0, processing: 0, sent: 0, failed: 0, ambiguous: 0, testSent: 0 },
    })),
    updateBroadcast: vi.fn(async () => null),
    deleteOrCancelBroadcast: vi.fn(async () => 'deleted'),
    enqueueTestBroadcast: vi.fn(async () => ({ queued: 2 })),
    launchBroadcast: vi.fn(async () => ({ queued: 12, status: 'sending' })),
    listBroadcastDeliveries: vi.fn(async () => []),
    listScenarios: vi.fn(async () => []),
    createScenario: vi.fn(async (input): Promise<CmsScenarioRecord> => ({
      id: '33333333-3333-4333-8333-333333333333',
      slug: input.startPayload.toLowerCase(),
      title: input.title,
      description: input.description ?? '',
      startPayload: input.startPayload,
      deepLinkUrl: `https://t.me/yogermeisters_bot?start=${input.startPayload}`,
      status: input.status ?? 'draft',
      isDefault: Boolean(input.isDefault),
      restartOnStart: input.restartOnStart ?? true,
      enrolledSubscribers: 0,
      activeEnrollments: 0,
      completedEnrollments: 0,
      steps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    })),
    updateScenario: vi.fn(async () => null),
    deleteScenario: vi.fn(async () => 'deleted'),
    listAdminCourses: vi.fn(async () => []),
    listCourseClientsWithProgress: vi.fn(async () => []),
    listTeamUsers: vi.fn(async () => []),
    updateUserRole: vi.fn(async () => 'updated'),
    ...overrides,
  };
}

describe('CMS validation', () => {
  it('enforces 1024-char Telegram caption limit when photo is attached', () => {
    expect(() =>
      parseBroadcastInput({
        title: 'Photo test',
        messageText: 'a'.repeat(1025),
        mediaUrl: 'https://example.com/poster.png',
        mediaType: 'photo',
        targetType: 'all_active',
      }),
    ).toThrow(/1024/);
  });

  it('rejects unknown nextStepKey in scenarios and allows personal_practice_v1 payload', () => {
    const valid = parseScenarioInput({
      title: 'Personal Practice',
      startPayload: 'personal_practice_v1',
      steps: [{ stepKey: 's1', triggerType: 'delay', delayMinutes: 0, messageText: 'Hi' }],
    });
    expect(valid.startPayload).toBe('personal_practice_v1');
    expect(valid.isDefault).toBe(false);

    expect(() =>
      parseScenarioInput({
        title: 'Broken link',
        startPayload: 'sri_lanka_2027',
        steps: [
          {
            stepKey: 's1',
            triggerType: 'delay',
            delayMinutes: 0,
            messageText: 'Hi',
            buttons: [[{ text: 'Next', nextStepKey: 'missing_step' }]],
          },
        ],
      }),
    ).toThrow(/unknown stepKey/);
  });

  it('parses valid base64 PNG uploads and rejects unsupported mime types', () => {
    const parsed = parseMediaUpload({
      filename: 'poster.png',
      mimeType: 'image/png',
      dataBase64: `data:image/png;base64,${Buffer.from('fake-png-bytes').toString('base64')}`,
    });
    expect(parsed.sizeBytes).toBe(14);

    expect(() =>
      parseMediaUpload({
        filename: 'doc.pdf',
        mimeType: 'application/pdf',
        dataBase64: Buffer.from('pdf').toString('base64'),
      }),
    ).toThrow(/PNG, JPEG, and WEBP/);
  });
});

describe('Admin CMS API routes', () => {
  it('requires admin auth on CMS endpoints', async () => {
    const app = createApp({ cmsRepository: createMockCmsRepository(), adminApiKey: ADMIN_KEY });
    const res = await request(app).get('/api/admin/cms/overview');
    expect(res.status).toBe(401);
  });

  it('returns overview, creates broadcasts and scenarios with valid admin key', async () => {
    const cmsRepository = createMockCmsRepository();
    const app = createApp({ cmsRepository, adminApiKey: ADMIN_KEY });

    const overviewRes = await request(app)
      .get('/api/admin/cms/overview')
      .set('Authorization', `Bearer ${ADMIN_KEY}`);
    expect(overviewRes.status).toBe(200);
    expect(overviewRes.body.overview.subscribers.active).toBe(12);

    const broadcastRes = await request(app)
      .post('/api/admin/bot/broadcasts')
      .set('Authorization', `Bearer ${ADMIN_KEY}`)
      .send({
        title: 'Retreats',
        messageText: 'Привет! <b>Два тура</b> ждут тебя.',
        buttons: [[{ text: 'Шри-Ланка', url: 'https://yogermeisters.com/retreats/sri-lanka-yoga-tour' }]],
        targetType: 'all_active',
      });
    expect(broadcastRes.status).toBe(201);
    expect(broadcastRes.body.broadcast.status).toBe('draft');

    const scenarioRes = await request(app)
      .post('/api/admin/bot/scenarios')
      .set('Authorization', `Bearer ${ADMIN_KEY}`)
      .send({
        title: 'Sri Lanka Lead Magnet',
        startPayload: 'sri_lanka_2027',
        status: 'active',
        steps: [
          {
            stepKey: 'intro',
            triggerType: 'delay',
            delayMinutes: 0,
            messageText: 'Добро пожаловать!',
            buttons: [[{ text: 'Показать программу', nextStepKey: 'program' }]],
          },
          {
            stepKey: 'program',
            triggerType: 'button',
            delayMinutes: 0,
            messageText: 'Вот подробная программа по дням.',
          },
        ],
      });
    expect(scenarioRes.status).toBe(201);
    expect(scenarioRes.body.scenario.deepLinkUrl).toBe('https://t.me/yogermeisters_bot?start=sri_lanka_2027');
  });
});
