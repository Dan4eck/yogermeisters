import { existsSync } from 'node:fs';
import path from 'node:path';
import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { getRetreatBySlug, retreatSeedData } from '../shared/retreats';
import { sriLankaRetreat } from '../shared/retreats/sri-lanka';
import { ciraliRetreat } from '../shared/retreats/cirali';
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
    const legacy = await request(app).get('/api/retreats/nepal-buddhist-pilgrimage-tour?language=ru');
    expect(legacy.body.retreat.experience).toBeUndefined();
    expect(legacy.body.retreat.postBlocks.length).toBeGreaterThan(0);
  });

  it('serves the seven-day Cirali experience with optional SUP excluded in both languages', async () => {
    const app = createApp({ adminRepository: createRepository() });
    const { id: _id, slug: _slug, ...update } = ciraliRetreat;
    expect(() => parseRetreatUpdate(update)).not.toThrow();
    for (const language of ['ru', 'en'] as const) {
      const response = await request(app).get(`/api/retreats/cirali-yoga-tour?language=${language}`);
      expect(response.status).toBe(200);
      const retreat = response.body.retreat;
      expect(retreat.experience.days).toHaveLength(7);
      expect(retreat.experience.days[0].date).toBe(retreat.startDate);
      expect(retreat.experience.days[6].date).toBe(retreat.endDate);
      expect(retreat.price).toBe('€720 Early Bird / €790');
      expect(retreat.experience.priceOffer.regularPrice).toBe('€790');
      expect(retreat.experience.days[2].video.src).toBe('/assets/retreats/cirali/cirali-practice.mp4');
      expect(retreat.experience.days[2].images).toEqual([]);
      expect(retreat.experience.days[0].video).toBeUndefined();
      expect(retreat.experience.days[4].images[0].src).toBe('/assets/retreats/cirali/cirali-five-bays.webp');
      expect(retreat.experience.days[5].video.src).toBe('/assets/retreats/cirali/cirali-chimaera.mp4');
      expect(JSON.stringify(retreat.experience.days)).not.toMatch(/\bSUP\b|сап-борд/i);
      expect(JSON.stringify(retreat.experience.inclusions.included)).not.toMatch(/\bSUP\b|сап-борд/i);
      expect(JSON.stringify(retreat.experience.inclusions.excluded)).toMatch(/\bSUP\b/);
    }
  });

  it('keeps Cirali visuals unique across the hero, reasons, programme and accommodation', () => {
    for (const experience of [ciraliRetreat.experience!, ciraliRetreat.translations!.ru!.experience!]) {
      const sources = [
        ciraliRetreat.coverImage,
        ...experience.stayImages.map((media) => media.src),
        ...(experience.reasons ?? []).flatMap((reason) => [reason.image, ...(reason.additionalImages ?? [])])
          .map((media) => media.src),
        ...experience.days.flatMap((day) => day.images.map((media) => media.src)),
        ...experience.days.flatMap((day) => day.video ? [day.video.src, day.video.poster] : []),
      ];
      expect(new Set(sources).size).toBe(sources.length);
    }
  });

  it('validates programme videos and rejects external or unsafe media paths', () => {
    const experience = ciraliRetreat.experience!;
    const video = experience.days[2].video!;
    expect(parseRetreatUpdate({ experience }).experience?.days[2].video).toEqual(video);
    for (const invalid of [
      { ...video, src: 'https://example.com/video.mp4' },
      { ...video, src: '/assets/../video.mp4' },
      { ...video, poster: 'https://example.com/poster.jpg' },
    ]) {
      expect(() => parseRetreatUpdate({
        experience: { ...experience, days: [{ ...experience.days[0], video: invalid }] },
      })).toThrow();
    }
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
    expect(detail.body.retreat.experience.reasons).toEqual(changed.translations.ru.experience.reasons);
    expect(detail.body.retreat.experience.inclusions).toEqual(changed.translations.ru.experience.inclusions);
    expect(detail.body.retreat.experience.priceOffer).toEqual(changed.translations.ru.experience.priceOffer);
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

  it('accepts older content without reasons and rejects unsafe reason images', () => {
    const { reasons: _reasons, ...legacy } = sriLankaRetreat.experience!;
    expect(parseRetreatUpdate({ experience: legacy }).experience?.reasons).toBeUndefined();
    expect(() => parseRetreatUpdate({
      experience: {
        ...legacy,
        reasons: [{ title: 'Ocean', text: 'Beach time', image: { src: 'https://example.com/photo.jpg', alt: 'Ocean' } }],
      },
    })).toThrow('local image');
    expect(() => parseRetreatUpdate({
      experience: {
        ...legacy,
        reasons: [{
          ...sriLankaRetreat.experience!.reasons![0],
          additionalImages: [{ src: 'https://example.com/photo.jpg', alt: 'Ocean' }],
        }],
      },
    })).toThrow('local image');
  });

  it('validates inclusions while accepting older experiences without them', () => {
    const { inclusions, ...legacy } = sriLankaRetreat.experience!;
    expect(parseRetreatUpdate({ experience: legacy }).experience?.inclusions).toBeUndefined();
    expect(parseRetreatUpdate({ experience: { ...legacy, inclusions } }).experience?.inclusions).toEqual(inclusions);
    for (const invalid of [
      { included: [], excluded: ['Flights'] },
      { included: ['Programme'], excluded: [''] },
      { included: ['Programme'], excluded: ['Flights'], other: true },
    ]) {
      expect(() => parseRetreatUpdate({ experience: { ...legacy, inclusions: invalid } })).toThrow();
    }
  });

  it('keeps all selected media deployable and each day fully scheduled in both languages', () => {
    const experiences: readonly RetreatExperience[] = [
      sriLankaRetreat.experience!, sriLankaRetreat.translations!.ru!.experience!,
      ciraliRetreat.experience!, ciraliRetreat.translations!.ru!.experience!,
    ];
    for (const experience of experiences) {
      const images = [
        ...experience.stayImages, ...experience.days.flatMap((day) => day.images),
        ...(experience.reasons ?? []).flatMap((reason) => [reason.image, ...(reason.additionalImages ?? [])]),
      ];
      for (const media of images) {
        expect(existsSync(path.resolve('client/public', `.${media.src}`)), media.src).toBe(true);
      }
      for (const day of experience.days) {
        for (const source of day.video ? [day.video.src, day.video.poster] : []) {
          expect(existsSync(path.resolve('client/public', `.${source}`)), source).toBe(true);
        }
      }
      expect(experience.days.every((day) => day.schedule.length >= 3)).toBe(true);
      expect(new Set(experience.days.map((day) => day.date)).size).toBe(experience.days.length);
    }
  });
});
