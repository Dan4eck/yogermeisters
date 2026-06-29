import { CalendarDays, Flower2, Mail, Send, Youtube } from 'lucide-react';

import type { Language } from '@/lib/i18n';
import type { AnchorHref, ClassCard, HeroAction, NavItem, PracticeBenefit, PracticeVideo, SocialLink } from './types';

type PracticeDetail = {
  readonly label: string;
  readonly title: string;
  readonly text: string;
};

type BodhisattvaCtaPractice = {
  readonly number: string;
  readonly title: string;
  readonly quote: string;
  readonly cta: string;
  readonly ctaHref: AnchorHref;
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
    readonly titleLines: readonly [string, string];
    readonly posterLine: string;
    readonly primaryCta: string;
    readonly secondaryCta: string;
    readonly figureAlt: string;
    readonly actionsLabel: string;
    readonly socialsLabel: string;
    readonly actions: readonly HeroAction[];
    readonly socials: readonly SocialLink[];
  };
  readonly retreats: {
    readonly title: string;
    readonly description: string;
    readonly bookRetreat: string;
    readonly backToRetreats: string;
    readonly dateLocale: string;
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
    readonly title: string;
    readonly cards: readonly ClassCard[];
  };
  readonly himalayan: {
    readonly titleLines: readonly [string, string];
    readonly details: readonly [PracticeDetail, PracticeDetail];
  };
  readonly practice: {
    readonly title: string;
    readonly description: string;
    readonly frameLabel: string;
    readonly benefitsLabel: string;
    readonly benefits: readonly PracticeBenefit[];
    readonly video: PracticeVideo;
  };
  readonly bodhisattvaCta: {
    readonly title: string;
    readonly portraitAlt: string;
    readonly previousLabel: string;
    readonly nextLabel: string;
    readonly footnote: string;
    readonly practices: readonly [BodhisattvaCtaPractice, BodhisattvaCtaPractice, BodhisattvaCtaPractice];
  };
};

const practiceVideoSrc = 'https://www.youtube.com/embed/Z_AabfLhaHo';
const youtubePracticeUrl = 'https://www.youtube.com/watch?v=Z_AabfLhaHo';
export const telegramUrl = 'https://t.me/AnastasiaPagliacci';

export const contactEmail = 'hello@yogermeisters.com';

