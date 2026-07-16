import { useEffect, useState } from 'react';
import { ArrowUpRight, LogOut } from 'lucide-react';
import { Link, useLocation } from 'wouter';

import Header from '@/components/landing-v2/Header';
import type { Language } from '@/lib/i18n';
import { ApiError, apiRequest, type CabinetCourse, type CabinetUser } from '@/lib/cabinet-api';
import { cabinetCopy } from './cabinet-copy';
import styles from './CabinetPage.module.css';

type CabinetState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly user: CabinetUser; readonly courses: readonly CabinetCourse[] }
  | { readonly kind: 'error'; readonly message: string };

interface CabinetPageProps {
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
}

export default function CabinetPage({ language, setLanguage }: CabinetPageProps) {
  const [, navigate] = useLocation();
  const [state, setState] = useState<CabinetState>({ kind: 'loading' });
  const copy = cabinetCopy[language];

  useEffect(() => {
    void Promise.all([
      apiRequest<{ user: CabinetUser }>('/api/me'),
      apiRequest<{ courses: readonly CabinetCourse[] }>('/api/courses'),
    ])
      .then(([userResponse, coursesResponse]) => {
        setState({ kind: 'ready', user: userResponse.user, courses: coursesResponse.courses });
      })
      .catch((error: unknown) => {
        if (error instanceof ApiError && error.status === 401) {
          navigate('/login');
          return;
        }
        setState({ kind: 'error', message: getErrorMessage(error, copy) });
      });
  }, [navigate]);

  const logout = async (): Promise<void> => {
    await apiRequest<void>('/auth/logout', { method: 'POST' });
    navigate('/login');
  };

  return (
    <div className={`landing-v2-root ${styles.cabinetRoot} ${styles[language]}`}>
      <Header language={language} setLanguage={setLanguage} />
      <main className={styles.page}>
        <section className={styles.cabinetShell}>
          {state.kind === 'loading' ? <Status title={copy.cabinet.loading} /> : null}
          {state.kind === 'error' ? <Status title={copy.cabinet.errorTitle} message={state.message} /> : null}
          {state.kind === 'ready' ? (
            <div>
              <header className={styles.cabinetHeader}>
                <h1>{copy.cabinet.title}</h1>
                <button type='button' className={styles.logoutButton} onClick={() => void logout()}>
                  {copy.cabinet.logout}
                  <LogOut aria-hidden='true' />
                </button>
              </header>
              <div className={styles.profile}>
                {state.user.avatarUrl ? <img src={state.user.avatarUrl} alt='' referrerPolicy='no-referrer' /> : null}
                <div>
                  <h2>{state.user.name}</h2>
                  <p>{state.user.email}</p>
                </div>
              </div>
              <h2 className={styles.sectionTitle}>{copy.cabinet.coursesTitle}</h2>
              {state.courses.length === 0 ? (
                <Status title={copy.cabinet.emptyTitle} message={copy.cabinet.emptyText} />
              ) : (
                <div className={styles.courseGrid}>
                  {state.courses.map((course) => (
                    <article className={styles.courseCard} key={course.slug}>
                      <h3>{course.title}</h3>
                      <p>{course.description}</p>
                      <Link href={`/cabinet/courses/${course.slug}`} className={styles.courseLink}>
                        {copy.cabinet.openCourse}
                        <ArrowUpRight aria-hidden='true' />
                      </Link>
                    </article>
                  ))}
                </div>
              )}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function Status({ title, message }: { readonly title: string; readonly message?: string }) {
  return <div className={styles.status}><h2>{title}</h2>{message ? <p>{message}</p> : null}</div>;
}

function getErrorMessage(error: unknown, copy: typeof cabinetCopy.en): string {
  if (error instanceof ApiError && error.code === 'course_access_denied') {
    return copy.errors.accessDenied;
  }

  return copy.errors.unavailable;
}
