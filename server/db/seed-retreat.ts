import 'dotenv/config';

import { eq } from 'drizzle-orm';

import { retreatSeedData } from '@shared/retreats';
import { parseRetreatUpdate } from '../admin-validation';
import { createDatabase } from './client';
import { retreats } from './schema';

async function seedRetreat(): Promise<void> {
  const args = process.argv.slice(2);
  const slug = args.find((arg: string): boolean => !arg.startsWith('--'));
  if (!slug || args.some((arg: string): boolean => arg.startsWith('--') && arg !== '--apply')) {
    throw new Error('Usage: npm run db:seed:retreat -- <slug> [--apply]');
  }
  const seed = retreatSeedData.find((retreat) => retreat.slug === slug);
  if (!seed) {
    throw new Error(`Unknown retreat: ${slug}`);
  }
  const { id, slug: seedSlug, ...data } = seed;
  parseRetreatUpdate(data);
  if (!args.includes('--apply')) {
    console.log(JSON.stringify({
      mode: 'preview', id, slug: seedSlug, title: data.title, dates: [data.startDate, data.endDate],
      days: data.experience?.days.length ?? 0, existingRows: 'preserved', applyFlag: '--apply',
    }, null, 2));
    return;
  }
  const databaseUrl = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_DIRECT_URL or DATABASE_URL is required');
  }
  const { db, pool } = createDatabase(databaseUrl);
  try {
    const inserted = await db.insert(retreats).values({ id, slug: seedSlug, data })
      .onConflictDoNothing({ target: retreats.slug }).returning({ id: retreats.id });
    const [stored] = await db.select({ id: retreats.id, slug: retreats.slug })
      .from(retreats).where(eq(retreats.slug, seedSlug)).limit(1);
    if (!stored) {
      throw new Error('Retreat was not found after seed');
    }
    console.log(JSON.stringify({ action: inserted.length ? 'inserted' : 'already_exists', ...stored }));
  } finally {
    await pool.end();
  }
}

void seedRetreat().catch((error: unknown): void => {
  console.error(error instanceof Error ? error.message : 'Retreat seed failed');
  process.exitCode = 1;
});
