import { useEffect, useRef, useState, type KeyboardEvent, type ReactElement } from 'react';
import { ArrowLeft, ArrowRight, CalendarDays, MapPin } from 'lucide-react';
import { Link } from 'wouter';

import { landingCopy } from '@/components/landing-v2/content';
import type { Language } from '@/lib/i18n';
import { formatRetreatDateLabel } from '@/lib/retreat-date';
import { fetchRetreats } from '@/lib/retreat-api';
import { getRetreatImageUrl } from '@/lib/retreat-assets';
import { listRetreats, type RetreatRecord } from '@shared/retreat-content';

import styles from './RetreatsSection.module.css';

interface RetreatsSectionProps {
  readonly language: Language;
}

interface RetreatSlot {
  readonly slug: string;
  readonly image: string;
  readonly alt: Record<Language, string>;
}

interface RetreatDateStop {
  readonly date: string;
  readonly day: string;
  readonly month: string;
}

interface RetreatPrice {
  readonly current: string;
  readonly regular: string | null;
}

interface RetreatCard {
  readonly slug: string;
  readonly image: string;
  readonly alt: string;
  readonly title: string;
  readonly dateLabel: string;
  readonly dateStops: readonly RetreatDateStop[];
  readonly mobileDateLabel: string | null;
  readonly location: string;
  readonly price: RetreatPrice;
  readonly href: string;
  readonly bookingAvailable: boolean;
  readonly statusLabel: string;
}

const RETREAT_SLOTS: readonly RetreatSlot[] = [
  {
    slug: 'sri-lanka-yoga-tour',
    image: '/assets/landing-v3/retreats/sri-lanka.webp',
    alt: {
      ru: 'Пальмы на скалистом мысе у океана на Шри-Ланке',
      en: 'Palm trees on a rocky headland by the ocean in Sri Lanka',
    },
  },
  {
    slug: 'cirali-yoga-tour',
    image: '/assets/landing-v3/retreats/cirali.webp',
    alt: {
      ru: 'Пляж Чиралы с зонтиками у спокойного моря',
      en: 'Sun umbrellas on Cirali beach by the calm sea',
    },
  },
  {
    slug: 'nepal-buddhist-pilgrimage-tour',
    image: '/assets/landing-v3/retreats/nepal.webp',
    alt: {
      ru: 'Буддийская ступа и молитвенные флаги в Непале',
      en: 'A Buddhist stupa and prayer flags in Nepal',
    },
  },
  {
    slug: 'yoga-and-mountains-retreat',
    image: '/assets/landing-v3/retreats/mountains.webp',
    alt: {
      ru: 'Зелёные горные склоны Крконоше',
      en: 'Green mountain slopes in Krkonose',
    },
  },
];

const COPY = {
  ru: {
    label: 'Ретриты',
    unavailable: 'Запись недоступна',
    booking: 'Запись',
    regularPrice: 'Обычная цена:',
    discountedPrice: 'Цена со скидкой:',
    previous: 'Предыдущий ретрит',
    next: 'Следующий ретрит',
    carousel: 'Ретриты: используйте стрелки влево и вправо для просмотра',
    nepalTitle: 'Непал',
  },
  en: {
    label: 'Retreats',
    unavailable: 'Booking unavailable',
    booking: 'Booking',
    regularPrice: 'Regular price:',
    discountedPrice: 'Discounted price:',
    previous: 'Previous retreat',
    next: 'Next retreat',
    carousel: 'Retreats: use the left and right arrow keys to browse',
    nepalTitle: 'Nepal',
  },
} as const;

function getCardPrice(price: string): RetreatPrice {
  const discount = price.trim().match(/^(.+?)\s+early(?:\s+bird)?\s*\/\s*(.+)$/i);
  return discount
    ? { current: discount[1].trim(), regular: discount[2].trim() }
    : { current: price, regular: null };
}

