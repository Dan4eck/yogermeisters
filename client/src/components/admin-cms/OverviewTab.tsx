import { ArrowUpRight, GitBranch, GraduationCap, Send, Users } from 'lucide-react';

import type { CmsOverview } from '@shared/cms';

import styles from './AdminCms.module.css';

export type AdminCmsTab = 'overview' | 'broadcasts' | 'subscribers' | 'scenarios' | 'courses';

interface OverviewTabProps {
  readonly overview: CmsOverview;
  readonly onSelectTab: (tab: AdminCmsTab) => void;
}

export default function OverviewTab({ overview, onSelectTab }: OverviewTabProps) {
  return (
    <div className={styles.stack}>
      <section className={styles.kpiGrid} aria-label='Ключевые показатели'>
        <article className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Подписчики бота</span>
          <strong className={styles.kpiValue}>{overview.subscribers.active}</strong>
          <span className={styles.kpiMeta}>
            активных из {overview.subscribers.total} · заблокировали: {overview.subscribers.blocked}
          </span>
        </article>

        <article className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Новые за 30 дней</span>
          <strong className={styles.kpiValue}>{overview.subscribers.joinedLast30d}</strong>
          <span className={styles.kpiMeta}>за последние 7 дней: {overview.subscribers.joinedLast7d}</span>
        </article>

        <article className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Рассылки и сценарии</span>
          <strong className={styles.kpiValue}>{overview.broadcasts.messagesSent}</strong>
          <span className={styles.kpiMeta}>
            сообщений доставлено · активных диплинк-сценариев: {overview.scenarios.active}
          </span>
        </article>

        <article className={styles.kpiCard}>
          <span className={styles.kpiLabel}>Доступы к курсам</span>
          <strong className={styles.kpiValue}>{overview.courses.activeCourseAccesses}</strong>
          <span className={styles.kpiMeta}>
            пользователей сайта: {overview.courses.totalUsers} · админов: {overview.courses.totalAdmins}
          </span>
        </article>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>Быстрые действия</h2>
            <p className={styles.panelSub}>
              Бот <span className={styles.mono}>@{overview.botUsername}</span> работает напрямую с этой базой — новые рассылки и диплинк-сценарии подхватываются автоматически.
            </p>
          </div>
        </div>

        <div className={styles.quickGrid}>
          <button type='button' className={styles.quickCard} onClick={() => onSelectTab('broadcasts')}>
            <span className={styles.quickCardTitle}>
              <span className={styles.row}><Send size={16} /> Создать рассылку</span>
              <ArrowUpRight size={16} />
            </span>
            <span className={styles.quickCardText}>
              Загрузите афишу, соберите текст и кнопки, отправьте тест себе и запустите на нужный сегмент или по расписанию.
            </span>
          </button>

          <button type='button' className={styles.quickCard} onClick={() => onSelectTab('scenarios')}>
            <span className={styles.quickCardTitle}>
              <span className={styles.row}><GitBranch size={16} /> Собрать диплинк-воронку</span>
              <ArrowUpRight size={16} />
            </span>
            <span className={styles.quickCardText}>
              Создайте ссылку вида t.me/{overview.botUsername}?start=... с серией шагов по таймеру или по нажатию кнопок.
            </span>
          </button>

          <button type='button' className={styles.quickCard} onClick={() => onSelectTab('subscribers')}>
            <span className={styles.quickCardTitle}>
              <span className={styles.row}><Users size={16} /> Посмотреть клиентов бота</span>
              <ArrowUpRight size={16} />
            </span>
            <span className={styles.quickCardText}>
              История прохождения воронок, источники переходов, ответы квизов, статусы доставок и ручной запуск сценариев.
            </span>
          </button>

          <button type='button' className={styles.quickCard} onClick={() => onSelectTab('courses')}>
            <span className={styles.quickCardTitle}>
              <span className={styles.row}><GraduationCap size={16} /> Выдать доступ к курсу</span>
              <ArrowUpRight size={16} />
            </span>
            <span className={styles.quickCardText}>
              Добавляйте учеников по email (даже до первого входа через Google), следите за прогрессом и управляйте правами менеджеров.
            </span>
          </button>
        </div>
      </section>
    </div>
  );
}
