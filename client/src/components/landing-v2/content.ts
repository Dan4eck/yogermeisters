import { CalendarDays, Flower2, Instagram, Mail, Youtube } from 'lucide-react';

import type { Language } from '@/lib/i18n';
import type { ClassCard, HeroAction, NavItem, PracticeBenefit, PracticeVideo, SocialLink } from './types';

type PracticeDetail = {
  readonly label: string;
  readonly title: string;
  readonly text: string;
};

type LandingCopy = {
  readonly navItems: readonly NavItem[];
  readonly header: {
    readonly navigationLabel: string;
    readonly homeLabel: string;
    readonly contactLabel: string;
    readonly bookLabel: string;
    readonly switchLanguageLabel: string;
    readonly openMenuLabel: string;
    readonly closeMenuLabel: string;
  };
  readonly hero: {
    readonly mantra: string;
    readonly titleLines: readonly [string, string];
    readonly description: string;
    readonly primaryCta: string;
    readonly videoCta: string;
    readonly actionsLabel: string;
    readonly socialsLabel: string;
    readonly actions: readonly HeroAction[];
    readonly socials: readonly SocialLink[];
  };
  readonly retreats: {
    readonly mantra: string;
    readonly title: string;
    readonly description: string;
    readonly bookRetreat: string;
    readonly backToRetreats: string;
    readonly dateLocale: string;
    readonly featuredEyebrow: string;
    readonly loading: string;
    readonly error: string;
    readonly detailLoading: string;
    readonly detailError: string;
    readonly detailCtaTitle: string;
    readonly detailCtaDescription: string;
    readonly destinationsLabel: string;
    readonly empty: string;
    readonly unavailableTitle: string;
    readonly unavailableDescription: string;
  };
  readonly classes: {
    readonly kicker: string;
    readonly title: string;
    readonly cards: readonly ClassCard[];
  };
  readonly himalayan: {
    readonly kicker: string;
    readonly titleLines: readonly [string, string];
    readonly details: readonly [PracticeDetail, PracticeDetail];
  };
  readonly practice: {
    readonly kicker: string;
    readonly title: string;
    readonly description: string;
    readonly frameLabel: string;
    readonly benefitsLabel: string;
    readonly benefits: readonly PracticeBenefit[];
    readonly video: PracticeVideo;
  };
  readonly contact: {
    readonly kicker: string;
    readonly title: string;
    readonly description: string;
    readonly panelTitle: string;
    readonly panelDescription: string;
    readonly responseLabel: string;
    readonly responseTime: string;
    readonly emailCta: string;
    readonly backToTop: string;
  };
};

const practiceVideoSrc = 'https://www.youtube.com/embed/Z_AabfLhaHo';

