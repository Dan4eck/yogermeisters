import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';

import { ApiError, apiRequest, type CabinetCourseDetails } from '@/lib/cabinet-api';
import styles from './CabinetPage.module.css';

interface CourseCabinetPageProps {
  readonly slug: string;
}

export default function CourseCabinetPage({ slug }: CourseCabinetPageProps) {
  const [, navigate] = useLocation();
  const [course, setCourse] = useState<CabinetCourseDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);

  useEffect(() => {
    void apiRequest<{ course: CabinetCourseDetails }>(`/api/courses/${encodeURIComponent(slug)}`)
      .then((response) => setCourse(response.course))
      .catch((requestError: unknown) => {
        if (requestError instanceof ApiError && requestError.status === 401) {
          navigate('/login');
          return;
        }
        setError(requestError instanceof Error ? requestError.message : 'Не удалось открыть курс');
      });
  }, [navigate, slug]);

  const openLesson = async (lessonSlug: string): Promise<void> => {
    setError(null);
    setMediaUrl(null);
    try {
      const media = await apiRequest<{ url: string; expiresIn: number }>(
        `/api/courses/${encodeURIComponent(slug)}/lessons/${encodeURIComponent(lessonSlug)}/media`,
      );
      setMediaUrl(media.url);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Видео пока недоступно');
    }
  };

  return (
    <main className={styles.page}>
      <section className={styles.cabinetShell}>
        <header className={styles.cabinetHeader}>
          <Link href='/cabinet' className={styles.textLink}>← Мои курсы</Link>
          <Link href='/' className={styles.brand}>yogermeisters</Link>
        </header>
        {!course && !error ? <div className={styles.status}><h2>Загружаем курс…</h2></div> : null}
        {error ? <div className={styles.errorNotice}>{error}</div> : null}
        {course ? (
          <div>
            <span className={styles.eyebrow}>Онлайн-курс</span>
            <h1>{course.title}</h1>
            <p className={styles.lead}>{course.description}</p>
            {mediaUrl ? <video className={styles.player} controls playsInline src={mediaUrl} /> : null}
            <div className={styles.moduleList}>
              {course.modules.map((module) => (
                <section className={styles.moduleCard} key={module.sortOrder}>
                  <h2>{module.sortOrder}. {module.title}</h2>
                  <ol>
                    {module.lessons.map((lesson) => (
                      <li key={lesson.slug}>
                        <span>{lesson.title}</span>
                        <button type='button' className={styles.secondaryButton} onClick={() => void openLesson(lesson.slug)}>Смотреть</button>
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
  );
}
