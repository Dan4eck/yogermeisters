import { useEffect, useRef, useState, type ReactElement, type Touch as ReactTouch, type TouchEvent } from 'react';
import { ArrowDown, ArrowLeft, ArrowUpRight, Plus } from 'lucide-react';
import { Link } from 'wouter';

import type { RetreatRecord } from '@shared/retreat-content';
import type { RetreatDay, RetreatExperience, RetreatMedia, RetreatReason, RetreatScheduleItem } from '@shared/retreats/experience';
import { whatsappUrl } from '@/components/landing-v2/content';
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
    programText: 'Выбери день и посмотри, что нас ждёт.',
    included: 'Что включено в стоимость 🌴',
    excluded: 'Не включено в стоимость 🥲',
    schedule: 'Расписание дня',
    telegram: 'Написать в Telegram',
    whatsapp: 'Написать в WhatsApp',
    footer: 'Йога-туры Yogermeisters', skip: 'Перейти к программе',
    dateLocale: 'ru-RU',
  },
  en: {
    back: 'All retreats', program: 'Programme', book: 'Enquire now',
    programTitle: 'Tour programme',
    programText: 'Choose a day to see what we have planned.',
    included: 'Included in the price 🌴',
    excluded: 'Not included in the price 🥲',
    schedule: 'Daily schedule',
    telegram: 'Message on Telegram',
    whatsapp: 'Message on WhatsApp',
    footer: 'Yoga tours by Yogermeisters', skip: 'Skip to the programme',
    dateLocale: 'en-GB',
  },
} as const;

const MOUNTAINS_COPY = {
  ru: { programTitle: 'Программа ретрита', included: 'Что включено в стоимость 🌲' },
  en: { programTitle: 'Retreat programme', included: 'Included in the price 🌲' },
} as const;

const TELEGRAM_PATH = 'M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z';

const WHATSAPP_PATH = 'M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z';

function BrandIcon({ path }: { readonly path: string }): ReactElement {
  return <svg className={styles.brandIcon} viewBox='0 0 24 24' fill='currentColor' aria-hidden='true'><path d={path} /></svg>;
}

function formatDay(date: string, language: Language, weekday = false): string {
  return new Intl.DateTimeFormat(COPY[language].dateLocale, {
    day: 'numeric', month: 'long', ...(weekday ? { weekday: 'long' as const } : {}), timeZone: 'UTC',
  }).format(new Date(`${date}T12:00:00Z`));
}

interface PhotographProps {
  readonly media: RetreatMedia;
  readonly className?: string;
  readonly loading?: 'eager' | 'lazy';
}

function EarlyBirdCard({ offer }: { readonly offer: NonNullable<RetreatExperience['priceOffer']> }): ReactElement {
  const cardRef = useRef<HTMLElement>(null);
  const [arrived, setArrived] = useState(false);

  useEffect((): (() => void) => {
    const observer = new IntersectionObserver(([entry]: IntersectionObserverEntry[]): void => {
      if (entry.isIntersecting) {
        setArrived(true);
        observer.disconnect();
      }
    }, { threshold: 0.6 });
    if (cardRef.current) observer.observe(cardRef.current);
    return (): void => observer.disconnect();
  }, []);

  return (
    <aside ref={cardRef} className={styles.earlyBird} data-arrived={arrived} aria-label={offer.label}>
      <span className={styles.offerBird} aria-hidden='true'>🐦</span>
      <p>{offer.note.replace(/[.!?]\s*$/, '')} <strong>{offer.label}</strong>.</p>
    </aside>
  );
}

function Photograph({ media, className = '', loading = 'lazy' }: PhotographProps): ReactElement {
  return (
    <figure className={`${styles.photograph} ${className}`}>
      <img src={media.src} alt={media.alt} loading={loading} decoding='async' />
    </figure>
  );
}

