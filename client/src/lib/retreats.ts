import beachImg from '@assets/cirali/cirali-beach-cover.jpeg';
import mountainImg from '@assets/mountain-retreat-location.png';
import studioImg from '@assets/retreat-studio-forest-sunrise.png';
import teacherImg from '@assets/teacher-portrait-nature.png';
import nepalMonksTempleImg from '@assets/nepal/nepal-monks-temple.jpg';
import nepalPatanDurbarImg from '@assets/nepal/nepal-patan-durbar.jpg';
import nepalBoudhanathCloseImg from '@assets/nepal/nepal-boudhanath-close.jpg';
import nepalBoudhanathWideImg from '@assets/nepal/nepal-boudhanath-wide.jpg';
import nepalAnastasiaBoudhanathNightImg from '@assets/nepal/nepal-anastasia-boudhanath-night.png';

export interface Retreat {
  id: number;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  dateLabel?: string;
  price: string;
  coverImage: string;
  postBlocks: readonly RetreatPostBlock[];
  bookingUrl: string;
}

export type RetreatPostBlock =
  | {
      id: string;
      type: 'paragraph';
      text: string;
    }
  | {
      id: string;
      type: 'image';
      image: string;
      alt: string;
    };

export const retreats: readonly Retreat[] = [
  {
    id: 1,
    title: 'Cirali Yoga Tour',
    location: 'Cirali, Lycian Coast, Turkey',
    startDate: '2026-10-10',
    endDate: '2026-10-16',
    price: '€790',
    coverImage: beachImg,
    postBlocks: [
      {
        id: 'intro',
        type: 'paragraph',
        text: 'My signature 7-day Cirali retreat for body, mind, and energy reset. This village between sea and mountains has a unique atmosphere that helps practitioners drop stress quickly and return to themselves.',
      },
      {
        id: 'practice-overview',
        type: 'paragraph',
        text: 'Core practices include Himalayan yoga and pranayama, breath-led work for subconscious release, anti-stress and drainage focus, dynamic and Buddhist-inspired sessions, plus face yoga.',
      },
      {
        id: 'studio-image',
        type: 'image',
        image: studioImg,
        alt: 'Calm yoga studio atmosphere for deep inner practice',
      },
      {
        id: 'adventure',
        type: 'paragraph',
        text: 'Adventure blocks include the Lycian Way, Chimaera flames hike, Black Beach trail, ancient Olympos, and sea activities: SUP, boats, and bikes.',
      },
      {
        id: 'landscape-image',
        type: 'image',
        image: beachImg,
        alt: 'Retreat landscape for mindful walking and integration',
      },
      {
        id: 'pricing',
        type: 'paragraph',
        text: 'All-inclusive format: accommodation, breakfasts, daily practices, SUP/boats, and transfers. Price: €790. Deposit: €200 (refundable until September 10), installments available.',
      },
      {
        id: 'teacher-image',
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
        id: 'intro',
        type: 'paragraph',
        text: 'Three restorative days in the mountains near Prague. This retreat combines Himalayan yoga, breath practices, and meditation with fresh mountain air and deep nervous-system recovery.',
      },
      {
        id: 'mountain-image',
        type: 'image',
        image: mountainImg,
        alt: 'Krkonose mountain landscape near Prague',
      },
      {
        id: 'daily-rhythm',
        type: 'paragraph',
        text: 'Morning practice energizes body and mind; evening practice shifts into deep release with Yoga Nidra and sound-based meditation.',
      },
      {
        id: 'free-time',
        type: 'paragraph',
        text: 'In free time, you can choose forest walks, ski or snowboard sessions, and sauna recovery. The format is suitable for both beginners and experienced practitioners.',
      },
      {
        id: 'studio-image',
        type: 'image',
        image: studioImg,
        alt: 'Warm indoor practice space for guided yoga sessions',
      },
      {
        id: 'teacher-image',
        type: 'image',
        image: teacherImg,
        alt: 'Teacher supporting participants during retreat practice',
      },
    ],
    bookingUrl: 'https://t.me/AnastasiaPagliacci',
  },
  {
    id: 3,
    title: 'Nepal Buddhist Pilgrimage Tour',
    location: 'Kathmandu Valley & Nagarkot, Nepal',
    startDate: '2026-12-01',
    endDate: '2026-12-05',
    dateLabel: 'August',
    price: '€1450 early / €1650',
    coverImage: nepalBoudhanathCloseImg,
    postBlocks: [
      {
        id: 'intro',
        type: 'paragraph',
        text: 'An 8-day Buddhist pilgrimage through Nepal designed as a living practice: sacred stupas, monasteries, meditation, yoga, and deep cultural immersion in the Kathmandu Valley. The journey culminates with an overnight stay in Nagarkot for sunset and sunrise views over the Himalayan range. Exact travel dates in August will be announced separately.',
      },
      {
        id: 'daily-rhythm',
        type: 'paragraph',
        text: 'Our route includes Boudhanath and Swayambhunath (Monkey Temple), monastery visits and private puja, evening meditation and restorative yoga, plus daily moments for integration. The rhythm is built to support both inner work and meaningful travel without rushing from point to point.',
      },
      {
        id: 'landscape-image',
        type: 'image',
        image: nepalBoudhanathWideImg,
        alt: 'Boudhanath Stupa in Kathmandu with surrounding shrines',
      },
      {
        id: 'program',
        type: 'paragraph',
        text: 'The program also includes Pharping sacred caves (Asura and Yanglesho), Dakshinkali Temple, Guru Rinpoche sites, Pashupatinath, Patan and Kathmandu Durbar Squares, Asan Bazaar, Bajrayogini Temple, Bhaktapur, Namo Buddha, and Kopan Monastery. We include group guidance and translation, meditations in the Buddhist tradition, yoga sessions, transfers/taxis/excursions, breakfasts, accommodation in Kathmandu and Nagarkot (shared rooms), and entry tickets. Deposit: €300 refundable until April 30; installment payments are possible.',
      },
      {
        id: 'studio-image',
        type: 'image',
        image: nepalPatanDurbarImg,
        alt: 'Historic square and temple architecture in Patan, Nepal',
      },
      {
        id: 'host-presence',
        type: 'paragraph',
        text: 'This tour is guided in a personal format with my full support on the route: translation, navigation, timing, and a carefully held group process so you can stay in practice rather than logistics.',
      },
      {
        id: 'teacher-image',
        type: 'image',
        image: nepalAnastasiaBoudhanathNightImg,
        alt: 'Retreat host Anastasia near Boudhanath Stupa in Kathmandu at night',
      },
      {
        id: 'closing',
        type: 'paragraph',
        text: 'The final days are dedicated to deeper integration: mountain silence, sunrise practice, and a softer pace that helps the experience settle into the body and mind before returning home. If this route resonates with you, reserve your place now: a €300 deposit secures your spot (refundable until April 30), and spaces are limited.',
      },
      {
        id: 'integration-image',
        type: 'image',
        image: nepalMonksTempleImg,
        alt: 'Monks in meditation at a temple complex during sunset',
      },
    ],
    bookingUrl: 'https://t.me/AnastasiaPagliacci',
  },
];
