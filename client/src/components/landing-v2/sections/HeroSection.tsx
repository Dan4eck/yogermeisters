import { ArrowRight, Play } from 'lucide-react';

import type { Language } from '@/lib/i18n';
import { landingCopy } from '../content';
import type { HeroActionTone } from '../types';
import { ButtonLink, TitleOrnament } from '../ui';
import styles from './HeroSection.module.css';

const actionToneClass: Record<HeroActionTone, string> = {
  dark: styles.actionDark,
  gold: styles.actionGold,
  sand: styles.actionSand,
};

interface HeroSectionProps {
  language: Language;
}

export default function HeroSection({ language }: HeroSectionProps) {
  const copy = landingCopy[language].hero;
  const [titleTop, titleBottom] = copy.titleLines;

  return (
    <section className={`section ${styles.section}${language === 'ru' ? ` ${styles.ru}` : ''}`} id='hero'>
      <h1 className={styles.title}>
        <span>{titleTop}</span>
        <span>{titleBottom}</span>
      </h1>

      <div className={styles.copy}>
        <p>{copy.description}</p>
        <div className={styles.primaryActions}>
          <ButtonLink className={styles.primaryButton} href='#online'>
            {copy.primaryCta}
          </ButtonLink>
          <a className={styles.videoLink} href='#practice'>
            <span>
              <Play aria-hidden='true' />
            </span>
            <strong>{copy.videoCta}</strong>
          </a>
        </div>
      </div>

      <TitleOrnament className={styles.ornament} />

      <aside className={styles.actionsPanel} aria-label={copy.actionsLabel}>
        {copy.actions.map(({ title, text, href, icon: Icon, tone }) => (
          <a className={`${styles.action} ${actionToneClass[tone]}`} href={href} key={title}>
            <span className={styles.actionIcon}>
              <Icon aria-hidden='true' />
            </span>
            <span className={styles.actionCopy}>
              <strong>{title}</strong>
              <small>{text}</small>
            </span>
            <ArrowRight aria-hidden='true' />
          </a>
        ))}
      </aside>

      <footer className={styles.footer}>
        <div className={styles.socials} aria-label={copy.socialsLabel}>
          <span>
            {copy.socials.map(({ label, href, icon: Icon }) => (
              <a href={href} aria-label={label} key={label}>
                <Icon aria-hidden='true' />
              </a>
            ))}
          </span>
        </div>
      </footer>
    </section>
  );
}