function RetreatReasons({ experience, reasons }: {
  readonly experience: RetreatExperience;
  readonly reasons: readonly RetreatReason[];
}): ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const [active, setActive] = useState(0);
  const [inView, setInView] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [touching, setTouching] = useState(false);
  const swipeStart = useRef<{ readonly id: number; readonly x: number; readonly y: number } | null>(null);

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
    if (reducedMotion || !inView || touching || reasons.length < 2) return;
    const timer = window.setInterval((): void => {
      if (!document.hidden) setActive((current: number): number => (current + 1) % reasons.length);
    }, 4000);
    return (): void => window.clearInterval(timer);
  }, [active, reducedMotion, inView, touching, reasons.length]);

  const cancelSwipe = (): void => {
    swipeStart.current = null;
    setTouching(false);
  };

  const startSwipe = (event: TouchEvent<HTMLDivElement>): void => {
    if (event.touches.length !== 1) {
      cancelSwipe();
      return;
    }
    const touch = event.touches[0];
    swipeStart.current = { id: touch.identifier, x: touch.clientX, y: touch.clientY };
    setTouching(true);
  };

  const endSwipe = (event: TouchEvent<HTMLDivElement>): void => {
    const start = swipeStart.current;
    const touch = Array.from(event.changedTouches).find((item: ReactTouch): boolean => item.identifier === start?.id);
    if (!start || !touch) return;
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    cancelSwipe();
    if (Math.abs(dx) < 40 || Math.abs(dx) <= Math.abs(dy) * 1.2) return;
    setActive((current: number): number => (current + (dx < 0 ? 1 : -1) + reasons.length) % reasons.length);
  };

  return (
    <section
      className={styles.reasons} ref={sectionRef} aria-labelledby='reasons-title' data-in-view={inView}
    >
      <div className={styles.reasonContent}>
        <h2 id='reasons-title'>{experience.introTitle}</h2>
        <p className={styles.reasonIntro}>{experience.introText}</p>
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
      <div
        className={styles.reasonGallery}
        onTouchStart={startSwipe} onTouchEnd={endSwipe} onTouchCancel={cancelSwipe}
      >
        {reasons.map((reason: RetreatReason, index: number): ReactElement => {
          const images = [reason.image, ...(reason.additionalImages ?? [])];
          return (
            <div
              key={reason.title} aria-hidden={index !== active} data-photo-count={images.length}
              className={`${styles.reasonPhotoSet} ${index === active ? styles.activePhotoSet : ''}`}
            >
              {images.map((media: RetreatMedia): ReactElement => (
                <Photograph key={media.src} media={media} className={styles.reasonPhoto} />
              ))}
            </div>
          );
        })}
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
}

function DaySection({ day, index, language, open, onToggle }: DaySectionProps): ReactElement {
  const panelId = `schedule-${day.id}`;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect((): (() => void) => {
    const video = videoRef.current;
    if (video) {
      video.muted = true;
      if (open) void video.play().catch((): undefined => undefined);
      else video.pause();
    }
    return (): void => video?.pause();
  }, [open]);
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
          <section className={styles.dayPanel} data-has-media={Boolean(day.video || day.images.length)} id={panelId} aria-labelledby={`title-${day.id}`}>
            <ol className={styles.schedule}>
              {day.schedule.map((item: RetreatScheduleItem, itemIndex: number): ReactElement => (
                <li key={`${item.time}-${itemIndex}`}>
                  <span className={styles.scheduleTime}>{item.time}</span>
                  <p>{item.text}</p>
                </li>
              ))}
            </ol>
            {day.video ? (
              <figure className={styles.dayVideo}>
                <video
                  ref={videoRef} src={day.video.src} poster={day.video.poster}
                  autoPlay={open} muted loop playsInline preload='none' aria-label={day.video.label}
                />
              </figure>
            ) : day.images[0] ? <Photograph media={day.images[0]} className={styles.dayImage} loading={open ? 'eager' : 'lazy'} /> : null}
          </section>
        </div>
      </div>
    </article>
  );
}

