import { Link } from 'wouter';
import { ArrowLeft, Check, ExternalLink } from 'lucide-react';

import Header from '@/components/landing-v2/Header';
import { telegramUrl } from '@/components/landing-v2/content';
import type { Language } from '@/lib/i18n';
import { openExternal } from '@/lib/open-external';
import styles from './HimalayanYogaCoursePage.module.css';

interface HimalayanYogaCoursePageProps {
  language: Language;
  setLanguage: (language: Language) => void;
}

interface CourseModule {
  readonly number: string;
  readonly title: string;
  readonly lessons: readonly string[];
}

interface Tariff {
  readonly label: string;
  readonly title: string;
  readonly badge: string;
  readonly originalPrice: string;
  readonly price: string;
  readonly description: string;
  readonly features: readonly string[];
  readonly isFeatured?: boolean;
}

const modules: readonly CourseModule[] = [
  {
    number: '01',
    title: 'Здоровое тело — фундамент практики',
    lessons: [
      'Здоровье спины и осанка — 38 минут',
      'Мышцы кора. Сила. Разгибание в тазобедренных суставах. Прогибы — 47 минут',
      'Общая практика на всё тело — 50 минут',
      'Короткая сбалансированная практика — 30 минут',
    ],
  },
  {
    number: '02',
    title: 'Гибкость без травм',
    lessons: [
      'Углубление прогибов — 40 минут',
      'Углубление продольного шпагата — 40 минут',
      'Углубление поперечного шпагата — 40 минут',
    ],
  },
  {
    number: '03',
    title: 'Техника выполнения асан',
    lessons: [
      'Отстройка базовых асан — 15 минут',
      'Разбор балансов на руках — 10 минут',
    ],
  },
  {
    number: '04',
    title: 'Восстановление и расслабление',
    lessons: [
      'Медитация — 20 минут',
      'Практика для раскрытия таза и пробуждения энергии — 15 минут',
      'Йога-нидра, аудио — 30 минут',
      'Медитация Метта, аудио — 20 минут',
    ],
  },
];

const results = [
  'более здоровую осанку',
  'уменьшение напряжения в шее и спине',
  'сильный кор и устойчивое тело',
  'улучшение гибкости без боли',
  'больше энергии и лёгкости',
  'инструменты для самостоятельной практики на долгие годы',
] as const;

const tariffs: readonly Tariff[] = [
  {
    label: 'Запись',
    title: 'Курс в записи',
    badge: 'Предпродажа',
    originalPrice: '€69',
    price: '€49',
    description: 'Самостоятельный доступ к программе курса в удобном темпе.',
    features: ['полная программа курса', 'практики на каждый день', 'медитации и йога-нидра'],
  },
  {
    label: 'Поток',
    title: 'Онлайн-поток',
    badge: 'Предпродажа',
    originalPrice: '€99',
    price: '€79',
    description: 'Групповое прохождение с поддержкой, чатом и комментариями от учителя.',
    features: ['доступ к записям', 'Групповые онлайн практики + чат', 'комментарии от преподавателя'],
    isFeatured: true,
  },
  {
    label: 'Лично',
    title: 'Индивидуальный',
    badge: 'Предпродажа',
    originalPrice: '€200',
    price: '€180',
    description: 'Курс с двумя персональными практиками от преподавателя.',
    features: ['всё из онлайн-потока', 'две индивидуальные практики', 'персональная корректировка фокуса'],
  },
];

const courseVideoSrc = 'https://4c312672-588a-49d9-9475-4f2a2f2b54e4.selstorage.ru/course-website_1.mp4';
const courseVideoPosterSrc = '/assets/landing-v2/course-video-poster.jpg';

