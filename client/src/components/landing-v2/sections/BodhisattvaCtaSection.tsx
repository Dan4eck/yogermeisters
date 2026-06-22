import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useRef, useState, type ReactElement } from 'react';

import type { Language } from '@/lib/i18n';
import { landingCopy } from '../content';
import { ButtonLink } from '../ui';
import styles from './BodhisattvaCtaSection.module.css';

interface BodhisattvaCtaSectionProps {
  language: Language;
}

const portraitSrc = '/assets/landing-v2/teachers/teacher-portrait-bamboo-wall.jpg';

export default function BodhisattvaCtaSection({ language }: BodhisattvaCtaSectionProps): ReactElement {
  const copy = landingCopy[language].bodhisattvaCta;
  const [activeIndex, setActiveIndex] = useState(0);
  const preservedScrollRef = useRef<{ x: number; y: number } | null>(null);
  const activePractice = copy.practices[activeIndex];

  const updateActiveIndex = (getNextIndex: (currentIndex: number) => number): void => {
    const preservedScroll = preservedScrollRef.current ?? { x: window.scrollX, y: window.scrollY };

    setActiveIndex(getNextIndex);
    window.requestAnimationFrame(() => window.scrollTo(preservedScroll.x, preservedScroll.y));
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => window.scrollTo(preservedScroll.x, preservedScroll.y));
    });
    preservedScrollRef.current = null;
  };

  const preserveScroll = (): void => {
    preservedScrollRef.current = { x: window.scrollX, y: window.scrollY };
  };

  const showPrevious = (): void => {
    updateActiveIndex((currentIndex) => (currentIndex === 0 ? copy.practices.length - 1 : currentIndex - 1));
  };

  const showNext = (): void => {
    updateActiveIndex((currentIndex) => (currentIndex + 1) % copy.practices.length);
  };

  return (
    <section className={`section ${styles.section}`} id='cta'>
      <div className={styles.copy}>
        <div className={styles.practiceSwitcher}>
          <button
            className={styles.navButton}
            type='button'
            onPointerDown={preserveScroll}
            onMouseDown={(event) => event.preventDefault()}
            onFocus={(event) => event.currentTarget.blur()}
            onClick={showPrevious}
            aria-label={copy.previousLabel}
          >
            <ChevronLeft aria-hidden='true' />
          </button>

          <article className={styles.practice} aria-live='polite'>
            <blockquote>{activePractice.quote}</blockquote>
            <p className={styles.practiceMeta}>
              {activePractice.number} · {activePractice.title}
            </p>
            <ButtonLink className={styles.ctaButton} href={activePractice.ctaHref}>
              {activePractice.cta}
            </ButtonLink>
          </article>

          <button
            className={styles.navButton}
            type='button'
            onPointerDown={preserveScroll}
            onMouseDown={(event) => event.preventDefault()}
            onFocus={(event) => event.currentTarget.blur()}
            onClick={showNext}
            aria-label={copy.nextLabel}
          >
            <ChevronRight aria-hidden='true' />
          </button>
        </div>

        <p className={styles.footnote}>{copy.footnote}</p>
      </div>

      <div className={styles.portraitWrap}>
        <img className={styles.portrait} src={portraitSrc} alt={copy.portraitAlt} loading='lazy' decoding='async' />
      </div>
    </section>
  );
}