function Programme({ experience, language, title }: {
  readonly experience: RetreatExperience;
  readonly language: Language;
  readonly title: string;
}): ReactElement {
  const [openIds, setOpenIds] = useState<readonly string[]>(
    (): readonly string[] => experience.days.slice(0, 1).map((day: RetreatDay): string => day.id),
  );

  const toggleDay = (id: string): void => {
    setOpenIds((current: readonly string[]): readonly string[] => (
      current.includes(id) ? current.filter((item: string): boolean => item !== id) : [...current, id]
    ));
  };

  useEffect((): (() => void) => {
    let timeout: number | undefined;
    const openHashDay = (): void => {
      window.clearTimeout(timeout);
      const day = experience.days.find((item: RetreatDay): boolean => `#day-${item.id}` === window.location.hash);
      if (day) {
        setOpenIds((current: readonly string[]): readonly string[] => (
          current.includes(day.id) ? current : [...current, day.id]
        ));
      }
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
        <h2 id='programme-title'>{title}</h2>
        <p>{COPY[language].programText}</p>
      </div>
      <div className={styles.days}>
        {experience.days.map((day: RetreatDay, index: number): ReactElement => (
          <DaySection
            key={day.id} day={day} index={index} language={language}
            open={openIds.includes(day.id)}
            onToggle={(): void => toggleDay(day.id)}
          />
        ))}
      </div>
    </section>
  );
}

export default function RetreatExperiencePage({
  retreat, experience, language, setLanguage,
}: RetreatExperiencePageProps): ReactElement {
  const copy = { ...COPY[language], ...(retreat.slug === 'yoga-and-mountains-retreat' ? MOUNTAINS_COPY[language] : {}) };
  const coverImage = getRetreatImageUrl(retreat.coverImage);
  const discount = retreat.price.trim().match(/^(.+?)\s+early(?:\s+bird)?\s*\/\s*(.+)$/i);
  const currentPrice = discount?.[1].trim() ?? retreat.price;
  const regularPrice = experience.priceOffer?.regularPrice ?? discount?.[2].trim();

  useEffect((): (() => void) => {
    const previousTitle = document.title;
    document.title = `${retreat.title} · ${retreat.dateLabel ?? ''} | Yogermeisters`;
    return (): void => { document.title = previousTitle; };
  }, [retreat.title, retreat.dateLabel]);

  return (
    <div className={styles.page} lang={language} data-retreat={retreat.slug}>
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
            <p className={styles.heroPrice}>
              {regularPrice ? <del>{regularPrice}</del> : null}
              <strong>{currentPrice}</strong>
              {experience.priceOffer ? <a className={styles.heroOffer} href='#booking'>{experience.priceOffer.label}<ArrowUpRight size={14} aria-hidden='true' /></a> : null}
            </p>
          </div>
        </section>
        {experience.reasons?.length ? (
          <RetreatReasons experience={experience} reasons={experience.reasons} />
        ) : null}
        <Programme experience={experience} language={language} title={copy.programTitle} />
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
            {experience.priceOffer ? <EarlyBirdCard offer={experience.priceOffer} /> : null}
            <div className={styles.bookingOffer}>
              <div className={styles.bookingPrices}>
                {regularPrice ? <del>{regularPrice}</del> : null}
                <p className={styles.bookingPrice}>{currentPrice}</p>
              </div>
            </div>
            <div className={styles.bookingButtons}>
              <a className={styles.lightButton} href={retreat.bookingUrl} target='_blank' rel='noopener noreferrer'><BrandIcon path={TELEGRAM_PATH} />{copy.telegram}</a>
              <a className={styles.outlineButton} href={whatsappUrl} target='_blank' rel='noopener noreferrer'><BrandIcon path={WHATSAPP_PATH} />{copy.whatsapp}</a>
            </div>
          </div>
        </section>
      </main>
      <footer className={styles.footer}><Link href='/' className={styles.brand}>yogermeisters.</Link><span>{copy.footer}</span><Link href='/#retreats'>{copy.back}<ArrowUpRight size={15} aria-hidden='true' /></Link></footer>
    </div>
  );
}