export default function HimalayanYogaCoursePage({ language, setLanguage }: HimalayanYogaCoursePageProps) {
  const handleTelegramClick = (): void => {
    openExternal(telegramUrl);
  };

  return (
    <div className={`landing-v2-root ${styles.page}`}>
      <Header language={language} setLanguage={setLanguage} />

      <main className={styles.main}>
        <div className={styles.topbar}>
          <Link href='/#classes' className={styles.backLink}>
            <ArrowLeft aria-hidden='true' />
            К занятиям
          </Link>
        </div>

        <section className={styles.hero}>
          <div className={styles.heroCopy}>
            <span className={styles.courseName}>the yoga method</span>
            <h1>Йога, после которой тело начинает работать по&#8209;другому</h1>
            <p>
              Курс создан не для идеальных йогов, а для обычных людей, которые устали от боли в спине,
              зажатых плеч, плохой осанки и ощущения, что тело стало деревянным.
            </p>
            <HeroActions className={styles.desktopActions} />
          </div>

          <div className={styles.heroMedia}>
            <div className={styles.heroVideo} aria-label='Видео-пример курса'>
              <video controls playsInline poster={courseVideoPosterSrc} preload='metadata' src={courseVideoSrc}>
                Ваш браузер не поддерживает видео.
              </video>
            </div>
            <HeroActions className={styles.mobileActions} />
          </div>
        </section>

        <section className={styles.introSection} aria-label='О курсе'>
          <div className={styles.introCopy}>
            <h2>Что внутри</h2>
            <p>
              Мы постепенно восстановим подвижность позвоночника, укрепим мышцы кора, научимся безопасно выполнять
              прогибы и шпагаты, улучшим осанку, раскроем грудной отдел и таз, а также добавим практики глубокого
              расслабления.
            </p>
            <p>
              Внутри вас ждут полноценные тренировки, короткие практики на каждый день, медитации, йога-нидра,
              фейс-йога и подробные объяснения техники выполнения.
            </p>
          </div>
          <div className={styles.fitPanel}>
            <span>Подходит</span>
            <p>
              Начинающим и тем, кто уже занимается йогой и хочет двигаться глубже без риска для суставов и позвоночника.
            </p>
          </div>
        </section>

        <section className={styles.resultsSection} aria-label='Результаты курса'>
          <h2>В результате вы получите</h2>
          <div className={styles.resultsGrid}>
            {results.map((result) => (
              <article className={styles.resultCard} key={result}>
                <Check aria-hidden='true' />
                <p>{result}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.programSection} id='program'>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Программа курса</span>
            <h2>4 модуля для силы, гибкости и восстановления</h2>
          </div>

          <div className={styles.modules}>
            {modules.map((module) => (
              <article className={styles.moduleCard} key={module.number}>
                <div className={styles.moduleHeader}>
                  <span>{module.number}</span>
                  <h3>{module.title}</h3>
                </div>
                <ul>
                  {module.lessons.map((lesson) => (
                    <li key={lesson}>
                      <Check aria-hidden='true' />
                      {lesson}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.tariffsSection} id='tariffs'>
          <div className={styles.sectionHeader}>
            <span className={styles.eyebrow}>Тарифы</span>
            <h2>Выберите формат прохождения</h2>
          </div>

          <div className={styles.tariffGrid}>
            {tariffs.map((tariff) => (
              <article
                className={`${styles.tariffCard}${tariff.isFeatured ? ` ${styles.featuredTariff}` : ''}`}
                key={tariff.title}
              >
                <div className={styles.tariffMeta}>
                  <span className={styles.tariffLabel}>{tariff.label}</span>
                  <span className={styles.presaleBadge}>{tariff.badge}</span>
                </div>
                <h3>{tariff.title}</h3>
                <div className={styles.priceStack}>
                  <span className={styles.originalPrice}>{tariff.originalPrice}</span>
                  <p className={styles.tariffPrice}>{tariff.price}</p>
                </div>
                <p className={styles.tariffDescription}>{tariff.description}</p>
                <ul>
                  {tariff.features.map((feature) => (
                    <li key={feature}>
                      <Check aria-hidden='true' />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button className={styles.tariffButton} type='button' onClick={handleTelegramClick}>
                  <span>Записаться</span>
                  <ExternalLink aria-hidden='true' />
                </button>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

interface HeroActionsProps {
  className: string;
}

function HeroActions({ className }: HeroActionsProps) {
  return (
    <div className={`${styles.heroActions} ${className}`}>
      <a href='#tariffs' className={styles.primaryButton}>
        <span>Выбрать тариф</span>
      </a>
      <a href='#program' className={styles.secondaryButton}>
        <span>Смотреть программу</span>
      </a>
    </div>
  );
}
