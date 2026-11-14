import { ciraliEnglishExperience, ciraliRussianExperience } from './cirali-experience';
import type { RetreatSeed } from './types';

export const ciraliRetreat: RetreatSeed = {
  id: 1,
  slug: 'cirali-yoga-tour',
  status: 'active',
  title: 'Cirali Yoga Tour',
  location: 'Cirali, Lycian Coast, Turkey',
  startDate: '2027-05-01',
  endDate: '2027-05-07',
  dateLabel: 'May 1–7, 2027',
  price: '€720 Early Bird / €790',
  bookingUrl: 'https://t.me/AnastasiaPagliacci',
  coverImage: '/assets/retreats/cirali/cirali-beach-cover.webp',
  experience: ciraliEnglishExperience,
  translations: {
    ru: {
      title: 'Чиралы Йога Тур',
      location: 'Чиралы, Ликийское побережье, Турция',
      dateLabel: '1–7 мая 2027',
      experience: ciraliRussianExperience,
    },
  },
  blocks: [],
};
