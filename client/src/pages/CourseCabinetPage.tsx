import { useEffect, useRef, useState } from 'react';
import { ArrowLeft, ChevronDown, LoaderCircle, Play } from 'lucide-react';
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
  const [courseError, setCourseError] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [selectedLessonSlug, setSelectedLessonSlug] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loadingLesson, setLoadingLesson] = useState<string | null>(null);
  const mediaRequestId = useRef(0);
  const activeLessonRef = useRef<HTMLDivElement | null>(null);
  const copy = cabinetCopy[language];

  useEffect(() => {
    void apiRequest<{ course: CabinetCourseDetails }>(`/api/courses/${encodeURIComponent(slug)}`)
      .then((response) => setCourse(response.course))
      .catch((requestError: unknown) => {
        if (requestError instanceof ApiError && requestError.status === 401) {
          navigate('/login');
          return;
        }
        setCourseError(getCourseError(requestError, copy));
      });
  }, [navigate, slug]);

  const openLesson = async (lessonSlug: string): Promise<void> => {
    if (selectedLessonSlug === lessonSlug) {
      mediaRequestId.current += 1;
      setSelectedLessonSlug(null);
      setMediaUrl(null);
      setMediaError(null);
      setLoadingLesson(null);
      return;
    }

    const requestId = mediaRequestId.current + 1;
    mediaRequestId.current = requestId;
    setSelectedLessonSlug(lessonSlug);
    setMediaUrl(null);
    setMediaError(null);
    setLoadingLesson(lessonSlug);
    try {
      const media = await apiRequest<{ url: string; expiresIn: number }>(
        `/api/courses/${encodeURIComponent(slug)}/lessons/${encodeURIComponent(lessonSlug)}/media`,
      );
      if (requestId === mediaRequestId.current) {
        setMediaUrl(media.url);
      }
    } catch (requestError) {
      if (requestId === mediaRequestId.current) {
        setMediaError(getCourseError(requestError, copy));
      }
    } finally {
      if (requestId === mediaRequestId.current) {
        setLoadingLesson(null);
      }
    }
  };

  useEffect(() => {
    if (!mediaUrl || !activeLessonRef.current) {
      return;
    }

    activeLessonRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [mediaUrl]);

  return (
    <div className={`landing-v2-root ${styles.cabinetRoot} ${styles[language]}`}>
      <Header language={language} setLanguage={setLanguage} />
      <main className={styles.page}>
        <section className={styles.cabinetShell}>
          <Link href='/cabinet' className={styles.backLink}>
            <ArrowLeft aria-hidden='true' />
            {copy.course.back}
          </Link>
          {!course && !courseError ? <div className={styles.status}><h2>{copy.course.loading}</h2></div> : null}
          {courseError ? <div className={styles.errorNotice}>{courseError}</div> : null}
          {course ? (
            <div>
              <div className={styles.courseIntro}>
                <h1>{course.title}</h1>
                <p className={styles.lead}>{course.description}</p>
              </div>
              <div className={styles.moduleList}>
                {course.modules.map((module) => (
                  <section className={styles.moduleCard} key={module.sortOrder}>
                    <h2>{module.title}</h2>
                    <ol>
                      {module.lessons.map((lesson) => {
                        const isSelected = selectedLessonSlug === lesson.slug;
                        const isLoading = loadingLesson === lesson.slug;
                        const panelId = `lesson-${lesson.slug}`;

                        return (
                          <li className={isSelected ? styles.activeLesson : undefined} key={lesson.slug}>
                            <button
                              type='button'
                              className={styles.lessonTrigger}
                              onClick={() => void openLesson(lesson.slug)}
                              aria-expanded={isSelected}
                              aria-controls={isSelected ? panelId : undefined}
                            >
                              <span className={styles.lessonTitle}>{lesson.title}</span>
                              <span className={styles.lessonControl}>
                                {isLoading ? copy.course.loadingMedia : isSelected ? copy.course.close : copy.course.watch}
                                {isLoading ? (
                                  <LoaderCircle className={styles.loadingIcon} aria-hidden='true' />
                                ) : isSelected ? (
                                  <ChevronDown aria-hidden='true' />
                                ) : (
                                  <Play className={styles.playIcon} aria-hidden='true' />
                                )}
                              </span>
                            </button>
                            {isSelected ? (
                              <div className={styles.lessonPanel} id={panelId} ref={activeLessonRef}>
                                {isLoading ? <div className={styles.lessonLoading}>{copy.course.loadingMedia}</div> : null}
                                {mediaError ? <div className={styles.lessonMediaError}>{mediaError}</div> : null}
                                {mediaUrl ? (
                                  <div className={styles.lessonMedia}>
                                    <video
                                      className={styles.player}
                                      controls
                                      controlsList='nodownload'
                                      playsInline
                                      src={mediaUrl}
                                      onContextMenu={(event) => event.preventDefault()}
                                    />
                                    {lesson.description.trim() ? (
                                      <p className={styles.lessonDescription}>{lesson.description}</p>
                                    ) : null}
                                  </div>
                                ) : null}
                              </div>
                            ) : null}
                          </li>
                        );
                      })}
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
