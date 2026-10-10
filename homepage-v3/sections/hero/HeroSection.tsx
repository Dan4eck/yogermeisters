import type { ReactElement } from 'react';
import { ArrowUpRight } from 'lucide-react';

import type { Language } from '@/lib/i18n';

import { photos } from '../../media';
import styles from './HeroSection.module.css';

interface HeroSectionProps {
  readonly language: Language;
}

type HeroPhotoKey = keyof typeof photos;

interface HeroTile {
  readonly photo: HeroPhotoKey;
  readonly position?: string;
}

const HERO_TILES: readonly HeroTile[] = [
  { photo: 'braidedPortrait', position: '50% 38%' },
  { photo: 'sunsetBreath', position: '50% 55%' },
  { photo: 'oceanMovement', position: '50% 82%' },
  { photo: 'prayerFlagsPortrait', position: '50% 48%' },
  { photo: 'studioBackbend', position: '50% 56%' },
  { photo: 'mirrorPortrait', position: '50% 35%' },
  { photo: 'waterfallMeditation', position: '50% 62%' },
  { photo: 'rockPose', position: '50% 35%' },
  { photo: 'rockStanding', position: '50% 35%' },
  { photo: 'paddleboardYoga', position: '50% 55%' },
];

const COPY = {
  ru: {
    statement: ['Между движением', 'и тишиной рождается практика'],
    classes: 'Выбрать занятие',
    retreats: 'Ретриты',
  },
  en: {
    statement: ['Between movement', 'and stillness, there is practice'],
    classes: 'Find your practice',
    retreats: 'Retreats',
  },
} as const;

export default function HeroSection({ language }: HeroSectionProps): ReactElement {
  const copy = COPY[language];

  return (
    <section
      id='home'
      className={styles.section}
      data-v3-scene='hero'
      data-v3-section='hero'
      aria-labelledby='v3-hero-heading'
    >
      <div className={styles.camera} data-hero-camera aria-hidden='true'>
        {HERO_TILES.map((tile: HeroTile, index: number): ReactElement => {
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
          <span aria-hidden='true'>Yogermeisters.</span>
          <span aria-hidden='true'>Himalayan</span>
          <span aria-hidden='true'>Yoga.</span>
        </h1>
      </div>

      <div className={styles.bottom} data-hero-bottom>
        <p className={styles.statement}>
          <span>{copy.statement[0]}</span>
          <span>{copy.statement[1]}</span>
        </p>

        <div className={styles.actions}>
          <a className={styles.action} href='#classes'>
            <span>{copy.classes}</span>
            <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden='true' />
          </a>
          <a className={styles.action} href='#retreats'>
            <span>{copy.retreats}</span>
            <ArrowUpRight size={18} strokeWidth={1.5} aria-hidden='true' />
          </a>
        </div>
      </div>
    </section>
  );
}
