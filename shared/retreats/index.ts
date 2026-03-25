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
};

export const retreatSeedData: readonly RetreatSeed[] = [ciraliRetreat, mountainsRetreat, nepalRetreat];

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
          text: blockTranslation?.text ?? block.text,
          image: block.image,
          alt: blockTranslation?.alt ?? block.alt,
        };
      }),
  };
}

export function mapSeedRetreats(language: RetreatLanguage): RetreatRecord[] {
  return retreatSeedData.map((retreat) => localizeRetreat(retreat, language));
}
