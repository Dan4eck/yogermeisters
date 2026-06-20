import { Minus, Plus } from 'lucide-react';
import { useState } from 'react';

import type { Language } from '@/lib/i18n';
import { landingCopy } from '../content';
import { SectionKicker, TitleOrnament } from '../ui';
import styles from './HimalayanSection.module.css';

interface HimalayanSectionProps {
  language: Language;
}

export default function HimalayanSection({ language }: HimalayanSectionProps) {
  const [activeDetailIndex, setActiveDetailIndex] = useState(0);
  const copy = landingCopy[language].himalayan;
  const activeDetail = copy.details[activeDetailIndex] ?? copy.details[0];
  const [titleTop, titleBottom] = copy.titleLines;

  return (
    <section className={`section ${styles['himalayan-section']}`} id='online'>
      <div className={styles['himalayan-copy']}>
        <SectionKicker>{copy.kicker}</SectionKicker>
        <h2>
          {titleTop}
          <br />
          {titleBottom}
        </h2>
        <TitleOrnament className={styles.ornament} />
        <p>{activeDetail.text}</p>
        <div className={styles.accordion}>
          {copy.details.map((item, index) => {
            const isActive = activeDetailIndex === index;

            return (
              <button
                aria-pressed={isActive}
                className={isActive ? styles.activeAccordionButton : undefined}
                key={item.label}
                onClick={() => setActiveDetailIndex(index)}
                type='button'
              >
                <span>{item.label}</span>
                <span className={styles.accordionIcon}>
                  {isActive ? <Minus aria-hidden='true' /> : <Plus aria-hidden='true' />}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
