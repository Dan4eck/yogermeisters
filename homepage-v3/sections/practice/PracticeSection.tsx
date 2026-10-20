import { useEffect, useRef, useState } from 'react';
import type { ReactElement } from 'react';
import { ArrowUpRight, Play } from 'lucide-react';

import { landingCopy } from '@/components/landing-v2/content';
import type { Language } from '@/lib/i18n';

import styles from './PracticeSection.module.css';

interface PracticeSectionProps {
  readonly language: Language;
}

const COPY = {
  ru: {
    title: ['Почувствуй', 'до первого', 'занятия.'],
    loading: 'Загружаем видео…',
  },
  en: {
    title: ['Feel it', 'before your', 'first class.'],
    loading: 'Loading the video…',
  },
} as const;

function getPlaybackSrc(src: string): string {
  const url = new URL(src);
  url.searchParams.set('autoplay', '1');
  url.searchParams.set('rel', '0');
  return url.toString();
}

export default function PracticeSection({ language }: PracticeSectionProps): ReactElement {
  const copy = landingCopy[language].practice;
  const labels = COPY[language];
  const videoId = new URL(copy.video.src).pathname.split('/').pop();
  const thumbnailSrc = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
  const [hasStarted, setHasStarted] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const playerRef = useRef<HTMLIFrameElement>(null);

  useEffect((): void => {
    if (hasStarted) {
      playerRef.current?.focus();
    }
  }, [hasStarted]);

  function startPractice(): void {
    if (hasStarted) {
      playerRef.current?.focus();
      return;
    }
    setIsLoaded(false);
    setHasStarted(true);
  }

  function handlePlayerLoad(): void {
    setIsLoaded(true);
  }

  return (
    <section
      id='practice'
      className={styles.section}
      data-v3-section='practice'
      data-v3-scene='practice'
      aria-labelledby='v3-practice-heading'
      lang={language}
    >
      <div className={styles.content}>
        <div className={styles.copy} data-practice-copy>
          <h2 id='v3-practice-heading' className={styles.title}>
            {labels.title.map((line: string): ReactElement => (
              <span key={line}>{line}{' '}</span>
            ))}
          </h2>
          <p className={styles.description}>{copy.description}</p>
          <button
            className={styles.primaryButton}
            type='button'
            onClick={startPractice}
            aria-controls='v3-practice-player'
          >
            {copy.primaryCta}
            <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden='true' />
          </button>
        </div>

        <figure className={styles.media} data-practice-media>
          <div
            id='v3-practice-player'
            className={styles.frame}
            role='group'
            aria-label={copy.frameLabel}
            aria-busy={hasStarted && !isLoaded}
          >
            {hasStarted ? (
              <>
                <iframe
                  ref={playerRef}
                  className={styles.player}
                  src={getPlaybackSrc(copy.video.src)}
                  title={copy.video.title}
                  allow='autoplay; encrypted-media; picture-in-picture'
                  allowFullScreen
                  loading='lazy'
                  onLoad={handlePlayerLoad}
                />
                {!isLoaded && (
                  <p className={styles.loading} role='status' aria-live='polite'>
                    {labels.loading}
                  </p>
                )}
              </>
            ) : (
              <>
                <img
                  className={styles.poster}
                  src={thumbnailSrc}
                  width={1280}
                  height={720}
                  alt={copy.video.title}
                  loading='lazy'
                  decoding='async'
                />
                <button
                  className={styles.playButton}
                  type='button'
                  onClick={startPractice}
                  aria-label={copy.primaryCta}
                  aria-controls='v3-practice-player'
                >
                  <Play size={42} strokeWidth={1} fill='currentColor' aria-hidden='true' />
                </button>
              </>
            )}
          </div>
        </figure>
      </div>
    </section>
  );
}