export const landingCopy = {
  en: {
    navItems: [
      { label: 'About', href: '#hero' },
      { label: 'Retreats', href: '#retreats' },
      { label: 'Classes', href: '#classes' },
      { label: 'Online', href: '#online' },
      { label: 'Practice', href: '#practice' },
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
      titleLines: ['Himalayan', 'Yoga'],
      posterLine: 'Between movement and stillness, there is practice',
      primaryCta: 'Book a Retreat',
      secondaryCta: 'Book a Class',
      figureAlt: 'Yoga teacher Nastya practicing Himalayan yoga',
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
        { label: 'Telegram', href: telegramUrl, icon: Send },
        { label: 'YouTube', href: youtubePracticeUrl, icon: Youtube },
        { label: 'Email', href: `mailto:${contactEmail}`, icon: Mail },
      ],
    },
    retreats: {
      title: 'Upcoming Retreats',
      description:
        'Retreats where route and practice work together: sea, mountains, silence, and a daily return to yourself.',
      bookRetreat: 'Sign Up',
      backToRetreats: 'Back to retreats',
      dateLocale: 'en-US',
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
      title: 'Start Practice Today',
      cards: [
        {
          label: 'Online',
          title: 'Yoga Course',
          price: '€49',
          description:
            'A structured online course covering the foundations of Himalayan yoga with pranayama, biomechanics and meditation.',
          cta: 'Learn more',
          href: youtubePracticeUrl,
        },
        {
          label: 'Online',
          title: 'Private Classes',
          price: '€45',
          description:
            "Individual practice with careful teacher attention, gentle support and adaptation to the student's personal request.",
          cta: 'Book',
          href: telegramUrl,
        },
        {
          label: 'Offline. Prague',
          title: 'Private Classes',
          price: '€49',
          description: 'Individual practice at a yoga studio in Prague, with full attention to your alignment, breath and personal goals.',
          cta: 'Book',
          href: telegramUrl,
        },
        {
          label: 'Offline. Prague',
          title: 'Group Practice',
          price: '€25',
          description: 'Fly yoga and hatha yoga in a small group of up to eight people at a yoga studio in Prague.',
          cta: 'Book',
          href: telegramUrl,
        },
        {
          label: 'Online',
          title: 'Group Practice',
          price: 'Donation',
          description:
            'Community group practice online. Breath, movement and meditation together - pay what feels right.',
          cta: 'Join group',
          href: telegramUrl,
        },
      ],
    },
    himalayan: {
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
    bodhisattvaCta: {
      title: 'Choose the next step while the conditions are here',
      portraitAlt: 'Yoga teacher Nastya near a bamboo wall',
      previousLabel: 'Show previous practice',
      nextLabel: 'Show next practice',
      footnote:
        'Meaning-based selections inspired by The Thirty-Seven Practices of Bodhisattvas by Gyalse Tokme Zangpo.',
      practices: [
        {
          number: 'Practice 1',
          title: 'Precious human life',
          quote:
            'When body, time, and the chance to learn are already here, practice is not something to postpone.',
          cta: 'Book a practice',
          ctaHref: '#classes',
        },
        {
          number: 'Practice 3',
          title: 'Solitude',
          quote: 'In quiet places, distraction softens; clarity and steady practice can naturally become stronger.',
          cta: 'Join a retreat',
          ctaHref: '#retreats',
        },
        {
          number: 'Practice 10',
          title: 'Bodhicitta',
          quote: 'Practice opens wider when it is not only for ourselves, but also for greater kindness to others.',
          cta: 'Write in Telegram',
          ctaHref: telegramUrl,
        },
      ],
    },
  },
  ru: {
    navItems: [
      { label: 'О проекте', href: '#hero' },
      { label: 'Ретриты', href: '#retreats' },
      { label: 'Занятия', href: '#classes' },
      { label: 'Онлайн', href: '#online' },
      { label: 'Практика', href: '#practice' },
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
      titleLines: ['Himalayan', 'Yoga'],
      posterLine: 'Между движением и тишиной рождается практика',
      primaryCta: 'Book a Retreat',
      secondaryCta: 'Book a Class',
      figureAlt: 'Преподаватель йоги Настя в практике гималайской йоги',
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
        { label: 'Telegram', href: telegramUrl, icon: Send },
        { label: 'YouTube', href: youtubePracticeUrl, icon: Youtube },
        { label: 'Электронная почта', href: `mailto:${contactEmail}`, icon: Mail },
      ],
    },
    retreats: {
      title: 'Ближайшие ретриты',
      description:
        'Ретриты, где сочетаются познание внешнего и внутреннего: море, горы, тишина и ежедневное возвращение к себе.',
      bookRetreat: 'Записаться',
      backToRetreats: 'К ретритам',
      dateLocale: 'ru-RU',
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
      title: 'Начни заниматься сегодня',
      cards: [
        {
          label: 'Онлайн',
          title: 'Курс по йоге',
          price: '€49',
          description:
            'Структурированный онлайн-курс по основам гималайской йоги: пранаяма, биомеханика и медитация в удобном темпе.',
          cta: 'Узнать подробнее',
          href: youtubePracticeUrl,
        },
        {
          label: 'Онлайн',
          title: 'Индивид',
          price: '€45',
          description:
            'Индивидуальная практика с вниманием преподавателя, бережной поддержкой и адаптацией под личный запрос ученика.',
          cta: 'Записаться',
          href: telegramUrl,
        },
        {
          label: 'Офлайн. Прага',
          title: 'Индивид',
          price: '€49',
          description: 'Индивидуальная практика в йога-студии в Праге, с полным вниманием к выравниванию, дыханию и вашим целям.',
          cta: 'Записаться',
          href: telegramUrl,
        },
        {
          label: 'Офлайн. Прага',
          title: 'Флай, хатха-йога',
          price: '€25',
          description: 'Флай-йога и хатха-йога в небольшой группе до восьми человек в йога-студии в Праге.',
          cta: 'Записаться',
          href: telegramUrl,
        },
        {
          label: 'Онлайн',
          title: 'Йога-буст',
          price: 'Donation',
          description:
            'Совместная групповая практика онлайн. Дыхание, движение и медитация вместе - платите, сколько чувствуете уместным.',
          cta: 'Присоединиться',
          href: telegramUrl,
        },
      ],
    },
    himalayan: {
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
    bodhisattvaCta: {
      title: 'Выберите следующий шаг, пока условия уже есть',
      portraitAlt: 'Преподаватель йоги Настя у бамбуковой стены',
      previousLabel: 'Показать предыдущую практику',
      nextLabel: 'Показать следующую практику',
      footnote:
        'Смысловые выдержки по мотивам текста «37 практик бодхисаттвы» Гьялсе Тогме Зангпо.',
      practices: [
        {
          number: 'Практика 1',
          title: 'Драгоценная человеческая жизнь',
          quote:
            'Раз у нас есть тело, время и возможность встретиться с путем, практику стоит начинать сейчас, не откладывая.',
          cta: 'Записаться на практику',
          ctaHref: '#classes',
        },
        {
          number: 'Практика 3',
          title: 'Уединение',
          quote:
            'В тишине меньше отвлечений: ясность становится ближе, а практика естественно набирает силу.',
          cta: 'Поехать на ретрит',
          ctaHref: '#retreats',
        },
        {
          number: 'Практика 10',
          title: 'Бодхичитта',
          quote:
            'Практика раскрывается шире, когда она не только для себя, но и ради большей доброты к другим.',
          cta: 'Написать в Telegram',
          ctaHref: telegramUrl,
        },
      ],
    },
  },
} satisfies Record<Language, LandingCopy>;
