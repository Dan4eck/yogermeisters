import type { photos } from '../../media';

export interface HeroTile {
  readonly photo: keyof typeof photos;
  readonly position?: string;
}

interface HeroStudy {
  readonly tiles: readonly HeroTile[];
  readonly eyebrow: { readonly ru: string; readonly en: string };
}

export const heroStudies = {
  triptych: {
    eyebrow: { ru: 'Практика. Тишина. Люди.', en: 'Practice. Stillness. People.' },
    tiles: [
      { photo: 'studioAssistedPractice', position: '48% 62%' },
      { photo: 'sunsetBreath', position: '50% 50%' },
      { photo: 'retreatCampfire', position: '48% 50%' },
    ],
  },
  sanctuary: {
    eyebrow: { ru: 'Место для своей практики', en: 'A space for your practice' },
    tiles: [
      { photo: 'studioSeatedMeditation', position: '40% 65%' },
      { photo: 'templeRoof', position: '65% 50%' },
      { photo: 'mountainMeditation', position: '45% 65%' },
    ],
  },
  together: {
    eyebrow: { ru: 'Личная практика. Общий путь.', en: 'Your practice. A shared path.' },
    tiles: [
      { photo: 'retreatCampfire', position: '50% 50%' },
      { photo: 'studioAssistedPractice', position: '50% 65%' },
      { photo: 'prayerFlagsPortrait', position: '50% 48%' },
      { photo: 'sunsetBreath', position: '50% 55%' },
      { photo: 'studioSeatedMeditation', position: '42% 65%' },
    ],
  },
  rhythm: {
    eyebrow: { ru: 'От движения — к вниманию', en: 'From movement to awareness' },
    tiles: [
      { photo: 'templeRoof', position: '65% 50%' },
      { photo: 'prayerFlagsPortrait', position: '50% 48%' },
      { photo: 'studioAssistedPractice', position: '50% 65%' },
      { photo: 'studioSeatedMeditation', position: '42% 65%' },
      { photo: 'sunsetBreath', position: '50% 55%' },
    ],
  },
  atlas: {
    eyebrow: { ru: 'В зале. В горах. Внутри себя.', en: 'In the studio. In nature. Within.' },
    tiles: [
      { photo: 'rockStanding', position: '50% 45%' },
      { photo: 'retreatCampfire', position: '50% 57%' },
      { photo: 'studioAssistedPractice', position: '50% 65%' },
      { photo: 'studioSeatedMeditation', position: '42% 65%' },
      { photo: 'sunsetBreath', position: '50% 55%' },
      { photo: 'templeRoof', position: '65% 50%' },
    ],
  },
} as const satisfies Record<string, HeroStudy>;

export type HeroStudyKey = keyof typeof heroStudies;

export function isHeroStudy(value: string): value is HeroStudyKey {
  return Object.hasOwn(heroStudies, value);
}

const RHYTHM_ANCHORS = [
  { photo: 'prayerFlagsPortrait', position: '50% 48%' },
  { photo: 'studioAssistedPractice', position: '50% 65%' },
] as const satisfies readonly HeroTile[];

export const rhythmPhotoSets = {
  balanced: [
    { photo: 'waterfallWalk', position: '40% 65%' },
    ...RHYTHM_ANCHORS,
    { photo: 'prayerFlagsWalk', position: '50% 60%' },
    { photo: 'mountainMeditation', position: '45% 65%' },
  ],
  nature: [
    { photo: 'waterfallWalk', position: '40% 65%' },
    ...RHYTHM_ANCHORS,
    { photo: 'paddleboardYoga', position: '50% 55%' },
    { photo: 'rockStanding', position: '50% 45%' },
  ],
  people: [
    { photo: 'prayerFlagsWalk', position: '50% 60%' },
    ...RHYTHM_ANCHORS,
    { photo: 'braidedPortrait', position: '50% 50%' },
    { photo: 'retreatCampfire', position: '52% 58%' },
  ],
  original: heroStudies.rhythm.tiles,
} as const satisfies Record<string, readonly HeroTile[]>;

export function getRhythmPhotos(value: string): readonly HeroTile[] {
  return Object.hasOwn(rhythmPhotoSets, value)
    ? rhythmPhotoSets[value as keyof typeof rhythmPhotoSets]
    : rhythmPhotoSets.balanced;
}
