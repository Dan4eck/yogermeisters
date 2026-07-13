import { Flower2, Send } from 'lucide-react';
import type { ReactElement } from 'react';

import type { Language } from '@/lib/i18n';
import { landingCopy, telegramUrl } from '../content';
import { ButtonLink } from '../ui';
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
        <p>{copy.description}</p>
      </header>

      <div className={styles.paths}>
        <article className={styles.pathCard}>
          <span className={styles.cardNumber}>01</span>
          <h3>{copy.practiceTitle}</h3>
          <p>{copy.practiceText}</p>
          <ButtonLink className={styles.pathButton} href='#classes'>
            {copy.practiceCta}
          </ButtonLink>
        </article>

        <article className={`${styles.pathCard} ${styles.retreatCard}`}>
          <Flower2 aria-hidden='true' className={styles.flower} />
          <span className={styles.cardNumber}>02</span>
          <h3>{copy.retreatTitle}</h3>
          <p>{copy.retreatText}</p>
          <ButtonLink className={styles.pathButton} href='#retreats'>
            {copy.retreatCta}
          </ButtonLink>
        </article>
      </div>

      <footer className={styles.contact}>
        <div>
          <span>Yogermeisters</span>
          <p>{copy.location}</p>
        </div>
        <p className={styles.helpText}>{copy.helpText}</p>
        <ButtonLink className={styles.contactButton} href={telegramUrl} icon={Send}>
          {copy.helpCta}
        </ButtonLink>
      </footer>
    </section>
  );
}
