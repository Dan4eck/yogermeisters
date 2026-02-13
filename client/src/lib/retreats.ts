import beachImg from '@assets/generated_images/tropical_beach_yoga_retreat_location.png';
import mountainImg from '@assets/generated_images/mountain_yoga_retreat_location.png';
import desertImg from '@assets/generated_images/desert_yoga_retreat_at_sunset.png';
import studioImg from '@assets/generated_images/serene_yoga_studio_overlooking_forest_at_sunrise.png';
import teacherImg from '@assets/generated_images/friendly_female_yoga_teacher_portrait_in_nature.png';

export interface Retreat {
  id: number;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  price: string;
  coverImage: string;
  postBlocks: readonly RetreatPostBlock[];
  bookingUrl: string;
}

export type RetreatPostBlock =
  | {
      type: 'paragraph';
      text: string;
    }
  | {
      type: 'image';
      image: string;
      alt: string;
    };

export const retreats: readonly Retreat[] = [
  {
    id: 1,
    title: 'Coastal Serenity',
    location: 'Bali, Indonesia',
    startDate: '2026-10-12',
    endDate: '2026-10-19',
    price: '$2,400',
    coverImage: beachImg,
    postBlocks: [
      {
        type: 'paragraph',
        text: 'Coastal Serenity is built around a simple rhythm: sunrise movement, nourishing food, ocean air, and long evenings that bring the nervous system back to baseline. We keep the structure intentional, so your body can soften while your focus sharpens.',
      },
      {
        type: 'paragraph',
        text: 'Morning classes focus on alignment and breath pacing, while afternoon sessions are restorative and adaptive for different levels of practice. You leave with a practical template you can continue at home.',
      },
      {
        type: 'image',
        image: studioImg,
        alt: 'Sunlit yoga studio with calm atmosphere',
      },
      {
        type: 'paragraph',
        text: 'Between classes, there is free time for journaling, ocean walks, and optional one-to-one check-ins. The retreat is intimate by design, so each participant receives clear personal guidance.',
      },
      {
        type: 'image',
        image: beachImg,
        alt: 'Tropical beach location for yoga retreat',
      },
      {
        type: 'paragraph',
        text: 'The closing practice combines meditation, breathwork, and a final integration flow. The goal is not only a memorable week, but a grounded return into your regular life with more clarity and steadiness.',
      },
      {
        type: 'image',
        image: teacherImg,
        alt: 'Yoga teacher portrait in nature',
      },
    ],
    bookingUrl: 'https://t.me/AnastasiaPagliacci',
  },
  {
    id: 2,
    title: 'Alpine Flow',
    location: 'Swiss Alps',
    startDate: '2026-11-05',
    endDate: '2026-11-12',
    price: '$2,800',
    coverImage: mountainImg,
    postBlocks: [
      {
        type: 'paragraph',
        text: 'Alpine Flow combines intensive movement sessions with mountain recovery principles. Mornings are energizing and technically precise, with attention to safe load, mobility, and intelligent progression.',
      },
      {
        type: 'image',
        image: mountainImg,
        alt: 'Mountain landscape retreat location',
      },
      {
        type: 'paragraph',
        text: 'Afternoons include guided hikes and breath training adapted to altitude. Evenings are slower: long holds, soft tissue release, and practices that improve sleep quality and reduce accumulated fatigue.',
      },
      {
        type: 'paragraph',
        text: 'This retreat works especially well for active practitioners who want both challenge and restoration without burnout.',
      },
      {
        type: 'image',
        image: studioImg,
        alt: 'Studio setup for detailed alignment work',
      },
      {
        type: 'image',
        image: teacherImg,
        alt: 'Instructor guiding participants in nature',
      },
    ],
    bookingUrl: 'https://t.me/AnastasiaPagliacci',
  },
  {
    id: 3,
    title: 'Desert Silence',
    location: 'Joshua Tree, USA',
    startDate: '2026-12-01',
    endDate: '2026-12-05',
    price: '$1,900',
    coverImage: desertImg,
    postBlocks: [
      {
        type: 'paragraph',
        text: 'Desert Silence is a compact retreat for deep reset. The environment itself supports quiet focus, and the schedule is intentionally spacious to create room for reflection and nervous system downshift.',
      },
      {
        type: 'paragraph',
        text: 'Sessions prioritize grounding, breath-led movement, and longer meditative holds. We keep instructions minimal and clear, allowing you to notice subtle shifts in attention and recovery.',
      },
      {
        type: 'image',
        image: desertImg,
        alt: 'Desert sunset retreat setting',
      },
      {
        type: 'paragraph',
        text: 'Evening practices are held under open sky and close with guided integration. Many participants describe this format as the most effective way to step out of constant cognitive load.',
      },
      {
        type: 'image',
        image: studioImg,
        alt: 'Indoor restorative practice setup',
      },
      {
        type: 'image',
        image: teacherImg,
        alt: 'Teacher portrait during retreat week',
      },
    ],
    bookingUrl: 'https://t.me/AnastasiaPagliacci',
  },
];
