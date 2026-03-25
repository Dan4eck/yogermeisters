import { and, asc, eq, gte, inArray, lt, or } from 'drizzle-orm';

import { db } from './db';
import {
  retreatBlockTranslations,
  retreatBlocks,
  retreats,
  retreatTranslations,
  type RetreatBlockRow,
  type RetreatBlockTranslationRow,
  type RetreatRow,
  type RetreatTranslationRow,
} from '@shared/schema';
import {
  mapSeedRetreats,
  type RetreatLanguage,
  type RetreatRecord,
  type RetreatStatus,
  type RetreatView,
} from '@shared/retreat-content';

type LocalizedRetreatBlock = RetreatRecord['postBlocks'][number];

interface ListRetreatOptions {
  readonly language: RetreatLanguage;
  readonly view: RetreatView;
  readonly today: string;
}

const fallbackRetreats = mapSeedRetreats('en').map((retreat) => ({
  ...retreat,
  postBlocks: retreat.postBlocks.map((block) => ({ ...block })),
}));

function matchesView(retreat: RetreatRecord, view: RetreatView, today: string): boolean {
  const isPast = retreat.endDate < today;

  if (view === 'all') {
    return true;
  }

  if (view === 'archive') {
    return retreat.status === 'archived' || isPast;
  }

  return retreat.status === 'active' && !isPast;
}

function localizeFallbackRetreats(language: RetreatLanguage): RetreatRecord[] {
  if (language === 'en') {
    return fallbackRetreats.map((retreat) => ({
      ...retreat,
      postBlocks: retreat.postBlocks.map((block) => ({ ...block })),
    }));
  }

  return mapSeedRetreats(language);
}

function buildRetreatFilters(view: RetreatView, today: string) {
  if (view === 'all') {
    return undefined;
  }

  if (view === 'archive') {
    return or(eq(retreats.status, 'archived'), lt(retreats.endDate, today));
  }

  return and(eq(retreats.status, 'active'), gte(retreats.endDate, today));
}

function mapBlocks(
  retreatId: number,
  blockRows: RetreatBlockRow[],
  blockTranslationRows: RetreatBlockTranslationRow[],
): LocalizedRetreatBlock[] {
  return blockRows
    .filter((block) => block.retreatId === retreatId)
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .map((block) => {
      const translation = blockTranslationRows.find((item) => item.blockId === block.id);

      return {
        id: block.blockKey,
        type: block.type as LocalizedRetreatBlock['type'],
        text: translation?.text ?? block.text ?? undefined,
        image: block.image ?? undefined,
        alt: translation?.alt ?? block.alt ?? undefined,
      };
    });
}

function mapRowsToRetreats(
  retreatRows: RetreatRow[],
  translationRows: RetreatTranslationRow[],
  blockRows: RetreatBlockRow[],
  blockTranslationRows: RetreatBlockTranslationRow[],
): RetreatRecord[] {
  return retreatRows.map((retreatRow) => {
    const translation = translationRows.find((item) => item.retreatId === retreatRow.id);

    return {
      id: retreatRow.id,
      slug: retreatRow.slug,
      status: retreatRow.status as RetreatStatus,
      title: translation?.title ?? retreatRow.title,
      location: translation?.location ?? retreatRow.location,
      startDate: retreatRow.startDate,
      endDate: retreatRow.endDate,
      dateLabel: translation?.dateLabel ?? retreatRow.dateLabel ?? undefined,
      price: retreatRow.price,
      bookingUrl: retreatRow.bookingUrl,
      coverImage: retreatRow.coverImage,
      postBlocks: mapBlocks(retreatRow.id, blockRows, blockTranslationRows),
    };
  });
}

