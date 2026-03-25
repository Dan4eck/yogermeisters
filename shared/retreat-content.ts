export type RetreatLanguage = 'en' | 'ru';
export type RetreatStatus = 'draft' | 'active' | 'archived';
export type RetreatView = 'upcoming' | 'archive' | 'all';
export type RetreatBlockType = 'paragraph' | 'image';

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
  readonly text?: string;
  readonly imageAssetKey?: string;
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
  readonly coverAssetKey: string;
  readonly translations?: Partial<Record<RetreatLanguage, RetreatTranslationSeed>>;
  readonly blocks: readonly RetreatBlockSeed[];
}

export interface RetreatPostBlock {
  readonly id: string;
  readonly type: RetreatBlockType;
  readonly text?: string;
  readonly assetKey?: string;
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
  readonly coverAssetKey: string;
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

export const retreatSeedData: readonly RetreatSeed[] = [
  {
    id: 1,
    slug: 'cirali-yoga-tour',
    status: 'active',
    title: 'Cirali Yoga Tour',
    location: 'Cirali, Lycian Coast, Turkey',
    startDate: '2026-05-01',
    endDate: '2026-05-08',
    price: '€750 early / €790',
    bookingUrl: 'https://t.me/AnastasiaPagliacci',
    coverAssetKey: 'cirali-beach',
    translations: {
      ru: {
        title: 'Чиралы Йога Тур',
        location: 'Чиралы, Ликийское побережье, Турция',
      },
    },
    blocks: [
      {
        id: 'intro',
        sortOrder: 1,
        type: 'paragraph',
        text: 'My signature 8-day Cirali retreat for body, mind, and energy reset. This village between sea and mountains has a unique atmosphere that helps practitioners drop stress quickly and return to themselves.',
        translations: {
          ru: {
            text: 'Мой любимый 8-дневный ретрит в Чиралы для глубокой перезагрузки тела, ума и энергии. Это место между морем и горами быстро возвращает в живое, ясное и спокойное состояние.',
          },
        },
      },
      {
        id: 'practice-overview',
        sortOrder: 2,
        type: 'paragraph',
        text: 'Core practices include Himalayan yoga and pranayama, breath-led work for subconscious release, anti-stress and drainage focus, dynamic and Buddhist-inspired sessions, plus face yoga.',
        translations: {
          ru: {
            text: 'Практика включает гималайскую йогу и пранаяму, дыхательные техники для работы с подсознанием, face-йогу, дренажные и антистресс-блоки, динамические и буддийские практики.',
          },
        },
      },
      {
        id: 'studio-image',
        sortOrder: 3,
        type: 'image',
        imageAssetKey: 'retreat-studio',
        alt: 'Calm yoga studio atmosphere for deep inner practice',
        translations: {
          ru: {
            alt: 'Спокойная студийная атмосфера для глубокой внутренней практики',
          },
        },
      },
      {
        id: 'adventure',
        sortOrder: 4,
        type: 'paragraph',
        text: 'Adventure blocks include the Lycian Way, Chimaera flames hike, Black Beach trail, ancient Olympos, and sea activities: SUP, boats, and bikes.',
        translations: {
          ru: {
            text: 'В программе активности и приключения: Ликийская тропа, огни Химеры, трек к Black Beach, древний Олимпос, а также SUP, лодки и велосипеды.',
          },
        },
      },
      {
        id: 'landscape-image',
        sortOrder: 5,
        type: 'image',
        imageAssetKey: 'cirali-beach',
        alt: 'Retreat landscape for mindful walking and integration',
        translations: {
          ru: {
            alt: 'Природная локация для прогулок и интеграции практики',
          },
        },
      },
      {
        id: 'pricing',
        sortOrder: 6,
        type: 'paragraph',
        text: 'All-inclusive format: accommodation, breakfasts, daily practices, SUP/boats, and transfers. Price: €750 early-bird (limited spots), then €790. Deposit: €200 (refundable until April 1), installments available.',
        translations: {
          ru: {
            text: 'Формат all-inclusive: проживание, завтраки, практики, SUP/лодки и трансферы. Стоимость: €750 early bird (ограниченное число мест), далее €790. Депозит €200, возвратный до 1 апреля, возможна оплата частями.',
          },
        },
      },
      {
        id: 'teacher-image',
        sortOrder: 7,
        type: 'image',
        imageAssetKey: 'teacher-portrait',
        alt: 'Yoga teacher guiding participants through integration practice',
        translations: {
          ru: {
            alt: 'Преподаватель ведет интеграционную практику',
          },
        },
      },
    ],
  },
  {
    id: 2,
    slug: 'yoga-and-mountains-retreat',
    status: 'archived',
    title: 'Yoga & Mountains Retreat',
    location: 'Krkonose, Czech Republic',
    startDate: '2026-03-13',
    endDate: '2026-03-15',
    price: '5,699 CZK early / 6,399 CZK',
    bookingUrl: 'https://t.me/AnastasiaPagliacci',
    coverAssetKey: 'mountains-retreat',
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
        imageAssetKey: 'mountains-retreat',
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
        imageAssetKey: 'retreat-studio',
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
        imageAssetKey: 'teacher-portrait',
        alt: 'Teacher supporting participants during retreat practice',
        translations: {
          ru: {
            alt: 'Преподаватель сопровождает участников ретрита',
          },
        },
      },
    ],
  },
  {
    id: 3,
    slug: 'nepal-buddhist-pilgrimage-tour',
    status: 'active',
    title: 'Nepal Buddhist Pilgrimage Tour',
    location: 'Kathmandu Valley & Nagarkot, Nepal',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    dateLabel: 'August 2026',
    price: '€1450 early / €1650',
    bookingUrl: 'https://t.me/AnastasiaPagliacci',
    coverAssetKey: 'nepal-boudhanath-close',
    translations: {
      ru: {
        title: 'Буддийский паломнический тур в Непал',
        location: 'Долина Катманду и Нагаркот, Непал',
        dateLabel: 'Август 2026',
      },
    },
    blocks: [
      {
        id: 'intro',
        sortOrder: 1,
        type: 'paragraph',
        text: 'An 8-day Buddhist pilgrimage through Nepal designed as a living practice: sacred stupas, monasteries, meditation, yoga, and deep cultural immersion in the Kathmandu Valley. The journey culminates with an overnight stay in Nagarkot for sunset and sunrise views over the Himalayan range. Exact travel dates in August will be announced separately.',
        translations: {
          ru: {
            text: '8-дневный буддийский паломнический тур по Непалу в формате живой практики: священные ступы, монастыри, медитация, йога и глубокое погружение в культуру долины Катманду. Кульминация путешествия — ночевка в Нагаркоте с видами на закат и рассвет над Гималаями. Точные даты в августе будут объявлены отдельно.',
          },
        },
      },
      {
        id: 'daily-rhythm',
        sortOrder: 2,
        type: 'paragraph',
        text: 'Our route includes Boudhanath and Swayambhunath (Monkey Temple), monastery visits and private puja, evening meditation and restorative yoga, plus daily moments for integration. The rhythm is built to support both inner work and meaningful travel without rushing from point to point.',
        translations: {
          ru: {
            text: 'В маршруте — Боднатх и Сваямбунатх (Monkey Temple), посещение монастырей и частная пуджа для группы, вечерние медитации и мягкая расслабляющая йога, а также ежедневные паузы на интеграцию опыта. Ритм выстроен так, чтобы совместить внутреннюю работу и насыщенное путешествие без суеты.',
          },
        },
      },
      {
        id: 'landscape-image',
        sortOrder: 3,
        type: 'image',
        imageAssetKey: 'nepal-boudhanath-wide',
        alt: 'Boudhanath Stupa in Kathmandu with surrounding shrines',
        translations: {
          ru: {
            alt: 'Ступа Боднатх в Катманду с окружающими святынями',
          },
        },
      },
      {
        id: 'program',
        sortOrder: 4,
        type: 'paragraph',
        text: 'The program also includes Pharping sacred caves (Asura and Yanglesho), Dakshinkali Temple, Guru Rinpoche sites, Pashupatinath, Patan and Kathmandu Durbar Squares, Asan Bazaar, Bajrayogini Temple, Bhaktapur, Namo Buddha, and Kopan Monastery. We include group guidance and translation, meditations in the Buddhist tradition, yoga sessions, transfers/taxis/excursions, breakfasts, accommodation in Kathmandu and Nagarkot (shared rooms), and entry tickets. Deposit: €300 refundable until April 30; installment payments are possible.',
        translations: {
          ru: {
            text: 'Программа также включает священные пещеры Фарпинга (Asura Cave и Yanglesho), храм Дакшинкали, места Гуру Ринпоче, Пашупатинатх, площади Дурбар в Патане и Катманду, рынок Асан, храм Ваджрайогини, Бхактапур, Намо Будда и монастырь Копан. В стоимость входят сопровождение и перевод, вся программа с медитациями в буддийской традиции и йогой, завтраки, проживание в Катманду и Нагаркоте (2-местные номера), трансферы/такси/экскурсии и входные билеты. Залог €300 (возвратный до 30 апреля), возможна рассрочка.',
          },
        },
      },
      {
        id: 'studio-image',
        sortOrder: 5,
        type: 'image',
        imageAssetKey: 'nepal-patan-durbar',
        alt: 'Historic square and temple architecture in Patan, Nepal',
        translations: {
          ru: {
            alt: 'Историческая площадь и храмовая архитектура Патана, Непал',
          },
        },
      },
      {
        id: 'host-presence',
        sortOrder: 6,
        type: 'paragraph',
        text: 'This tour is guided in a personal format with my full support on the route: translation, navigation, timing, and a carefully held group process so you can stay in practice rather than logistics.',
        translations: {
          ru: {
            text: 'Тур проходит в личном формате с моим полным сопровождением по маршруту: перевод, логистика, тайминг и бережное ведение группы, чтобы вы могли оставаться в практике, а не в организационных задачах.',
          },
        },
      },
      {
        id: 'teacher-image',
        sortOrder: 7,
        type: 'image',
        imageAssetKey: 'nepal-anastasia-boudhanath-night',
        alt: 'Retreat host Anastasia near Boudhanath Stupa in Kathmandu at night',
        translations: {
          ru: {
            alt: 'Анастасия, ведущая тура, рядом со ступой Боднатх в Катманду вечером',
          },
        },
      },
      {
        id: 'closing',
        sortOrder: 8,
        type: 'paragraph',
        text: 'The final days are dedicated to deeper integration: mountain silence, sunrise practice, and a softer pace that helps the experience settle into the body and mind before returning home. If this route resonates with you, reserve your place now: a €300 deposit secures your spot (refundable until April 30), and spaces are limited.',
        translations: {
          ru: {
            text: 'Финальные дни посвящены более глубокой интеграции: горная тишина, практика на рассвете и более мягкий ритм, чтобы опыт успел уложиться в теле и уме перед возвращением домой. Если вам откликается этот маршрут, записывайтесь уже сейчас: депозит €300 фиксирует место (возвратный до 30 апреля), а количество мест ограничено.',
          },
        },
      },
      {
        id: 'integration-image',
        sortOrder: 9,
        type: 'image',
        imageAssetKey: 'nepal-monks-temple',
        alt: 'Monks in meditation at a temple complex during sunset',
        translations: {
          ru: {
            alt: 'Монахи в медитации в храмовом комплексе на закате',
          },
        },
      },
    ],
  },
];

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
    coverAssetKey: seed.coverAssetKey,
    postBlocks: seed.blocks
      .slice()
      .sort((left, right) => left.sortOrder - right.sortOrder)
      .map((block) => {
        const blockTranslation = block.translations?.[language];
        return {
          id: block.id,
          type: block.type,
          text: blockTranslation?.text ?? block.text,
          assetKey: block.imageAssetKey,
          alt: blockTranslation?.alt ?? block.alt,
        };
      }),
  };
}

export function mapSeedRetreats(language: RetreatLanguage): RetreatRecord[] {
  return retreatSeedData.map((retreat) => localizeRetreat(retreat, language));
}
