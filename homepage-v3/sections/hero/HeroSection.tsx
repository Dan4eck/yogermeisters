import type { ReactElement } from 'react';

import type { Language } from '@/lib/i18n';

import { photos } from '../../media';
import { getRhythmPhotos, heroStudies, isHeroStudy, type HeroTile } from './hero-studies';
import styles from './HeroSection.module.css';

interface HeroSectionProps {
  readonly language: Language;
}

const HERO_TILES: readonly HeroTile[] = [
  { photo: 'sunsetBreath', position: '50% 55%' },
  { photo: 'retreatCampfire', position: '50% 60%' },
  { photo: 'prayerFlagsPortrait', position: '50% 48%' },
  { photo: 'studioAssistedPractice', position: '50% 65%' },
  { photo: 'waterfallWalk', position: '35% 65%' },
  { photo: 'studioSeatedMeditation', position: '50% 48%' },
  { photo: 'mountainMeditation', position: '45% 65%' },
  { photo: 'prayerFlagsWalk', position: '50% 65%' },
  { photo: 'templeRoof', position: '65% 50%' },
];

const FIVE_PHOTO_TILES: readonly HeroTile[] = [
  { photo: 'sunsetBreath', position: '50% 55%' },
  { photo: 'templeRoof', position: '65% 50%' },
  { photo: 'studioAssistedPractice', position: '50% 62%' },
  { photo: 'mountainMeditation', position: '45% 65%' },
  { photo: 'studioSeatedMeditation', position: '42% 70%' },
];

const COPY = {
  ru: {
    statement: 'Между движением и тишиной рождается практика',
  },
  en: {
    statement: 'Between movement and stillness, there is practice',
  },
} as const;

export default function HeroSection({ language }: HeroSectionProps): ReactElement {
  const copy = COPY[language];
  const params = new URLSearchParams(window.location.search);
  const requestedVariant = params.get('hero') ?? 'rhythm';
  const variant = isHeroStudy(requestedVariant) || ['five', 'nine'].includes(requestedVariant)
    ? requestedVariant
    : 'rhythm';
  const study = isHeroStudy(variant) ? heroStudies[variant] : undefined;
  const tiles: readonly HeroTile[] = variant === 'rhythm'
    ? getRhythmPhotos(params.get('photos') ?? 'balanced')
    : study?.tiles ?? (variant === 'five' ? FIVE_PHOTO_TILES : HERO_TILES);
  const variantClass = study ? `${styles.study} ${styles[variant]}` : variant === 'five' ? styles.fivePhotos : '';

  return (
    <section
      id='home'
      className={`${styles.section} ${variantClass}`}
      data-v3-scene='hero'
      data-v3-section='hero'
      data-hero-study={study ? variant : undefined}
      aria-labelledby='v3-hero-heading'
    >
      <div className={styles.camera} data-hero-camera aria-hidden='true'>
        {tiles.map((tile: HeroTile, index: number): ReactElement => {
          const photo = photos[tile.photo];

          return (
            <div
              key={tile.photo}
              className={styles.tile}
              data-hero-tile={index}
              data-hero-photo={tile.photo}
            >
              <div className={styles.tileMedia} data-hero-crop='natural'>
                <img
                  className={styles.photo}
                  src={photo.src}
                  width={photo.width}
                  height={photo.height}
                  alt={photo.alt[language]}
                  style={{ objectPosition: tile.position ?? photo.position }}
                  loading='eager'
                  decoding='async'
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className={styles.shade} data-hero-shade aria-hidden='true' />

      <div className={styles.copy} data-hero-copy>
        <h1
          id='v3-hero-heading'
          className={styles.headline}
          aria-label='Yogermeisters. Himalayan Yoga.'
          lang='en'
        >
          <span aria-hidden='true'>Yogermeisters<b className={styles.brandDot}>.</b></span>
          <span aria-hidden='true'>Himalayan</span>
          <span aria-hidden='true'>Yoga.</span>
        </h1>
      </div>

      <div className={styles.bottom} data-hero-bottom>
        <p className={styles.statement}>{copy.statement}</p>
      </div>
    </section>
  );
}
