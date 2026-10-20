import { existsSync } from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { getRetreatBySlug, retreatSeedData } from '../shared/retreats';
import { sriLankaRetreat } from '../shared/retreats/sri-lanka';
import type { RetreatExperience } from '../shared/retreats/experience';
import type { RetreatSeed, RetreatUpdate } from '../shared/retreats/types';
import type { AdminRepository } from './admin-repository';
import { parseRetreatUpdate } from './admin-validation';
import { createApp } from './app';

const apiKey = 'retreat-test-key-at-least-thirty-two-characters';

function createRepository(): AdminRepository {
  let stored: RetreatSeed = structuredClone(sriLankaRetreat);
  return {
    listCourseClients: vi.fn().mockResolvedValue([]),
    grantCourseAccess: vi.fn().mockResolvedValue('changed'),
    revokeCourseAccess: vi.fn().mockResolvedValue('changed'),
    listRetreats: async (): Promise<readonly RetreatSeed[]> => [
      ...retreatSeedData.filter((retreat) => retreat.slug !== stored.slug), stored,
    ],
    updateRetreat: async (slug: string, update: RetreatUpdate): Promise<RetreatSeed | null> => {
      if (slug !== stored.slug) {
        return null;
      }
      stored = JSON.parse(JSON.stringify({ ...stored, ...update })) as RetreatSeed;
      return stored;
    },
  };
}

describe('structured retreat experience', () => {
  it('serves all eight localized days through the existing public API', async () => {
    const app = createApp({ adminRepository: createRepository() });
    for (const language of ['ru', 'en'] as const) {
      const response = await request(app).get(`/api/retreats/sri-lanka-yoga-tour?language=${language}`);
      expect(response.status).toBe(200);
      expect(response.body.retreat.experience.days).toHaveLength(8);
      expect(response.body.retreat.experience.days[0].date).toBe('2027-02-24');
      expect(response.body.retreat.experience.days[7].date).toBe('2027-03-03');
      expect(response.body.retreat.experience.heroTitle).toBe(
        getRetreatBySlug('sri-lanka-yoga-tour', language)?.experience?.heroTitle,
      );
    }
    const legacy = await request(app).get('/api/retreats/cirali-yoga-tour?language=ru');
    expect(legacy.body.retreat.experience).toBeUndefined();
    expect(legacy.body.retreat.postBlocks.length).toBeGreaterThan(0);
  });

  it('round-trips the full bilingual payload through an admin edit and public read', async () => {
    const app = createApp({ adminRepository: createRepository(), adminApiKey: apiKey });
    const { id: _id, slug, ...update } = structuredClone(sriLankaRetreat);
    const changed = {
      ...update,
      price: '€1250',
      translations: {
        ru: {
          ...update.translations!.ru!,
          experience: { ...update.translations!.ru!.experience!, heroText: 'Обновлённый текст из базы.' },
        },
      },
    };
    const response = await request(app).patch(`/api/admin/retreats/${slug}`)
      .set('Authorization', `Bearer ${apiKey}`).send(changed);
    expect(response.status).toBe(200);
    const detail = await request(app).get(`/api/retreats/${slug}?language=ru`);
    const list = await request(app).get('/api/retreats?language=ru&view=all');
    expect(detail.body.retreat.price).toBe('€1250');
    expect(detail.body.retreat.experience.heroText).toBe('Обновлённый текст из базы.');
    expect(detail.body.retreat.experience.days).toEqual(changed.translations.ru.experience.days);
    expect(list.body.retreats.find((retreat: RetreatSeed) => retreat.slug === slug).price).toBe('€1250');
  });

  it('rejects unsafe media paths, duplicate anchors and invalid calendar dates', () => {
    const experience = sriLankaRetreat.experience!;
    expect(() => parseRetreatUpdate({
      experience: { ...experience, stayImages: [{ src: 'javascript:alert(1)', alt: 'Invalid' }] },
    })).toThrow('local image');
    expect(() => parseRetreatUpdate({
      experience: { ...experience, days: [experience.days[0], { ...experience.days[1], id: experience.days[0].id }] },
    })).toThrow('unique IDs');
    expect(() => parseRetreatUpdate({
      experience: { ...experience, days: [{ ...experience.days[0], date: '2027-02-30' }] },
    })).toThrow('valid ISO date');
    expect(() => parseRetreatUpdate({
      experience: { ...experience, days: [{ ...experience.days[0], layout: 'arbitrary-html' }] },
    })).toThrow('not supported');
  });

  it('validates translated experiences as strictly as the base content', () => {
    expect(() => parseRetreatUpdate({
      translations: {
        ru: {
          title: 'Тур', location: 'Велигама',
          experience: { ...sriLankaRetreat.experience, stayImages: [{ src: '/assets/../secret.png', alt: 'Invalid' }] },
        },
      },
    })).toThrow('local image');
  });

  it('keeps all selected media deployable and each day fully scheduled in both languages', () => {
    const experiences: readonly RetreatExperience[] = [
      sriLankaRetreat.experience!, sriLankaRetreat.translations!.ru!.experience!,
    ];
    for (const experience of experiences) {
      const images = [...experience.stayImages, ...experience.days.flatMap((day) => day.images)];
      for (const media of images) {
        expect(existsSync(path.resolve('client/public', `.${media.src}`)), media.src).toBe(true);
      }
      expect(experience.days.every((day) => day.schedule.length >= 3)).toBe(true);
      expect(new Set(experience.days.map((day) => day.date)).size).toBe(8);
    }
  });
});
