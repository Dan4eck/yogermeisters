import { useEffect, useState } from 'react';
import { ArrowUpRight, Gift, LogOut } from 'lucide-react';
import { Link, useLocation } from 'wouter';

import Header from '@/components/landing-v2/Header';
import VajraLoader from '@/components/VajraLoader';
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

interface CatalogCourse {
  readonly slug: string;
  readonly title: string;
  readonly href: string;
}

const CATALOG_COURSES: readonly CatalogCourse[] = [
  {
    slug: 'the-yoga-method',
    title: 'the yoga method',
    href: '/the-yoga-method',
  },
];

export default function CabinetPage({ language, setLanguage }: CabinetPageProps) {
  const [, navigate] = useLocation();
  const [state, setState] = useState<CabinetState>({ kind: 'loading' });
  const copy = cabinetCopy[language];

  useEffect(() => {
    let isActive = true;

    const loadCabinet = async (): Promise<void> => {
      try {
        const [userResponse, coursesResponse] = await Promise.all([
          apiRequest<{ user: CabinetUser }>('/api/me'),
          apiRequest<{ courses: readonly CabinetCourse[] }>('/api/courses'),
        ]);

        if (!isActive) {
          return;
        }

        setState({ kind: 'ready', user: userResponse.user, courses: coursesResponse.courses });
      } catch (error: unknown) {
        if (error instanceof ApiError && error.status === 401) {
          if (isActive) {
            navigate('/login');
          }
          return;
        }

        if (!isActive) {
          return;
        }

        setState({ kind: 'error', message: getErrorMessage(error, copy) });
      }
    };

    void loadCabinet();

    return () => {
      isActive = false;
    };
  }, [navigate]);

  const logout = async (): Promise<void> => {
    await apiRequest<void>('/auth/logout', { method: 'POST' });
    navigate('/login');
  };

  return (
    <div
      className={`landing-v2-root ${styles.cabinetRoot} ${styles[language]} ${
        state.kind === 'loading' ? styles.loadingRoot : ''
      }`}
    >
      <Header language={language} setLanguage={setLanguage} />
      <main className={styles.page}>
        <section className={styles.cabinetShell}>
          {state.kind === 'loading' ? <VajraLoader label={copy.cabinet.loading} /> : null}
          {state.kind === 'error' ? <Status title={copy.cabinet.errorTitle} message={state.message} /> : null}
          {state.kind === 'ready' ? (
            <CabinetContent user={state.user} courses={state.courses} language={language} logout={logout} />
          ) : null}
        </section>
      </main>
    </div>
  );
}

function CabinetContent({
  user,
  courses,
  language,
  logout,
}: {
  readonly user: CabinetUser;
  readonly courses: readonly CabinetCourse[];
  readonly language: Language;
  readonly logout: () => Promise<void>;
}) {
  const copy = cabinetCopy[language];
  const purchasedCourseSlugs = new Set(courses.map((course) => course.slug));
  const availableCourses = CATALOG_COURSES.filter((course) => !purchasedCourseSlugs.has(course.slug));

  return (
    <div>
      <header className={styles.cabinetHeader}>
        <h1>{copy.cabinet.title}</h1>
        <button type='button' className={styles.logoutButton} onClick={() => void logout()}>
          {copy.cabinet.logout}
          <LogOut aria-hidden='true' />
        </button>
      </header>
      <div className={styles.profile}>
        {user.avatarUrl ? <img src={user.avatarUrl} alt='' referrerPolicy='no-referrer' /> : null}
        <div>
          <h2>{user.name}</h2>
          <p>{user.email}</p>
        </div>
      </div>

      <section className={styles.coursesSection} aria-labelledby='my-courses-title'>
        <h2 className={styles.sectionTitle} id='my-courses-title'>
          {copy.cabinet.coursesTitle}
        </h2>
        {courses.length === 0 ? (
          <p className={styles.emptyMessage}>
            <span>{copy.cabinet.emptyTitle}</span>
            {copy.cabinet.emptyText}
          </p>
        ) : (
          <div className={styles.cardGrid}>
            {courses.map((course) => (
              <article className={styles.courseCard} key={course.slug}>
                <h3>{course.title}</h3>
                <p>{course.description}</p>
                <div
                  className={styles.courseProgress}
                  role='progressbar'
                  aria-label={copy.cabinet.progressLabel}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-valuenow={course.progressPercent}
                >
                  <div className={styles.progressMeta}>
                    <span>{copy.cabinet.progressLabel}</span>
                    <strong>{course.progressPercent}%</strong>
                  </div>
                  <div className={styles.progressTrack} aria-hidden='true'>
                    <span style={{ width: `${course.progressPercent}%` }} />
                  </div>
                </div>
                <Link href={`/cabinet/courses/${course.slug}`} className={styles.courseLink}>
                  {copy.cabinet.openCourse}
                  <ArrowUpRight aria-hidden='true' />
                </Link>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className={styles.freeLessonBanner} aria-labelledby='free-lesson-title'>
        <div className={styles.freeLessonIcon}><Gift aria-hidden='true' /></div>
        <div>
          <h2 id='free-lesson-title'>
            {language === 'ru' ? 'Общая практика на всё тело' : 'Full-body yoga practice'}
          </h2>
          <p>
            {language === 'ru'
              ? 'Бесплатный полноценный урок из курса the yoga method.'
              : 'A free complete lesson from the yoga method course.'}
          </p>
        </div>
        <Link href='/cabinet/free-lesson' className={styles.freeLessonLink}>
          {language === 'ru' ? 'Начать практику' : 'Start practice'}
          <ArrowUpRight aria-hidden='true' />
        </Link>
      </section>

      <section className={styles.coursesSection} aria-labelledby='catalog-title'>
        <h2 className={styles.sectionTitle} id='catalog-title'>
          {copy.cabinet.catalogTitle}
        </h2>
        {availableCourses.length === 0 ? (
          <p className={styles.catalogEmpty}>{copy.cabinet.catalogEmpty}</p>
        ) : (
          <div className={styles.cardGrid}>
            {availableCourses.map((course) => (
              <Link href={course.href} className={styles.catalogCard} key={course.slug}>
                <div className={styles.catalogCardHeader}>
                  <h3>{course.title}</h3>
                  <ArrowUpRight aria-hidden='true' />
                </div>
                <p>{copy.cabinet.catalogCourseDescription}</p>
                <span className={styles.catalogCardAction}>{copy.cabinet.viewCourse}</span>
              </Link>
            ))}
          </div>
        )}
      </section>
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
