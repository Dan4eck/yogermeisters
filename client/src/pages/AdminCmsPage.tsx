import { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  GitBranch,
  GraduationCap,
  LayoutDashboard,
  RefreshCw,
  Send,
  ShieldAlert,
  Users,
} from 'lucide-react';
import { Link, useLocation } from 'wouter';

import type { CmsOverview, CmsSubscriberSummary } from '@shared/cms';

import BroadcastsTab from '@/components/admin-cms/BroadcastsTab';
import CoursesTab from '@/components/admin-cms/CoursesTab';
import OverviewTab, { type AdminCmsTab } from '@/components/admin-cms/OverviewTab';
import ScenariosTab from '@/components/admin-cms/ScenariosTab';
import SubscribersTab from '@/components/admin-cms/SubscribersTab';
import styles from '@/components/admin-cms/AdminCms.module.css';
import Header from '@/components/landing-v2/Header';
import VajraLoader from '@/components/VajraLoader';
import { fetchBotSubscribers, fetchCmsOverview } from '@/lib/admin-cms-api';
import { ApiError, apiRequest, type CabinetUser } from '@/lib/cabinet-api';
import type { Language } from '@/lib/i18n';

interface AdminCmsPageProps {
  readonly language: Language;
  readonly setLanguage: (language: Language) => void;
}

type AdminPageState =
  | { readonly kind: 'loading' }
  | { readonly kind: 'forbidden'; readonly user: CabinetUser }
  | { readonly kind: 'error'; readonly message: string }
  | {
      readonly kind: 'ready';
      readonly user: CabinetUser;
      readonly overview: CmsOverview;
      readonly subscribers: readonly CmsSubscriberSummary[];
    };

export default function AdminCmsPage({ language, setLanguage }: AdminCmsPageProps) {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<AdminCmsTab>('overview');
  const [state, setState] = useState<AdminPageState>({ kind: 'loading' });
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async (isInitial: boolean): Promise<void> => {
    if (!isInitial) setRefreshing(true);
    try {
      const { user } = await apiRequest<{ user: CabinetUser }>('/api/me');
      if (user.role !== 'admin') {
        setState({ kind: 'forbidden', user });
        return;
      }
      const [overview, subscribers] = await Promise.all([fetchCmsOverview(), fetchBotSubscribers()]);
      setState({ kind: 'ready', user, overview, subscribers });
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        navigate('/login?next=%2Fcabinet%2Fadmin');
        return;
      }
      setState({
        kind: 'error',
        message: error instanceof ApiError ? error.message : 'Не удалось загрузить панель управления',
      });
    } finally {
      setRefreshing(false);
    }
  }, [navigate]);

  useEffect(() => {
    void loadData(true);
  }, [loadData]);

  return (
    <div className={`landing-v2-root ${styles.cmsRoot}`}>
      <Header language={language} setLanguage={setLanguage} />
      <main className={styles.page}>
        <div className={styles.shell}>
          {state.kind === 'loading' ? (
            <VajraLoader label='Загружаем панель управления' />
          ) : state.kind === 'forbidden' ? (
            <section className={styles.panel} style={{ maxWidth: 560, margin: '48px auto', textAlign: 'center' }}>
              <div className={styles.stack} style={{ alignItems: 'center' }}>
                <ShieldAlert size={36} color='#d35f35' />
                <h1 className={styles.panelTitle}>Доступ только для администраторов</h1>
                <p className={styles.panelSub}>
                  Вы вошли как <strong>{state.user.email}</strong> (роль: {state.user.role}). Попросите владельца проекта выдать роль администратора.
                </p>
                <Link href='/cabinet' className={styles.btnPrimary}>
                  <ArrowLeft size={15} /> Вернуться в кабинет
                </Link>
              </div>
            </section>
          ) : state.kind === 'error' ? (
            <section className={styles.panel} style={{ maxWidth: 560, margin: '48px auto', textAlign: 'center' }}>
              <div className={styles.stack} style={{ alignItems: 'center' }}>
                <h1 className={styles.panelTitle}>Ошибка загрузки</h1>
                <p className={styles.panelSub}>{state.message}</p>
                <button type='button' className={styles.btnPrimary} onClick={() => void loadData(true)}>
                  Попробовать снова
                </button>
              </div>
            </section>
          ) : (
            <>
              <header className={styles.topBar}>
                <div>
                  <div className={styles.eyebrow}>Yogermeisters CMS · Admin</div>
                  <h1 className={styles.title}>Управление ботом и курсами</h1>
                </div>
                <div className={styles.topActions}>
                  <button
                    type='button'
                    className={styles.btn}
                    disabled={refreshing}
                    onClick={() => void loadData(false)}
                  >
                    <RefreshCw size={14} />
                    {refreshing ? 'Обновляем...' : 'Обновить данные'}
                  </button>
                  <Link href='/cabinet' className={styles.btn}>
                    <ArrowLeft size={14} /> В личный кабинет
                  </Link>
                </div>
              </header>

              <nav className={styles.navTabs} aria-label='Разделы админки'>
                <button
                  type='button'
                  className={`${styles.navTab} ${tab === 'overview' ? styles.navTabActive : ''}`}
                  onClick={() => setTab('overview')}
                >
                  <LayoutDashboard size={15} />
                  Обзор
                </button>
                <button
                  type='button'
                  className={`${styles.navTab} ${tab === 'broadcasts' ? styles.navTabActive : ''}`}
                  onClick={() => setTab('broadcasts')}
                >
                  <Send size={15} />
                  Рассылки
                  <span className={styles.navBadge}>{state.overview.broadcasts.total}</span>
                </button>
                <button
                  type='button'
                  className={`${styles.navTab} ${tab === 'subscribers' ? styles.navTabActive : ''}`}
                  onClick={() => setTab('subscribers')}
                >
                  <Users size={15} />
                  Клиенты бота
                  <span className={styles.navBadge}>{state.overview.subscribers.active}</span>
                </button>
                <button
                  type='button'
                  className={`${styles.navTab} ${tab === 'scenarios' ? styles.navTabActive : ''}`}
                  onClick={() => setTab('scenarios')}
                >
                  <GitBranch size={15} />
                  Диплинк-сценарии
                  <span className={styles.navBadge}>{state.overview.scenarios.total}</span>
                </button>
                <button
                  type='button'
                  className={`${styles.navTab} ${tab === 'courses' ? styles.navTabActive : ''}`}
                  onClick={() => setTab('courses')}
                >
                  <GraduationCap size={15} />
                  Курсы и команда
                  <span className={styles.navBadge}>{state.overview.courses.activeCourseAccesses}</span>
                </button>
              </nav>

              {tab === 'overview' ? (
                <OverviewTab overview={state.overview} onSelectTab={setTab} />
              ) : null}
              {tab === 'broadcasts' ? (
                <BroadcastsTab
                  overview={state.overview}
                  subscribers={state.subscribers}
                  onDataChanged={() => void loadData(false)}
                />
              ) : null}
              {tab === 'subscribers' ? (
                <SubscribersTab
                  overview={state.overview}
                  onDataChanged={() => void loadData(false)}
                />
              ) : null}
              {tab === 'scenarios' ? (
                <ScenariosTab
                  overview={state.overview}
                  onDataChanged={() => void loadData(false)}
                />
              ) : null}
              {tab === 'courses' ? (
                <CoursesTab
                  currentUserId={state.user.id}
                  onDataChanged={() => void loadData(false)}
                />
              ) : null}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