export const landingCopy = {
  en: {
    navItems: [
      { label: 'About', href: '#hero' },
      { label: 'Retreats', href: '#retreats' },
      { label: 'Classes', href: '#classes' },
      { label: 'Online', href: '#online' },
      { label: 'Practice', href: '#practice' },
      { label: 'Contact', href: '#contact' },
    ],
    header: {
      navigationLabel: 'Main navigation',
      homeLabel: 'Yogermeisters home',
      contactLabel: 'Contact',
      bookLabel: 'Book a class',
      switchLanguageLabel: 'Switch to Russian',
      openMenuLabel: 'Open menu',
      closeMenuLabel: 'Close menu',
    },
    hero: {
      mantra: 'Breathe • Move • Transform',
      titleLines: ['Himalayan', 'Yoga'],
      description:
        'Nastya shares Himalayan yoga through breath, attention and precise movement. Her practice helps the body grow stronger while the mind becomes quieter.',
      primaryCta: 'Learn more',
      videoCta: 'Watch Practice',
      actionsLabel: 'Featured actions',
      socialsLabel: 'Follow Nastya',
      actions: [
        {
          title: 'Book a practice',
          text: 'Private & group sessions online and in-person',
          href: '#classes',
          icon: CalendarDays,
          tone: 'dark',
        },
        {
          title: 'Join a retreat',
          text: 'Transformative retreats in the Himalayas',
          href: '#retreats',
          icon: Flower2,
          tone: 'gold',
        },
      ],
      socials: [
        { label: 'Instagram', href: '#contact', icon: Instagram },
        { label: 'YouTube', href: '#contact', icon: Youtube },
        { label: 'Email', href: '#contact', icon: Mail },
      ],
    },
    retreats: {
      mantra: 'Travel • Practice • Restore',
      title: 'Upcoming Retreats',
      description:
        'Retreats where route and practice work together: sea, mountains, silence, and a daily return to yourself.',
      bookRetreat: 'Sign Up',
      backToRetreats: 'Back to retreats',
      dateLocale: 'en-US',
      featuredEyebrow: 'Featured',
      loading: 'Loading retreats...',
      error: 'Unable to load retreats right now.',
      detailLoading: 'Loading retreat...',
      detailError: 'Unable to load this retreat right now.',
      detailCtaTitle: 'Ready to join this retreat?',
      detailCtaDescription:
        'Write to me in Telegram and I will send current details, available places, and explain how to reserve your spot.',
      destinationsLabel: 'Retreat destinations',
      empty: 'Upcoming retreats will be announced soon.',
      unavailableTitle: 'Retreat unavailable',
      unavailableDescription: 'Booking is not available for this retreat right now.',
    },
    classes: {
      kicker: '02 — Classes',
      title: 'Classes',
      cards: [
        {
          placement: 'left',
          label: 'Private practice',
          title: 'Online Classes',
          price: '€18',
          description:
            "Individual practice with careful teacher attention, gentle support and adaptation to the student's personal request.",
          cta: 'Reserve online',
        },
        {
          placement: 'right',
          label: 'Small group',
          title: 'Offline Classes — Prague',
          price: '€25',
          description: 'Fly yoga and hatha yoga practices in a small group of up to eight people at a yoga studio in Prague.',
          cta: 'Reserve Prague',
        },
      ],
    },
    himalayan: {
      kicker: '03 — Himalayan Yoga',
      titleLines: ['What is', 'Himalayan Yoga?'],
      details: [
        {
          label: 'Meditation',
          title: 'Meditation',
          text: 'A comprehensive work with the mind through meditation. Metta and no mind techniques teach the mind to disidentify from the body and from external and internal fluctuations. I share practices that I received from my Lama, Karma Gyurme.',
        },
        {
          label: 'Yoga Practice',
          title: 'Yoga Practice',
          text: 'My approach to yoga is based on the principles of Universal Yoga: comprehensive work through every direction of mobility, with attention to biomechanics and the individual qualities of each practitioner.',
        },
      ],
    },
    practice: {
      kicker: '04 — Practice with me',
      title: 'How practice with me works',
      description:
        'Each session is a complete practice. We begin with a warm-up and breathwork to either calm or activate the nervous system, then move through every direction of mobility. Depending on the focus, the practice may deepen strength, flexibility, backbends, splits, or a specific part of the body.',
      frameLabel: 'YouTube practice video',
      benefitsLabel: 'Practice benefits',
      benefits: [
        {
          accent: 'Prana',
          title: 'Pranayama',
          text: 'Breathing techniques that help calm, steady, or activate the nervous system before movement begins.',
        },
        {
          accent: 'Axis',
          title: 'Biomechanics',
          text: 'Precise work with mobility, alignment, and the individual structure of the body, so movement stays clear and intelligent.',
        },
        {
          accent: 'Reset',
          title: 'Closing sequence',
          text: 'Reverse asanas and finishing positions that integrate the practice and bring the body back into balance.',
        },
      ],
      video: {
        src: practiceVideoSrc,
        title: 'Yogermeisters practice video',
      },
    },
    contact: {
      kicker: '05 — Contact',
      title: 'Begin with breath',
      description: 'Write to Nastya to book a class, ask about retreats, or find the practice rhythm that fits your body.',
      panelTitle: 'Practice inquiry',
      panelDescription: 'Classes, retreats and online sessions. A short note is enough to begin.',
      responseLabel: 'Response',
      responseTime: '1-2 days',
      emailCta: 'Email Nastya',
      backToTop: 'Back to top',
    },
  },
  ru: {
    navItems: [
      { label: 'О проекте', href: '#hero' },
      { label: 'Ретриты', href: '#retreats' },
      { label: 'Занятия', href: '#classes' },
      { label: 'Онлайн', href: '#online' },
      { label: 'Практика', href: '#practice' },
      { label: 'Контакты', href: '#contact' },
    ],
    header: {
      navigationLabel: 'Главная навигация',
      homeLabel: 'На главную Yogermeisters',
      contactLabel: 'Контакты',
      bookLabel: 'Записаться',
      switchLanguageLabel: 'Переключить на английский',
      openMenuLabel: 'Открыть меню',
      closeMenuLabel: 'Закрыть меню',
    },
    hero: {
      mantra: 'Дыхание • Движение • Трансформация',
      titleLines: ['Гималайская', 'йога'],
      description:
        'Настя делится гималайской йогой через дыхание, внимание и точное движение. Практика помогает телу становиться сильнее, а уму — тише.',
      primaryCta: 'Узнать больше',
      videoCta: 'Смотреть практику',
      actionsLabel: 'Главные действия',
      socialsLabel: 'Соцсети Насти',
      actions: [
        {
          title: 'Записаться на практику',
          text: 'Индивидуальные и групповые занятия онлайн и очно',
          href: '#classes',
          icon: CalendarDays,
          tone: 'dark',
        },
        {
          title: 'Поехать в ретрит',
          text: 'Трансформирующие ретриты в Гималаях и у моря',
          href: '#retreats',
          icon: Flower2,
          tone: 'gold',
        },
      ],
      socials: [
        { label: 'Instagram', href: '#contact', icon: Instagram },
        { label: 'YouTube', href: '#contact', icon: Youtube },
        { label: 'Электронная почта', href: '#contact', icon: Mail },
      ],
    },
    retreats: {
      mantra: 'Путешествие • Практика • Восстановление',
      title: 'Ближайшие ретриты',
      description:
        'Ретриты, где сочетаются познание внешнего и внутреннего: море, горы, тишина и ежедневное возвращение к себе.',
      bookRetreat: 'Записаться',
      backToRetreats: 'К ретритам',
      dateLocale: 'ru-RU',
      featuredEyebrow: 'Главный',
      loading: 'Загружаем ретриты...',
      error: 'Сейчас не получается загрузить ретриты.',
      detailLoading: 'Загружаем ретрит...',
      detailError: 'Сейчас не получается загрузить этот ретрит.',
      detailCtaTitle: 'Готовы присоединиться к ретриту?',
      detailCtaDescription:
        'Напишите мне в Telegram, и я отправлю актуальные детали, наличие мест и расскажу, как сделать бронирование.',
      destinationsLabel: 'Направления ретритов',
      empty: 'Ближайшие ретриты скоро появятся.',
      unavailableTitle: 'Запись недоступна',
      unavailableDescription: 'На данный ретрит записаться сейчас нельзя.',
    },
    classes: {
      kicker: '02 — Занятия',
      title: 'Занятия',
      cards: [
        {
          placement: 'left',
          label: 'Индивидуальная практика',
          title: 'Онлайн-занятия',
          price: '€18',
          description:
            'Индивидуальная практика с вниманием преподавателя, бережной поддержкой и адаптацией под личный запрос ученика.',
          cta: 'Записаться онлайн',
        },
        {
          placement: 'right',
          label: 'Малая группа',
          title: 'Офлайн-занятия — Прага',
          price: '€25',
          description: 'Флай-йога и хатха-йога в небольшой группе до восьми человек в йога-студии в Праге.',
          cta: 'Записаться в Праге',
        },
      ],
    },
    himalayan: {
      kicker: '03 — Гималайская йога',
      titleLines: ['Что такое', 'гималайская йога?'],
      details: [
        {
          label: 'Медитация',
          title: 'Медитация',
          text: 'Это глубокая работа с умом через медитацию. Практики метты и безмыслия учат ум разотождествляться с телом, внешними и внутренними колебаниями. Я передаю практики, которые получила от своего ламы Кармы Гюрме.',
        },
        {
          label: 'Практика йоги',
          title: 'Практика йоги',
          text: 'Мой подход к йоге основан на принципах универсальной йоги: комплексная работа со всеми направлениями подвижности, вниманием к биомеханике и индивидуальным особенностям каждого практикующего.',
        },
      ],
    },
    practice: {
      kicker: '04 — Практика со мной',
      title: 'Как устроена практика со мной',
      description:
        'Каждая встреча — это полноценная практика. Мы начинаем с разминки и дыхания, чтобы успокоить или активировать нервную систему, затем проходим разные направления подвижности. В зависимости от фокуса практика может углублять силу, гибкость, прогибы, шпагаты или работу с конкретной частью тела.',
      frameLabel: 'Видео практики на YouTube',
      benefitsLabel: 'Польза практики',
      benefits: [
        {
          accent: 'Прана',
          title: 'Пранаяма',
          text: 'Дыхательные техники помогают успокоить, стабилизировать или активировать нервную систему перед движением.',
        },
        {
          accent: 'Ось',
          title: 'Биомеханика',
          text: 'Точная работа с подвижностью, выравниванием и индивидуальным строением тела, чтобы движение оставалось ясным и осознанным.',
        },
        {
          accent: 'Баланс',
          title: 'Завершение практики',
          text: 'Перевернутые асаны и завершающие положения интегрируют практику и возвращают тело в равновесие.',
        },
      ],
      video: {
        src: practiceVideoSrc,
        title: 'Видео практики Yogermeisters',
      },
    },
    contact: {
      kicker: '05 — Контакты',
      title: 'Начните с дыхания',
      description: 'Напишите Насте, чтобы записаться на занятие, спросить о ретритах или найти ритм практики под ваше тело.',
      panelTitle: 'Запрос о практике',
      panelDescription: 'Занятия, ретриты и онлайн-сессии. Достаточно короткого сообщения, чтобы начать.',
      responseLabel: 'Ответ',
      responseTime: '1–2 дня',
      emailCta: 'Написать Насте',
      backToTop: 'Наверх',
    },
  },
} satisfies Record<Language, LandingCopy>;

export const contactEmail = 'hello@yogermeisters.com';
