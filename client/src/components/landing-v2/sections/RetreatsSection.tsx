import { Sparkle } from 'lucide-react';
import { useState, type CSSProperties, type ReactNode } from 'react';
import { Link } from 'wouter';

import { formatRetreatDateLabel } from '@/lib/retreat-date';
import { getRetreatImageUrl } from '@/lib/retreat-assets';
import type { Language } from '@/lib/i18n';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { listRetreats, type RetreatRecord } from '@shared/retreat-content';
import { landingCopy } from '../content';
import { ButtonLink, TitleOrnament } from '../ui';
import styles from './RetreatsSection.module.css';

type RetreatTone = 'mountain' | 'coast' | 'forest';
type RetreatSlug = 'nepal-buddhist-pilgrimage-tour' | 'cirali-yoga-tour' | 'yoga-and-mountains-retreat';
type PhotoStyle = CSSProperties & Record<'--bg-image', string>;

interface RetreatsSectionProps {
  language: Language;
}

interface RetreatCardView {
  readonly id: number;
  readonly title: string;
  readonly slug: RetreatSlug;
  readonly eyebrow?: string;
  readonly text: string;
  readonly tone: RetreatTone;
  readonly image: string;
  readonly isAvailable: boolean;
}

interface RetreatCardFallback {
  readonly title: string;
  readonly text: string;
}

interface RetreatSlot {
  readonly slug: RetreatSlug;
  readonly tone: RetreatTone;
  readonly fallback: Record<Language, RetreatCardFallback>;
}

const retreatSlots: readonly RetreatSlot[] = [
  {
    slug: 'nepal-buddhist-pilgrimage-tour',
    tone: 'mountain',
    fallback: {
      en: {
        title: 'Nepal Buddhist Pilgrimage Tour',
        text: 'August 2026 • Kathmandu Valley & Nagarkot, Nepal • €1450 early / €1650',
      },
      ru: {
        title: 'Буддийский паломнический тур в Непал',
        text: 'Август 2026 • Долина Катманду и Нагаркот, Непал • €1450 early / €1650',
      },
    },
  },
  {
    slug: 'cirali-yoga-tour',
    tone: 'coast',
    fallback: {
      en: {
        title: 'Cirali Yoga Tour',
        text: '10 - 16 October • Cirali, Lycian Coast, Turkey • €750',
      },
      ru: {
        title: 'Чиралы Йога Тур',
        text: '10 - 16 октября • Чиралы, Ликийское побережье, Турция • €750',
      },
    },
  },
  {
    slug: 'yoga-and-mountains-retreat',
    tone: 'forest',
    fallback: {
      en: {
        title: 'Yoga & Mountains Retreat',
        text: '13 - 15 March • Krkonose, Czech Republic • 5,699 CZK early / 6,399 CZK',
      },
      ru: {
        title: 'Йога и Горы',
        text: '13 - 15 марта • Крконоше, Чехия • 5,699 CZK early / 6,399 CZK',
      },
    },
  },
];

const toneClass: Record<RetreatTone, string> = {
  mountain: styles.mountain,
  coast: styles.coast,
  forest: styles.forest,
};

const fallbackImageBySlug: Record<RetreatSlug, string> = {
  'nepal-buddhist-pilgrimage-tour': '/assets/landing-v2/retreats/thumb-nepal-retreat.jpg',
  'cirali-yoga-tour': '/assets/landing-v2/retreats/thumb-cirali-retreat.jpeg',
  'yoga-and-mountains-retreat': '/assets/landing-v2/retreats/thumb-prague-retreat.png',
};

function isRetreatAvailable(retreat: RetreatRecord | undefined, today: string): boolean {
  return Boolean(retreat && retreat.status === 'active' && retreat.endDate >= today);
}

