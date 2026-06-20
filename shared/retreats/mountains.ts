import type { RetreatSeed } from './types';

export const mountainsRetreat: RetreatSeed = {
  id: 2,
  slug: 'yoga-and-mountains-retreat',
  status: 'archived',
  title: 'Yoga & Mountains Retreat',
  location: 'Krkonose, Czech Republic',
  startDate: '2026-03-13',
  endDate: '2026-03-15',
  price: '5,699 CZK early / 6,399 CZK',
  bookingUrl: 'https://t.me/AnastasiaPagliacci',
  coverImage: 'thumb-prague-retreat.png',
  translations: {
    ru: {
      title: 'Йога и Горы',
      location: 'Крконоше, Чехия',
    },
  },
  blocks: [
    {
      id: 'intro',
      sortOrder: 1,
      type: 'paragraph',
      text: 'Three restorative days in the mountains near Prague. This retreat combines Himalayan yoga, breath practices, and meditation with fresh mountain air and deep nervous-system recovery.',
      translations: {
        ru: {
          text: 'Три дня в горах рядом с Прагой: гималайская йога, пранаяма, медитация и настоящее восстановление через природу, тишину и ритм практики.',
        },
      },
    },
    {
      id: 'mountain-image',
      sortOrder: 2,
      type: 'image',
      image: 'thumb-prague-retreat.png',
      alt: 'Krkonose mountain landscape near Prague',
      translations: {
        ru: {
          alt: 'Горная панорама Крконоше рядом с Прагой',
        },
      },
    },
    {
      id: 'daily-rhythm',
      sortOrder: 3,
      type: 'paragraph',
      text: 'Morning practice energizes body and mind; evening practice shifts into deep release with Yoga Nidra and sound-based meditation.',
      translations: {
        ru: {
          text: 'Утренние сессии дают заряд и ясность, вечерние переводят в глубокий отпуск через йога-нидру, дыхательные практики и работу со звуком.',
        },
      },
    },
    {
      id: 'free-time',
      sortOrder: 4,
      type: 'paragraph',
      text: 'In free time, you can choose forest walks, ski or snowboard sessions, and sauna recovery. The format is suitable for both beginners and experienced practitioners.',
      translations: {
        ru: {
          text: 'В свободное время можно выбрать лесные прогулки, лыжи или сноуборд и восстановление в сауне. Ретрит подходит и новичкам, и тем, кто давно в практике.',
        },
      },
    },
    {
      id: 'studio-image',
      sortOrder: 5,
      type: 'image',
      image: 'thumb-prague-retreat.png',
      alt: 'Warm indoor practice space for guided yoga sessions',
      translations: {
        ru: {
          alt: 'Теплое пространство для очной практики йоги',
        },
      },
    },
    {
      id: 'teacher-image',
      sortOrder: 6,
      type: 'image',
      image: 'thumb-prague-retreat.png',
      alt: 'Teacher supporting participants during retreat practice',
      translations: {
        ru: {
          alt: 'Преподаватель сопровождает участников ретрита',
        },
      },
    },
  ],
};
