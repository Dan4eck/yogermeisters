import { useEffect, type ReactElement } from 'react';
import { ArrowDown, ArrowLeft, ArrowUpRight } from 'lucide-react';
import { Link } from 'wouter';

import type { RetreatRecord } from '@shared/retreat-content';
import type { RetreatDay, RetreatExperience, RetreatMedia, RetreatScheduleItem } from '@shared/retreats/experience';
import type { Language } from '@/lib/i18n';
import { getRetreatImageUrl } from '@/lib/retreat-assets';
import styles from './RetreatExperiencePage.module.css';

interface RetreatExperiencePageProps {
  readonly retreat: RetreatRecord;
  readonly experience: RetreatExperience;
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
}

const COPY = {
  ru: {
    back: 'Все ретриты', program: 'Программа', book: 'Оставить заявку',
    programTitle: 'Программа тура',
    programText: 'Посмотри, что запланировано на каждый день: занятия йогой, поездки, отдых и время в дороге.',
    schedule: 'Расписание дня',
    telegram: 'Написать в Telegram',
    footer: 'Йога-туры Yogermeisters', skip: 'Перейти к программе',
    dateLocale: 'ru-RU',
  },
  en: {
    back: 'All retreats', program: 'Programme', book: 'Enquire now',
    programTitle: 'Tour programme',
    programText: 'See what is planned for each day: yoga, day trips, free time and travel.',
    schedule: 'Daily schedule',
    telegram: 'Message on Telegram',
    footer: 'Yoga tours by Yogermeisters', skip: 'Skip to the programme',
    dateLocale: 'en-GB',
  },
} as const;