export default function RetreatsSection({ language }: RetreatsSectionProps) {
  const [unavailableRetreat, setUnavailableRetreat] = useState<RetreatCardView | null>(null);
  const sectionCopy = landingCopy[language].retreats;
  const data = listRetreats('all', language);
  const retreats = data.retreats;
  const today = new Date().toISOString().slice(0, 10);
  const retreatBySlug = new Map(retreats.map((retreat) => [retreat.slug, retreat]));
  const cards: readonly RetreatCardView[] = retreatSlots.map(({ slug, tone, fallback }, index) => {
    const retreat = retreatBySlug.get(slug);
    const fallbackCopy = fallback[language];
    const dateLabel = retreat
      ? formatRetreatDateLabel(retreat.startDate, retreat.endDate, retreat.dateLabel, sectionCopy.dateLocale, language)
      : null;

    return {
      id: retreat?.id ?? -(index + 1),
      title: retreat?.title ?? fallbackCopy.title,
      slug,
      eyebrow: index === 0 ? sectionCopy.featuredEyebrow : undefined,
      text: retreat && dateLabel ? `${dateLabel} • ${retreat.location} • ${retreat.price}` : fallbackCopy.text,
      tone,
      image: (retreat ? getRetreatImageUrl(retreat.coverImage) : '') || fallbackImageBySlug[slug],
      isAvailable: isRetreatAvailable(retreat, today),
    };
  });
  const [featured, ...secondaryItems] = cards;

  const renderCardContent = (card: RetreatCardView): ReactNode => (
    <>
      <div className={styles.cardCopy}>
        {card.eyebrow ? (
          <span className={styles.featuredLabel}>
            <Sparkle aria-hidden='true' />
            {card.eyebrow}
          </span>
        ) : null}
        <h3>{card.title}</h3>
        <span className={styles.titleRule}></span>
        <p>{card.text}</p>
      </div>
      <div
        className={styles.photoPlaceholder}
        style={{ '--bg-image': `url(${card.image})` } as PhotoStyle}
        aria-hidden='true'
      ></div>
    </>
  );

  const renderCard = (card: RetreatCardView, className: string): ReactNode => {
    const cardClassName = `${className}${card.isAvailable ? '' : ` ${styles.unavailable}`}`;

    if (card.isAvailable) {
      return (
        <Link href={`/retreats/${card.slug}`}>
          <a className={cardClassName}>{renderCardContent(card)}</a>
        </Link>
      );
    }

    return (
      <button className={cardClassName} type='button' onClick={() => setUnavailableRetreat(card)}>
        {renderCardContent(card)}
      </button>
    );
  };

  return (
    <section className={`section ${styles.section}${language === 'ru' ? ` ${styles.ru}` : ''}`} id='retreats'>
      <div className={styles.copy}>
        {language === 'ru' ? null : <span className={styles.mantra}>{sectionCopy.mantra}</span>}
        <h2>{sectionCopy.title}</h2>
        <TitleOrnament className={styles.ornament} />
        <p>{sectionCopy.description}</p>
        <ButtonLink className={styles.button} href='#contact'>
          {sectionCopy.bookRetreat}
        </ButtonLink>
      </div>

      {featured ? (
        <div className={styles.cards} aria-label={sectionCopy.destinationsLabel}>
          {renderCard(featured, `${styles.card} ${styles.featured} ${toneClass[featured.tone]}`)}

          <div className={styles.sideCards}>
            {secondaryItems.map((item) => (
              <div key={item.slug}>
                {renderCard(item, `${styles.card} ${styles.sideCard} ${toneClass[item.tone]}`)}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {!featured ? (
        <div className={`${styles.cards} ${styles.stateCard}`}>
          {sectionCopy.empty}
        </div>
      ) : null}

      <Dialog open={Boolean(unavailableRetreat)} onOpenChange={(open) => !open && setUnavailableRetreat(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{sectionCopy.unavailableTitle}</DialogTitle>
            <DialogDescription>{sectionCopy.unavailableDescription}</DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  );
}
