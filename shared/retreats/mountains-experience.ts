import type { RetreatDay, RetreatExperience, RetreatMedia, RetreatScheduleItem, RetreatVideo } from './experience';

function photo(name: string, alt: string): RetreatMedia {
  return { src: `/assets/retreats/mountains/mountains-${name}.webp`, alt };
}

function video(name: string, label: string): RetreatVideo {
  return {
    src: `/assets/retreats/mountains/mountains-${name}.mp4`,
    poster: `/assets/retreats/mountains/mountains-${name}-poster.webp`,
    label,
  };
}

function day(
  id: string, date: string, title: string, media: RetreatMedia | RetreatVideo,
  items: readonly (readonly [string, string])[],
): RetreatDay {
  const schedule: readonly RetreatScheduleItem[] = items.map(
    ([time, text]: readonly [string, string]): RetreatScheduleItem => ({ time, text }),
  );
  const isVideo = 'poster' in media;
  return {
    id, date, title, summary: items.map(([, text]: readonly [string, string]): string => text).join(' '),
    pace: title, layout: isVideo ? 'text' : 'split', images: isVideo ? [] : [media],
    ...(isVideo ? { video: media } : {}), highlights: [title], schedule,
  };
}

export const mountainsRussianExperience: RetreatExperience = {
  priceOffer: { regularPrice: '€350', label: 'Early bird', note: '€275 вместо €350 - цена по предложению' },
  heroTitle: 'Йога в Чешской\nШвейцарии.',
  heroText: 'Три дня для себя: практики, поход в лес, сауна, медитации и итальянская кухня.',
  introTitle: 'Перезагрузка\nна природе',
  introText: 'Утром - йога и пранаяма, днём - лес и время для себя, вечером - сауна, дыхание и медитация. А за столом - итальянская кухня.',
  reasons: [
    {
      title: 'Поход и практика в лесу',
      text: 'В субботу идём в поход и практикуем прямо в лесу. После обеда оставляем время для себя.',
      image: photo('hike-group', 'Участники ретрита на смотровой площадке, вокруг лесистые холмы'),
    },
    {
      title: 'Медитация Метта',
      text: 'В первый вечер знакомимся с буддийской медитацией Метта: теория и практика. Во второй - звуковибрационный массаж тибетскими чашами и гонгом.',
      image: photo('teacher-bowl', 'Девушка в бордовом держит поющую чашу'),
    },
    {
      title: 'Дыхание, энергия и красота',
      text: 'Face yoga утром, сауна и аюрведическая практика красоты и молодости днём, дыхательная и психо-энергетическая практики вечером.',
      image: photo('sage', 'Девушка с закрытыми глазами держит дымящийся пучок трав'),
    },
  ],
  stayTitle: 'Где будем жить',
  stayText: 'Живём в Рыбниште (Rybniště), в Чешской Швейцарии. Проживание входит в стоимость, подробности о доме и размещении расскажу в Telegram.',
  stayImages: [
    photo('moon', 'Молодая луна над тёмным горным хребтом'),
    photo('dreamcatcher', 'Ловец снов в каплях росы, за ним туманный луг и лес'),
    photo('bowl-mat', 'Поющая чаша на коврике в солнечном свете'),
  ],
  inclusions: {
    included: [
      'Проживание.',
      'Все практики йоги, пранаямы и медитации по программе.',
      'Питание с акцентом на итальянскую кухню: два ужина, обед и два завтрака.',
      'Поход и практика в лесу.',
      'Сауна, аюрведическая практика красоты и молодости.',
    ],
    excluded: ['Дорога до места и обратно.', 'Страховка.', 'Личные расходы.'],
  },
  days: [
    day('arrival', '2026-12-11', 'Приезд и открытие', photo('meditation-bowl', 'Девушка в медитации держит поющую чашу'), [
      ['16:00-17:30', 'Заезд участников, расселение, открытие ретрита.'],
      ['18:00', 'Практика асан, акцент на раскрытие грудного отдела и осанку.'],
      ['20:00', 'Ужин.'],
      ['Вечер', 'Буддийская медитация Метта, теория и практика, журналирование.'],
    ]),
    day('immersion', '2026-12-12', 'День погружения', photo('forest-trail', 'Тропа в зимнем еловом лесу'), [
      ['07:50', 'Face yoga, хатха йога.'],
      ['09:30-10:30', 'Завтрак.'],
      ['11:00', 'Поход, практика в лесу.'],
      ['14:00', 'Обед.'],
      ['День', 'Время для себя.'],
      ['17:00', 'Сауна, аюрведическая практика красоты и молодости, теория.'],
      ['Вечер', 'Ужин.'],
      ['20:40', 'Дыхательная практика, психо-энергетическая практика, звуковибрационный массаж тибетскими чашами и гонгом.'],
    ]),
    day('closing', '2026-12-13', 'Закрытие', video('pranayama', 'Участницы ретрита выполняют пранаяму'), [
      ['07:30', 'Пранаяма, практика асан с элементами парной йоги.'],
      ['08:40', 'Завтрак, закрытие ретрита, обмен впечатлениями.'],
      ['10:00', 'Check-out, выносим вещи в машины и по желанию гуляем.'],
    ]),
  ],
  bookingTitle: 'Едешь\nс нами?',
  bookingText: 'Встречаемся в Чешской Швейцарии 11-13 декабря. Напиши мне в Telegram, расскажу о местах и размещении. Оставляю за собой право менять программу :)',
  bookingSteps: ['Напиши в Telegram: «Хочу в Чешскую Швейцарию».', 'Уточни наличие мест и размещение.', 'Получи условия оплаты и подтверждение бронирования.'],
  bookingNote: 'Early bird - €275, обычная цена - €350. Программа может меняться.',
};

