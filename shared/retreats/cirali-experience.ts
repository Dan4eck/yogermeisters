import type { RetreatDay, RetreatExperience, RetreatMedia, RetreatScheduleItem, RetreatVideo } from './experience';

function photo(name: string, alt: string): RetreatMedia {
  return { src: `/assets/retreats/cirali/cirali-${name}.webp`, alt };
}

function video(name: string, label: string): RetreatVideo {
  return {
    src: `/assets/retreats/cirali/cirali-${name}.mp4`,
    poster: `/assets/retreats/cirali/cirali-${name}-poster.webp`,
    label,
  };
}

function day(
  id: string, date: string, title: string, media: RetreatMedia | RetreatVideo | null,
  items: readonly (readonly [string, string])[],
): RetreatDay {
  const schedule: readonly RetreatScheduleItem[] = items.map(([time, text]): RetreatScheduleItem => ({ time, text }));
  const video = media && 'poster' in media ? media : undefined;
  const image = media && 'alt' in media ? media : undefined;
  return {
    id, date, title, summary: items.map(([, text]): string => text).join(' '),
    pace: title, layout: image ? 'split' : 'text', images: image ? [image] : [],
    ...(video ? { video } : {}), highlights: [title], schedule,
  };
}

export const ciraliRussianExperience: RetreatExperience = {
  priceOffer: { regularPrice: '€790', label: 'Early Bird', note: '€720 вместо €790 — цена по предложению' },
  heroTitle: 'Йога и море.\nНеделя в Чиралы.',
  heroText: 'Семь дней на Ликийском побережье: йога, прогулки среди гор, тихие бухты и время для себя.',
  introTitle: 'К морю. В горы.\nБлиже к себе.',
  introText: 'Утром — практика, днём — море и маленькие путешествия, вечером — медитации. В этом ритме есть место и новым впечатлениям, и простому отдыху без спешки.',
  reasons: [
    {
      title: 'Море без расписания',
      text: 'Купаться, читать на пляже или просто смотреть на воду. Между практиками и прогулками оставляем время для себя. SUP-прогулки — по желанию, за отдельную плату.',
      image: photo('beach-reading', 'Отдых с книгой на пляже Чиралы, море и горы'),
      additionalImages: [photo('sup-group', 'Участники на SUP-бордах: прогулка по желанию, за отдельную плату')],
    },
    {
      title: 'Йога и живая практика',
      text: 'Гималайская йога, пранаяма, балансы и мягкое восстановление. Вечером — медитации, йога-нидра и движение под музыку. Каждый день встречаемся с телом немного по-новому.',
      image: photo('teacher-adjustment', 'Настя помогает участнице выстроить положение тела во время практики'),
    },
    {
      title: 'Ликийская тропа и бухты',
      text: 'Идём среди сосен и скал к Чёрному пляжу, купаемся и устраиваем пикник у воды. В другой день смотрим на побережье с лодки: пять бухт, снорклинг и обед на борту.',
      image: photo('mountain-view', 'Скалы и сосновый лес на Ликийском побережье'),
    },
    {
      title: 'Маленькие открытия вместе',
      text: 'Велосипедные прогулки по деревушке, древний Олимпос и местный рынок. Фрукты, турецкие сладости и люди, с которыми приятно разделить эту неделю.',
      image: photo('forest-group', 'Участники ретрита вместе на прогулке среди сосен'),
    },
  ],
  stayTitle: 'Где будем жить',
  stayText: 'Уютные деревянные бунгало в апельсиновом саду, в нескольких шагах от моря. Снаружи — зелень и горы, внутри — место для спокойного отдыха между практиками. Проживание с завтраками входит в стоимость.',
  stayImages: [
    photo('bungalows-exterior', 'Деревянные бунгало с верандами в саду на фоне гор'),
    photo('bungalows-interior', 'Спальня и общая зона внутри деревянного бунгало'),
    photo('banana-garden', 'Банановые листья и плоды в саду Чиралы'),
  ],
  inclusions: {
    included: [
      'Проживание в уютных бунгало с завтраками.',
      'Трансферы из аэропорта и обратно.',
      'Практики йоги, пранаямы, медитаций и йога-нидры по программе.',
      'Прогулка на лодке по пяти бухтам.',
      'Продуманный маршрут и сопровождение на протяжении поездки.',
      'Фото- и видеосъёмка ярких моментов ретрита.',
    ],
    excluded: [
      'Авиаперелёты.',
      'Питание, кроме завтраков.',
      'Аренда велосипедов.',
      'SUP-бординг и аренда сап-бордов — по желанию, за отдельную плату.',
      'Личные расходы и сувениры.',
    ],
  },
  days: [
    day('arrival', '2027-05-01', 'Приезд и мягкое приземление',
      null, [
        ['Приезд', 'Встречаемся и заселяемся в бунгало среди апельсиновых деревьев.'],
        ['День', 'Отдыхаем после дороги, знакомимся с местом и выходим к морю.'],
        ['Вечер', 'Бережная йога и глубокая йога-нидра, чтобы отпустить напряжение дороги.'],
      ]),
    day('village', '2027-05-02', 'Велосипеды, пляж и энергия',
      photo('bicycle', 'Велосипед под сосной на фоне гор'), [
        ['Утро', 'Гималайская йога и пранаяма на активацию энергии. Затем завтрак.'],
        ['День', 'Катаемся по деревушке и живописным окрестностям, отдыхаем на пляже. Аренда велосипедов оплачивается отдельно.'],
        ['Вечер', 'Мета-дыхание и ОШО-медитация.'],
      ]),
    day('sea', '2027-05-03', 'Море и время для себя',
      video('practice', 'Практика йоги с Настей'), [
        ['Утро', 'Практика с фокусом на балансах на руках и завтрак.'],
        ['День', 'Пляж, книги, сон или неспешная прогулка. Свободное время без обязательной программы.'],
        ['Вечер', 'Буддийская медитация и йога-нидра.'],
      ]),
    day('lycian-way', '2027-05-04', 'Ликийская тропа и Чёрный пляж',
      photo('lycian-trail', 'Бирюзовая бухта и сосны на Ликийской тропе'), [
        ['Утро', 'Практика на раскрытие таза и мягкую работу с телом. Завтрак перед выходом.'],
        ['День', 'Идём по Ликийской тропе среди сосен и скал к Чёрному пляжу. Купаемся и устраиваем пикник у берега.'],
        ['Вечер', 'Экстатик-дэнс и медитация в движении.'],
      ]),
    day('five-bays', '2027-05-05', 'Пять бухт с моря',
      photo('five-bays', 'Море, пляж и горы Ликийского побережья'), [
        ['Утро', 'Динамическая йога для энергии и завтрак.'],
        ['День', 'Лодочное путешествие по пяти бухтам: снорклинг, купание и обед на борту.'],
        ['Вечер', 'Мета-дыхание и практика «тишины ума».'],
      ]),
    day('chimaera', '2027-05-06', 'Огни Химеры и тишина',
      video('chimaera', 'Огни Химеры и участники ретрита'), [
        ['Утро', 'Йога с фокусом на силе, стойках на руках и инверсиях.'],
        ['День', 'Отдыхаем, оставляем время для моря и готовимся к прогулке.'],
        ['Вечер', 'Поднимаемся к огням Химеры и садимся в медитацию под звёздами.'],
      ]),
    day('olympos', '2027-05-07', 'Олимпос и завершение ретрита',
      photo('olympos-group', 'Группа ретрита у древних колонн Олимпоса'), [
        ['Утро', 'Интеграционная йога, пранаяма и неспешный завтрак.'],
        ['День', 'Древний Олимпос, местный рынок и сувениры — в зависимости от времени выезда группы.'],
        ['Завершение', 'Собираемся и прощаемся с Чиралы. Время обратного трансфера согласуем по билетам.'],
      ]),
  ],
  bookingTitle: 'Оставь неделю\nдля себя.',
  bookingText: 'Море, горы и практика — с 1 по 7 мая в Чиралы. Напиши Насте в Telegram: она расскажет о поездке, размещении и свободных местах. Залог для брони — €200.',
  bookingSteps: ['Напиши в Telegram: «Хочу в Чиралы».', 'Уточни размещение, перелёт и наличие мест.', 'Внеси залог €200 и получи подтверждение бронирования.'],
  bookingNote: 'Основная цена — €790, Early Bird — €720. Даты: 1–7 мая 2027. Точное расписание выезда согласуем по билетам.',
};

