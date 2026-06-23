import type { Language } from '@/lib/i18n';
import { landingCopy } from '../content';
import styles from './PracticeVideoSection.module.css';

interface PracticeVideoSectionProps {
  language: Language;
}

export default function PracticeVideoSection({ language }: PracticeVideoSectionProps) {
  const copy = landingCopy[language].practice;

  return (
    <section className={`section ${styles.section}`} id='practice'>
      <div className={styles.copy}>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </div>
      <div className={`${styles.frame} surface-panel`} aria-label={copy.frameLabel}>
        <iframe
          src={copy.video.src}
          title={copy.video.title}
          allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
          allowFullScreen
        ></iframe>
      </div>
      <div className={styles.benefits} aria-label={copy.benefitsLabel}>
        {copy.benefits.map(({ accent, title, text }, index) => (
          <article className={`${styles.benefitCard} ${styles[`benefitCard${index + 1}`]}`} key={title}>
            <span className={styles.benefitGhost} aria-hidden='true'>
              {accent}
            </span>
            <h3>{title}</h3>
            <span className={styles.titleRule}></span>
            <p>{text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
