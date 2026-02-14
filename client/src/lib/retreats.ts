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
    title: 'Cirali Yoga Tour',
    location: 'Cirali, Lycian Coast, Turkey',
    startDate: '2026-05-01',
    endDate: '2026-05-08',
    price: '€750 early / €790',
    coverImage: beachImg,
    postBlocks: [
      {
        type: 'paragraph',
        text: 'My signature 8-day Cirali retreat for body, mind, and energy reset. This village between sea and mountains has a unique atmosphere that helps practitioners drop stress quickly and return to themselves.',
      },
      {
        type: 'paragraph',
        text: 'Core practices include Himalayan yoga and pranayama, breath-led work for subconscious release, anti-stress and drainage focus, dynamic and Buddhist-inspired sessions, plus face yoga.',
      },
      {
        type: 'image',
        image: studioImg,
        alt: 'Calm yoga studio atmosphere for deep inner practice',
      },
      {
        type: 'paragraph',
        text: 'Adventure blocks include the Lycian Way, Chimaera flames hike, Black Beach trail, ancient Olympos, and sea activities: SUP, boats, and bikes.',
      },
      {
        type: 'image',
        image: beachImg,
        alt: 'Retreat landscape for mindful walking and integration',
      },
      {
        type: 'paragraph',
        text: 'All-inclusive format: accommodation, breakfasts, daily practices, SUP/boats, and transfers. Price: €750 early-bird (limited spots), then €790. Deposit: €200 (refundable until April 1), installments available.',
      },
      {
        type: 'image',
        image: teacherImg,
        alt: 'Yoga teacher guiding participants through integration practice',
      },
    ],
    bookingUrl: 'https://t.me/AnastasiaPagliacci',
  },
  {
    id: 2,
    title: 'Yoga & Mountains Retreat',
    location: 'Krkonose, Czech Republic',
    startDate: '2026-03-13',
    endDate: '2026-03-15',
    price: '5,699 CZK early / 6,399 CZK',
    coverImage: mountainImg,
    postBlocks: [
      {
        type: 'paragraph',
        text: 'Three restorative days in the mountains near Prague. This retreat combines Himalayan yoga, breath practices, and meditation with fresh mountain air and deep nervous-system recovery.',
      },
      {
        type: 'image',
        image: mountainImg,
        alt: 'Krkonose mountain landscape near Prague',
      },
      {
        type: 'paragraph',
        text: 'Morning practice energizes body and mind; evening practice shifts into deep release with Yoga Nidra and sound-based meditation.',
      },
      {
        type: 'paragraph',
        text: 'In free time, you can choose forest walks, ski or snowboard sessions, and sauna recovery. The format is suitable for both beginners and experienced practitioners.',
      },
      {
        type: 'image',
        image: studioImg,
        alt: 'Warm indoor practice space for guided yoga sessions',
      },
      {
        type: 'image',
        image: teacherImg,
        alt: 'Teacher supporting participants during retreat practice',
      },
    ],
    bookingUrl: 'https://t.me/AnastasiaPagliacci',
  },
  {
    id: 3,
    title: 'Yoga in the Himalayas',
    location: 'Kathmandu, Nepal',
    startDate: '2026-12-01',
    endDate: '2026-12-05',
    price: '$1,900',
    coverImage: desertImg,
    postBlocks: [
      {
        type: 'paragraph',
        text: 'An immersive journey into Himalayan culture and yoga practice. This retreat blends movement, breathwork, meditation, and sacred sites to restore inner balance and clarity.',
      },
      {
        type: 'paragraph',
        text: 'Morning sessions focus on alignment, pranayama, and energy activation. Evening practice includes Yoga Nidra, sound immersion, and contemplative meditation.',
      },
      {
        type: 'image',
        image: desertImg,
        alt: 'Himalayan-inspired retreat landscape',
      },
      {
        type: 'paragraph',
        text: 'Beyond the yoga mat, the program includes meaningful local exploration, temple visits, and guided integration to connect practice with lived experience.',
      },
      {
        type: 'image',
        image: studioImg,
        alt: 'Indoor practice setting for breath and recovery work',
      },
      {
        type: 'image',
        image: teacherImg,
        alt: 'Teacher guiding participants in Himalayan retreat format',
      },
    ],
    bookingUrl: 'https://t.me/AnastasiaPagliacci',
  },
];
