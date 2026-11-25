import { mkdtempSync, readFileSync, rmSync, writeFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import express, { type Express } from 'express';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';

import { retreatSeedData, type RetreatSeed } from '../shared/retreats';
import type { AdminRepository } from './admin-repository';
import { resolvePageMeta } from './page-meta';
import { serveStatic } from './static';

function createRepository(listRetreats: () => Promise<readonly RetreatSeed[]>): AdminRepository {
  return {
    listCourseClients: vi.fn(), grantCourseAccess: vi.fn(), revokeCourseAccess: vi.fn(),
    listRetreats, updateRetreat: vi.fn(),
  };
}

describe('link previews', () => {
  let distPath: string;
  let app: Express;

  beforeAll((): void => {
    distPath = mkdtempSync(path.join(tmpdir(), 'og-'));
    writeFileSync(path.join(distPath, 'index.html'), readFileSync('client/index.html', 'utf-8'));
    app = express();
    serveStatic(app, createRepository(async () => retreatSeedData), distPath);
  });

  afterAll((): void => rmSync(distPath, { recursive: true, force: true }));

  it('gives every public page its own title and an absolute image that exists', async () => {
    const pages: readonly (readonly [string, string, string])[] = [
      ['/', 'Yogermeisters | Гималайская йога и ретриты', 'home'],
      ['/the-yoga-method', 'the yoga method | Yogermeisters', 'the-yoga-method'],
      ...retreatSeedData.map((seed): readonly [string, string, string] => [
        `/retreats/${seed.slug}`, `${seed.translations!.ru!.title} | Yogermeisters`, seed.slug,
      ]),
    ];
    for (const [url, title, image] of pages) {
      const response = await request(app).get(`${url}?utm_source=telegram`).set('Host', 'yogermeisters.com')
        .set('X-Forwarded-Proto', 'https');
      expect(response.text).toContain(`<meta property="og:title" content="${title}" />`);
      expect(response.text).toContain(`<meta property="og:image" content="https://yogermeisters.com/assets/og/${image}.jpg" />`);
      expect(response.text).toContain(`<meta name="twitter:image" content="https://yogermeisters.com/assets/og/${image}.jpg" />`);
      expect(response.text).toContain(`<meta property="og:url" content="https://yogermeisters.com${url}" />`);
      expect(response.text.match(/property="og:image"/g)).toHaveLength(1);
      expect(existsSync(`client/public/assets/og/${image}.jpg`)).toBe(true);
    }
  });

  it('uses stored content, hides drafts and survives a database failure', async () => {
    const seed = retreatSeedData.find((item): boolean => item.slug === 'yoga-and-mountains-retreat')!;
    const edited: RetreatSeed = {
      ...seed, translations: { ru: { ...seed.translations!.ru!, title: 'Горы "$1" <b>' } },
    };
    expect((await resolvePageMeta('/retreats/yoga-and-mountains-retreat/', createRepository(async () => [edited]))).title)
      .toContain('Горы "$1"');
    const editedApp = express();
    serveStatic(editedApp, createRepository(async () => [edited]), distPath);
    const response = await request(editedApp).get('/retreats/yoga-and-mountains-retreat');
    expect(response.text).toContain('content="Горы &quot;$1&quot; &lt;b&gt; | Yogermeisters"');
    const draft = await resolvePageMeta(`/retreats/${seed.slug}`, createRepository(async () => [{ ...seed, status: 'draft' }]));
    expect(draft.imagePath).toBe('/assets/og/home.jpg');
    const fallback = await resolvePageMeta(`/retreats/${seed.slug}`, createRepository(async () => { throw new Error('down'); }));
    expect(fallback.title).toBe('Йога и Горы | Yogermeisters');
    expect((await resolvePageMeta('/retreats/unknown')).imagePath).toBe('/assets/og/home.jpg');
  });
});
