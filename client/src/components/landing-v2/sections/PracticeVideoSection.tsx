import type { Language } from '@/lib/i18n';
import { landingCopy, youtubePracticeUrl } from '../content';
import { ButtonLink } from '../ui';
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
        <div className={styles.actions}>
          <ButtonLink className={styles.primaryButton} href={youtubePracticeUrl} icon={null}>
            {copy.primaryCta}
          </ButtonLink>
          <ButtonLink className={styles.secondaryButton} href='#classes' icon={null}>
            {copy.secondaryCta}
          </ButtonLink>
        </div>
      </div>
      <div className={styles.media}>
        <div className={styles.frame} aria-label={copy.frameLabel}>
          <iframe
            src={copy.video.src}
            title={copy.video.title}
            allow='accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            allowFullScreen
          ></iframe>
        </div>
        <ol className={styles.sequence} aria-label={copy.benefitsLabel}>
          {copy.sequence.map((item, index) => (
            <li key={item}>
              <span>0{index + 1}</span>
              {item}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
