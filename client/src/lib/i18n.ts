import type { Retreat, RetreatPostBlock } from '@/lib/retreats';

export type Language = 'en' | 'ru';

export const DEFAULT_LANGUAGE: Language = 'en';

export const languageToggleLabel: Record<Language, string> = {
  en: 'RU',
  ru: 'EN',
};

export const siteCopy = {
  en: {
    nav: {
      links: [
        { name: 'Retreats', href: '#tours' },
        { name: 'About', href: '#about' },
        { name: 'Reviews', href: '#reviews' },
        { name: 'Contact', href: '#contact' },
      ],
    },
    hero: {
      badgeLabel: 'Early Birds',
      badgeText: 'Yoga Retreat in Cirali',
      titleTop: 'Practice,',
      titleBottom: 'self-awareness and inner stability',
      description:
        'I teach Himalayan yoga as a path to a resilient body, a calm mind, and a clear inner state. Deep practice, pranayama, and meditation without rush or noise.',
      bookClass: 'Join a Session',
      bookRetreat: 'View Retreats',
    },
    tours: {
      title: 'Upcoming Retreats',
      description:
        'Retreats where route and practice work together: sea, mountains, silence, and a daily return to yourself.',
      bookNow: 'Learn More',
      bookRetreat: 'Open Program',
      dateLocale: 'en-US',
    },
    classes: {
      title: 'Formats & Pricing',
      description:
        'Choose the format that helps you practice more deeply: online 1:1 sessions or in-person classes with precise adjustment.',
      classTypes: [
        {
          id: 1,
          title: 'Online Classes',
          description:
            'Personalized work from anywhere in the world. Practice adapted to your rhythm, goals, and current body condition.',
          features: [
            '60-90 min private sessions',
            'Individual approach based on your level',
            'Himalayan yoga, pranayama, and meditation',
          ],
          price: '€75 / session',
          tags: ['Zoom', 'Private', 'Online'],
        },
        {
          id: 2,
          title: 'In-Person Classes in Prague',
          description:
            'In-person practice for those who value direct guidance, depth, and real-time correction, available in Prague.',
          features: [
            '60-90 min in-person sessions in Prague',
            'Himalayan yoga, aerial yoga, and sound meditation',
            'Small groups of 4-10 people',
          ],
          price: '€40 / session',
          tags: ['Studio', 'In-Person', 'Small Group'],
        },
      ],
      bookSession: 'Book Session',
      firstTime:
        'If you are just starting, message me: we will do a 15-minute call and choose a soft, safe entry into practice.',
      getInTouch: 'Get in Touch',
    },
    about: {
      titleTop: 'Himalayan Yoga as',
      titleBottom: 'a practice of inner stability.',
      paragraphs: [
        'For me, yoga is not a set of poses but a discipline of attention. Through breath, precise form, and rhythm, we return strength to the body and silence to the mind.',
        'Over years of teaching, I built a method where Himalayan tradition meets modern bodywork. The result is more energy, clarity, and calm focus in daily life.',
      ],
      stats: [
        { label: 'Years Teaching', value: '10+' },
        { label: 'Practitioners', value: '5k+' },
        { label: 'Countries', value: '12' },
      ],
      bullets: [
        'Extensive teaching experience',
        'Himalayan yoga, Buddhist meditation, pranayama',
        'Precise alignment and supportive guidance',
      ],
      imageAlt: 'Yoga teacher portrait',
    },
    reviews: {
      title: 'What Students Say',
      description: 'Feedback from people who value depth, structure, and a real effect from practice.',
      list: [
        {
          id: 1,
          name: 'Emma Thompson',
          role: 'Product Designer',
          content:
            'There is so much clarity and structure in each class. After practice I feel not only relaxed, but focused and steady for the whole day.',
        },
        {
          id: 2,
          name: 'Michael Chen',
          role: 'Startup Founder',
          content:
            'This retreat gives a rare state: rested body, quiet mind, better decisions. A deep reset that stays with you long after the trip.',
        },
        {
          id: 3,
          name: 'Sofia Rodriguez',
          role: 'Architect',
          content:
            'Very subtle work with form and breath. You understand how to go deeper safely and how practice transforms your inner state.',
        },
      ],
    },
    cta: {
      title: 'Ready to take your first step in practice?',
      description:
        'You can start with an individual online session or join a retreat where yoga becomes part of a real, living journey.',
      bookClass: 'Start with a Session',
      bookRetreat: 'Book a Retreat',
    },
    footer: {
      lineOne: 'Designed for balance.',
      lineTwo: 'Engineered for peace.',
      rights: 'All rights reserved.',
    },
  },
  ru: {
    nav: {
      links: [
        { name: 'Ретриты', href: '#tours' },
        { name: 'Обо мне', href: '#about' },
        { name: 'Отзывы', href: '#reviews' },
        { name: 'Контакты', href: '#contact' },
      ],
    },
    hero: {
      badgeLabel: 'Early Birds',
      badgeText: 'Йога-ретрит в Чиралы',
      titleTop: 'Практика,',
      titleBottom: 'самопознание и внутренняя опора',
      description:
        'Преподаю гималайскую йогу как путь к устойчивому телу, спокойному уму и ясному состоянию. Глубокая практика, пранаяма и медитация без спешки и лишнего шума.',
      bookClass: 'Записаться на практику',
      bookRetreat: 'Смотреть ретриты',
    },
    tours: {
      title: 'Ближайшие ретриты',
      description:
        'Ретриты, где маршрут и практика работают вместе: море, горы, тишина и ежедневное возвращение к себе.',
      bookNow: 'Подробнее',
      bookRetreat: 'Открыть программу',
      dateLocale: 'ru-RU',
    },
    classes: {
      title: 'Форматы и цены',
      description:
        'Выбери формат, в котором тебе легче заниматься: индивидуально онлайн или очно с более тонкой отстройкой.',
      classTypes: [
        {
          id: 1,
          title: 'Онлайн-занятия',
          description:
            'Индивидуальная работа из любой точки мира. Практика под ваш ритм, запрос и текущее состояние тела.',
          features: [
            'Персональные сессии 60-90 минут',
            'Индивидуальный подход по уровень практики',
            'Гималайская йога, пранаяма и медитация',
          ],
          price: '€75 / сессия',
          tags: ['Zoom', 'Индивидуально', 'Онлайн'],
        },
        {
          id: 2,
          title: 'Офлайн-занятия в Праге',
          description:
            'Очная практика для тех, кому важны отстройка, глубина и прямой контакт с преподавателем. и вы находитесь в Праге :)',
          features: [
            'Очные занятия в Праге 60-90 минут',
            'Гималайская йога, йога в гамаках, звуковая медитация',
            'Малые группы 4-10 человек',
          ],
          price: '€40 / сессия',
          tags: ['Студия', 'Очный формат', 'Малая группа'],
        },
      ],
      bookSession: 'Записаться',
      firstTime:
        'Если вы только начинаете, напишите мне: созвонимся на 15 минут и подберем мягкий, безопасный вход в практику.',
      getInTouch: 'Связаться',
    },
    about: {
      titleTop: 'Гималайская йога как',
      titleBottom: 'практика внутренней устойчивости.',
      paragraphs: [
        'Для меня йога - это не набор поз, а дисциплина внимания. Через дыхание, точную форму и ритм практики мы возвращаем телу силу, а уму - тишину.',
        'За годы преподавания я выстроила метод, где гималайская традиция соединяется с современной телесной работой. Результат - больше энергии, ясности и спокойной собранности в жизни.',
      ],
      stats: [
        { label: 'Лет преподавания', value: '10+' },
        { label: 'Практикующих', value: '5k+' },
        { label: 'Стран', value: '12' },
      ],
      bullets: [
        'Многолетний преподавательский опыт',
        'Гималайская йога, буддистская медитация, пранаямы',
        'Точная отстройка и бережное сопровождение',
      ],
      imageAlt: 'Портрет преподавателя йоги',
    },
    reviews: {
      title: 'Что говорят ученики',
      description: 'Отзывы людей, для которых важны глубина, структура и ощутимый эффект от практики.',
      list: [
        {
          id: 1,
          name: 'Emma Thompson',
          role: 'Продуктовый дизайнер',
          content:
            'В занятиях много ясности и структуры. После практики чувствую не просто расслабление, а собранность и ровное внимание на весь день.',
        },
        {
          id: 2,
          name: 'Michael Chen',
          role: 'Основатель стартапа',
          content:
            'Ретрит дает редкое состояние: тело отдохнуло, голова тихая, решения принимаются легче. Это глубокая перезагрузка, которая остается с тобой после поездки.',
        },
        {
          id: 3,
          name: 'Sofia Rodriguez',
          role: 'Архитектор',
          content:
            'Очень тонкая работа с формой и дыханием. Понимаешь, как безопасно углубляться в асаны и как практика влияет на состояние изнутри.',
        },
      ],
    },
    cta: {
      title: 'Готовы сделать первый шаг в практике?',
      description:
        'Можно начать с индивидуального занятия онлайн или присоединиться к ретриту, где йога становится частью большого живого путешествия.',
      bookClass: 'Начать с занятия',
      bookRetreat: 'Выбрать ретрит',
    },
    footer: {
      lineOne: 'Практика для ясного ума и устойчивого тела.',
      lineTwo: 'Глубина без спешки, эффект в реальной жизни.',
      rights: 'Все права защищены.',
    },
  },
} as const;