async function listRetreatsFromDatabase(options: ListRetreatOptions): Promise<RetreatRecord[]> {
  if (!db) {
    return [];
  }

  const retreatRows = await db
    .select()
    .from(retreats)
    .where(buildRetreatFilters(options.view, options.today))
    .orderBy(asc(retreats.startDate), asc(retreats.id));

  if (retreatRows.length === 0) {
    return [];
  }

  const retreatIds = retreatRows.map((retreat) => retreat.id);
  const blockRows = await db
    .select()
    .from(retreatBlocks)
    .where(inArray(retreatBlocks.retreatId, retreatIds))
    .orderBy(asc(retreatBlocks.retreatId), asc(retreatBlocks.sortOrder));

  const blockIds = blockRows.map((block) => block.id);
  const [translationRows, blockTranslationRows] = await Promise.all([
    db
      .select()
      .from(retreatTranslations)
      .where(
        and(
          inArray(retreatTranslations.retreatId, retreatIds),
          eq(retreatTranslations.language, options.language),
        ),
      ),
    blockIds.length > 0
      ? db
          .select()
          .from(retreatBlockTranslations)
          .where(
            and(
              inArray(retreatBlockTranslations.blockId, blockIds),
              eq(retreatBlockTranslations.language, options.language),
            ),
          )
      : Promise.resolve([]),
  ]);

  return mapRowsToRetreats(retreatRows, translationRows, blockRows, blockTranslationRows);
}

export async function listRetreats(options: ListRetreatOptions): Promise<RetreatRecord[]> {
  if (!db) {
    return localizeFallbackRetreats(options.language).filter((retreat) =>
      matchesView(retreat, options.view, options.today),
    );
  }

  try {
    return await listRetreatsFromDatabase(options);
  } catch {
    return localizeFallbackRetreats(options.language).filter((retreat) =>
      matchesView(retreat, options.view, options.today),
    );
  }
}

export async function getRetreatBySlug(
  slug: string,
  language: RetreatLanguage,
): Promise<RetreatRecord | null> {
  if (!db) {
    return localizeFallbackRetreats(language).find((retreat) => retreat.slug === slug) ?? null;
  }

  try {
    const retreatRows = await db.select().from(retreats).where(eq(retreats.slug, slug)).limit(1);
    const retreatRow = retreatRows[0];

    if (!retreatRow) {
      return null;
    }

    const [translationRows, blockRows] = await Promise.all([
      db
        .select()
        .from(retreatTranslations)
        .where(
          and(eq(retreatTranslations.retreatId, retreatRow.id), eq(retreatTranslations.language, language)),
        ),
      db
        .select()
        .from(retreatBlocks)
        .where(eq(retreatBlocks.retreatId, retreatRow.id))
        .orderBy(asc(retreatBlocks.sortOrder)),
    ]);
    const blockIds = blockRows.map((block) => block.id);
    const blockTranslationRows =
      blockIds.length > 0
        ? await db
            .select()
            .from(retreatBlockTranslations)
            .where(
              and(
                inArray(retreatBlockTranslations.blockId, blockIds),
                eq(retreatBlockTranslations.language, language),
              ),
            )
        : [];

    return mapRowsToRetreats([retreatRow], translationRows, blockRows, blockTranslationRows)[0] ?? null;
  } catch {
    return localizeFallbackRetreats(language).find((retreat) => retreat.slug === slug) ?? null;
  }
}

export async function updateRetreatStatus(id: number, status: RetreatStatus): Promise<RetreatRecord | null> {
  if (!db) {
    const retreatIndex = fallbackRetreats.findIndex((retreat) => retreat.id === id);

    if (retreatIndex === -1) {
      return null;
    }

    const updatedRetreat = {
      ...fallbackRetreats[retreatIndex],
      status,
      postBlocks: fallbackRetreats[retreatIndex].postBlocks.map((block) => ({ ...block })),
    };

    fallbackRetreats[retreatIndex] = updatedRetreat;
    return updatedRetreat;
  }

  try {
    const updatedRows = await db
      .update(retreats)
      .set({
        status,
        updatedAt: new Date(),
      })
      .where(eq(retreats.id, id))
      .returning();

    const updatedRow = updatedRows[0];

    if (!updatedRow) {
      return null;
    }

    const [translationRows, blockRows] = await Promise.all([
      db.select().from(retreatTranslations).where(eq(retreatTranslations.retreatId, updatedRow.id)),
      db
        .select()
        .from(retreatBlocks)
        .where(eq(retreatBlocks.retreatId, updatedRow.id))
        .orderBy(asc(retreatBlocks.sortOrder)),
    ]);
    const blockIds = blockRows.map((block) => block.id);
    const blockTranslationRows =
      blockIds.length > 0
        ? await db.select().from(retreatBlockTranslations).where(inArray(retreatBlockTranslations.blockId, blockIds))
        : [];

    return mapRowsToRetreats([updatedRow], translationRows, blockRows, blockTranslationRows)[0] ?? null;
  } catch {
    return null;
  }
}
