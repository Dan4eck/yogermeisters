import type { ReactElement } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { landingCopy } from '@/components/landing-v2/content';
import type { ClassCard } from '@/components/landing-v2/types';
import type { Language } from '@/lib/i18n';
import { photos } from '../../media';
import styles from './ClassesSection.module.css';

interface ClassesSectionProps {
  readonly language: Language;
}

const RUSSIAN_TITLES: readonly string[] = [
  'Курс по йоге',
  'Индивидуально',
  'Индивидуально',
  'Флай, хатха-йога',
  'Йога-буст',
];

const HEADING_LINES: Readonly<Record<Language, readonly [string, string]>> = {
  ru: ['Начни заниматься', 'сегодня'],
  en: ['Start practicing', 'today'],
};

export default function ClassesSection({ language }: ClassesSectionProps): ReactElement {
  const cards: readonly ClassCard[] = landingCopy[language].classes.cards;
  const photo = photos.oceanMovement;
  const headingLines = HEADING_LINES[language];

  return (
    <section
      id='classes'
      className={styles.section}
      data-v3-scene='classes'
      data-v3-section='classes'
      aria-labelledby='v3-classes-title'
    >
      <figure className={styles.photoFrame} data-classes-photo>
        <img
          className={styles.photo}
          src={photo.src}
          alt={photo.alt[language]}
          width={photo.width}
          height={photo.height}
          loading='lazy'
          decoding='async'
        />
        <figcaption className={styles.photoCaption}>
          <a className={styles.courseLink} href={cards[0].href}>
            <span>the yoga method</span>
            <ArrowUpRight size={16} strokeWidth={1.5} aria-hidden='true' />
          </a>
        </figcaption>
      </figure>

      <div className={styles.panel}>
        <header className={styles.heading} data-classes-heading>
          <p className={styles.eyebrow}>{language === 'ru' ? '02 / ЗАНЯТИЯ' : '02 / CLASSES'}</p>
          <h2 id='v3-classes-title' className={styles.title}>
            <span>{headingLines[0]}</span>
            <span>{headingLines[1]}</span>
          </h2>
        </header>

        <ol className={styles.offers}>
          {cards.map((card: ClassCard, index: number): ReactElement => {
            const title: string = language === 'ru' ? RUSSIAN_TITLES[index] : card.title;
            const descriptionId: string = `v3-class-description-${index + 1}`;

            return (
              <li className={styles.offer} key={`${card.href}-${index}`} data-class-row>
                <a
                  className={styles.offerLink}
                  href={card.href}
                  title={card.description}
                  aria-label={`${card.cta}: ${title}, ${card.label}, ${card.price}`}
                  aria-describedby={descriptionId}
                >
                  <span className={styles.number} aria-hidden='true'>
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <h3 className={styles.offerTitle}>{title}</h3>
                  <span className={styles.format}>{card.label}</span>
                  <span className={styles.price}>{card.price}</span>
                  <ArrowUpRight className={styles.arrow} size={18} strokeWidth={1.5} aria-hidden='true' />
                  <p id={descriptionId} className={styles.description}>
                    {card.description}
                  </p>
                  <span className={styles.action}>{card.cta}</span>
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
