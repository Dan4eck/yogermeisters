import type { RetreatExperience, RetreatMedia, RetreatScheduleItem } from './experience';
import type { RetreatSeed } from './types';

function photo(name: string, alt: string, caption?: string): RetreatMedia {
  return { src: `/assets/retreats/sri-lanka/${name}.webp`, alt, ...(caption ? { caption } : {}) };
}

function schedule(items: readonly (readonly [string, string])[]): readonly RetreatScheduleItem[] {
  return items.map(([time, text]: readonly [string, string]): RetreatScheduleItem => ({ time, text }));
}

const russianExperience: RetreatExperience = {
  priceOffer: { regularPrice: '€1299', label: 'Early birds', note: 'Всего 3 места' },
  heroTitle: 'Йога и отдых\nна Шри-Ланке.',
  heroText: 'Восемь дней в Велигаме: йога по утрам, поездки по югу острова и время у океана.',
  introTitle: 'Летим на Цейлон\nжить у океана!',
  introText: 'Утром — йога, днём — океан, пляжи и сёрфинг по желанию, вечером — медитации в буддийских храмах. Все поездки — примерно до 30–50 минут, чтобы не уставать от дороги.',
  reasons: [
    { title: 'Океан, пляжи и сёрфинг', text: 'Океан и Jungle Beach — в 10 минутах от проживания. Купаемся, отдыхаем на пляже или пробуем сёрфинг по желанию.', image: photo('surf-van', 'Фургон с досками для сёрфинга у океана'), additionalImages: [photo('surfer', 'Сёрфер с доской на берегу океана'), photo('palm-coast', 'Волны, песчаный пляж, пальмы и лодки с высоты')] },
    { title: 'Чайная плантация', text: 'Гуляем среди чайных кустов, знакомимся с производством цейлонского чая и пробуем его на дегустации.', image: photo('tea-plantation', 'Зелёные чайные плантации Шри-Ланки') },
    { title: 'Исторический форт Галле', text: 'Гуляем по старинным улочкам и вдоль крепостных стен, выходим к маяку и смотрим на океан.', image: photo('galle', 'Маяк и исторический форт Галле'), additionalImages: [photo('galle-street', 'Улица Галле в закатном свете')] },
    { title: 'Пальмы и морские черепахи', text: 'Пальмовые рощи и пляжи южного побережья. Здесь есть возможность увидеть морских черепах в их естественной среде.', image: photo('palm-grove', 'Пальмовая роща над бирюзовым океаном'), additionalImages: [photo('turtle', 'Морская черепаха в прозрачной воде'), photo('turtle-beach', 'Морская черепаха на пляже')] },
    { title: 'Храмы и древние святыни', text: 'Посещаем буддийские храмы и древние святыни. Вечером оставляем время для тишины и медитации.', image: photo('weherahena', 'Буддийский храм Weherahena'), additionalImages: [photo('temple-monks', 'Буддийские монахи в оранжевых одеяниях на каменной лестнице'), photo('agrabodhi', 'Буддийский храм Agrabodhi')] },
    { title: 'Ecstatic Dance в джунглях', text: 'Кульминация тура — легендарный Ecstatic Dance в джунглях, ради которого сюда съезжаются люди со всего мира.', image: photo('ecstatic', 'Участники танцуют на Ecstatic Dance') },
  ],
  stayTitle: 'Где будем жить',
  stayText: 'Светлые комнаты, деревянная мебель и балкон с видом на зелень и океан. Здесь отдыхаем между практиками и поездками по острову.',
  stayImages: [
    photo('casa-ocean-view', 'Вид на океан и балкон из спальни'),
    photo('casa-room-balcony', 'Светлая комната с кроватью, рабочим столом и выходом на балкон'),
    photo('casa-bedroom', 'Светлая спальня с деревянным столом и плетёным светильником'),
  ],
  inclusions: {
    included: [
      'Проживание — комфортное двухместное размещение в уютном отеле в Велигаме с завтраками.',
      'Все трансферы — из аэропорта, по маршруту путешествия и обратно в аэропорт.',
      'Сопровождение турлидера на протяжении всего путешествия.',
      'Утренние практики йоги и вечерние медитации.',
      'Ecstatic Dance в джунглях — участие в особенном событии, на которое съезжаются люди со всего мира.',
      'Экскурсии по программе — древние буддийские храмы, чайная плантация, исторический форт Галле и живописные пляжи.',
    ],
    excluded: [
      'Международный авиаперелёт.',
      'Медицинская страховка.',
      'Обеды и ужины.',
      'Личные расходы и покупка сувениров.',
      'Сёрфинг и занятия с инструктором — по желанию, за дополнительную плату.',
    ],
  },
  days: [
    {
      id: 'arrival', date: '2027-02-24', title: 'Прилёт и отдых',
      summary: 'После ночного перелёта отдыхаем и знакомимся с Велигамой. Вечером – короткая прогулка и лёгкая йога.',
      pace: 'Мягкий старт', layout: 'text', images: [photo('casa-room', 'Комната для проживания')],
      highlights: ['Встреча с океаном', 'Прогулка по Велигаме', 'Мягкая вечерняя йога'],
      schedule: schedule([
        ['04:00', 'Прилёт и трансфер к месту проживания. Дорога из аэропорта – около 2,5–3,5 часа.'],
        ['День', 'Заселение по готовности номера, завтрак, сон и первое знакомство с океаном.'],
        ['16:30', 'Прогулка по Велигаме.'],
        ['18:00', 'Мягкая йога после перелёта, затем ужин и отдых.'],
      ]),
    },
    {
      id: 'weligama', date: '2027-02-25', title: 'Святыни Велигамы',
      summary: 'Первое знакомство с островом начинается совсем рядом: скальный барельеф Kushtarajagala и храм Agrabodhi. Неспешно исследуем древние святыни, а вечером медитируем в храме, если его правила и обстановка это позволяют.',
      pace: 'Лёгкий день', layout: 'split',
      images: [photo('kushtarajagala', 'Барельеф Kushtarajagala')],
      highlights: ['Йога в 07:30', 'Святыни рядом с домом', 'Медитация в 17:30'],
      schedule: schedule([
        ['07:30', 'Йога и завтрак.'],
        ['10:00', 'Пешая прогулка к барельефу Kushtarajagala и храму Agrabodhi.'],
        ['День', 'Обед, океан и свободное время.'],
        ['17:30', 'Вечерняя медитация в Agrabodhi, затем ужин.'],
      ]),
    },
    {
      id: 'tea-and-mirissa', date: '2027-02-26', title: 'Чайная плантация\nи Мирисса',
      summary: 'Утром – плантация Handunugoda, знакомство с производством и дегустация. После – пляж в Мириссе, обед и свободное время у моря.',
      pace: 'Экскурсионный день', layout: 'panorama',
      images: [photo('tea-plantation', 'Чайные плантации Шри-Ланки')],
      highlights: ['Handunugoda', 'Дегустация чая', 'Пляж Мириссы'],
      schedule: schedule([
        ['07:00', 'Йога и завтрак. В 09:00 выезжаем на плантацию.'],
        ['09:45', 'Экскурсия по Handunugoda и дегустация чая.'],
        ['12:00', 'Мирисса: пляж, прогулка и обед у моря.'],
        ['16:15', 'Возвращение в Велигаму. Вечер свободный или с короткой расслабляющей практикой.'],
      ]),
    },
    {
      id: 'ecstatic', date: '2027-02-27', title: 'Океан\nи Ecstatic Dance',
      summary: 'Днём – океан, отдых и сёрфинг по желанию. Вечером планируем пойти на Ecstatic Dance в Pearl, Soul Lanka. Дату, адрес и время поездки подтвердим по расписанию площадки на 2027 год.',
      pace: 'Спокойный день · яркий вечер', layout: 'panorama',
      images: [photo('ecstatic', 'Ecstatic Dance на открытой площадке')],
      highlights: ['Океан без спешки', 'Сёрфинг по желанию', 'Ecstatic Dance в 18:00'],
      schedule: schedule([
        ['07:30', 'Утренняя йога и завтрак.'],
        ['День', 'Пляж, сёрфинг по желанию, обед и отдых.'],
        ['18:00', 'Ecstatic Dance в Pearl, Soul Lanka. Дату и площадку подтвердим по расписанию на 2027 год.'],
        ['Вечер', 'Возвращаемся отдыхать.'],
      ]),
    },
    {
      id: 'galle', date: '2027-02-28', title: 'Галле и пляж Виджая',
      summary: 'Гуляем по историческому форту, обедаем и едем к пляжу Виджая / Далавелла. Здесь отдыхаем у воды и наблюдаем за жизнью океана. Возможно, увидим морских черепах: они дикие, поэтому встреча не гарантирована.',
      pace: 'Экскурсия + пляж', layout: 'collage',
      images: [photo('turtle-beach', 'Морская черепаха на пляже')],
      highlights: ['Исторический форт', 'Пляж Виджая / Далавелла', 'Дикие морские черепахи'],
      schedule: schedule([
        ['07:00', 'Йога и завтрак. В 09:00 отправляемся в Галле.'],
        ['10:00', 'Гуляем по историческому форту и обедаем.'],
        ['13:30', 'Отдыхаем на пляже Виджая / Далавелла. Возможно, увидим диких черепах – встреча не гарантирована.'],
        ['17:00', 'Возвращение в Велигаму, ужин и отдых.'],
      ]),
    },
    {
      id: 'temples', date: '2027-03-01', title: 'Храмы\nи медитация',
      summary: 'Едем в сторону Матары к храмам Weherahena и Wewurukannala: большие статуи Будды, туннельные галереи и время для созерцания. Ориентируемся на самочувствие группы – если устанем, посетим один храм и оставим больше времени на отдых.',
      pace: 'Насыщенный день', layout: 'split',
      images: [photo('weherahena', 'Храм Weherahena')],
      highlights: ['Храмы у Матары', 'Туннельные галереи', 'Тихая практика вечером'],
      schedule: schedule([
        ['07:30', 'Йога и завтрак. В 10:00 выезжаем в сторону Матары.'],
        ['10:30', 'Храмы Weherahena и Wewurukannala: статуи Будды и туннельные галереи. Если группа устанет, посетим один храм.'],
        ['День', 'Обед и возвращение в Велигаму к 16:00.'],
        ['17:30', 'Медитация в храме либо спокойная практика в месте проживания.'],
      ]),
    },
    {
      id: 'closing', date: '2027-03-02', title: 'Последний день\nу океана',
      summary: 'Утром – йога, затем пляж и свободное время. Можно прогуляться до Jungle Beach, купить сувениры и собраться. Вечером встречаемся всей группой, обсуждаем поездку и готовимся к выезду в аэропорт.',
      pace: 'Отдых и завершение', layout: 'text', images: [photo('mirissa', 'Пляж Мириссы')],
      highlights: ['Заключительная йога', 'Свободное время у океана', 'Встреча всей группой'],
      schedule: schedule([
        ['07:30', 'Заключительная йога и завтрак.'],
        ['День', 'Океан, сувениры и сборы. По желанию – прогулка до Jungle Beach.'],
        ['16:00', 'Встреча всей группой: обсуждаем поездку, затем ранний ужин.'],
        ['20:00–20:30', 'Ориентировочный выезд в аэропорт. Точное время согласуем по билетам и дорожной ситуации.'],
      ]),
    },
    {
      id: 'departure', date: '2027-03-03', title: 'Вылет домой',
      summary: 'Выезжаем в аэропорт вечером 2 марта, вылетаем ночью 3 марта. Аэропорт, рейс и точное время трансфера подтверждаем по билетам; время в пути указано ориентировочно.',
      pace: 'Дорога домой', layout: 'text', images: [photo('casa-balcony', 'Светлая комната с балконом')], highlights: ['02:40 · вылет', 'Трансфер вечером 2 марта'],
      schedule: schedule([
        ['2 марта, вечер', 'Трансфер из Велигамы: около 2,5–3,5 часа в пути.'],
        ['До 23:40', 'Прибытие в аэропорт примерно за три часа до вылета.'],
        ['02:40', 'Вылет 3 марта. Аэропорт и рейс подтверждаем по билетам.'],
      ]),
    },
  ],
  bookingTitle: 'Хочешь с нами?',
  bookingText: 'Присоединяйся к йога-туру за новыми впечатлениями и духовным опытом. Оставь заявку в Telegram – Я расскажу подробности поездки!',
  bookingSteps: ['Перейди в Telegram и напиши: «Хочу на Шри-Ланку».', 'Уточни наличие мест, проживание и что входит в стоимость.', 'Получи условия оплаты и подтверждение бронирования.'],
  bookingNote: 'Стоимость Early birds — €1090, всего 3 места по этой цене. Полная стоимость — €1299. Условия оплаты уточняются при заявке. Программа может меняться с учётом погоды, расписания площадок и состояния группы.',
};

