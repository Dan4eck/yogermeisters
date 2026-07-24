import { useEffect, useRef, useState, type ReactElement } from 'react';
import { ArrowLeft, BookOpen, Check, ChevronDown, LoaderCircle, Play } from 'lucide-react';
import { Link, useLocation } from 'wouter';

import Header from '@/components/landing-v2/Header';
import VajraLoader from '@/components/VajraLoader';
import YogaMatLoader from '@/components/YogaMatLoader';
import type { Language } from '@/lib/i18n';
import { ApiError, apiRequest, type CabinetCourseDetails, type CabinetLesson } from '@/lib/cabinet-api';
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
  const [mediaKind, setMediaKind] = useState<'audio' | 'video' | null>(null);
  const [introUrl, setIntroUrl] = useState<string | null>(null);
  const [introOpen, setIntroOpen] = useState(false);
  const [introLoading, setIntroLoading] = useState(false);
  const [introError, setIntroError] = useState<string | null>(null);
  const [loadingLesson, setLoadingLesson] = useState<string | null>(null);
  const [completingLessonSlug, setCompletingLessonSlug] = useState<string | null>(null);
  const mediaRequestId = useRef(0);
  const activeLessonRef = useRef<HTMLDivElement | null>(null);
  const copy = cabinetCopy[language];

  useEffect(() => {
    let isActive = true;

    const loadCourse = async (): Promise<void> => {
      setCourse(null);
      setCourseError(null);

      try {
        const response = await apiRequest<{ course: CabinetCourseDetails }>(
          `/api/courses/${encodeURIComponent(slug)}`,
        );

        if (isActive) {
          setCourse(response.course);
        }
      } catch (requestError: unknown) {
        if (requestError instanceof ApiError && requestError.status === 401) {
          if (isActive) {
            navigate('/login');
          }
          return;
        }

        if (isActive) {
          setCourseError(getCourseError(requestError, copy));
        }
      }
    };

    void loadCourse();

    return () => {
      isActive = false;
    };
  }, [navigate, slug]);

  const toggleIntro = async (): Promise<void> => {
    if (introOpen) {
      setIntroOpen(false);
      return;
    }

    setIntroOpen(true);
    if (introUrl) {
      return;
    }

    setIntroLoading(true);
    setIntroError(null);
    try {
      const media = await apiRequest<{ url: string; expiresIn: number }>(
        `/api/courses/${encodeURIComponent(slug)}/intro-media`,
      );
      setIntroUrl(media.url);
    } catch (requestError) {
      setIntroError(getCourseError(requestError, copy));
      setIntroLoading(false);
    }
  };

  const openLesson = async (lesson: CabinetLesson): Promise<void> => {
    const lessonSlug = lesson.slug;
    if (selectedLessonSlug === lessonSlug) {
      mediaRequestId.current += 1;
      setSelectedLessonSlug(null);
      setMediaUrl(null);
      setMediaKind(null);
      setMediaError(null);
      setLoadingLesson(null);
      return;
    }

    const requestId = mediaRequestId.current + 1;
    mediaRequestId.current = requestId;
    setSelectedLessonSlug(lessonSlug);
    setMediaUrl(null);
    setMediaKind(null);
    setMediaError(null);

    if (!lesson.mediaAvailable && lesson.description.trim()) {
      setLoadingLesson(null);
      void completeLesson(lessonSlug);
      return;
    }

    setLoadingLesson(lessonSlug);
    try {
      const media = await apiRequest<{ url: string; expiresIn: number; kind?: 'audio' | 'video' }>(
        `/api/courses/${encodeURIComponent(slug)}/lessons/${encodeURIComponent(lessonSlug)}/media`,
      );
      if (requestId === mediaRequestId.current) {
        setMediaUrl(media.url);
        setMediaKind(media.kind ?? getMediaKindFromUrl(media.url));
      }
    } catch (requestError) {
      if (requestId === mediaRequestId.current) {
        setMediaError(getCourseError(requestError, copy));
        setLoadingLesson(null);
      }
    }
  };

  const handleIntroReady = (): void => {
    setIntroLoading(false);
  };

  const handleIntroError = (): void => {
    setIntroLoading(false);
    setIntroError(copy.errors.unavailable);
  };

  const handleLessonMediaReady = (lessonSlug: string): void => {
    setLoadingLesson((currentSlug) => (currentSlug === lessonSlug ? null : currentSlug));
  };

  const handleLessonMediaError = (lessonSlug: string): void => {
    setLoadingLesson((currentSlug) => (currentSlug === lessonSlug ? null : currentSlug));
    setMediaError(copy.errors.mediaNotReady);
  };

  async function completeLesson(lessonSlug: string): Promise<void> {
    if (completingLessonSlug === lessonSlug || isLessonCompleted(course, lessonSlug)) {
      return;
    }

    setCompletingLessonSlug(lessonSlug);
    try {
      await apiRequest<void>(
        `/api/courses/${encodeURIComponent(slug)}/lessons/${encodeURIComponent(lessonSlug)}/completion`,
        { method: 'PUT' },
      );
      setCourse((currentCourse) => markLessonCompleted(currentCourse, lessonSlug));
      setMediaError(null);
    } catch {
      setMediaError(copy.course.progressSaveError);
    } finally {
      setCompletingLessonSlug(null);
    }
  }

  useEffect(() => {
    if (!mediaUrl || !activeLessonRef.current) {
      return;
    }

    activeLessonRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [mediaUrl]);

  return (
    <div
      className={`landing-v2-root ${styles.cabinetRoot} ${styles[language]} ${
        !course && !courseError ? styles.loadingRoot : ''
      }`}
    >
      <Header language={language} setLanguage={setLanguage} />
      <main className={styles.page}>
        <section className={styles.cabinetShell}>
          {course || courseError ? (
            <Link href='/cabinet' className={styles.backLink}>
              <ArrowLeft aria-hidden='true' />
              {copy.course.back}
            </Link>
          ) : null}
          {!course && !courseError ? <VajraLoader label={copy.course.loading} /> : null}
          {courseError ? <div className={styles.errorNotice}>{courseError}</div> : null}
          {course ? (
            <div>
              <div className={styles.courseIntro}>
                <h1>{course.title}</h1>
                <p className={styles.lead}>{course.description}</p>
              </div>
              {course.introAvailable ? (
                <div className={styles.introAccordion}>
                  <button
                    type='button'
                    className={styles.introTrigger}
                    onClick={() => void toggleIntro()}
                    aria-expanded={introOpen}
                    aria-controls={introOpen ? 'course-intro-player' : undefined}
                  >
                    <span className={styles.introTitle}>{copy.course.introLesson}</span>
                    <span className={styles.introControl}>
                      {introLoading ? copy.course.loadingMedia : introOpen ? copy.course.close : copy.course.watch}
                      {introLoading ? (
                        <LoaderCircle className={styles.loadingIcon} aria-hidden='true' />
                      ) : introOpen ? (
                        <ChevronDown aria-hidden='true' />
                      ) : (
                        <Play className={styles.playIcon} aria-hidden='true' />
                      )}
                    </span>
                  </button>
                  {introOpen ? (
                    <div className={styles.introPanel} id='course-intro-player'>
                      {introLoading ? (
                        <YogaMatLoader label={copy.course.loadingMedia} variant='media' />
                      ) : null}
                      {introError ? <div className={styles.introError}>{introError}</div> : null}
                      {introUrl ? (
                        <video
                          className={`${styles.introPlayer} ${introLoading ? styles.mediaPending : ''}`}
                          controls
                          controlsList='nodownload'
                          playsInline
                          preload='auto'
                          poster='/assets/cabinet/course-intro-poster.jpg'
                          src={introUrl}
                          onCanPlay={handleIntroReady}
                          onContextMenu={(event) => event.preventDefault()}
                          onError={handleIntroError}
                        />
                      ) : null}
                    </div>
                  ) : null}
                </div>
              ) : null}
              <div className={styles.moduleList}>
                {course.modules.map((module) => (
                  <section className={styles.moduleCard} key={module.sortOrder}>
                    <h2>{module.title}</h2>
                    <ol>
                      {module.lessons.map((lesson) => {
                        const isSelected = selectedLessonSlug === lesson.slug;
                        const isLoading = loadingLesson === lesson.slug;
                        const isTextLesson = !lesson.mediaAvailable && Boolean(lesson.description.trim());
                        const panelId = `lesson-${lesson.slug}`;

                        return (
                          <li className={isSelected ? styles.activeLesson : undefined} key={lesson.slug}>
                            <button
                              type='button'
                              className={styles.lessonTrigger}
                              onClick={() => void openLesson(lesson)}
                              aria-expanded={isSelected}
                              aria-controls={isSelected ? panelId : undefined}
                            >
                              <span className={styles.lessonHeading}>
                                <span className={styles.lessonTitle}>{lesson.title}</span>
                                {lesson.completed ? (
                                  <span className={styles.completionMark} aria-label={copy.course.completed}>
                                    <Check aria-hidden='true' />
                                  </span>
                                ) : null}
                              </span>
                              <span className={styles.lessonControl}>
                                {isLoading
                                  ? copy.course.loadingMedia
                                  : isSelected
                                    ? copy.course.close
                                    : isTextLesson
                                      ? copy.course.read
                                      : copy.course.watch}
                                {isLoading ? (
                                  <LoaderCircle className={styles.loadingIcon} aria-hidden='true' />
                                ) : isSelected ? (
                                  <ChevronDown aria-hidden='true' />
                                ) : isTextLesson ? (
                                  <BookOpen aria-hidden='true' />
                                ) : (
                                  <Play className={styles.playIcon} aria-hidden='true' />
                                )}
                              </span>
                            </button>
                            {isSelected ? (
                              <div className={styles.lessonPanel} id={panelId} ref={activeLessonRef}>
                                {isLoading ? (
                                  <YogaMatLoader label={copy.course.loadingMedia} variant='media' />
                                ) : null}
                                {mediaError ? <div className={styles.lessonMediaError}>{mediaError}</div> : null}
                                {mediaUrl ? (
                                  <div className={styles.lessonMedia}>
                                    {mediaKind === 'audio' ? (
                                      <audio
                                        className={`${styles.audioPlayer} ${isLoading ? styles.mediaPending : ''}`}
                                        controls
                                        controlsList='nodownload'
                                        preload='auto'
                                        src={mediaUrl}
                                        onCanPlay={() => handleLessonMediaReady(lesson.slug)}
                                        onEnded={() => void completeLesson(lesson.slug)}
                                        onContextMenu={(event) => event.preventDefault()}
                                        onError={() => handleLessonMediaError(lesson.slug)}
                                      />
                                    ) : (
                                      <video
                                        className={`${styles.player} ${isLoading ? styles.mediaPending : ''}`}
                                        controls
                                        controlsList='nodownload'
                                        playsInline
                                        preload='auto'
                                        src={mediaUrl}
                                        onCanPlay={() => handleLessonMediaReady(lesson.slug)}
                                        onEnded={() => void completeLesson(lesson.slug)}
                                        onContextMenu={(event) => event.preventDefault()}
                                        onError={() => handleLessonMediaError(lesson.slug)}
                                      />
                                    )}
                                  </div>
                                ) : null}
                                {isTextLesson ? (
                                  <LessonTextContent description={lesson.description} />
                                ) : lesson.description.trim() ? (
                                  <p className={styles.lessonDescription}>{lesson.description}</p>
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

function isLessonCompleted(course: CabinetCourseDetails | null, lessonSlug: string): boolean {
  return course?.modules.some((module) => (
    module.lessons.some((lesson) => lesson.slug === lessonSlug && lesson.completed)
  )) ?? false;
}

function markLessonCompleted(
  course: CabinetCourseDetails | null,
  lessonSlug: string,
): CabinetCourseDetails | null {
  if (!course || isLessonCompleted(course, lessonSlug)) {
    return course;
  }

  const completedLessons = Math.min(course.completedLessons + 1, course.totalLessons);

  return {
    ...course,
    completedLessons,
    progressPercent: course.totalLessons === 0 ? 0 : Math.round((completedLessons / course.totalLessons) * 100),
    modules: course.modules.map((module) => ({
      ...module,
      lessons: module.lessons.map((lesson) => (
        lesson.slug === lessonSlug ? { ...lesson, completed: true } : lesson
      )),
    })),
  };
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

function getMediaKindFromUrl(url: string): 'audio' | 'video' {
  return /\.(?:mp3|m4a|aac|ogg|wav)(?:$|[?#])/i.test(url) ? 'audio' : 'video';
}

function LessonTextContent({ description }: { readonly description: string }): ReactElement {
  const [heading, ...paragraphs] = description
    .split('\n\n')
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);

  return (
    <div className={styles.lessonTextContent}>
      {heading ? <h3>{heading}</h3> : null}
      <hr />
      {paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
    </div>
  );
}
