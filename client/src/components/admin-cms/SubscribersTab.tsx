import { useCallback, useEffect, useState } from 'react';
import { Play, RefreshCw, Search, UserCheck, UserX } from 'lucide-react';

import type { CmsOverview, CmsScenarioRecord, CmsSubscriberDetail, CmsSubscriberSummary } from '@shared/cms';

import {
  enrollSubscriberInScenario,
  fetchBotSubscriberDetail,
  fetchBotSubscribers,
  fetchScenarios,
} from '@/lib/admin-cms-api';
import { ApiError } from '@/lib/cabinet-api';
import styles from './AdminCms.module.css';

interface SubscribersTabProps {
  readonly overview: CmsOverview;
  readonly onDataChanged: () => void;
}

export default function SubscribersTab({ overview, onDataChanged }: SubscribersTabProps) {
  const [subscribers, setSubscribers] = useState<readonly CmsSubscriberSummary[]>([]);
  const [activeScenarios, setActiveScenarios] = useState<readonly CmsScenarioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [funnelFilter, setFunnelFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<CmsSubscriberDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [enrollScenarioId, setEnrollScenarioId] = useState('');
  const [enrolling, setEnrolling] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const loadList = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      const [subs, scenarios] = await Promise.all([
        fetchBotSubscribers({
          search: search.trim() || undefined,
          status: statusFilter || undefined,
          funnelKey: funnelFilter || undefined,
          source: sourceFilter || undefined,
        }),
        fetchScenarios(),
      ]);
      setSubscribers(subs);
      setActiveScenarios(scenarios.filter((s) => s.status === 'active'));
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof ApiError ? error.message : 'Не удалось загрузить клиентов' });
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, funnelFilter, sourceFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadList();
    }, 180);
    return () => window.clearTimeout(timer);
  }, [loadList]);

  const loadDetail = useCallback(async (id: string): Promise<void> => {
    setSelectedId(id);
    setLoadingDetail(true);
    try {
      setDetail(await fetchBotSubscriberDetail(id));
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof ApiError ? error.message : 'Не удалось загрузить карточку' });
    } finally {
      setLoadingDetail(false);
    }
  }, []);

  const handleManualEnroll = async (): Promise<void> => {
    if (!detail || !enrollScenarioId) return;
    setEnrolling(true);
    setNotice(null);
    try {
      await enrollSubscriberInScenario(detail.id, enrollScenarioId);
      setEnrollScenarioId('');
      await Promise.all([loadDetail(detail.id), loadList()]);
      onDataChanged();
      setNotice({ kind: 'success', text: 'Сценарий запущен для клиента — бот отправит первый шаг в ближайшие секунды.' });
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof ApiError ? error.message : 'Не удалось запустить сценарий' });
    } finally {
      setEnrolling(false);
    }
  };

  return (
    <div className={styles.stack}>
      {notice ? (
        <div className={notice.kind === 'error' ? styles.noticeError : styles.noticeSuccess}>
          <span>{notice.text}</span>
        </div>
      ) : null}

      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>Клиенты Telegram-бота ({subscribers.length})</h2>
            <p className={styles.panelSub}>Нажмите на любого подписчика, чтобы увидеть историю воронок, шагов и рассылок</p>
          </div>
          <button type='button' className={`${styles.btn} ${styles.btnSm}`} onClick={() => void loadList()}>
            <RefreshCw size={13} /> Обновить
          </button>
        </div>

        <div className={styles.row} style={{ marginBottom: 16 }}>
          <div style={{ position: 'relative', flex: '1 1 240px' }}>
            <Search size={14} style={{ position: 'absolute', left: 11, top: 13, color: '#706962' }} />
            <input
              className={styles.input}
              style={{ paddingLeft: 34 }}
              placeholder='Поиск по имени, @username, Telegram ID...'
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select className={styles.select} style={{ width: 'auto' }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value=''>Все статусы</option>
            <option value='active'>Активные</option>
            <option value='blocked'>Заблокировали</option>
          </select>

          <select className={styles.select} style={{ width: 'auto' }} value={funnelFilter} onChange={(e) => setFunnelFilter(e.target.value)}>
            <option value=''>Все воронки</option>
            {overview.filterOptions.funnels.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>

          <select className={styles.select} style={{ width: 'auto' }} value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)}>
            <option value=''>Все источники</option>
            <option value='__none__'>Без параметра (/start)</option>
            {overview.filterOptions.sources.map((src) => (
              <option key={src} value={src}>{src}</option>
            ))}
          </select>
        </div>

        <div className={styles.twoCol}>
          <div className={styles.tableWrap}>
            {loading ? (
              <div className={styles.emptyState}>Загрузка подписчиков...</div>
            ) : subscribers.length === 0 ? (
              <div className={styles.emptyState}>Никого не найдено по текущим фильтрам.</div>
            ) : (
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Клиент</th>
                    <th>Статус</th>
                    <th>Воронки</th>
                    <th>Источник</th>
                    <th>Активность</th>
                  </tr>
                </thead>
                <tbody>
                  {subscribers.map((sub) => (
                    <tr
                      key={sub.id}
                      className={`${styles.tableRowClickable} ${selectedId === sub.id ? styles.tableRowSelected : ''}`}
                      onClick={() => void loadDetail(sub.id)}
                    >
                      <td>
                        <strong>{sub.firstName} {sub.lastName ?? ''}</strong>
                        <div className={styles.labelHint}>
                          {sub.username ? `@${sub.username}` : `ID ${sub.telegramUserId}`}
                          {sub.languageCode ? ` · ${sub.languageCode}` : ''}
                        </div>
                      </td>
                      <td>
                        {sub.status === 'active' ? (
                          <span className={`${styles.badge} ${styles.badgeSuccess}`}>
                            <UserCheck size={11} /> active
                          </span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badgeDanger}`}>
                            <UserX size={11} /> blocked
                          </span>
                        )}
                      </td>
                      <td>
                        <div className={styles.row} style={{ gap: 5 }}>
                          {sub.funnels.length === 0 ? (
                            <span className={styles.labelHint}>—</span>
                          ) : (
                            sub.funnels.map((f) => (
                              <span
                                key={`${f.funnelKey}-${f.funnelVersion}`}
                                className={`${styles.badge} ${
                                  f.status === 'completed' ? styles.badgeSuccess : styles.badgeAccent
                                }`}
                              >
                                {formatFunnelName(f.funnelKey)} {f.sentSteps}/{f.totalSteps}
                              </span>
                            ))
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={styles.mono}>{sub.firstStartPayload ?? '/start'}</span>
                      </td>
                      <td>{formatDate(sub.lastInteractionAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Client Detail Drawer */}
          <aside className={styles.panel} style={{ background: 'rgba(255,255,255,0.85)' }}>
            {!selectedId ? (
              <div className={styles.emptyState}>Выберите клиента в таблице слева, чтобы посмотреть подробную карточку.</div>
            ) : loadingDetail || !detail ? (
              <div className={styles.emptyState}>Загрузка карточки клиента...</div>
            ) : (
              <div className={styles.stack}>
                <div className={styles.rowBetween}>
                  <div>
                    <h3 className={styles.panelTitle}>{detail.firstName} {detail.lastName ?? ''}</h3>
                    <div className={styles.labelHint}>
                      {detail.username ? `@${detail.username} · ` : ''}ID: {detail.telegramUserId} · Язык: {detail.languageCode ?? '—'}
                    </div>
                  </div>
                  <span className={`${styles.badge} ${detail.status === 'active' ? styles.badgeSuccess : styles.badgeDanger}`}>
                    {detail.status}
                  </span>
                </div>

                <div className={styles.notice} style={{ flexDirection: 'column', alignItems: 'flex-start', gap: 4 }}>
                  <div>Первый вход: <span className={styles.mono}>{detail.firstStartPayload ?? '(без диплинка)'}</span></div>
                  <div>Последний диплинк: <span className={styles.mono}>{detail.latestStartPayload ?? '(без диплинка)'}</span></div>
                  <div>Регистрация: {formatDate(detail.startedAt)} · Получено рассылок: {detail.broadcastsReceived}</div>
                </div>

                {detail.status === 'active' && activeScenarios.length > 0 ? (
                  <div className={styles.field}>
                    <span className={styles.label}>Запустить сценарий вручную</span>
                    <div className={styles.row}>
                      <select
                        className={styles.select}
                        style={{ flex: 1 }}
                        value={enrollScenarioId}
                        onChange={(e) => setEnrollScenarioId(e.target.value)}
                      >
                        <option value=''>Выберите активный сценарий...</option>
                        {activeScenarios.map((sc) => (
                          <option key={sc.id} value={sc.id}>{sc.title} (?start={sc.startPayload})</option>
                        ))}
                      </select>
                      <button
                        type='button'
                        className={`${styles.btnPrimary} ${styles.btnSm}`}
                        disabled={!enrollScenarioId || enrolling}
                        onClick={() => void handleManualEnroll()}
                      >
                        <Play size={13} /> Запустить
                      </button>
                    </div>
                  </div>
                ) : null}

                <div>
                  <span className={styles.label}>Воронки и шаги ({detail.enrollments.length})</span>
                  {detail.enrollments.length === 0 ? (
                    <div className={styles.labelHint} style={{ marginTop: 6 }}>Нет прохождений.</div>
                  ) : (
                    <div className={styles.stack} style={{ gap: 10, marginTop: 8 }}>
                      {detail.enrollments.map((enrollment) => (
                        <div key={enrollment.id} className={styles.stepCard} style={{ padding: 12, gap: 8 }}>
                          <div className={styles.rowBetween}>
                            <strong>{formatFunnelName(enrollment.funnelKey)}</strong>
                            <span
                              className={`${styles.badge} ${
                                enrollment.status === 'completed'
                                  ? styles.badgeSuccess
                                  : enrollment.status === 'active'
                                    ? styles.badgeAccent
                                    : styles.badgeNeutral
                              }`}
                            >
                              {enrollment.status}
                            </span>
                          </div>
                          {enrollment.conversationState ? (
                            <div className={styles.labelHint}>
                              Состояние квиза: <span className={styles.mono}>{JSON.stringify(enrollment.conversationState)}</span>
                            </div>
                          ) : null}
                          <div className={styles.timeline}>
                            {enrollment.deliveries.map((d) => (
                              <div key={d.id} className={styles.timelineItem}>
                                <div>
                                  <span className={styles.mono}>{d.contentKey}</span>
                                  {d.lastError ? <div style={{ color: '#b4362a' }}>{d.lastError}</div> : null}
                                </div>
                                <div className={styles.row}>
                                  <span className={styles.labelHint}>
                                    {d.sentAt ? formatDate(d.sentAt) : formatDate(d.scheduledAt)}
                                  </span>
                                  <span
                                    className={`${styles.badge} ${
                                      d.status === 'sent'
                                        ? styles.badgeSuccess
                                        : d.status === 'failed'
                                          ? styles.badgeDanger
                                          : styles.badgeNeutral
                                    }`}
                                  >
                                    {d.status}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <span className={styles.label}>История рассылок ({detail.broadcastHistory.length})</span>
                  {detail.broadcastHistory.length === 0 ? (
                    <div className={styles.labelHint} style={{ marginTop: 6 }}>Рассылки ещё не отправлялись.</div>
                  ) : (
                    <div className={styles.timeline}>
                      {detail.broadcastHistory.map((b) => (
                        <div key={b.id} className={styles.timelineItem}>
                          <div>
                            <strong>{b.broadcastTitle}</strong>{' '}
                            {b.isTest ? <span className={`${styles.badge} ${styles.badgeAccent}`}>ТЕСТ</span> : null}
                          </div>
                          <span
                            className={`${styles.badge} ${
                              b.status === 'sent' ? styles.badgeSuccess : b.status === 'failed' ? styles.badgeDanger : styles.badgeNeutral
                            }`}
                          >
                            {b.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </aside>
        </div>
      </section>
    </div>
  );
}

function formatFunnelName(key: string): string {
  if (key === 'welcome_meditation') return 'Медитация';
  if (key === 'personal_practice') return 'Подбор практики';
  if (key.startsWith('scenario:')) return key.slice('scenario:'.length);
  return key;
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}
