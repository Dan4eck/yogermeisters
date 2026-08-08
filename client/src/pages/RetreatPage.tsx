import { useEffect, useState } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Calendar, ExternalLink, MapPin } from 'lucide-react';

import Header from '@/components/landing-v2/Header';
import { landingCopy } from '@/components/landing-v2/content';
import { getRetreatImageUrl } from '@/lib/retreat-assets';
import { fetchRetreat } from '@/lib/retreat-api';
import { formatRetreatDateLabel } from '@/lib/retreat-date';
import type { Language } from '@/lib/i18n';
import { openExternal } from '@/lib/open-external';
import { getRetreatBySlug } from '@shared/retreat-content';
import styles from './RetreatPage.module.css';

interface RetreatPageProps {
  slug: string;
  language: Language;
  setLanguage: (language: Language) => void;
}

const fallbackImageBySlug: Record<string, string> = {
  'nepal-buddhist-pilgrimage-tour': '/assets/landing-v2/retreats/thumb-nepal-retreat.jpg',
  'cirali-yoga-tour': '/assets/landing-v2/retreats/thumb-cirali-retreat.jpeg',
  'yoga-and-mountains-retreat': '/assets/landing-v2/retreats/thumb-prague-retreat.png',
};

export default function RetreatPage({ slug, language, setLanguage }: RetreatPageProps) {
  const copy = landingCopy[language].retreats;
  const [retreat, setRetreat] = useState(() => getRetreatBySlug(slug, language));

  useEffect(() => {
    const controller = new AbortController();
    setRetreat(getRetreatBySlug(slug, language));
    void fetchRetreat(slug, language, controller.signal)
      .then(setRetreat)
      .catch(() => undefined);
    return () => controller.abort();
  }, [language, slug]);

  const coverImage = retreat ? getRetreatImageUrl(retreat.coverImage) || fallbackImageBySlug[retreat.slug] : '';
  const dateLabel = retreat
    ? formatRetreatDateLabel(retreat.startDate, retreat.endDate, retreat.dateLabel, copy.dateLocale, language)
    : '';

  return (
    <div className={`landing-v2-root ${styles.page}`}>
      <Header language={language} setLanguage={setLanguage} />

      <main className={styles.main}>
        <div className={styles.topbar}>
          <Link href='/#retreats' className={styles.backLink}>
            <ArrowLeft aria-hidden='true' />
            {copy.backToRetreats}
          </Link>
        </div>

        {!retreat ? <StatePanel>{copy.detailError}</StatePanel> : null}

        {retreat ? (
          <>
            <section className={styles.hero}>
              <div className={styles.heroCopy}>
                <div className={styles.meta}>
                  <span>{retreat.price}</span>
                  <span>
                    <Calendar aria-hidden='true' />
                    {dateLabel}
                  </span>
                </div>
                <h1>{retreat.title}</h1>
                <p className={styles.location}>
                  <MapPin aria-hidden='true' />
                  {retreat.location}
                </p>
                <button className={styles.primaryButton} type='button' onClick={() => openExternal(retreat.bookingUrl)}>
                  {copy.bookRetreat}
                  <ExternalLink aria-hidden='true' />
                </button>
              </div>

              <div className={styles.heroImage}>
                {coverImage ? <img src={coverImage} alt={retreat.title} loading='eager' decoding='async' /> : null}
              </div>
            </section>

            <section className={styles.content}>
              {retreat.postBlocks.map((block) => {
                if (block.type === 'heading') {
                  return <h2 key={block.id}>{block.text}</h2>;
                }

                if (block.type === 'paragraph') {
                  return <p key={block.id}>{block.text}</p>;
                }

                if (block.type === 'callout') {
                  return (
                    <div key={block.id} className={`${styles.callout} ${getCalloutClass(block.variant)}`}>
                      <p>{block.text}</p>
                    </div>
                  );
                }

                if (block.type === 'countdown') {
                  return (
                    <CountdownBlock
                      key={block.id}
                      deadline={block.deadline}
                      priceCurrent={block.priceCurrent}
                      priceCompare={block.priceCompare}
                      language={language}
                    />
                  );
                }

                const image = block.image ? getRetreatImageUrl(block.image) : '';

                if (!image) {
                  return null;
                }

                return (
                  <figure key={block.id} className={styles.imageBlock}>
                    <img src={image} alt={block.alt ?? retreat.title} loading='lazy' decoding='async' />
                  </figure>
                );
              })}

              <div className={styles.ctaPanel}>
                <div>
                  <h2>{copy.detailCtaTitle}</h2>
                  <p>{copy.detailCtaDescription}</p>
                </div>
                <button className={styles.primaryButton} type='button' onClick={() => openExternal(retreat.bookingUrl)}>
                  {copy.bookRetreat}
                  <ExternalLink aria-hidden='true' />
                </button>
              </div>
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}

interface ChildrenProps {
  children: string;
}

function StatePanel({ children }: ChildrenProps) {
  return <div className={styles.statePanel}>{children}</div>;
}

interface CountdownBlockProps {
  deadline?: string;
  priceCurrent?: string;
  priceCompare?: string;
  language: Language;
}

function CountdownBlock({ deadline, priceCurrent, priceCompare, language }: CountdownBlockProps) {
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(deadline));

  useEffect(() => {
    setTimeLeft(getTimeLeft(deadline));

    const timer = window.setInterval(() => {
      setTimeLeft(getTimeLeft(deadline));
    }, 1000);

    return () => window.clearInterval(timer);
  }, [deadline]);

  if (!timeLeft) {
    return null;
  }

  const labels =
    language === 'ru'
      ? { days: 'дней', hours: 'часов', minutes: 'минут', seconds: 'секунд' }
      : { days: 'days', hours: 'hours', minutes: 'minutes', seconds: 'seconds' };

  return (
    <div className={styles.countdown}>
      <div className={styles.priceLine}>
        {priceCurrent ? <strong>{priceCurrent}</strong> : null}
        {priceCompare ? <span>{priceCompare}</span> : null}
      </div>
      <div className={styles.countdownGrid}>
        <CountdownUnit value={timeLeft.days} label={labels.days} />
        <CountdownUnit value={timeLeft.hours} label={labels.hours} />
        <CountdownUnit value={timeLeft.minutes} label={labels.minutes} />
        <CountdownUnit value={timeLeft.seconds} label={labels.seconds} />
      </div>
    </div>
  );
}

interface CountdownUnitProps {
  value: number;
  label: string;
}

function CountdownUnit({ value, label }: CountdownUnitProps) {
  return (
    <span>
      <strong>{String(value).padStart(2, '0')}</strong>
      <small>{label}</small>
    </span>
  );
}

function getTimeLeft(
  deadline?: string,
): { days: number; hours: number; minutes: number; seconds: number } | null {
  if (!deadline) {
    return null;
  }

  const baseTarget = new Date(deadline).getTime();
  if (Number.isNaN(baseTarget)) {
    return null;
  }

  const diff = baseTarget - Date.now();
  if (diff <= 0) {
    return null;
  }

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

function getCalloutClass(variant?: string): string {
  if (variant === 'cta') {
    return styles.calloutCta;
  }

  if (variant === 'sunrise') {
    return styles.calloutSunrise;
  }

  if (variant === 'lagoon') {
    return styles.calloutLagoon;
  }

  if (variant === 'outline') {
    return styles.calloutOutline;
  }

  return styles.calloutSoft;
}
