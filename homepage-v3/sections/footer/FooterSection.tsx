import type { ReactElement } from 'react';
import { ArrowUpRight } from 'lucide-react';

import type { Language } from '@/lib/i18n';

import styles from './FooterSection.module.css';

type PracticeLink = {
  readonly number: string;
  readonly label: string;
  readonly href: string;
};

export default function FooterSection({ language }: { language: Language }): ReactElement {
  const isRussian: boolean = language === 'ru';
  const practiceLinks: readonly PracticeLink[] = [
    { number: '01', label: isRussian ? 'Личная практика' : 'Personal practice', href: '#classes' },
    { number: '02', label: isRussian ? 'Ретрит' : 'Retreat', href: '#retreats' },
    { number: '03', label: 'the yoga method', href: '/the-yoga-method' },
  ];

  return (
    <footer className={styles.section} data-v3-section='footer' id='contact'>
      <p className={styles.eyebrow}>
        {isRussian ? 'ПРАКТИКА НАЧИНАЕТСЯ С ТЕБЯ' : 'YOUR PRACTICE STARTS WITH YOU'}
      </p>

      <h2 className={styles.heading}>
        <span>{isRussian ? 'Вернись' : 'Return'}</span>
        <span>{isRussian ? 'к практике.' : 'to practice.'}</span>
      </h2>

      <nav className={styles.practiceLinks} aria-label={isRussian ? 'Направления практики' : 'Ways to practice'}>
        {practiceLinks.map(({ number, label, href }: PracticeLink): ReactElement => (
          <a className={styles.practiceLink} href={href} key={number}>
            <span className={styles.number}>{number}</span>
            <span className={styles.practiceLabel}>
              {label}
              <ArrowUpRight aria-hidden='true' className={styles.practiceArrow} strokeWidth={1.5} />
            </span>
          </a>
        ))}
      </nav>

      <p className={styles.wordmark}>Yogermeisters.</p>

      <div className={styles.bottom}>
        <p className={styles.location}>
          {isRussian ? 'Прага · Онлайн · Ретриты' : 'Prague · Online · Retreats'}
        </p>
        <nav className={styles.socialLinks} aria-label={isRussian ? 'Контакты и Шала' : 'Contact and Shala'}>
          <a className={styles.socialLink} href='https://t.me/AnastasiaPagliacci' target='_blank' rel='noopener noreferrer'>
            Telegram
            <ArrowUpRight aria-hidden='true' className={styles.socialArrow} strokeWidth={1.5} />
          </a>
          <a
            className={styles.socialLink}
            href='https://www.youtube.com/watch?v=Z_AabfLhaHo'
            target='_blank'
            rel='noopener noreferrer'
          >
            YouTube
            <ArrowUpRight aria-hidden='true' className={styles.socialArrow} strokeWidth={1.5} />
          </a>
          <a className={styles.socialLink} href='/cabinet'>
            {isRussian ? 'Шала' : 'Shala'}
            <ArrowUpRight aria-hidden='true' className={styles.socialArrow} strokeWidth={1.5} />
          </a>
        </nav>
      </div>
    </footer>
  );
}
