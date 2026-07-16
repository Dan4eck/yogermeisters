import { Link } from 'wouter';

import Header from '@/components/landing-v2/Header';
import type { Language } from '@/lib/i18n';
import { cabinetCopy } from './cabinet-copy';
import styles from './CabinetPage.module.css';

interface LoginPageProps {
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
}

export default function LoginPage({ language, setLanguage }: LoginPageProps) {
  const copy = cabinetCopy[language].login;

  return (
    <div className={`landing-v2-root ${styles.cabinetRoot} ${styles[language]}`}>
      <Header language={language} setLanguage={setLanguage} />
      <main className={`${styles.page} ${styles.loginPage}`}>
        <section className={styles.loginStage}>
          <div className={styles.loginEditorial}>
            <span className={styles.sectionNumber}>01</span>
            <p className={styles.eyebrow}>{copy.sideLabel}</p>
            <h1>{copy.sideTitle}</h1>
            <p>{copy.sideText}</p>
          </div>
          <section className={styles.authCard}>
            <span className={styles.eyebrow}>{copy.eyebrow}</span>
            <h2>{copy.title}</h2>
            <p className={styles.authDescription}>{copy.description}</p>
            <a className={styles.primaryButton} href='/auth/google'>{copy.googleAction}</a>
            <p className={styles.authNote}>{copy.note}</p>
            <Link href='/' className={styles.textLink}>{copy.returnHome}</Link>
          </section>
        </section>
      </main>
    </div>
  );
}
