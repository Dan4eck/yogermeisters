import type { Language } from '@/lib/i18n';
import { landingCopy } from '../content';
import { SectionKicker, TitleOrnament } from '../ui';
import styles from './ClassesSection.module.css';

const cardPlacementClass = {
  left: styles.cardLeft,
  right: styles.cardRight,
};

const cardToneClass = {
  left: styles.online,
  right: styles.offline,
};

interface ClassesSectionProps {
  language: Language;
}

export default function ClassesSection({ language }: ClassesSectionProps) {
  const copy = landingCopy[language].classes;

  return (
    <section className={`section ${styles.section}`} id='classes'>
      <div className={styles.kicker}>
        <SectionKicker>{copy.kicker}</SectionKicker>
      </div>
      <h2 className={styles.title}>{copy.title}</h2>
      <TitleOrnament className={styles.ornament} />
      {copy.cards.map(({ placement, label, title, price, description, cta }) => (
        <a
          className={`${styles.card} ${cardPlacementClass[placement]} ${cardToneClass[placement]}`}
          href='#contact'
          aria-label={cta}
          key={title}
        >
          <div className={styles.cardCopy}>
            <span className={styles.cardLabel}>{label}</span>
            <h3>{title}</h3>
            <span className={styles.titleRule}></span>
            <p>{price}</p>
            <small>{description}</small>
          </div>
          <div className={styles.photoPlaceholder} aria-hidden='true'></div>
        </a>
      ))}
    </section>
  );
}
