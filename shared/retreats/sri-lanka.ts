import type { RetreatExperience, RetreatMedia, RetreatScheduleItem } from './experience';
import type { RetreatSeed } from './types';

function photo(name: string, alt: string, caption?: string): RetreatMedia {
  return { src: `/assets/retreats/sri-lanka/${name}.webp`, alt, ...(caption ? { caption } : {}) };
}

function schedule(items: readonly (readonly [string, string])[]): readonly RetreatScheduleItem[] {
  return items.map(([time, text]: readonly [string, string]): RetreatScheduleItem => ({ time, text }));
}

const russianExperience: RetreatExperience = {
  heroTitle: 'Йога и отдых\nна Шри-Ланке.',
  heroText: 'Восемь дней в Велигаме: йога по утрам, поездки по югу острова и время у океана. Живём в Casa Banana.',
  introTitle: 'Путешествие,\nв котором есть\nместо для тебя.',
  introText: 'Начинаем день с практики, отправляемся знакомиться с островом и оставляем время просто быть у океана. Чайные плантации, улочки Галле и тихие храмы чередуются с отдыхом. Не нужно успевать всё: программа учитывает дорогу, самочувствие и желание замедлиться.',
  stayTitle: 'Проживание в Casa Banana',
  stayText: 'На время тура останавливаемся в Casa Banana в Велигаме. Отсюда отправляемся на прогулки и выезды, сюда возвращаемся отдыхать. Светлые комнаты, тропические детали и пространство, где можно спокойно побыть между впечатлениями.',
  stayImages: [
    photo('casa-balcony', 'Светлая комната Casa Banana с открытой дверью на балкон', 'Casa Banana · Велигама'),
    photo('casa-room', 'Комната Casa Banana с деревянной мебелью и растениями'),
  ],
  days: [
    {
      id: 'arrival', date: '2027-02-24', title: 'Прилёт и отдых',
      summary: 'После ночного перелёта отдыхаем и знакомимся с Велигамой. Вечером – короткая прогулка и лёгкая йога.',
      pace: 'Мягкий старт', layout: 'text', images: [],
      highlights: ['Встреча с океаном', 'Прогулка по Велигаме', 'Мягкая вечерняя йога'],
      schedule: schedule([
        ['04:00', 'Прилёт в аэропорт.'],
        ['04:00–08:00', 'Прохождение аэропорта и трансфер в Casa Banana. Дорога после выхода из аэропорта занимает ориентировочно 2,5–3,5 часа.'],
        ['Утро', 'Заселяемся, если номер уже доступен, или оставляем багаж и отдыхаем.'],
        ['День', 'Сон, завтрак, знакомство с территорией и океаном.'],
        ['16:30', 'Лёгкая прогулка по Велигаме.'],
        ['18:00', 'Мягкая вечерняя йога и расслабление.'],
        ['Вечер', 'Ужин и отдых.'],
      ]),
    },
    {
      id: 'weligama', date: '2027-02-25', title: 'Святыни Велигамы',
      summary: 'Первое знакомство с островом начинается совсем рядом: скальный барельеф Kushtarajagala и храм Agrabodhi. Неспешно исследуем древние святыни, а вечером медитируем в храме, если его правила и обстановка это позволяют.',
      pace: 'Лёгкий день', layout: 'split',
      images: [photo('kushtarajagala', 'Древний барельеф Kushtarajagala среди зелени', 'Kushtarajagala'), photo('agrabodhi', 'Статуя Будды и лестница у храма Agrabodhi', 'Agrabodhi Raja Maha Viharaya')],
      highlights: ['Йога в 07:30', 'Святыни рядом с домом', 'Медитация в 17:30'],
      schedule: schedule([
        ['07:30–08:30', 'Утренняя йога.'], ['08:30–09:30', 'Завтрак.'],
        ['10:00–10:45', 'Выходим к Kushtarajagala и рассматриваем древний скальный барельеф. От Casa Banana – около 3–5 минут на байке или 10–15 минут пешком.'],
        ['11:00–12:00', 'Прогулка и посещение Agrabodhi Raja Maha Viharaya. От Casa Banana – около 3–5 минут на байке или 15 минут пешком.'],
        ['12:30', 'Обед.'], ['После обеда', 'Свободное время, океан и отдых.'],
        ['17:30–18:30', 'Вечерняя медитация в Agrabodhi'], ['Вечер', 'Ужин.'],
      ]),
    },
    {
      id: 'tea-and-mirissa', date: '2027-02-26', title: 'Чайная плантация\nи Мирисса',
      summary: 'Утром – плантация Handunugoda, знакомство с производством и дегустация. После – пляж в Мириссе, обед и свободное время у моря.',
      pace: 'Экскурсионный день', layout: 'panorama',
      images: [photo('tea-country', 'Зелёные чайные склоны Шри-Ланки', 'Чайные пейзажи острова'), photo('tea-plantation', 'Чайные кусты на зелёных склонах Шри-Ланки', 'Чайные плантации Шри-Ланки')],
      highlights: ['Handunugoda', 'Дегустация чая', 'Пляж Мириссы'],
      schedule: schedule([
        ['07:00–08:00', 'Утренняя йога.'], ['08:00–09:00', 'Завтрак.'],
        ['09:00', 'Выезжаем на плантацию Handunugoda. Дорога занимает около 30–45 минут.'],
        ['09:45–11:15', 'Экскурсия, знакомство с производством и дегустация чая.'],
        ['11:15–12:00', 'Переезд в Мириссу, ориентировочно 30–45 минут.'],
        ['12:00–15:30', 'Пляж, прогулка и обед в кафе.'],
        ['15:30–16:15', 'Возвращаемся в Велигаму. Сам переезд занимает ориентировочно 15–25 минут.'],
        ['Вечер', 'Свободное время или короткая расслабляющая практика.'],
      ]),
    },
    {
      id: 'ecstatic', date: '2027-02-27', title: 'Океан\nи Ecstatic Dance',
      summary: 'Днём – океан, отдых и сёрфинг по желанию. Вечером планируем пойти на Ecstatic Dance в Pearl, Soul Lanka. Дату, адрес и время поездки подтвердим по расписанию площадки на 2027 год.',
      pace: 'Спокойный день · яркий вечер', layout: 'panorama',
      images: [photo('ecstatic', 'Участники Ecstatic Dance танцуют на открытой площадке среди деревьев', 'Ecstatic Dance · Soul Lanka'), photo('mirissa', 'Песчаный пляж с пальмами и океаном', 'До танцев – день у океана')],
      highlights: ['Океан без спешки', 'Сёрфинг по желанию', 'Ecstatic Dance в 18:00'],
      schedule: schedule([
        ['07:30–08:30', 'Утренняя йога.'], ['08:30–10:00', 'Завтрак и свободное время.'],
        ['10:00–12:00', 'Океан, пляж или сёрфинг по желанию.'], ['12:00–14:00', 'Обед и отдых.'],
        ['14:00–16:30', 'Свободное время, подготовка к вечеру.'], ['16:30–17:30', 'Сборы и дорога к месту проведения.'],
        ['18:00', 'Ecstatic Dance в баре Pearl, Soul Lanka – по подтверждённому расписанию площадки.'],
        ['После танцев', 'Возвращаемся в Casa Banana.'],
      ]),
    },
    {
      id: 'galle', date: '2027-02-28', title: 'Галле и пляж Виджая',
      summary: 'Гуляем по историческому форту, обедаем и едем к пляжу Виджая / Далавелла. Здесь отдыхаем у воды и наблюдаем за жизнью океана. Возможно, увидим морских черепах: они дикие, поэтому встреча не гарантирована.',
      pace: 'Экскурсия + пляж', layout: 'collage',
      images: [photo('galle', 'Форт Галле и маяк на берегу океана', 'Форт Галле'), photo('turtle', 'Морская черепаха у кромки воды', 'Встреча, которую решает природа'), photo('turtle-beach', 'Морская черепаха на песчаном пляже у океана')],
      highlights: ['Исторический форт', 'Пляж Виджая / Далавелла', 'Дикие морские черепахи'],
      schedule: schedule([
        ['07:00–08:00', 'Утренняя йога.'], ['08:00–09:00', 'Завтрак.'],
        ['09:00', 'Выезд в сторону Галле. Дорога на машине – ориентировочно 35–50 минут.'],
        ['10:00–12:00', 'Прогулка по историческому форту Галле.'], ['12:00–13:00', 'Обед.'],
        ['13:00–13:30', 'Переезд к пляжу Виджая / Далавелла.'],
        ['13:30–16:00', 'Отдых на пляже и наблюдение за дикими морскими черепахами, если они появятся.'],
        ['16:00–17:00', 'Возвращение в Велигаму, ориентировочно 30–45 минут в пути.'], ['Вечер', 'Ужин и отдых.'],
      ]),
    },
    {
      id: 'temples', date: '2027-03-01', title: 'Храмы\nи медитация',
      summary: 'Едем в сторону Матары к храмам Weherahena и Wewurukannala: большие статуи Будды, туннельные галереи и время для созерцания. Ориентируемся на самочувствие группы – если устанем, посетим один храм и оставим больше времени на отдых.',
      pace: 'Насыщенный день', layout: 'split',
      images: [photo('weherahena', 'Статуя Будды и храмовый комплекс Weherahena', 'Weherahena'), photo('wewurukannala', 'Статуя Будды и белые постройки Wewurukannala', 'Wewurukannala')],
      highlights: ['Храмы у Матары', 'Туннельные галереи', 'Тихая практика вечером'],
      schedule: schedule([
        ['07:30–08:30', 'Утренняя йога.'], ['08:30–09:30', 'Завтрак.'],
        ['10:00', 'Выезжаем в сторону Матары. До Weherahena от Casa Banana – ориентировочно 25–35 минут.'],
        ['10:30–12:00', 'Weherahena Poorwarama Rajamaha Viharaya: осмотр комплекса, статуи Будды и туннельных галерей.'],
        ['12:00–12:30', 'Переезд к следующему храму, около 25–35 минут.'],
        ['12:30–14:00', 'Wewurukannala Raja Maha Viharaya: храмовый комплекс и большая статуя Будды.'],
        ['14:00–15:00', 'Обед.'], ['15:00–16:00', 'Возвращение в Велигаму, примерно 40–50 минут в пути.'],
        ['После 16:00', 'Отдых.'],
        ['17:30–18:30', 'Медитация в храме либо спокойная практика в месте проживания.'],
      ]),
    },
    {
      id: 'closing', date: '2027-03-02', title: 'Последний день\nу океана',
      summary: 'Утром – йога, затем пляж и свободное время. Можно прогуляться до Jungle Beach, купить сувениры и собраться. Вечером встречаемся всей группой, обсуждаем поездку и готовимся к выезду в аэропорт.',
      pace: 'Отдых и завершение', layout: 'text', images: [],
      highlights: ['Заключительная йога', 'Свободное время у океана', 'Встреча всей группой'],
      schedule: schedule([
        ['07:30–08:30', 'Заключительная утренняя йога.'], ['08:30–10:00', 'Завтрак.'],
        ['10:00–12:00', 'Океан, пляж или свободное время.'], ['12:00–14:00', 'Обед и отдых.'],
        ['14:00–16:00', 'Свободное время, сувениры и сборы.'], ['16:00–17:00', 'Общая встреча: делимся впечатлениями и подводим итоги поездки.'],
        ['Вечер', 'Ранний ужин и подготовка к выезду в аэропорт.'],
        ['Около 20:00–20:30', 'Ориентировочный выезд в аэропорт к ночному рейсу. Точное время согласуем по билетам, аэропорту и дорожной ситуации.'],
      ]),
    },
    {
      id: 'departure', date: '2027-03-03', title: 'Вылет домой',
      summary: 'Выезжаем в аэропорт вечером 2 марта, вылетаем ночью 3 марта. Аэропорт, рейс и точное время трансфера подтверждаем по билетам; время в пути указано ориентировочно.',
      pace: 'Дорога домой', layout: 'text', images: [], highlights: ['02:40 · вылет', 'Трансфер вечером 2 марта'],
      schedule: schedule([
        ['Вечер 2 марта', 'Трансфер из Велигамы. При дороге 2,5–3,5 часа планируем выезд ориентировочно в 20:00–20:30.'],
        ['До 23:40, 2 марта', 'Планируем прибытие в аэропорт примерно за 3 часа до вылета.'],
        ['02:40, 3 марта', 'Вылет из Шри-Ланки.'],
      ]),
    },
  ],
  bookingTitle: 'Хочешь с нами?',
  bookingText: 'Присоединяйся к йога-туру за новыми впечатлениями и духовным опытом. Оставь заявку в Telegram – Я расскажу подробности поездки!',
  bookingSteps: ['Перейди в Telegram и напиши: «Хочу на Шри-Ланку».', 'Уточни наличие мест, проживание и что входит в стоимость.', 'Получи условия оплаты и подтверждение бронирования.'],
  bookingNote: 'Стоимость тура – €1199. Состав стоимости, перелёт, размещение и условия оплаты уточняются при заявке. Программа может меняться с учётом погоды, расписания площадок и состояния группы.',
};