function formatDay(date: string, language: Language, weekday = false): string {
  return new Intl.DateTimeFormat(COPY[language].dateLocale, {
    day: 'numeric', month: 'long', ...(weekday ? { weekday: 'long' as const } : {}), timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
}

interface PhotographProps {
  readonly media: RetreatMedia;
  readonly className?: string;
}

function Photograph({ media, className = '' }: PhotographProps): ReactElement {
  return (
    <figure className={`${styles.photograph} ${className}`}>
      <img src={media.src} alt={media.alt} loading='lazy' decoding='async' />
    </figure>
  );
}

interface DaySectionProps {
  readonly day: RetreatDay;
  readonly index: number;
  readonly language: Language;
}

function DaySection({ day, index, language }: DaySectionProps): ReactElement {
  const copy = COPY[language];
  const isPanorama = day.layout === 'panorama';
  const [mainImage, ...otherImages] = day.images;
  const visualImages = isPanorama ? otherImages : day.images;
  const dayNumber = String(index + 1).padStart(2, '0');

  const introduction = (
    <>
      <div className={styles.dayMeta}>
        <span className={styles.dayNumber}>{dayNumber}</span>
        <div>
          <time dateTime={day.date}>{formatDay(day.date, language, true)}</time>
        </div>
      </div>
      <h3 id={`title-${day.id}`}>{day.title}</h3>
      <p className={styles.daySummary}>{day.summary}{day.note ? ` ${day.note}` : ''}</p>
    </>
  );

  return (
    <section
      className={`${styles.day} ${styles[day.layout]}${index % 2 ? ` ${styles.alternate}` : ''}`}
      id={`day-${day.id}`}
      aria-labelledby={`title-${day.id}`}
    >
      {isPanorama && mainImage ? (
        <div className={styles.panoramaFrame}>
          <Photograph media={mainImage} />
          <div className={styles.panoramaHeading}>{introduction}</div>
        </div>
      ) : null}
      <div className={styles.dayBody}>
        <div className={styles.dayCopy}>
          {!isPanorama ? introduction : null}
          <section className={styles.schedule} aria-labelledby={`schedule-${day.id}`}>
            <h4 className={styles.scheduleTitle} id={`schedule-${day.id}`}>{copy.schedule}</h4>
            <ol>
              {day.schedule.map((item: RetreatScheduleItem, itemIndex: number): ReactElement => (
                <li key={`${item.time}-${itemIndex}`}>
                  <span className={styles.scheduleTime}>{item.time}</span>
                  <p>{item.text}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
        {visualImages.length > 0 ? (
          <div className={styles.dayPhotos}>
            {visualImages.map((media: RetreatMedia): ReactElement => <Photograph key={media.src} media={media} />)}
          </div>
        ) : null}
      </div>
    </section>
  );
}

export default function RetreatExperiencePage({
  retreat, experience, language, setLanguage,
}: RetreatExperiencePageProps): ReactElement {
  const copy = COPY[language];
  const coverImage = getRetreatImageUrl(retreat.coverImage);

  useEffect((): (() => void) => {
    const previousTitle = document.title;
    document.title = `${retreat.title} · ${retreat.dateLabel ?? ''} | Yogermeisters`;
    return (): void => { document.title = previousTitle; };
  }, [retreat.title, retreat.dateLabel]);

  return (
    <div className={styles.page} lang={language}>
      <a className={styles.skipLink} href='#programme'>{copy.skip}</a>
      <header className={styles.header}>
        <Link href='/' className={styles.brand} aria-label='Yogermeisters – home'>yogermeisters.</Link>
        <Link href='/#retreats' className={styles.back}><ArrowLeft size={15} aria-hidden='true' />{copy.back}</Link>
        <button
          type='button'
          className={styles.language}
          onClick={(): void => setLanguage(language === 'ru' ? 'en' : 'ru')}
          aria-label={language === 'ru' ? 'Switch to English' : 'Переключить на русский'}
        >
          <span aria-current={language === 'ru' ? 'true' : undefined}>RU</span>
          <span aria-hidden='true'>/</span>
          <span aria-current={language === 'en' ? 'true' : undefined}>EN</span>
        </button>
      </header>
      <main>
        <section className={styles.hero} aria-labelledby='retreat-title'>
          <img className={styles.heroImage} src={coverImage} alt={retreat.title} fetchPriority='high' decoding='async' />
          <div className={styles.heroContent}>
            <p className={styles.eyebrow}>{retreat.title} / {retreat.startDate.slice(0, 4)}</p>
            <h1 id='retreat-title'>{experience.heroTitle}</h1>
            <p className={styles.heroText}>{experience.heroText}</p>
            <div className={styles.heroActions}>
              <a className={styles.lightButton} href='#booking'>{copy.book}<ArrowUpRight size={18} aria-hidden='true' /></a>
              <a className={styles.programLink} href='#programme'>{copy.program}<ArrowDown size={16} aria-hidden='true' /></a>
            </div>
          </div>
          <div className={styles.heroBottom}>
            <span>{retreat.location}</span>
            <span>{retreat.dateLabel}</span>
            <span>{retreat.price}</span>
          </div>
        </section>
        <section className={styles.stay} id='stay' aria-labelledby='stay-title'>
          <div className={styles.stayCopy}><h2 id='stay-title'>{experience.stayTitle}</h2><p>{experience.stayText}</p></div>
          <div className={styles.stayPhotos}>
            {experience.stayImages.map((media: RetreatMedia): ReactElement => <Photograph key={media.src} media={media} />)}
          </div>
        </section>
        <section className={styles.programIntro} id='programme' aria-labelledby='programme-title'>
          <h2 id='programme-title'>{copy.programTitle}</h2><p>{copy.programText}</p>
        </section>
        <nav className={styles.dayNavigation} aria-label={copy.program}>
          <span>{copy.program}</span>
          <div>
            {experience.days.map((day: RetreatDay): ReactElement => (
              <a key={day.id} href={`#day-${day.id}`} aria-label={`${formatDay(day.date, language)}: ${day.title.replaceAll('\n', ' ')}`}>
                {new Intl.DateTimeFormat(copy.dateLocale, { day: 'numeric', month: 'short', timeZone: 'UTC' }).format(new Date(`${day.date}T12:00:00Z`)).replace('.', '')}
              </a>
            ))}
          </div>
          <a className={styles.navBook} href='#booking'>{retreat.price}<ArrowUpRight size={16} aria-hidden='true' /></a>
        </nav>
        <div className={styles.days}>
          {experience.days.map((day: RetreatDay, index: number): ReactElement => <DaySection key={day.id} day={day} index={index} language={language} />)}
        </div>
        <section className={styles.booking} id='booking' aria-labelledby='booking-title'>
          <div>
            <h2 id='booking-title'>{experience.bookingTitle}</h2>
            <p className={styles.bookingText}>{experience.bookingText}</p>
          </div>
          <div className={styles.bookingActions}>
            <p className={styles.bookingPrice}>{retreat.price}</p>
            <a className={styles.lightButton} href={retreat.bookingUrl} target='_blank' rel='noopener noreferrer'>{copy.telegram}<ArrowUpRight size={19} aria-hidden='true' /></a>
          </div>
        </section>
      </main>
      <footer className={styles.footer}><Link href='/' className={styles.brand}>yogermeisters.</Link><span>{copy.footer}</span><Link href='/#retreats'>{copy.back}<ArrowUpRight size={15} aria-hidden='true' /></Link></footer>
    </div>
  );
}