const englishExperience: RetreatExperience = {
  priceOffer: { regularPrice: '€1299', label: 'Early birds', note: 'Only 3 places' },
  heroTitle: 'Yoga and a break\nin Sri Lanka.',
  heroText: 'Eight days in Weligama: morning yoga, trips along the south coast and time by the ocean.',
  introTitle: 'Off to Ceylon,\nto live by the ocean!',
  introText: 'Yoga in the morning, ocean swims, beaches and optional surfing by day, and meditation in Buddhist temples in the evening. Trips take roughly 30–50 minutes, so we spend less time on the road.',
  reasons: [
    { title: 'Ocean, beaches and surfing', text: 'The ocean and Jungle Beach are 10 minutes from our accommodation. Swim, relax on the beach or try surfing if you feel like it.', image: photo('surf-van', 'A van with surfboards by the ocean'), additionalImages: [photo('surfer', 'A surfer carrying a board by the ocean'), photo('palm-coast', 'An aerial view of ocean waves, a sandy beach, palms and boats')] },
    { title: 'A tea plantation', text: 'Walk among tea bushes, discover how Ceylon tea is made and enjoy a tasting.', image: photo('tea-plantation', 'Green tea plantations in Sri Lanka') },
    { title: 'Historic Galle Fort', text: 'Explore old streets and the fort walls, walk to the lighthouse and take in the ocean views.', image: photo('galle', 'The lighthouse and historic Galle Fort'), additionalImages: [photo('galle-street', 'A street in Galle at sunset')] },
    { title: 'Palm groves and sea turtles', text: 'Discover palm groves and beaches along the south coast, with a chance to see sea turtles in their natural habitat.', image: photo('palm-grove', 'A palm grove above the turquoise ocean'), additionalImages: [photo('turtle', 'A sea turtle in clear water'), photo('turtle-beach', 'A sea turtle on the beach')] },
    { title: 'Temples and ancient sacred sites', text: 'Visit Buddhist temples and ancient sacred sites, with evenings set aside for stillness and meditation.', image: photo('weherahena', 'Weherahena Buddhist temple'), additionalImages: [photo('temple-monks', 'Buddhist monks in orange robes on a stone staircase'), photo('agrabodhi', 'Agrabodhi Buddhist temple')] },
    { title: 'Ecstatic Dance in the jungle', text: 'The highlight of the tour: a legendary Ecstatic Dance in the jungle that draws people from all over the world.', image: photo('ecstatic', 'People taking part in Ecstatic Dance') },
  ],
  stayTitle: 'Where we’ll stay',
  stayText: 'Bright rooms, wooden furniture and a balcony overlooking greenery and the ocean. A place to rest between practices and trips around the island.',
  stayImages: [
    photo('casa-ocean-view', 'An ocean view and balcony seen from the bedroom'),
    photo('casa-room-balcony', 'A bright room with a bed, desk and doors opening onto a balcony'),
    photo('casa-bedroom', 'A bright bedroom with a wooden desk and a woven pendant light'),
  ],
  inclusions: {
    included: [
      'Accommodation — comfortable twin-share accommodation in a cosy hotel in Weligama, with breakfast.',
      'All transfers — from the airport, throughout the itinerary and back to the airport.',
      'A tour leader accompanying the group throughout the journey.',
      'Morning yoga practices and evening meditation.',
      'Ecstatic Dance in the jungle — admission to a special event that draws people from all over the world.',
      'Excursions on the programme — ancient Buddhist temples, a tea plantation, historic Galle Fort and scenic beaches.',
    ],
    excluded: [
      'International flights.',
      'Travel medical insurance.',
      'Lunches and dinners.',
      'Personal expenses and souvenirs.',
      'Surfing and lessons with an instructor — optional, at an additional cost.',
    ],
  },
  days: [
    {
      id: 'arrival', date: '2027-02-24', title: 'Arrival and rest',
      summary: 'Rest after the overnight flight and get to know Weligama. In the evening, take a short walk and join a gentle yoga session.',
      pace: 'A gentle start', layout: 'text', images: [photo('casa-room', 'A room at our accommodation')], highlights: ['Meet the ocean', 'A walk around Weligama', 'Gentle evening yoga'],
      schedule: schedule([
        ['04:00', 'Arrival and transfer to our accommodation. The drive takes around 2.5–3.5 hours.'],
        ['Daytime', 'Check in when the room is ready, have breakfast, rest and meet the ocean.'],
        ['16:30', 'A walk around Weligama.'],
        ['18:00', 'Gentle yoga after the flight, then dinner and rest.'],
      ]),
    },
    {
      id: 'weligama', date: '2027-02-25', title: 'Weligama’s sacred sites',
      summary: 'Our first discoveries are close to home: the Kushtarajagala rock carving and Agrabodhi temple. We explore these ancient places at an easy pace, with evening meditation at the temple if its rules and circumstances allow.',
      pace: 'An easy day', layout: 'split',
      images: [photo('kushtarajagala', 'Kushtarajagala rock carving')],
      highlights: ['Yoga at 07:30', 'Nearby sacred sites', 'Meditation at 17:30'],
      schedule: schedule([
        ['07:30', 'Yoga and breakfast.'],
        ['10:00', 'Walk to the Kushtarajagala rock carving and Agrabodhi temple.'],
        ['Daytime', 'Lunch, ocean and free time.'],
        ['17:30', 'Evening meditation at Agrabodhi, then dinner.'],
      ]),
    },
    {
      id: 'tea-and-mirissa', date: '2027-02-26', title: 'Tea plantation\nand Mirissa',
      summary: 'A morning at Handunugoda tea plantation: a tour, an introduction to production and a tasting. Then Mirissa for lunch, the beach and free time by the sea.',
      pace: 'A day of discovery', layout: 'panorama',
      images: [photo('tea-plantation', 'Tea plantations in Sri Lanka')],
      highlights: ['Handunugoda', 'Tea tasting', 'Mirissa beach'],
      schedule: schedule([
        ['07:00', 'Yoga and breakfast. Leave for the plantation at 09:00.'],
        ['09:45', 'A tour of Handunugoda and a tea tasting.'],
        ['12:00', 'Mirissa: beach time, a walk and lunch by the sea.'],
        ['16:15', 'Back in Weligama. Free evening or a short relaxation practice.'],
      ]),
    },
    {
      id: 'ecstatic', date: '2027-02-27', title: 'Ocean\nand Ecstatic Dance',
      summary: 'Ocean, rest and optional surfing during the day. In the evening, we plan to go to Ecstatic Dance at Pearl, Soul Lanka. The date, address and travel time will be confirmed against the venue’s 2027 schedule.',
      pace: 'A quiet day · a vibrant evening', layout: 'panorama',
      images: [photo('ecstatic', 'Open-air Ecstatic Dance')],
      highlights: ['Unhurried ocean time', 'Optional surfing', 'Ecstatic Dance at 18:00'],
      schedule: schedule([
        ['07:30', 'Morning yoga and breakfast.'],
        ['Daytime', 'Beach, optional surfing, lunch and rest.'],
        ['18:00', 'Ecstatic Dance at Pearl, Soul Lanka. Date and venue to be confirmed against the 2027 schedule.'],
        ['Evening', 'Return to our accommodation.'],
      ]),
    },
    {
      id: 'galle', date: '2027-02-28', title: 'Galle and Wijaya beach',
      summary: 'Explore the historic fort, pause for lunch and head to Wijaya / Dalawella beach. We relax by the water and watch ocean life. We may spot sea turtles, but these are wild animals, so a sighting is not guaranteed.',
      pace: 'Culture + beach', layout: 'collage',
      images: [photo('turtle-beach', 'A sea turtle on the beach')],
      highlights: ['Historic Galle Fort', 'Wijaya / Dalawella beach', 'Wild sea turtles'],
      schedule: schedule([
        ['07:00', 'Yoga and breakfast. Leave for Galle at 09:00.'],
        ['10:00', 'Explore the historic fort and stop for lunch.'],
        ['13:30', 'Relax on Wijaya / Dalawella beach. We may see wild sea turtles, but a sighting is not guaranteed.'],
        ['17:00', 'Back in Weligama for dinner and rest.'],
      ]),
    },
    {
      id: 'temples', date: '2027-03-01', title: 'Temples\nand meditation',
      summary: 'Travel towards Matara to Weherahena and Wewurukannala: large Buddha statues, tunnel galleries and time for contemplation. We follow the group’s energy – if we feel tired, we will visit one temple and leave more time for rest.',
      pace: 'A full excursion day', layout: 'split',
      images: [photo('weherahena', 'Weherahena temple')],
      highlights: ['Temples near Matara', 'Tunnel galleries', 'Quiet evening practice'],
      schedule: schedule([
        ['07:30', 'Yoga and breakfast. Leave towards Matara at 10:00.'],
        ['10:30', 'Weherahena and Wewurukannala: Buddha statues and tunnel galleries. If the group feels tired, we will visit one temple.'],
        ['Daytime', 'Lunch and return to Weligama by 16:00.'],
        ['17:30', 'Meditation at a temple or a quiet practice at our accommodation.'],
      ]),
    },
    {
      id: 'closing', date: '2027-03-02', title: 'Our last day\nby the ocean',
      summary: 'Morning yoga, followed by the beach and free time. Take a walk to Jungle Beach, shop for souvenirs or pack. In the evening, we meet as a group, talk about the trip and get ready for the airport.',
      pace: 'Rest and reflection', layout: 'text', images: [photo('mirissa', 'Mirissa beach')], highlights: ['Final yoga practice', 'Free ocean time', 'Group catch-up'],
      schedule: schedule([
        ['07:30', 'Final yoga practice and breakfast.'],
        ['Daytime', 'Ocean, souvenirs and packing. An optional walk to Jungle Beach.'],
        ['16:00', 'Meet as a group to share impressions, then have an early dinner.'],
        ['20:00–20:30', 'Provisional departure for the airport. Exact timing depends on tickets and traffic.'],
      ]),
    },
    {
      id: 'departure', date: '2027-03-03', title: 'Flight home',
      summary: 'Leave for the airport on the evening of 2 March and fly home in the early hours of 3 March. The airport, flight and exact transfer time will be confirmed from tickets; journey times are approximate.',
      pace: 'Homeward bound', layout: 'text', images: [photo('casa-balcony', 'A bright room with a balcony')], highlights: ['02:40 · departure', 'Transfer on 2 March'],
      schedule: schedule([
        ['2 March, evening', 'Transfer from Weligama: around 2.5–3.5 hours on the road.'],
        ['By 23:40', 'Arrive at the airport about three hours before departure.'],
        ['02:40', 'Flight on 3 March. Airport and flight to be confirmed from tickets.'],
      ]),
    },
  ],
  bookingTitle: 'Would you like to join us?',
  bookingText: 'Join the yoga tour for new experiences and spiritual practice. Leave an enquiry on Telegram – I’ll tell you more about the trip!',
  bookingSteps: ['Open Telegram and write: “I’d like to join Sri Lanka”.', 'Ask about availability, accommodation and what the price includes.', 'Receive payment terms and booking confirmation.'],
  bookingNote: 'Early birds price: €1090, with only 3 places at this price. Full price: €1299. Payment terms are clarified when you enquire. The programme may change with the weather, venue schedules and the group’s wellbeing.',
};

export const sriLankaRetreat: RetreatSeed = {
  id: 4,
  slug: 'sri-lanka-yoga-tour',
  status: 'active',
  title: 'Sri Lanka Yoga Tour',
  location: 'Weligama',
  startDate: '2027-02-24',
  endDate: '2027-03-03',
  dateLabel: '24 February – 3 March 2027',
  price: '€1090',
  bookingUrl: 'https://t.me/AnastasiaPagliacci',
  coverImage: '/assets/retreats/sri-lanka/coast.webp',
  experience: englishExperience,
  translations: {
    ru: {
      title: 'Йога-тур на Шри-Ланке',
      location: 'Велигама',
      dateLabel: '24 февраля – 3 марта 2027',
      experience: russianExperience,
    },
  },
  blocks: [],
};
