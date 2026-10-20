import { useEffect, useRef, useState, type ReactElement } from 'react';
import { ArrowDown, ArrowLeft, ArrowUpRight, Plus } from 'lucide-react';
import { Link } from 'wouter';

import type { RetreatRecord } from '@shared/retreat-content';
import type { RetreatDay, RetreatExperience, RetreatMedia, RetreatReason, RetreatScheduleItem } from '@shared/retreats/experience';
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
    programText: 'Восемь дней на юге острова. Выбери день и посмотри, что нас ждёт.',
    reasons: 'Что тебя\nждёт',
    included: 'Что включено',
    excluded: 'Не включено',
    schedule: 'Расписание дня',
    telegram: 'Написать в Telegram',
    footer: 'Йога-туры Yogermeisters', skip: 'Перейти к программе',
    dateLocale: 'ru-RU',
  },
  en: {
    back: 'All retreats', program: 'Programme', book: 'Enquire now',
    programTitle: 'Tour programme',
    programText: 'Eight days on the south coast. Choose a day to see what we have planned.',
    reasons: 'What awaits\nyou',
    included: 'What’s included',
    excluded: 'Not included',
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

function RetreatReasons({ reasons, language }: {
  readonly reasons: readonly RetreatReason[];
  readonly language: Language;
}): ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect((): (() => void) => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncMotion = (): void => setReducedMotion(preference.matches);
    syncMotion();
    preference.addEventListener('change', syncMotion);
    const observer = new IntersectionObserver(([entry]: IntersectionObserverEntry[]): void => {
      setInView(entry.isIntersecting);
    }, { threshold: 0.15 });
    if (sectionRef.current) observer.observe(sectionRef.current);
    return (): void => {
      observer.disconnect();
      preference.removeEventListener('change', syncMotion);
    };
  }, []);

  useEffect((): (() => void) | undefined => {
    if (reducedMotion || !inView || reasons.length < 2) return;
    const timer = window.setInterval((): void => {
      if (!document.hidden) setActive((current: number): number => (current + 1) % reasons.length);
    }, 3000);
    return (): void => window.clearInterval(timer);
  }, [active, reducedMotion, inView, reasons.length]);

  return (
    <section className={styles.reasons} ref={sectionRef} aria-labelledby='reasons-title' data-in-view={inView}>
      <div className={styles.reasonContent}>
        <h2 id='reasons-title'>{COPY[language].reasons}</h2>
        <div className={styles.reasonIndicators}>
          {reasons.map((reason: RetreatReason, index: number): ReactElement => (
            <button
              key={reason.title} type='button' aria-label={reason.title} aria-pressed={index === active}
              onClick={(): void => setActive(index)}
            >
              <span aria-hidden='true' />
            </button>
          ))}
        </div>
        <div className={styles.reasonDescriptions}>
          {reasons.map((reason: RetreatReason, index: number): ReactElement => (
            <div key={reason.title} aria-hidden={index !== active} className={`${styles.reasonSlide} ${index === active ? styles.activeDescription : ''}`}>
              <h3>{reason.title}</h3>
              <p>{reason.text}</p>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.reasonPhotos}>
        {reasons.map((reason: RetreatReason, index: number): ReactElement => (
          <img
            key={reason.image.src} src={reason.image.src} alt={reason.image.alt}
            aria-hidden={index !== active} loading='lazy' decoding='async'
            className={index === active ? styles.activePhoto : undefined}
          />
        ))}
      </div>
    </section>
  );
}

interface DaySectionProps {
  readonly day: RetreatDay;
  readonly index: number;
  readonly language: Language;
  readonly open: boolean;
  readonly onToggle: () => void;
  readonly fallbackImage: RetreatMedia;
}

function DaySection({ day, index, language, open, onToggle, fallbackImage }: DaySectionProps): ReactElement {
  const panelId = `schedule-${day.id}`;
  return (
    <article className={`${styles.dayCard} ${open ? styles.dayOpen : ''}`} id={`day-${day.id}`}>
      <h3>
        <button
          className={styles.dayTrigger}
          type='button'
          onClick={onToggle}
          aria-expanded={open}
          aria-controls={panelId}
          id={`title-${day.id}`}
        >
          <span className={styles.dayNumber}>{String(index + 1).padStart(2, '0')}</span>
          <span className={styles.dayLabel}>
            <time dateTime={day.date}>{formatDay(day.date, language, true)}</time>
            <span>{day.title.replaceAll('\n', ' ')}</span>
          </span>
          <span className={styles.dayToggle}><Plus size={22} strokeWidth={1.5} aria-hidden='true' /></span>
        </button>
      </h3>
      <div className={styles.dayReveal} inert={!open} aria-hidden={!open}>
        <div className={styles.dayRevealInner}>
          <section className={styles.dayPanel} id={panelId} aria-labelledby={`title-${day.id}`}>
            <ol className={styles.schedule}>
              {day.schedule.map((item: RetreatScheduleItem, itemIndex: number): ReactElement => (
                <li key={`${item.time}-${itemIndex}`}>
                  <span className={styles.scheduleTime}>{item.time}</span>
                  <p>{item.text}</p>
                </li>
              ))}
            </ol>
            <Photograph media={day.images[0] ?? fallbackImage} className={styles.dayImage} />
          </section>
        </div>
      </div>
    </article>
  );
}

function Programme({ experience, language }: { readonly experience: RetreatExperience; readonly language: Language }): ReactElement {
  const [openId, setOpenId] = useState<string | null>(experience.days[0]?.id ?? null);
  const revealOnChange = useRef(false);

  useEffect((): (() => void) | undefined => {
    if (!openId || !revealOnChange.current) return;
    const timeout = window.setTimeout((): void => {
      const card = document.getElementById(`day-${openId}`);
      const button = document.getElementById(`title-${openId}`);
      const bounds = button?.getBoundingClientRect();
      if (bounds && (bounds.top < 0 || bounds.bottom > window.innerHeight)) {
        card?.scrollIntoView({ block: 'start', behavior: 'instant' });
      }
      revealOnChange.current = false;
    }, 350);
    return (): void => window.clearTimeout(timeout);
  }, [openId]);

  useEffect((): (() => void) => {
    let timeout: number | undefined;
    const openHashDay = (): void => {
      window.clearTimeout(timeout);
      const day = experience.days.find((item: RetreatDay): boolean => `#day-${item.id}` === window.location.hash);
      if (day) setOpenId(day.id);
      const target = day ? `day-${day.id}` : window.location.hash === '#programme' ? 'programme' : null;
      if (target) {
        timeout = window.setTimeout((): void => {
          document.getElementById(target)?.scrollIntoView({ block: 'start', behavior: 'instant' });
        }, 350);
      }
    };
    openHashDay();
    window.addEventListener('hashchange', openHashDay);
    return (): void => {
      window.clearTimeout(timeout);
      window.removeEventListener('hashchange', openHashDay);
    };
  }, [experience.days]);

  return (
    <section className={styles.programme} id='programme' aria-labelledby='programme-title'>
      <div className={styles.programIntro}>
        <h2 id='programme-title'>{COPY[language].programTitle}</h2>
        <p>{COPY[language].programText}</p>
      </div>
      <div className={styles.days}>
        {experience.days.map((day: RetreatDay, index: number): ReactElement => (
          <DaySection
            key={day.id} day={day} index={index} language={language}
            open={openId === day.id}
            onToggle={(): void => {
              revealOnChange.current = true;
              setOpenId(openId === day.id ? null : day.id);
            }}
            fallbackImage={experience.stayImages[0]}
          />
        ))}
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
        {experience.reasons?.length ? <RetreatReasons reasons={experience.reasons} language={language} /> : null}
        <Programme experience={experience} language={language} />
        <section className={styles.stay} id='stay' aria-labelledby='stay-title'>
          <div className={styles.stayCopy}><h2 id='stay-title'>{experience.stayTitle}</h2><p>{experience.stayText}</p></div>
          <div className={styles.stayPhotos}>
            {experience.stayImages.map((media: RetreatMedia): ReactElement => <Photograph key={media.src} media={media} />)}
          </div>
        </section>
        {experience.inclusions ? (
          <section className={styles.inclusions} aria-labelledby='included-title'>
            <div>
              <h2 id='included-title'>{copy.included}</h2>
              <ul>
                {experience.inclusions.included.map((item: string): ReactElement => (
                  <li key={item}><span aria-hidden='true'>+</span>{item}</li>
                ))}
              </ul>
            </div>
            <div>
              <h2>{copy.excluded}</h2>
              <ul>
                {experience.inclusions.excluded.map((item: string): ReactElement => (
                  <li key={item}><span aria-hidden='true'>–</span>{item}</li>
                ))}
              </ul>
            </div>
          </section>
        ) : null}
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
