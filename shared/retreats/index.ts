import { ciraliRetreat } from './cirali';
import { mountainsRetreat } from './mountains';
import { nepalRetreat } from './nepal';
import type {
  RetreatLanguage,
  RetreatListResponse,
  RetreatRecord,
  RetreatSeed,
  RetreatStatus,
  RetreatStatusUpdate,
  RetreatTranslationSeed,
  RetreatBlockTranslationSeed,
  RetreatBlockSeed,
  RetreatPostBlock,
  RetreatView,
  RetreatBlockType,
  RetreatEditableData,
  RetreatUpdate,
} from './types';

export type {
  RetreatLanguage,
  RetreatListResponse,
  RetreatRecord,
  RetreatSeed,
  RetreatStatus,
  RetreatStatusUpdate,
  RetreatTranslationSeed,
  RetreatBlockTranslationSeed,
  RetreatBlockSeed,
  RetreatPostBlock,
  RetreatView,
  RetreatBlockType,
  RetreatEditableData,
  RetreatUpdate,
};

export const retreatSeedData: readonly RetreatSeed[] = [ciraliRetreat, mountainsRetreat, nepalRetreat];

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

function localizeRetreat(seed: RetreatSeed, language: RetreatLanguage): RetreatRecord {
  const translation = seed.translations?.[language];

  return {
    id: seed.id,
    slug: seed.slug,
    status: seed.status,
    title: translation?.title ?? seed.title,
    location: translation?.location ?? seed.location,
    startDate: seed.startDate,
    endDate: seed.endDate,
    dateLabel: translation?.dateLabel ?? seed.dateLabel,
    price: seed.price,
    bookingUrl: seed.bookingUrl,
    coverImage: seed.coverImage,
    postBlocks: seed.blocks
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((block) => {
        const blockTranslation = block.translations?.[language];

        return {
          id: block.id,
          type: block.type,
          variant: block.variant,
          deadline: block.deadline,
          priceCurrent: block.priceCurrent,
          priceCompare: block.priceCompare,
          text: blockTranslation?.text ?? block.text,
          image: block.image,
          alt: blockTranslation?.alt ?? block.alt,
        };
      }),
  };
}

export function mapSeedRetreats(language: RetreatLanguage): RetreatRecord[] {
  return mapRetreatSeeds(retreatSeedData, language);
}

export function mapRetreatSeeds(seeds: readonly RetreatSeed[], language: RetreatLanguage): RetreatRecord[] {
  return seeds.map((retreat) => localizeRetreat(retreat, language));
}

export function listRetreats(view: RetreatView, language: RetreatLanguage, today = new Date().toISOString().slice(0, 10)): RetreatListResponse {
  return listRetreatRecords(retreatSeedData, view, language, today);
}

export function listRetreatRecords(
  seeds: readonly RetreatSeed[],
  view: RetreatView,
  language: RetreatLanguage,
  today = new Date().toISOString().slice(0, 10),
): RetreatListResponse {
  return {
    view,
    language,
    retreats: mapRetreatSeeds(seeds, language).filter((retreat) => matchesView(retreat, view, today)),
  };
}

export function getRetreatBySlug(slug: string, language: RetreatLanguage): RetreatRecord | null {
  return getRetreatRecordBySlug(retreatSeedData, slug, language);
}

export function getRetreatRecordBySlug(
  seeds: readonly RetreatSeed[],
  slug: string,
  language: RetreatLanguage,
): RetreatRecord | null {
  return mapRetreatSeeds(seeds, language).find((retreat) => retreat.slug === slug) ?? null;
}
