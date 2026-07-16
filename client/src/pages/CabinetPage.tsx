import { useEffect, useState } from 'react';
import { Link, useLocation } from 'wouter';

import { ApiError, apiRequest, type CabinetCourse, type CabinetUser } from '@/lib/cabinet-api';
import styles from './CabinetPage.module.css';

type CabinetState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'ready'; readonly user: CabinetUser; readonly courses: readonly CabinetCourse[] }
  | { readonly kind: 'error'; readonly message: string };

export default function CabinetPage() {
  const [, navigate] = useLocation();
  const [state, setState] = useState<CabinetState>({ kind: 'loading' });

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
        setState({ kind: 'error', message: error instanceof Error ? error.message : 'Не удалось загрузить кабинет' });
      });
  }, [navigate]);

  const logout = async (): Promise<void> => {
    await apiRequest<void>('/auth/logout', { method: 'POST' });
    navigate('/login');
  };

  return (
    <main className={styles.page}>
      <section className={styles.cabinetShell}>
        <header className={styles.cabinetHeader}>
          <Link href='/' className={styles.brand}>yogermeisters</Link>
          {state.kind === 'ready' ? <button type='button' className={styles.secondaryButton} onClick={() => void logout()}>Выйти</button> : null}
        </header>

        {state.kind === 'loading' ? <Status title='Загружаем кабинет…' /> : null}
        {state.kind === 'error' ? <Status title='Что-то пошло не так' message={state.message} /> : null}
        {state.kind === 'ready' ? (
          <div>
            <div className={styles.profile}>
              {state.user.avatarUrl ? <img src={state.user.avatarUrl} alt='' referrerPolicy='no-referrer' /> : null}
              <div>
                <span className={styles.eyebrow}>Личный кабинет</span>
                <h1>{state.user.name}</h1>
                <p>{state.user.email}</p>
              </div>
            </div>
            <h2>Мои курсы</h2>
            {state.courses.length === 0 ? (
              <Status title='Пока нет доступных курсов' message='Доступ появится здесь после того, как администратор активирует его.' />
            ) : (
              <div className={styles.courseGrid}>
                {state.courses.map((course) => (
                  <article className={styles.courseCard} key={course.slug}>
                    <span className={styles.eyebrow}>Онлайн-курс</span>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <Link href={`/cabinet/courses/${course.slug}`} className={styles.primaryButton}>Открыть курс</Link>
                  </article>
                ))}
              </div>
            )}
          </div>
        ) : null}
      </section>
    </main>
  );
}

function Status({ title, message }: { readonly title: string; readonly message?: string }) {
  return <div className={styles.status}><h2>{title}</h2>{message ? <p>{message}</p> : null}</div>;
}
