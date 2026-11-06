import type { ReactElement } from 'react';

import { landingCopy } from '@/components/landing-v2/content';
import type { Language } from '@/lib/i18n';

import { photos } from '../../media';
import styles from './AboutSection.module.css';

interface AboutSectionProps {
  readonly language: Language;
}

type AboutDetail = (typeof landingCopy)[Language]['himalayan']['details'][number];

const COPY = {
  ru: {
    eyebrow: '01 / О ПОДХОДЕ',
    title: ['Движение.', 'Дыхание.', 'Тишина'],
    credit: 'Анастасия Пальяччи / Himalayan Yoga',
    yogaLabel: 'Практика йоги',
    meditationLabel: 'Медитация',
  },
  en: {
    eyebrow: '01 / THE APPROACH',
    title: ['Movement.', 'Breath.', 'Stillness'],
    credit: 'Anastasia Pagliacci / Himalayan Yoga',
    yogaLabel: 'Yoga Practice',
    meditationLabel: 'Meditation',
  },
} as const;

export default function AboutSection({ language }: AboutSectionProps): ReactElement {
  const copy = COPY[language];
  const details = landingCopy[language].himalayan.details;
  const yoga = details.find((detail: AboutDetail): boolean => detail.label === copy.yogaLabel) ?? details[1];
  const meditation = details.find((detail: AboutDetail): boolean => detail.label === copy.meditationLabel) ?? details[0];
  const portrait = photos.braidedPortrait;

  return (
    <section
      id='about'
      className={styles.section}
      data-v3-scene='about'
      data-v3-section='about'
      aria-labelledby='v3-about-heading'
      lang={language}
    >
      <div className={styles.content} data-about-copy>
        <header className={styles.header}>
          <p className={styles.eyebrow} data-about-text>{copy.eyebrow}</p>
          <h2 id='v3-about-heading' className={styles.title}>
            <span data-about-text>{copy.title[0]}</span>{' '}
            <span data-about-text>{copy.title[1]}</span>{' '}
            <span data-about-text>{copy.title[2]}<span className={styles.fullStop}>.</span></span>
          </h2>
          <p className={styles.credit} data-about-text>{copy.credit}</p>
        </header>

        <figure className={styles.portrait} data-about-portrait>
          <div className={styles.portraitPrint}>
            <img
              src={portrait.src}
              width={portrait.width}
              height={portrait.height}
              alt={portrait.alt[language]}
              loading='lazy'
              decoding='async'
            />
          </div>
        </figure>

        <div className={styles.details}>
          <article className={styles.detail} data-about-text>
            <h3>{yoga.title}</h3>
            <p>{yoga.text}</p>
          </article>
          <article className={styles.detail} data-about-text>
            <h3>{meditation.title}</h3>
            <p>{meditation.text}</p>
          </article>
        </div>
      </div>
    </section>
  );
}