function getRetreatCards(language: Language, retreats: readonly RetreatRecord[]): readonly RetreatCard[] {
  const copy = COPY[language];
  const sectionCopy = landingCopy[language].retreats;
  const today = new Date().toISOString().slice(0, 10);
  const retreatBySlug = new Map<string, RetreatRecord>(
    retreats.map((retreat: RetreatRecord): [string, RetreatRecord] => [
      retreat.slug,
      retreat,
    ]),
  );

  return RETREAT_SLOTS.flatMap((slot: RetreatSlot): readonly RetreatCard[] => {
    const retreat = retreatBySlug.get(slot.slug);

    if (!retreat) {
      return [];
    }

    const isNepal = slot.slug === 'nepal-buddhist-pilgrimage-tour';
    const dateWithoutYear = retreat.dateLabel?.replace(/\b\d{4}\b/g, '').trim();

    return [{
      slug: retreat.slug,
      image: retreat.coverImage.startsWith('/assets/')
        ? getRetreatImageUrl(retreat.coverImage) || slot.image
        : slot.image,
      alt: slot.alt[language],
      title: isNepal ? copy.nepalTitle : retreat.title,
      dateLabel: formatRetreatDateLabel(
        retreat.startDate,
        retreat.endDate,
        retreat.dateLabel,
        sectionCopy.dateLocale,
        language,
      ),
      dateStops: [retreat.startDate, retreat.endDate].map((date: string): RetreatDateStop => {
        const value = new Date(`${date}T12:00:00Z`);
        return {
          date,
          day: new Intl.DateTimeFormat(sectionCopy.dateLocale, { day: '2-digit', timeZone: 'UTC' }).format(value),
          month: new Intl.DateTimeFormat(sectionCopy.dateLocale, { month: 'short', timeZone: 'UTC' })
            .format(value).replace(/\.$/, ''),
        };
      }),
      mobileDateLabel: dateWithoutYear && !/\d/.test(dateWithoutYear) ? dateWithoutYear : null,
      location: retreat.location,
      price: getCardPrice(retreat.price),
      href: `/retreats/${retreat.slug}`,
      bookingAvailable: retreat.status === 'active' && retreat.endDate >= today && Boolean(retreat.bookingUrl),
      statusLabel: copy.unavailable,
    }];
  });
}

function getSnapPositions(track: HTMLDivElement): readonly number[] {
  const maximum = Math.max(0, track.scrollWidth - track.clientWidth);

  return Array.from(track.querySelectorAll<HTMLElement>('[data-retreat-card]')).map(
    (card: HTMLElement): number => Math.max(
      0,
      Math.min(maximum, card.offsetLeft - (track.clientWidth - card.clientWidth) / 2),
    ),
  );
}

