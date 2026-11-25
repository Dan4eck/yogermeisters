import { mountainsEnglishExperience, mountainsRussianExperience } from './mountains-experience';
import type { RetreatSeed } from './types';

export const mountainsRetreat: RetreatSeed = {
  id: 2,
  slug: 'yoga-and-mountains-retreat',
  status: 'active',
  title: 'Bohemian Switzerland Yoga Retreat',
  location: 'Rybniště, Czech Republic',
  startDate: '2026-12-11',
  endDate: '2026-12-13',
  dateLabel: '11-13 December 2026',
  price: '€275 Early Bird / €350',
  bookingUrl: 'https://t.me/AnastasiaPagliacci',
  coverImage: '/assets/retreats/mountains/mountains-dawn-cover.webp',
  experience: mountainsEnglishExperience,
  translations: {
    ru: {
      title: 'Йога-ретрит в Чешской Швейцарии',
      location: 'Рыбниште, Чехия',
      dateLabel: '11-13 декабря 2026',
      experience: mountainsRussianExperience,
    },
  },
  blocks: [],
};