const englishExperience: RetreatExperience = {
  heroTitle: 'Yoga and a break\nin Sri Lanka.',
  heroText: 'Eight days in Weligama: morning yoga, trips along the south coast and time by the ocean. We stay at Casa Banana.',
  introTitle: 'A journey\nwith space\nfor you.',
  introText: 'We begin with practice, discover the island and leave time simply to be by the ocean. Tea country, Galle’s streets and quiet temples alternate with rest. There is no need to do everything: the programme makes room for travel, how we feel and the wish to slow down.',
  stayTitle: 'Staying at Casa Banana',
  stayText: 'Casa Banana in Weligama is our base for the tour. We set out from here for walks and day trips, and return to unwind. Light-filled rooms, tropical details and a place to pause between experiences.',
  stayImages: [photo('casa-balcony', 'A bright Casa Banana room opening onto a balcony', 'Casa Banana · Weligama'), photo('casa-room', 'Casa Banana room with wooden furniture and plants')],
  days: [
    {
      id: 'arrival', date: '2027-02-24', title: 'Arrival and rest',
      summary: 'Rest after the overnight flight and get to know Weligama. In the evening, take a short walk and join a gentle yoga session.',
      pace: 'A gentle start', layout: 'text', images: [], highlights: ['Meet the ocean', 'A walk around Weligama', 'Gentle evening yoga'],
      schedule: schedule([
        ['04:00', 'Arrival at the airport.'], ['04:00–08:00', 'Airport formalities and transfer to Casa Banana. The drive takes approximately 2.5–3.5 hours after leaving the airport.'],
        ['Morning', 'Check in if a room is available, or leave our bags and rest.'], ['Daytime', 'Sleep, breakfast and a first look around our home and the ocean.'],
        ['16:30', 'A gentle walk around Weligama.'], ['18:00', 'Soft evening yoga and relaxation.'], ['Evening', 'Dinner and rest.'],
      ]),
    },
    {
      id: 'weligama', date: '2027-02-25', title: 'Weligama’s sacred sites',
      summary: 'Our first discoveries are close to home: the Kushtarajagala rock carving and Agrabodhi temple. We explore these ancient places at an easy pace, with evening meditation at the temple if its rules and circumstances allow.',
      pace: 'An easy day', layout: 'split',
      images: [photo('kushtarajagala', 'The ancient Kushtarajagala rock carving surrounded by greenery', 'Kushtarajagala'), photo('agrabodhi', 'Buddha statue and steps at Agrabodhi temple', 'Agrabodhi Raja Maha Viharaya')],
      highlights: ['Yoga at 07:30', 'Nearby sacred sites', 'Meditation at 17:30'],
      schedule: schedule([
        ['07:30–08:30', 'Morning yoga.'], ['08:30–09:30', 'Breakfast.'],
        ['10:00–10:45', 'Walk to Kushtarajagala and visit the ancient rock carving. About 3–5 minutes by bike or 10–15 minutes on foot from Casa Banana.'],
        ['11:00–12:00', 'Walk and visit Agrabodhi Raja Maha Viharaya. About 3–5 minutes by bike or 15 minutes on foot from Casa Banana.'],
        ['12:30', 'Lunch.'], ['Afternoon', 'Free time, ocean and rest.'],
        ['17:30–18:30', 'Evening meditation at Agrabodhi'], ['Evening', 'Dinner.'],
      ]),
    },
    {
      id: 'tea-and-mirissa', date: '2027-02-26', title: 'Tea plantation\nand Mirissa',
      summary: 'A morning at Handunugoda tea plantation: a tour, an introduction to production and a tasting. Then Mirissa for lunch, the beach and free time by the sea.',
      pace: 'A day of discovery', layout: 'panorama',
      images: [photo('tea-country', 'Green tea-covered hills in Sri Lanka', 'The island’s tea landscapes'), photo('tea-plantation', 'Tea bushes on green hillsides in Sri Lanka', 'Sri Lanka’s tea plantations')],
      highlights: ['Handunugoda', 'Tea tasting', 'Mirissa beach'],
      schedule: schedule([
        ['07:00–08:00', 'Morning yoga.'], ['08:00–09:00', 'Breakfast.'], ['09:00', 'Leave for Handunugoda, approximately 30–45 minutes away.'],
        ['09:45–11:15', 'Plantation tour, an introduction to production and tea tasting.'], ['11:15–12:00', 'Transfer to Mirissa, approximately 30–45 minutes.'],
        ['12:00–15:30', 'Beach, a walk and lunch at a café.'], ['15:30–16:15', 'Return to Weligama. The drive itself is approximately 15–25 minutes.'],
        ['Evening', 'Free time or a short relaxation practice.'],
      ]),
    },
    {
      id: 'ecstatic', date: '2027-02-27', title: 'Ocean\nand Ecstatic Dance',
      summary: 'Ocean, rest and optional surfing during the day. In the evening, we plan to go to Ecstatic Dance at Pearl, Soul Lanka. The date, address and travel time will be confirmed against the venue’s 2027 schedule.',
      pace: 'A quiet day · a vibrant evening', layout: 'panorama',
      images: [photo('ecstatic', 'People dancing at an open-air Ecstatic Dance venue among trees', 'Ecstatic Dance · Soul Lanka'), photo('mirissa', 'A sandy beach with palm trees and ocean waves', 'Before the dance, a day by the ocean')],
      highlights: ['Unhurried ocean time', 'Optional surfing', 'Ecstatic Dance at 18:00'],
      schedule: schedule([
        ['07:30–08:30', 'Morning yoga.'], ['08:30–10:00', 'Breakfast and free time.'], ['10:00–12:00', 'Ocean, beach or optional surfing.'],
        ['12:00–14:00', 'Lunch and rest.'], ['14:00–16:30', 'Free time and preparation for the evening.'], ['16:30–17:30', 'Get ready and travel to the venue.'],
        ['18:00', 'Ecstatic Dance at Pearl bar, Soul Lanka, subject to the confirmed venue schedule.'], ['After dancing', 'Return to Casa Banana.'],
      ]),
    },
    {
      id: 'galle', date: '2027-02-28', title: 'Galle and Wijaya beach',
      summary: 'Explore the historic fort, pause for lunch and head to Wijaya / Dalawella beach. We relax by the water and watch ocean life. We may spot sea turtles, but these are wild animals, so a sighting is not guaranteed.',
      pace: 'Culture + beach', layout: 'collage',
      images: [photo('galle', 'Galle Fort and lighthouse on the coast', 'Galle Fort'), photo('turtle', 'A sea turtle at the water’s edge', 'An encounter nature decides'), photo('turtle-beach', 'A sea turtle on a sandy beach by the ocean')],
      highlights: ['Historic Galle Fort', 'Wijaya / Dalawella beach', 'Wild sea turtles'],
      schedule: schedule([
        ['07:00–08:00', 'Morning yoga.'], ['08:00–09:00', 'Breakfast.'], ['09:00', 'Leave for Galle, approximately 35–50 minutes by car.'],
        ['10:00–12:00', 'Walk around historic Galle Fort.'], ['12:00–13:00', 'Lunch.'], ['13:00–13:30', 'Transfer to Wijaya / Dalawella beach.'],
        ['13:30–16:00', 'Beach time and watching wild sea turtles, if they appear.'], ['16:00–17:00', 'Return to Weligama, approximately 30–45 minutes on the road.'],
        ['Evening', 'Dinner and rest.'],
      ]),
    },
    {
      id: 'temples', date: '2027-03-01', title: 'Temples\nand meditation',
      summary: 'Travel towards Matara to Weherahena and Wewurukannala: large Buddha statues, tunnel galleries and time for contemplation. We follow the group’s energy – if we feel tired, we will visit one temple and leave more time for rest.',
      pace: 'A full excursion day', layout: 'split',
      images: [photo('weherahena', 'Buddha statue at Weherahena temple', 'Weherahena'), photo('wewurukannala', 'Buddha statue and white buildings at Wewurukannala', 'Wewurukannala')],
      highlights: ['Temples near Matara', 'Tunnel galleries', 'Quiet evening practice'],
      schedule: schedule([
        ['07:30–08:30', 'Morning yoga.'], ['08:30–09:30', 'Breakfast.'], ['10:00', 'Leave towards Matara. Weherahena is approximately 25–35 minutes from Casa Banana.'],
        ['10:30–12:00', 'Visit Weherahena Poorwarama Rajamaha Viharaya, its Buddha statue and tunnel galleries.'], ['12:00–12:30', 'Transfer to the next temple, about 25–35 minutes.'],
        ['12:30–14:00', 'Visit Wewurukannala Raja Maha Viharaya and its large Buddha statue.'], ['14:00–15:00', 'Lunch.'],
        ['15:00–16:00', 'Return to Weligama, approximately 40–50 minutes on the road.'], ['After 16:00', 'Rest.'],
        ['17:30–18:30', 'Meditation at a temple or a quiet practice at our accommodation.'],
      ]),
    },
    {
      id: 'closing', date: '2027-03-02', title: 'Our last day\nby the ocean',
      summary: 'Morning yoga, followed by the beach and free time. Take a walk to Jungle Beach, shop for souvenirs or pack. In the evening, we meet as a group, talk about the trip and get ready for the airport.',
      pace: 'Rest and reflection', layout: 'text', images: [], highlights: ['Final yoga practice', 'Free ocean time', 'Group catch-up'],
      schedule: schedule([
        ['07:30–08:30', 'Final morning yoga.'], ['08:30–10:00', 'Breakfast.'], ['10:00–12:00', 'Ocean, beach or free time.'], ['12:00–14:00', 'Lunch and rest.'],
        ['14:00–16:00', 'Free time, souvenirs and packing.'], ['16:00–17:00', 'Meet as a group to share impressions and wrap up the trip.'], ['Evening', 'Early dinner and preparation for the airport.'],
        ['Around 20:00–20:30', 'Provisional airport departure for the overnight flight. We will confirm it using tickets, the airport and traffic conditions.'],
      ]),
    },
    {
      id: 'departure', date: '2027-03-03', title: 'Flight home',
      summary: 'Leave for the airport on the evening of 2 March and fly home in the early hours of 3 March. The airport, flight and exact transfer time will be confirmed from tickets; journey times are approximate.',
      pace: 'Homeward bound', layout: 'text', images: [], highlights: ['02:40 · departure', 'Transfer on 2 March'],
      schedule: schedule([
        ['Evening, 2 March', 'Transfer from Weligama. With a 2.5–3.5-hour drive, the provisional departure time is 20:00–20:30.'],
        ['By 23:40, 2 March', 'Plan to reach the airport approximately 3 hours before the flight.'], ['02:40, 3 March', 'Flight departs Sri Lanka.'],
      ]),
    },
  ],
  bookingTitle: 'Would you like to join us?',
  bookingText: 'Join the yoga tour for new experiences and spiritual practice. Leave an enquiry on Telegram – I’ll tell you more about the trip!',
  bookingSteps: ['Open Telegram and write: “I’d like to join Sri Lanka”.', 'Ask about availability, accommodation and what the price includes.', 'Receive payment terms and booking confirmation.'],
  bookingNote: 'Tour price: €1199. Inclusions, flights, accommodation and payment terms are clarified when you enquire. The programme may change with the weather, venue schedules and the group’s wellbeing.',
};

export const sriLankaRetreat: RetreatSeed = {
  id: 4,
  slug: 'sri-lanka-yoga-tour',
  status: 'active',
  title: 'Sri Lanka Yoga Tour',
  location: 'Weligama, Casa Banana',
  startDate: '2027-02-24',
  endDate: '2027-03-03',
  dateLabel: '24 February – 3 March 2027',
  price: '€1199',
  bookingUrl: 'https://t.me/AnastasiaPagliacci',
  coverImage: '/assets/retreats/sri-lanka/coast.webp',
  experience: englishExperience,
  translations: {
    ru: {
      title: 'Йога-тур на Шри-Ланке',
      location: 'Велигама, Casa Banana',
      dateLabel: '24 февраля – 3 марта 2027',
      experience: russianExperience,
    },
  },
  blocks: [],
};