function getClosestCardIndex(track: HTMLDivElement): number {
  const positions = getSnapPositions(track);
  let closestIndex = 0;
  let closestDistance = Number.POSITIVE_INFINITY;

  positions.forEach((position: number, index: number): void => {
    const distance = Math.abs(track.scrollLeft - position);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  return closestIndex;
}

export default function RetreatsSection({ language }: RetreatsSectionProps): ReactElement {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [hasOverflow, setHasOverflow] = useState<boolean>(false);
  const [retreats, setRetreats] = useState<readonly RetreatRecord[]>(() => listRetreats('all', language).retreats);
  const cards = getRetreatCards(language, retreats);
  const copy = COPY[language];

  useEffect((): (() => void) => {
    const controller = new AbortController();
    setRetreats(listRetreats('all', language).retreats);
    void fetchRetreats(language, 'all', controller.signal)
      .then((response): void => {
        if (!controller.signal.aborted) {
          setRetreats(response.retreats);
        }
      })
      .catch(() => undefined);
    return (): void => controller.abort();
  }, [language]);

  useEffect((): (() => void) | void => {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    let animationFrame = 0;
    const synchronize = (): void => {
      window.cancelAnimationFrame(animationFrame);
      animationFrame = window.requestAnimationFrame((): void => {
        setActiveIndex(getClosestCardIndex(track));
        setHasOverflow(track.scrollWidth > track.clientWidth + 1);
      });
    };
    const observer = new ResizeObserver(synchronize);

    track.addEventListener('scroll', synchronize, { passive: true });
    observer.observe(track);
    synchronize();

    return (): void => {
      window.cancelAnimationFrame(animationFrame);
      track.removeEventListener('scroll', synchronize);
      observer.disconnect();
    };
  }, [cards.length]);

  function scrollToCard(index: number): void {
    const track = trackRef.current;

    if (!track) {
      return;
    }

    const nextIndex = Math.max(0, Math.min(cards.length - 1, index));
    const left = getSnapPositions(track)[nextIndex] ?? 0;
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    track.scrollTo({ left, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (!hasOverflow) {
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      scrollToCard(activeIndex - 1);
    } else if (event.key === 'ArrowRight') {
      event.preventDefault();
      scrollToCard(activeIndex + 1);
    } else if (event.key === 'Home') {
      event.preventDefault();
      scrollToCard(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      scrollToCard(cards.length - 1);
    }
  }

  return (
    <section
      id='retreats'
      data-v3-section='retreats'
      className={styles.section}
      aria-label={copy.label}
    >
      <div className={styles.inner}>
        <div className={styles.carousel}>
          <button
            type='button'
            className={`${styles.arrow} ${styles.previous}`}
            hidden={!hasOverflow}
            aria-label={copy.previous}
            aria-controls='v3-retreats-track'
            disabled={activeIndex === 0}
            onClick={(): void => scrollToCard(activeIndex - 1)}
          >
            <ArrowLeft size={20} aria-hidden='true' strokeWidth={1.5} />
          </button>
          <div
            ref={trackRef}
            id='v3-retreats-track'
            className={styles.track}
            role='region'
            aria-roledescription={hasOverflow ? (language === 'ru' ? 'карусель' : 'carousel') : undefined}
            aria-label={hasOverflow ? copy.carousel : copy.label}
            tabIndex={hasOverflow ? 0 : undefined}
            onKeyDown={handleKeyDown}
          >
            {cards.map((card: RetreatCard, index: number): ReactElement => (
              <article
                key={card.slug}
                className={styles.card}
                data-retreat-card={card.slug}
                role='group'
                aria-roledescription={hasOverflow ? (language === 'ru' ? 'слайд' : 'slide') : undefined}
                aria-label={`${index + 1} / ${cards.length}: ${card.title}`}
              >
                <Link href={card.href} className={styles.cardLink}>
                  <div className={styles.photoFrame}>
                    <img
                      src={card.image}
                      alt={card.alt}
                      className={styles.photo}
                      width={1200}
                      height={760}
                      loading='lazy'
                      decoding='async'
                    />
                  </div>
                  <div className={styles.cardHeading}>
                    <h2 className={styles.cardTitle}>
                      {card.title}{' '}
                      {!card.bookingAvailable && (
                        <span className={styles.inlineStatus} aria-label={card.statusLabel}>
                          {copy.booking} <span aria-hidden='true'>×</span>
                        </span>
                      )}
                    </h2>
                    {!card.bookingAvailable && <p className={styles.unavailable}>{card.statusLabel}</p>}
                  </div>
                  <div className={styles.dateRoute} aria-label={card.dateLabel}>
                    {card.mobileDateLabel ? (
                      <span className={styles.monthLabel}>{card.mobileDateLabel}</span>
                    ) : (
                      <>
                        <time dateTime={card.dateStops[0].date}>
                          <strong>{card.dateStops[0].day}</strong><span>{card.dateStops[0].month}</span>
                        </time>
                        <span className={styles.routeLine} aria-hidden='true' />
                        <time dateTime={card.dateStops[1].date}>
                          <strong>{card.dateStops[1].day}</strong><span>{card.dateStops[1].month}</span>
                        </time>
                      </>
                    )}
                  </div>
                  <div className={styles.cardCopy}>
                    <p className={styles.date}>
                      <CalendarDays size={14} strokeWidth={1.5} aria-hidden='true' />
                      <span>{card.dateLabel}</span>
                    </p>
                    <p className={styles.location}>
                      <MapPin size={15} strokeWidth={1.5} aria-hidden='true' />
                      <span>{card.location}</span>
                    </p>
                    <div className={styles.cardAction}>
                      <p className={styles.price}>
                        {card.price.regular && (
                          <>
                            <span className={styles.srOnly}>{copy.regularPrice} </span>
                            <s className={styles.regularPrice}>{card.price.regular}</s>
                            <span className={styles.srOnly}>{copy.discountedPrice} </span>
                          </>
                        )}
                        <span className={card.price.regular ? styles.discountedPrice : undefined}>
                          {card.price.current}
                        </span>
                      </p>
                    </div>
                  </div>
                </Link>
              </article>
            ))}
          </div>
          <button
            type='button'
            className={`${styles.arrow} ${styles.next}`}
            hidden={!hasOverflow}
            aria-label={copy.next}
            aria-controls='v3-retreats-track'
            disabled={activeIndex === cards.length - 1}
            onClick={(): void => scrollToCard(activeIndex + 1)}
          >
            <ArrowRight size={20} aria-hidden='true' strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
}
