import { useEffect, useRef, useState, type KeyboardEvent, type ReactElement } from 'react';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { Link } from 'wouter';

import { landingCopy } from '@/components/landing-v2/content';
import type { Language } from '@/lib/i18n';
import { formatRetreatDateLabel } from '@/lib/retreat-date';
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

interface RetreatCard {
  readonly retreat: RetreatRecord;
  readonly image: string;
  readonly alt: string;
  readonly title: string;
  readonly subtitle?: string;
  readonly dateLabel: string;
  readonly isAvailable: boolean;
}

const RETREAT_SLOTS: readonly RetreatSlot[] = [
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
    eyebrow: '03 / РЕТРИТЫ',
    headline: ['Дальше от рутины.', 'Ближе к себе.'],
    explore: 'Посмотреть ретрит',
    unavailable: 'Запись недоступна',
    previous: 'Предыдущий ретрит',
    next: 'Следующий ретрит',
    carousel: 'Ретриты: используйте стрелки влево и вправо для просмотра',
    pagination: 'Выбор ретрита',
    show: 'Показать ретрит',
    current: 'Текущий ретрит',
    nepalTitle: 'Непал',
    nepalSubtitle: 'Буддийский паломнический тур',
  },
  en: {
    eyebrow: '03 / RETREATS',
    headline: ['Further from routine.', 'Closer to yourself.'],
    explore: 'Explore retreat',
    unavailable: 'Booking unavailable',
    previous: 'Previous retreat',
    next: 'Next retreat',
    carousel: 'Retreats: use the left and right arrow keys to browse',
    pagination: 'Choose a retreat',
    show: 'Show retreat',
    current: 'Current retreat',
    nepalTitle: 'Nepal',
    nepalSubtitle: 'Buddhist pilgrimage',
  },
} as const;

function getRetreatCards(language: Language): readonly RetreatCard[] {
  const copy = COPY[language];
  const sectionCopy = landingCopy[language].retreats;
  const today = new Date().toISOString().slice(0, 10);
  const retreatBySlug = new Map<string, RetreatRecord>(
    listRetreats('all', language).retreats.map((retreat: RetreatRecord): [string, RetreatRecord] => [
      retreat.slug,
      retreat,
    ]),
  );

  return RETREAT_SLOTS.map((slot: RetreatSlot): RetreatCard => {
    const retreat = retreatBySlug.get(slot.slug);

    if (!retreat) {
      throw new Error(`Retreat content is missing for ${slot.slug}`);
    }

    const isNepal = slot.slug === 'nepal-buddhist-pilgrimage-tour';

    return {
      retreat,
      image: slot.image,
      alt: slot.alt[language],
      title: isNepal ? copy.nepalTitle : retreat.title,
      subtitle: isNepal ? copy.nepalSubtitle : undefined,
      dateLabel: formatRetreatDateLabel(
        retreat.startDate,
        retreat.endDate,
        retreat.dateLabel,
        sectionCopy.dateLocale,
        language,
      ),
      isAvailable: retreat.status === 'active' && retreat.endDate >= today,
    };
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
  const cards = getRetreatCards(language);
  const copy = COPY[language];

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
  }, []);

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
      aria-labelledby='v3-retreats-heading'
    >
      <div className={styles.inner}>
        <header className={styles.header}>
          <p className={styles.eyebrow}>{copy.eyebrow}</p>
          <h2 id='v3-retreats-heading' className={styles.headline}>
            <span>{copy.headline[0]}</span>{' '}
            <span>{copy.headline[1]}</span>
          </h2>
          <p className={styles.description}>{landingCopy[language].retreats.description}</p>
        </header>

        <div
          ref={trackRef}
          id='v3-retreats-track'
          className={styles.track}
          role='region'
          aria-roledescription={language === 'ru' ? 'карусель' : 'carousel'}
          aria-label={copy.carousel}
          tabIndex={0}
          onKeyDown={handleKeyDown}
        >
          {cards.map((card: RetreatCard, index: number): ReactElement => (
            <article
              key={card.retreat.slug}
              className={styles.card}
              data-retreat-card={card.retreat.slug}
              role='group'
              aria-roledescription={language === 'ru' ? 'слайд' : 'slide'}
              aria-label={`${index + 1} / ${cards.length}: ${card.retreat.title}`}
            >
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
              <div className={styles.cardCopy}>
                <h3 className={styles.cardTitle} aria-label={card.retreat.title}>{card.title}</h3>
                {card.subtitle ? <p className={styles.subtitle}>{card.subtitle}</p> : null}
                <p className={styles.metadata}>
                  <span>{card.dateLabel}</span>
                  <span aria-hidden='true'> · </span>
                  <span>{card.retreat.location}</span>
                  <span aria-hidden='true'> · </span>
                  <span>{card.retreat.price}</span>
                </p>
                <div className={styles.cardAction}>
                  {card.isAvailable ? (
                    <Link href={`/retreats/${card.retreat.slug}`} className={styles.explore}>
                      {copy.explore}
                      <ArrowUpRight size={17} aria-hidden='true' strokeWidth={1.5} />
                    </Link>
                  ) : (
                    <p className={styles.unavailable}>{copy.unavailable}</p>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        <div className={styles.controls}>
          <button
            type='button'
            className={styles.arrow}
            aria-label={copy.previous}
            aria-controls='v3-retreats-track'
            disabled={activeIndex === 0}
            onClick={(): void => scrollToCard(activeIndex - 1)}
          >
            <ArrowLeft size={20} aria-hidden='true' strokeWidth={1.5} />
          </button>
          <div className={styles.controlStatus}>
            <p className={styles.counter} aria-live='polite' aria-atomic='true'>
              <span className={styles.visuallyHidden}>{copy.current}: </span>
              {String(activeIndex + 1).padStart(2, '0')} / {String(cards.length).padStart(2, '0')}
            </p>
            <div className={styles.dots} role='group' aria-label={copy.pagination}>
              {cards.map((card: RetreatCard, index: number): ReactElement => (
                <button
                  key={card.retreat.slug}
                  type='button'
                  className={`${styles.dot}${index === activeIndex ? ` ${styles.activeDot}` : ''}`}
                  aria-label={`${copy.show}: ${card.retreat.title}`}
                  aria-current={index === activeIndex ? 'true' : undefined}
                  aria-controls='v3-retreats-track'
                  onClick={(): void => scrollToCard(index)}
                >
                  <span aria-hidden='true' />
                </button>
              ))}
            </div>
          </div>
          <button
            type='button'
            className={styles.arrow}
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