export const mountainsEnglishExperience: RetreatExperience = {
  priceOffer: { regularPrice: '€350', label: 'Early bird', note: '€275 instead of €350 with our' },
  heroTitle: 'Yoga in Bohemian\nSwitzerland.',
  heroText: 'Three days for yourself: yoga, a forest hike, sauna, meditation and Italian cuisine.',
  introTitle: 'A reset\nin nature',
  introText: 'Yoga and pranayama in the morning, forest and free time by day, sauna, breathwork and meditation in the evening. And Italian cuisine at the table.',
  reasons: [
    {
      title: 'A hike and forest practice',
      text: 'On Saturday we go hiking and practise right in the forest. After lunch there is time for yourself.',
      image: photo('hike-group', 'Retreat participants at a viewpoint above wooded hills'),
    },
    {
      title: 'Metta meditation',
      text: 'On the first evening we explore Buddhist Metta meditation: theory and practice. On the second, a sound vibration massage with Tibetan singing bowls and a gong.',
      image: photo('teacher-bowl', 'A woman in burgundy holding a singing bowl'),
    },
    {
      title: 'Breath, energy and beauty',
      text: 'Face yoga in the morning, sauna and an Ayurvedic beauty and youth practice by day, breathwork and a psycho-energetic practice in the evening.',
      image: photo('sage', 'A woman with closed eyes holding a smoking bundle of herbs'),
    },
  ],
  stayTitle: 'Where we’ll stay',
  stayText: 'We stay in Rybniště, Bohemian Switzerland. Accommodation is included in the price, and I’ll share details about the house and rooms on Telegram.',
  stayImages: [
    photo('moon', 'A crescent moon above a dark mountain ridge'),
    photo('dreamcatcher', 'A dreamcatcher covered in dew with a misty meadow and forest behind it'),
    photo('bowl-mat', 'A singing bowl on a mat in the sunlight'),
  ],
  inclusions: {
    included: [
      'Accommodation.',
      'All yoga, pranayama and meditation practices on the programme.',
      'Meals with a focus on Italian cuisine: two dinners, a lunch and two breakfasts.',
      'The hike and forest practice.',
      'Sauna and the Ayurvedic beauty and youth practice.',
    ],
    excluded: ['Travel to and from the retreat.', 'Insurance.', 'Personal expenses.'],
  },
  days: [
    day('arrival', '2026-12-11', 'Arrival and opening', photo('meditation-bowl', 'A woman in meditation holding a singing bowl'), [
      ['16:00-17:30', 'Arrival, check-in and retreat opening.'],
      ['18:00', 'Asana practice focused on opening the chest and posture.'],
      ['20:00', 'Dinner.'],
      ['Evening', 'Buddhist Metta meditation, theory and practice, journaling.'],
    ]),
    day('immersion', '2026-12-12', 'Immersion day', photo('forest-trail', 'A trail through a winter spruce forest'), [
      ['07:50', 'Face yoga, hatha yoga.'],
      ['09:30-10:30', 'Breakfast.'],
      ['11:00', 'Hike and practice in the forest.'],
      ['14:00', 'Lunch.'],
      ['Daytime', 'Time for yourself.'],
      ['17:00', 'Sauna, Ayurvedic beauty and youth practice, theory.'],
      ['Evening', 'Dinner.'],
      ['20:40', 'Breathwork, psycho-energetic practice and a sound vibration massage with Tibetan singing bowls and a gong.'],
    ]),
    day('closing', '2026-12-13', 'Closing', video('pranayama', 'Retreat participants practising pranayama'), [
      ['07:30', 'Pranayama, asana practice with elements of partner yoga.'],
      ['08:40', 'Breakfast, retreat closing, sharing impressions.'],
      ['10:00', 'Check-out, load the cars and take an optional walk.'],
    ]),
  ],
  bookingTitle: 'Coming\nwith us?',
  bookingText: 'Join us in Bohemian Switzerland on 11-13 December. Message me on Telegram about availability and accommodation. I reserve the right to change the programme :)',
  bookingSteps: ['Write on Telegram: “I’d like to join the Bohemian Switzerland retreat”.', 'Ask about availability and accommodation.', 'Receive payment terms and booking confirmation.'],
  bookingNote: 'Early bird: €275, regular price: €350. The programme may change.',
};
