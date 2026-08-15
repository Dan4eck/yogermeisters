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
  const nextPath = new URLSearchParams(window.location.search).get('next');
  const safeNextPath = nextPath && /^\/cabinet(?:\/|$)/.test(nextPath) ? nextPath : '/cabinet';
  const isFreeLessonLogin = safeNextPath === '/cabinet/free-lesson';
  const copy = isFreeLessonLogin
    ? cabinetCopy[language].freeLessonLogin
    : cabinetCopy[language].login;

  return (
    <div className={`landing-v2-root ${styles.cabinetRoot} ${styles[language]}`}>
      <Header language={language} setLanguage={setLanguage} />
      <main className={`${styles.page} ${styles.loginPage}`}>
        <section className={`${styles.authCard} ${isFreeLessonLogin ? styles.freeLessonAuthCard : ''}`}>
          <h1>{copy.title}</h1>
          <p className={styles.authDescription}>{copy.description}</p>
          <a className={styles.primaryButton} href={`/auth/google?next=${encodeURIComponent(safeNextPath)}`}>
            {copy.googleAction}
          </a>
          <Link href='/' className={styles.textLink}>{copy.returnHome}</Link>
        </section>
      </main>
    </div>
  );
}