export const ciraliEnglishExperience: RetreatExperience = {
  priceOffer: { regularPrice: '€790', label: 'Early Bird', note: '€720 instead of €790 with our' },
  heroTitle: 'Yoga and the sea.\nA week in Cirali.',
  heroText: 'Seven days on the Lycian Coast: yoga, mountain walks, quiet bays and time for yourself.',
  introTitle: 'By the sea.\nBack to yourself.',
  introText: 'Morning practice, days by the sea and little adventures, followed by evening meditation. A rhythm with room for new experiences and unhurried rest.',
  reasons: [
    {
      title: 'Unhurried days by the sea',
      text: 'Swim, read on the beach or simply watch the water. Between practices and walks, there is time for yourself. SUP trips are optional and cost extra.',
      image: photo('beach-reading', 'Reading on Cirali beach with the sea and mountains beyond'),
      additionalImages: [photo('sup-group', 'Participants on SUP boards: an optional activity at an additional cost')],
    },
    {
      title: 'Yoga that moves with you',
      text: 'Himalayan yoga, pranayama, balances and gentle recovery. Evenings bring meditation, yoga nidra and movement to music. A different way to reconnect with your body each day.',
      image: photo('teacher-adjustment', 'Nastya guiding a participant’s alignment during yoga practice'),
    },
    {
      title: 'The Lycian Way and hidden bays',
      text: 'Walk through pines and cliffs to Black Beach for a swim and a picnic. On another day, discover the coast by boat: five bays, snorkelling and lunch on board.',
      image: photo('mountain-view', 'Pine-covered cliffs along the Lycian Coast'),
    },
    {
      title: 'Small discoveries together',
      text: 'Bicycle rides through the village, ancient Olympos and the local market. Fresh fruit, Turkish sweets and people to share the week with.',
      image: photo('forest-group', 'Retreat participants together on a walk among pine trees'),
    },
  ],
  stayTitle: 'Where we’ll stay',
  stayText: 'Cosy wooden bungalows in an orange garden, a few steps from the sea. Greenery and mountains outside, a quiet place to rest between practices inside. Accommodation with breakfast is included.',
  stayImages: [
    photo('bungalows-exterior', 'Wooden bungalows with verandas in a garden beneath the mountains'),
    photo('bungalows-interior', 'A bedroom and shared living area inside a wooden bungalow'),
    photo('banana-garden', 'Banana leaves and fruit in a Cirali garden'),
  ],
  inclusions: {
    included: [
      'Accommodation in cosy bungalows with breakfast.',
      'Transfers from and to the airport.',
      'Yoga, pranayama, meditation and yoga nidra on the programme.',
      'A boat trip through five bays.',
      'A carefully planned itinerary and support throughout the journey.',
      'Photo and video coverage of retreat highlights.',
    ],
    excluded: [
      'Flights.',
      'Meals other than breakfast.',
      'Bicycle rental.',
      'SUP boarding and board rental — optional, at an additional cost.',
      'Personal expenses and souvenirs.',
    ],
  },
  days: [
    day('arrival', '2027-05-01', 'Arrival and a gentle landing',
      null, [
        ['Arrival', 'Meet the group and settle into bungalows among orange trees.'],
        ['Daytime', 'Rest after travelling, get to know the surroundings and meet the sea.'],
        ['Evening', 'Gentle yoga and deep yoga nidra to release the tension of the journey.'],
      ]),
    day('village', '2027-05-02', 'Bicycles, beach and energy',
      photo('bicycle', 'A bicycle under a pine tree with mountain views'), [
        ['Morning', 'Himalayan yoga and energising pranayama, followed by breakfast.'],
        ['Daytime', 'Cycle through the village and scenic surroundings, then relax on the beach. Bicycle rental costs extra.'],
        ['Evening', 'Meta-breathing and OSHO meditation.'],
      ]),
    day('sea', '2027-05-03', 'The sea and time for yourself',
      video('practice', 'Yoga practice with Nastya'), [
        ['Morning', 'Yoga with a focus on hand balances, then breakfast.'],
        ['Daytime', 'Beach, books, sleep or a slow walk. Free time without a fixed programme.'],
        ['Evening', 'Buddhist meditation and yoga nidra.'],
      ]),
    day('lycian-way', '2027-05-04', 'The Lycian Way and Black Beach',
      photo('lycian-trail', 'A turquoise bay and pine trees along the Lycian Way'), [
        ['Morning', 'Hip-opening practice and gentle movement. Breakfast before the walk.'],
        ['Daytime', 'Follow the Lycian Way through pines and cliffs to Black Beach. Swim and enjoy a picnic by the shore.'],
        ['Evening', 'Ecstatic dance and moving meditation.'],
      ]),
    day('five-bays', '2027-05-05', 'Five bays by boat',
      photo('five-bays', 'Sea, beach and mountains along the Lycian Coast'), [
        ['Morning', 'Dynamic yoga for energy, followed by breakfast.'],
        ['Daytime', 'A boat trip through five bays: snorkelling, swimming and lunch on board.'],
        ['Evening', 'Meta-breathing and a silence-of-mind practice.'],
      ]),
    day('chimaera', '2027-05-06', 'Chimaera’s flames and stillness',
      video('chimaera', 'Chimaera’s flames and retreat participants'), [
        ['Morning', 'Yoga focusing on strength, handstands and inversions.'],
        ['Daytime', 'Rest, spend time by the sea and get ready for our walk.'],
        ['Evening', 'Walk to Chimaera’s flames and sit in meditation under the stars.'],
      ]),
    day('olympos', '2027-05-07', 'Olympos and a gentle goodbye',
      photo('olympos-group', 'Retreat participants at the ancient columns of Olympos'), [
        ['Morning', 'Integration yoga, pranayama and an unhurried breakfast.'],
        ['Daytime', 'Ancient Olympos, the local market and souvenirs, depending on the group’s departure time.'],
        ['Departure', 'Pack and say goodbye to Cirali. Return transfer times will be arranged around flight tickets.'],
      ]),
  ],
  bookingTitle: 'A week\njust for you.',
  bookingText: 'Sea, mountains and practice in Cirali, May 1–7. Message Nastya on Telegram for trip details, accommodation and availability. The deposit to reserve your place is €200.',
  bookingSteps: ['Send “I’d like to join Cirali” on Telegram.', 'Discuss accommodation, flights and availability.', 'Pay a €200 deposit and receive your booking confirmation.'],
  bookingNote: 'Standard price: €790. Early Bird: €720. May 1–7, 2027. Departure times will be arranged around flight tickets.',
};
