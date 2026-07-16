import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Play } from 'lucide-react';
import { Link, useLocation } from 'wouter';

import Header from '@/components/landing-v2/Header';
import type { Language } from '@/lib/i18n';
import { ApiError, apiRequest, type CabinetCourseDetails } from '@/lib/cabinet-api';
import { cabinetCopy } from './cabinet-copy';
import styles from './CabinetPage.module.css';

interface CourseCabinetPageProps {
  readonly slug: string;
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
}

export default function CourseCabinetPage({ slug, language, setLanguage }: CourseCabinetPageProps) {
  const [, navigate] = useLocation();
  const [course, setCourse] = useState<CabinetCourseDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loadingLesson, setLoadingLesson] = useState<string | null>(null);
  const copy = cabinetCopy[language];

  useEffect(() => {
    void apiRequest<{ course: CabinetCourseDetails }>(`/api/courses/${encodeURIComponent(slug)}`)
      .then((response) => setCourse(response.course))
      .catch((requestError: unknown) => {
        if (requestError instanceof ApiError && requestError.status === 401) {
          navigate('/login');
          return;
        }
        setError(getCourseError(requestError, copy));
      });
  }, [navigate, slug]);

  const openLesson = async (lessonSlug: string): Promise<void> => {
    setError(null);
    setMediaUrl(null);
    setLoadingLesson(lessonSlug);
    try {
      const media = await apiRequest<{ url: string; expiresIn: number }>(
        `/api/courses/${encodeURIComponent(slug)}/lessons/${encodeURIComponent(lessonSlug)}/media`,
      );
      setMediaUrl(media.url);
    } catch (requestError) {
      setError(getCourseError(requestError, copy));
    } finally {
      setLoadingLesson(null);
    }
  };

  return (
    <div className={`landing-v2-root ${styles.cabinetRoot} ${styles[language]}`}>
      <Header language={language} setLanguage={setLanguage} />
      <main className={styles.page}>
        <section className={styles.cabinetShell}>
          <Link href='/cabinet' className={styles.backLink}>
            <ArrowLeft aria-hidden='true' />
            {copy.course.back}
          </Link>
          {!course && !error ? <div className={styles.status}><h2>{copy.course.loading}</h2></div> : null}
          {error ? <div className={styles.errorNotice}>{error}</div> : null}
          {course ? (
            <div>
              <div className={styles.courseHero}>
                <span className={styles.sectionNumber}>02</span>
                <span className={styles.eyebrow}>{copy.course.eyebrow}</span>
                <h1>{course.title}</h1>
                <p className={styles.lead}>{course.description}</p>
              </div>
              <div className={styles.sectionHeading}>
                <div>
                  <span className={styles.eyebrow}>{copy.cabinet.practiceLabel}</span>
                  <h2>{copy.course.routeTitle}</h2>
                </div>
                <span className={styles.titleRule} aria-hidden='true'></span>
              </div>
              {mediaUrl ? <video className={styles.player} controls playsInline src={mediaUrl} /> : <p className={styles.mediaHint}>{copy.course.mediaHint}</p>}
              <div className={styles.moduleList}>
                {course.modules.map((module) => (
                  <section className={styles.moduleCard} key={module.sortOrder}>
                    <div className={styles.moduleHead}>
                      <span>{String(module.sortOrder).padStart(2, '0')}</span>
                      <div>
                        <p className={styles.eyebrow}>{copy.course.moduleLabel}</p>
                        <h3>{module.title}</h3>
                      </div>
                    </div>
                    <ol>
                      {module.lessons.map((lesson, index) => (
                        <li key={lesson.slug}>
                          <span className={styles.lessonIndex}>{String(index + 1).padStart(2, '0')}</span>
                          <span className={styles.lessonTitle}>{lesson.title}</span>
                          <button
                            type='button'
                            className={styles.lessonButton}
                            onClick={() => void openLesson(lesson.slug)}
                            disabled={loadingLesson === lesson.slug}
                          >
                            <Play aria-hidden='true' />
                            {loadingLesson === lesson.slug ? copy.course.loadingMedia : copy.course.watch}
                            <ArrowUpRight aria-hidden='true' />
                          </button>
                        </li>
                      ))}
                    </ol>
                  </section>
                ))}
              </div>
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}

function getCourseError(error: unknown, copy: typeof cabinetCopy.en): string {
  if (error instanceof ApiError) {
    if (error.code === 'course_access_denied') {
      return copy.errors.accessDenied;
    }
    if (error.code === 'media_not_ready') {
      return copy.errors.mediaNotReady;
    }
    if (error.code === 'storage_not_configured') {
      return copy.errors.storageNotConfigured;
    }
  }

  return copy.errors.unavailable;
}
