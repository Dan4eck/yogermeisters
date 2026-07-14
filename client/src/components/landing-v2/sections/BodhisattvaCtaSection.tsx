import type { ReactElement } from 'react';

import type { Language } from '@/lib/i18n';
import { landingCopy } from '../content';
import { ButtonLink } from '../ui';
import VajraIcon from '../VajraIcon';
import styles from './BodhisattvaCtaSection.module.css';

interface BodhisattvaCtaSectionProps {
  language: Language;
}

export default function BodhisattvaCtaSection({ language }: BodhisattvaCtaSectionProps): ReactElement {
  const copy = landingCopy[language].bodhisattvaCta;

  return (
    <section className={`section ${styles.section}`} id='cta'>
      <header className={styles.header}>
        <h2>{copy.title}</h2>
      </header>

      <div className={styles.paths}>
        <article className={styles.pathCard}>
          <img
            className={`${styles.cardIllustration} ${styles.personalIllustration}`}
            src='/assets/landing-v2/icons/practice.png'
            alt=''
            aria-hidden='true'
          />
          <span className={styles.cardNumber}>01</span>
          <h3>{copy.practiceTitle}</h3>
          <p>{copy.practiceText}</p>
          <ButtonLink className={styles.pathButton} href='#classes'>
            {copy.practiceCta}
          </ButtonLink>
        </article>

        <article className={`${styles.pathCard} ${styles.retreatCard}`}>
          <img
            className={`${styles.cardIllustration} ${styles.retreatIllustration}`}
            src='/assets/landing-v2/icons/retreat.png'
            alt=''
            aria-hidden='true'
          />
          <span className={styles.cardNumber}>02</span>
          <h3>{copy.retreatTitle}</h3>
          <p>{copy.retreatText}</p>
          <ButtonLink className={styles.pathButton} href='#retreats'>
            {copy.retreatCta}
          </ButtonLink>
        </article>

        <article className={`${styles.pathCard} ${styles.courseCard}`}>
          <VajraIcon className={`${styles.cardIllustration} ${styles.courseIllustration}`} aria-hidden='true' />
          <span className={styles.cardNumber}>03</span>
          <h3>{copy.courseTitle}</h3>
          <p>{copy.courseText}</p>
          <ButtonLink className={styles.pathButton} href='/the-yoga-method'>
            {copy.courseCta}
          </ButtonLink>
        </article>
      </div>

      <footer className={styles.contact}>
        <div>
          <span>Yogermeisters</span>
          <p>{copy.location}</p>
        </div>
        <p className={styles.helpText}>{copy.helpText}</p>
      </footer>
    </section>
  );
}
