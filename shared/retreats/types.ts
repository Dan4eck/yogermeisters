export type RetreatLanguage = 'en' | 'ru';
export type RetreatStatus = 'draft' | 'active' | 'archived';
export type RetreatView = 'upcoming' | 'archive' | 'all';
export type RetreatBlockType = 'paragraph' | 'image' | 'heading' | 'callout';
export type RetreatCalloutVariant = 'soft' | 'cta' | 'outline' | 'sunrise' | 'lagoon';

export interface RetreatTranslationSeed {
  readonly title: string;
  readonly location: string;
  readonly dateLabel?: string;
}

export interface RetreatBlockTranslationSeed {
  readonly text?: string;
  readonly alt?: string;
}

export interface RetreatBlockSeed {
  readonly id: string;
  readonly sortOrder: number;
  readonly type: RetreatBlockType;
  readonly variant?: RetreatCalloutVariant;
  readonly text?: string;
  readonly image?: string;
  readonly alt?: string;
  readonly translations?: Partial<Record<RetreatLanguage, RetreatBlockTranslationSeed>>;
}

export interface RetreatSeed {
  readonly id: number;
  readonly slug: string;
  readonly status: RetreatStatus;
  readonly title: string;
  readonly location: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly dateLabel?: string;
  readonly price: string;
  readonly bookingUrl: string;
  readonly coverImage: string;
  readonly translations?: Partial<Record<RetreatLanguage, RetreatTranslationSeed>>;
  readonly blocks: readonly RetreatBlockSeed[];
}

export interface RetreatPostBlock {
  readonly id: string;
  readonly type: RetreatBlockType;
  readonly variant?: RetreatCalloutVariant;
  readonly text?: string;
  readonly image?: string;
  readonly alt?: string;
}

export interface RetreatRecord {
  readonly id: number;
  readonly slug: string;
  readonly status: RetreatStatus;
  readonly title: string;
  readonly location: string;
  readonly startDate: string;
  readonly endDate: string;
  readonly dateLabel?: string;
  readonly price: string;
  readonly bookingUrl: string;
  readonly coverImage: string;
  readonly postBlocks: readonly RetreatPostBlock[];
}

export interface RetreatListResponse {
  readonly view: RetreatView;
  readonly language: RetreatLanguage;
  readonly retreats: readonly RetreatRecord[];
}

export interface RetreatStatusUpdate {
  readonly status: RetreatStatus;
}
