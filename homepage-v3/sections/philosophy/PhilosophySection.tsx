import { useEffect, useRef, useState, type ReactElement } from 'react';

import { landingCopy } from '@/components/landing-v2/content';
import type { Language } from '@/lib/i18n';

import { photos } from '../../media';
import styles from './PhilosophySection.module.css';

type BodhisattvaPractice = (typeof landingCopy)[Language]['bodhisattvaCta']['practices'][number];

const AUTOPLAY_DELAY = 8000;
const TRANSITION_DURATION = 1000;
const INITIAL_PRACTICE_INDEX = 1;

export default function PhilosophySection({ language }: { language: Language }): ReactElement {
  const sectionRef = useRef<HTMLElement>(null);
  const copy = landingCopy[language].bodhisattvaCta;
  const practices = copy.practices;
  const isRussian: boolean = language === 'ru';
  const [activeIndex, setActiveIndex] = useState<number>(INITIAL_PRACTICE_INDEX);
  const [departingIndex, setDepartingIndex] = useState<number | null>(null);
  const [isInView, setIsInView] = useState<boolean>(false);
  const [isPageVisible, setIsPageVisible] = useState<boolean>(
    (): boolean => typeof document !== 'undefined' && document.visibilityState === 'visible',
  );
  const [prefersReducedMotion, setPrefersReducedMotion] = useState<boolean>(
    (): boolean => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const activePractice = practices[activeIndex];
  const practiceNumber: string = (activePractice.number.match(/\d+/)?.[0] ?? '').padStart(2, '0');
  const canAutoplay: boolean = isInView && isPageVisible && !prefersReducedMotion;

  useEffect((): void => {
    setActiveIndex(INITIAL_PRACTICE_INDEX);
    setDepartingIndex(null);
  }, [language]);

  useEffect((): (() => void) => {
    const motionQuery: MediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updateMotionPreference = (): void => setPrefersReducedMotion(motionQuery.matches);
    const updatePageVisibility = (): void => setIsPageVisible(document.visibilityState === 'visible');
    updateMotionPreference();
    updatePageVisibility();
    motionQuery.addEventListener('change', updateMotionPreference);
    document.addEventListener('visibilitychange', updatePageVisibility);

    return (): void => {
      motionQuery.removeEventListener('change', updateMotionPreference);
      document.removeEventListener('visibilitychange', updatePageVisibility);
    };
  }, [language]);

  useEffect((): (() => void) | void => {
    const section: HTMLElement | null = sectionRef.current;
    if (!section) {
      return;
    }

    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const observer: IntersectionObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]): void => {
        const entry: IntersectionObserverEntry | undefined = entries[0];
        setIsInView(Boolean(entry?.isIntersecting && entry.intersectionRatio >= 0.35));
      },
      { threshold: [0, 0.35] },
    );
    observer.observe(section);

    return (): void => observer.disconnect();
  }, [language]);

  useEffect((): (() => void) | void => {
    if (!canAutoplay) {
      return;
    }

    const timer: number = window.setTimeout((): void => {
      setDepartingIndex(activeIndex);
      setActiveIndex((activeIndex + 1) % practices.length);
    }, AUTOPLAY_DELAY);
    return (): void => window.clearTimeout(timer);
  }, [activeIndex, canAutoplay, language, practices.length]);

  useEffect((): (() => void) | void => {
    if (departingIndex === null) {
      return;
    }

    if (prefersReducedMotion) {
      setDepartingIndex(null);
      return;
    }

    const timer: number = window.setTimeout((): void => setDepartingIndex(null), TRANSITION_DURATION);
    return (): void => window.clearTimeout(timer);
  }, [activeIndex, departingIndex, language, prefersReducedMotion]);

  return (
    <section
      className={styles.section}
      id='bodhisattva-practices'
      data-v3-section='philosophy'
      data-practice-number={practiceNumber}
      data-autoplay-state={prefersReducedMotion ? 'reduced-motion' : canAutoplay ? 'playing' : 'paused'}
      aria-labelledby='v3-philosophy-heading'
      ref={sectionRef}
    >
      <img
        className={styles.ocean}
        src={photos.oceanMovement.src}
        alt=''
        width={photos.oceanMovement.width}
        height={photos.oceanMovement.height}
        loading='lazy'
        decoding='async'
        aria-hidden='true'
      />
      <div className={styles.content}>
        <h2 className={styles.eyebrow} id='v3-philosophy-heading'>
          {isRussian ? '37 ПРАКТИК БОДХИСАТТВЫ' : '37 PRACTICES OF BODHISATTVAS'}
        </h2>
        <figure className={styles.figure}>
          <div className={styles.quotes}>
            {practices.map((practice: BodhisattvaPractice, index: number): ReactElement => {
              const isActive: boolean = index === activeIndex;
              const isDeparting: boolean = index === departingIndex && !isActive;
              const className: string = `${styles.quote} ${isActive
                ? styles.activeQuote : isDeparting ? styles.departingQuote : styles.hiddenQuote}`;

              return (
                <blockquote
                  className={className}
                  key={practice.number}
                  aria-hidden={!isActive}
                  data-animated={isActive && departingIndex !== null && !prefersReducedMotion}
                >
                  <p>{practice.quote}</p>
                </blockquote>
              );
            })}
          </div>
          <figcaption className={styles.attribution}>
            <span aria-hidden='true'>
              {isRussian ? 'По мотивам текста Гьялсе Тогме Зангпо' : 'Inspired by Gyalse Tokme Zangpo'}
            </span>
            <span className={styles.srOnly}>{copy.footnote}</span>
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
