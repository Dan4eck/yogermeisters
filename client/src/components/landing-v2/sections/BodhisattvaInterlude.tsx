import type { Language } from '@/lib/i18n';
import { landingCopy } from '../content';
import styles from './BodhisattvaInterlude.module.css';

interface BodhisattvaInterludeProps {
  language: Language;
}

export default function BodhisattvaInterlude({ language }: BodhisattvaInterludeProps) {
  const copy = landingCopy[language].bodhisattvaCta;

  return (
    <aside className={styles.interlude} id='bodhisattva-practices' aria-label={copy.footnote}>
      <div className={styles.track}>
        {[...copy.practices, ...copy.practices].map((practice, index) => (
          <figure
            className={`${styles.practice}${index >= copy.practices.length ? ` ${styles.duplicate}` : ''}`}
            key={`${practice.number}-${index}`}
            aria-hidden={index >= copy.practices.length ? 'true' : undefined}
          >
            <blockquote>“{practice.quote}”</blockquote>
            <figcaption>
              {practice.number} · {practice.title}
            </figcaption>
          </figure>
        ))}
      </div>
      <p className={styles.source}>* {copy.footnote}</p>
    </aside>
  );
}
