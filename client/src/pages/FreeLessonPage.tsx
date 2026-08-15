import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Check, Clock3, MoveRight, Sparkles } from 'lucide-react';
import { Link, useLocation } from 'wouter';

import Header from '@/components/landing-v2/Header';
import YogaMatLoader from '@/components/YogaMatLoader';
import { ApiError, apiRequest } from '@/lib/cabinet-api';
import type { Language } from '@/lib/i18n';
import styles from './FreeLessonPage.module.css';

interface FreeLessonPageProps {
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
}

const benefits = [
  'меньше напряжения в шее и спине',
  'сильный кор и более здоровая осанка',
  'гибкость без боли и больше лёгкости',
] as const;

export default function FreeLessonPage({ language, setLanguage }: FreeLessonPageProps) {
  const [, navigate] = useLocation();
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isActive = true;

    const loadLesson = async (): Promise<void> => {
      try {
        const media = await apiRequest<{ url: string }>('/api/free-lesson/media');
        if (isActive) {
          setMediaUrl(media.url);
        }
      } catch (requestError: unknown) {
        if (requestError instanceof ApiError && requestError.status === 401) {
          navigate(`/login?next=${encodeURIComponent('/cabinet/free-lesson')}`);
          return;
        }
        if (isActive) {
          setError(language === 'ru' ? 'Не удалось загрузить урок. Попробуй обновить страницу.' : 'Could not load the lesson. Please refresh the page.');
          setIsLoading(false);
        }
      }
    };

    void loadLesson();
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    return () => {
      isActive = false;
    };
  }, [language, navigate]);

  return (
    <div className={`landing-v2-root ${styles.page}`}>
      <Header language={language} setLanguage={setLanguage} />
      <main className={styles.main}>
        <div className={styles.topbar}>
          <Link href='/cabinet' className={styles.backLink}>
            <ArrowLeft aria-hidden='true' />
            {language === 'ru' ? 'В личный кабинет' : 'Back to cabinet'}
          </Link>
          <span className={styles.giftLabel}><Sparkles aria-hidden='true' /> Бесплатный урок</span>
        </div>

        <section className={styles.lessonHero}>
          <div className={styles.titleBlock}>
            <span className={styles.courseName}>the yoga method</span>
            <h1>Общая практика<br />на всё тело</h1>
            <p>Полноценная практика, чтобы познакомиться с методом через собственные ощущения.</p>
            <div className={styles.lessonMeta}>
              <span><Clock3 aria-hidden='true' /> Урок из основной программы</span>
              <span><Check aria-hidden='true' /> Доступ открыт</span>
            </div>
          </div>

          <div className={styles.videoFrame}>
            {isLoading ? (
              <div className={styles.videoLoader}>
                <YogaMatLoader label='Разворачиваем коврик...' variant='heroMedia' />
              </div>
            ) : null}
            {error ? <div className={styles.videoError}>{error}</div> : null}
            {mediaUrl ? (
              <video
                className={isLoading ? styles.videoPending : undefined}
                controls
                controlsList='nodownload'
                playsInline
                preload='auto'
                src={mediaUrl}
                onCanPlay={() => setIsLoading(false)}
                onContextMenu={(event) => event.preventDefault()}
                onError={() => {
                  setIsLoading(false);
                  setError('Не удалось воспроизвести урок. Попробуй обновить страницу.');
                }}
              />
            ) : null}
          </div>
        </section>

        <section className={styles.afterLesson}>
          <div className={styles.afterHeading}>
            <span>Если телу откликнулось</span>
            <h2>Это только одна практика.<br />Дальше — целая система.</h2>
            <p>
              Курс помогает постепенно вернуть телу силу, мобильность и устойчивость — без гонки за идеальными
              формами и риска для суставов.
            </p>
          </div>

          <div className={styles.benefitStrip}>
            {benefits.map((benefit, index) => (
              <div key={benefit}>
                <span>0{index + 1}</span>
                <p>{benefit}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.courseCta}>
          <div>
            <span className={styles.courseName}>the yoga method</span>
            <h2>Продолжить практику</h2>
            <p>Полная программа, короткие занятия на каждый день, медитации и йога-нидра — в удобном темпе.</p>
          </div>
          <Link href='/the-yoga-method#tariffs' className={styles.ctaLink}>
            Посмотреть курс и тарифы
            <ArrowUpRight aria-hidden='true' />
          </Link>
          <MoveRight className={styles.ctaDecoration} aria-hidden='true' />
        </section>
      </main>
    </div>
  );
}
