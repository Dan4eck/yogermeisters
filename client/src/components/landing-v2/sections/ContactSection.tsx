import { Mail, MoveDown } from 'lucide-react';

import type { Language } from '@/lib/i18n';
import { contactEmail, landingCopy } from '../content';
import { ButtonLink } from '../ui';
import styles from './ContactSection.module.css';

interface ContactSectionProps {
  language: Language;
}

export default function ContactSection({ language }: ContactSectionProps) {
  const copy = landingCopy[language].contact;

  return (
    <section className={`section ${styles.section}`} id='contact'>
      <div className={styles.copy}>
        <h2>{copy.title}</h2>
        <p>{copy.description}</p>
      </div>
      <aside className={`${styles.panel} surface-panel`}>
        <span className='round-icon'>
          <Mail aria-hidden='true' />
        </span>
        <strong>{copy.panelTitle}</strong>
        <small>{copy.panelDescription}</small>
        <div>
          <span>{copy.responseLabel}</span>
          <b>{copy.responseTime}</b>
        </div>
      </aside>
      <div className={styles.actions}>
        <ButtonLink href={`mailto:${contactEmail}`} icon={Mail}>
          {copy.emailCta}
        </ButtonLink>
        <a className={styles.backLink} href='#hero'>
          <span>
            <MoveDown aria-hidden='true' />
          </span>
          <strong>{copy.backToTop}</strong>
        </a>
      </div>
    </section>
  );
}