const retreatTranslationById: Record<Language, Record<number, Pick<Retreat, 'title' | 'location'> & { postBlocks: RetreatPostBlock[] }>> =
  {
    en: {},
    ru: {
      1: {
        title: 'Чиралы Йога Тур',
        location: 'Чиралы, Ликийское побережье, Турция',
        postBlocks: [
          {
            type: 'paragraph',
            text: 'Мой любимый 8-дневный ретрит в Чиралы для глубокой перезагрузки тела, ума и энергии. Это место между морем и горами быстро возвращает в живое, ясное и спокойное состояние.',
          },
          {
            type: 'paragraph',
            text: 'Практика включает гималайскую йогу и пранаяму, дыхательные техники для работы с подсознанием, face-йогу, дренажные и антистресс-блоки, динамические и буддийские практики.',
          },
          {
            type: 'image',
            image: '',
            alt: 'Спокойная студийная атмосфера для глубокой внутренней практики',
          },
          {
            type: 'paragraph',
            text: 'В программе активности и приключения: Ликийская тропа, огни Химеры, трек к Black Beach, древний Олимпос, а также SUP, лодки и велосипеды.',
          },
          {
            type: 'image',
            image: '',
            alt: 'Природная локация для прогулок и интеграции практики',
          },
          {
            type: 'paragraph',
            text: 'Формат all-inclusive: проживание, завтраки, практики, SUP/лодки и трансферы. Стоимость: €750 early bird (ограниченное число мест), далее €790. Депозит €200, возвратный до 1 апреля, возможна оплата частями.',
          },
          {
            type: 'image',
            image: '',
            alt: 'Преподаватель ведет интеграционную практику',
          },
        ],
      },
      2: {
        title: 'Йога и Горы',
        location: 'Крконоше, Чехия',
        postBlocks: [
          {
            type: 'paragraph',
            text: 'Три дня в горах рядом с Прагой: гималайская йога, пранаяма, медитация и настоящее восстановление через природу, тишину и ритм практики.',
          },
          {
            type: 'image',
            image: '',
            alt: 'Горная панорама Крконоше рядом с Прагой',
          },
          {
            type: 'paragraph',
            text: 'Утренние сессии дают заряд и ясность, вечерние переводят в глубокий отпуск через йога-нидру, дыхательные практики и работу со звуком.',
          },
          {
            type: 'paragraph',
            text: 'В свободное время можно выбрать лесные прогулки, лыжи или сноуборд и восстановление в сауне. Ретрит подходит и новичкам, и тем, кто давно в практике.',
          },
          {
            type: 'image',
            image: '',
            alt: 'Теплое пространство для очной практики йоги',
          },
          {
            type: 'image',
            image: '',
            alt: 'Преподаватель сопровождает участников ретрита',
          },
        ],
      },
      3: {
        title: 'Йога в Гималаях',
        location: 'Катманду, Непал',
        postBlocks: [
          {
            type: 'paragraph',
            text: 'Компактный ретрит для глубокой перезагрузки. Само пространство помогает успокоить внимание и снизить внутренний шум.',
          },
          {
            type: 'paragraph',
            text: 'Сессии основаны на заземлении, движении через дыхание и длительных медитативных удержаниях. Инструкции короткие и точные.',
          },
          {
            type: 'image',
            image: '',
            alt: 'Пустынная локация на закате',
          },
          {
            type: 'paragraph',
            text: 'Вечерние практики проходят под открытым небом и завершаются интеграцией. Такой формат особенно помогает выйти из режима постоянной когнитивной нагрузки.',
          },
          {
            type: 'image',
            image: '',
            alt: 'Восстановительная практика в помещении',
          },
          {
            type: 'image',
            image: '',
            alt: 'Портрет преподавателя во время ретрит-недели',
          },
        ],
      },
    },
  };

export function localizeRetreat(retreat: Retreat, language: Language): Retreat {
  const localized = retreatTranslationById[language]?.[retreat.id];

  if (!localized) {
    return retreat;
  }

  const localizedPostBlocks = retreat.postBlocks.map((block, index) => {
    const translatedBlock = localized.postBlocks[index];
    if (!translatedBlock) {
      return block;
    }

    if (block.type === 'paragraph' && translatedBlock.type === 'paragraph') {
      return { ...block, text: translatedBlock.text };
    }

    if (block.type === 'image' && translatedBlock.type === 'image') {
      return { ...block, alt: translatedBlock.alt };
    }

    return block;
  });

  return {
    ...retreat,
    title: localized.title,
    location: localized.location,
    postBlocks: localizedPostBlocks,
  };
}
