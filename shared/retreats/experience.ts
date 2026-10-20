export type RetreatDayLayout = 'text' | 'split' | 'panorama' | 'collage';

export interface RetreatMedia {
  readonly src: string;
  readonly alt: string;
  readonly caption?: string;
}

export interface RetreatScheduleItem {
  readonly time: string;
  readonly text: string;
}

export interface RetreatReason {
  readonly title: string;
  readonly text: string;
  readonly image: RetreatMedia;
  readonly additionalImages?: readonly RetreatMedia[];
}

export interface RetreatDay {
  readonly id: string;
  readonly date: string;
  readonly title: string;
  readonly summary: string;
  readonly pace: string;
  readonly layout: RetreatDayLayout;
  readonly highlights: readonly string[];
  readonly images: readonly RetreatMedia[];
  readonly schedule: readonly RetreatScheduleItem[];
  readonly note?: string;
}

export interface RetreatExperience {
  readonly priceOffer?: {
    readonly regularPrice: string;
    readonly label: string;
    readonly note: string;
  };
  readonly reasons?: readonly RetreatReason[];
  readonly inclusions?: {
    readonly included: readonly string[];
    readonly excluded: readonly string[];
  };
  readonly heroTitle: string;
  readonly heroText: string;
  readonly introTitle: string;
  readonly introText: string;
  readonly stayTitle: string;
  readonly stayText: string;
  readonly stayImages: readonly RetreatMedia[];
  readonly days: readonly RetreatDay[];
  readonly bookingTitle: string;
  readonly bookingText: string;
  readonly bookingSteps: readonly string[];
  readonly bookingNote: string;
}
