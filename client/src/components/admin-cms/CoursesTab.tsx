import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Shield, ShieldOff, Trash2, UserPlus } from 'lucide-react';

import type { CmsCourseClientWithProgress, CmsCourseSummary, CmsTeamUser } from '@shared/cms';

import {
  fetchAdminCourses,
  fetchCourseClientsWithProgress,
  fetchTeamUsers,
  grantCourseAccess,
  revokeCourseAccess,
  updateUserRole,
} from '@/lib/admin-cms-api';
import { ApiError } from '@/lib/cabinet-api';
import styles from './AdminCms.module.css';

interface CoursesTabProps {
  readonly currentUserId: string;
  readonly onDataChanged: () => void;
}

export default function CoursesTab({ currentUserId, onDataChanged }: CoursesTabProps) {
  const [courses, setCourses] = useState<readonly CmsCourseSummary[]>([]);
  const [selectedSlug, setSelectedSlug] = useState<string>('');
  const [clients, setClients] = useState<readonly CmsCourseClientWithProgress[]>([]);
  const [teamUsers, setTeamUsers] = useState<readonly CmsTeamUser[]>([]);
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);

  const loadAll = useCallback(async (preferredSlug?: string): Promise<void> => {
    setLoading(true);
    try {
      const [courseList, usersList] = await Promise.all([fetchAdminCourses(), fetchTeamUsers()]);
      setCourses(courseList);
      setTeamUsers(usersList);

      const slug = preferredSlug || selectedSlug || courseList[0]?.slug || '';
      setSelectedSlug(slug);
      if (slug) {
        setClients(await fetchCourseClientsWithProgress(slug));
      }
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof ApiError ? error.message : 'Не удалось загрузить курсы' });
    } finally {
      setLoading(false);
    }
  }, [selectedSlug]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const handleSelectCourse = async (slug: string): Promise<void> => {
    setSelectedSlug(slug);
    try {
      setClients(await fetchCourseClientsWithProgress(slug));
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof ApiError ? error.message : 'Не удалось загрузить учеников' });
    }
  };

  const handleGrant = async (event: FormEvent): Promise<void> => {
    event.preventDefault();
    if (!selectedSlug || !emailInput.trim()) return;
    setBusy(true);
    setNotice(null);
    try {
      const normalized = emailInput.trim().toLowerCase();
      await grantCourseAccess(selectedSlug, normalized);
      setEmailInput('');
      await loadAll(selectedSlug);
      onDataChanged();
      setNotice({
        kind: 'success',
        text: `Доступ к курсу «${selectedSlug}» выдан для ${normalized} (сработает даже до первого входа через Google).`,
      });
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof ApiError ? error.message : 'Не удалось выдать доступ' });
    } finally {
      setBusy(false);
    }
  };

  const handleRevoke = async (client: CmsCourseClientWithProgress): Promise<void> => {
    if (!selectedSlug) return;
    if (!window.confirm(`Отозвать доступ к курсу у ${client.email}?`)) return;
    setBusy(true);
    setNotice(null);
    try {
      await revokeCourseAccess(selectedSlug, client.id);
      await loadAll(selectedSlug);
      onDataChanged();
      setNotice({ kind: 'success', text: `Доступ отозван для ${client.email}` });
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof ApiError ? error.message : 'Не удалось отозвать доступ' });
    } finally {
      setBusy(false);
    }
  };

  const handleToggleRole = async (user: CmsTeamUser): Promise<void> => {
    const nextRole = user.role === 'admin' ? 'student' : 'admin';
    const promptText = nextRole === 'admin'
      ? `Выдать права администратора (доступ к CMS) пользователю ${user.email}?`
      : `Снять права администратора у ${user.email}?`;
    if (!window.confirm(promptText)) return;

    setBusy(true);
    setNotice(null);
    try {
      await updateUserRole(user.id, nextRole);
      await loadAll(selectedSlug);
      onDataChanged();
      setNotice({
        kind: 'success',
        text: nextRole === 'admin' ? `${user.email} назначен администратором` : `${user.email} переведён в ученики`,
      });
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof ApiError ? error.message : 'Не удалось изменить роль' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.stack}>
      {notice ? (
        <div className={notice.kind === 'error' ? styles.noticeError : styles.noticeSuccess}>
          <span>{notice.text}</span>
        </div>
      ) : null}

      {/* Courses Access Manager */}
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>Выдача доступов к курсам</h2>
            <p className={styles.panelSub}>
              Можно выдать доступ по email заранее — когда ученик войдёт через Google с этой почтой, курс уже будет открыт.
            </p>
          </div>
        </div>

        <div className={styles.row} style={{ marginBottom: 18 }}>
          {courses.map((course) => (
            <button
              key={course.slug}
              type='button'
              className={`${styles.navTab} ${selectedSlug === course.slug ? styles.navTabActive : ''}`}
              onClick={() => void handleSelectCourse(course.slug)}
            >
              <span>{course.title}</span>
              <span className={styles.navBadge}>{course.activeClientsCount}</span>
            </button>
          ))}
        </div>

        <form className={styles.row} style={{ marginBottom: 20 }} onSubmit={(e) => void handleGrant(e)}>
          <input
            type='email'
            required
            className={styles.input}
            style={{ maxWidth: 380 }}
            placeholder='student@gmail.com'
            value={emailInput}
            onChange={(e) => setEmailInput(e.target.value)}
          />
          <button type='submit' className={styles.btnAccent} disabled={busy || !selectedSlug}>
            <UserPlus size={15} />
            Выдать доступ
          </button>
        </form>

        {loading ? (
          <div className={styles.emptyState}>Загрузка учеников...</div>
        ) : clients.length === 0 ? (
          <div className={styles.emptyState}>У этого курса пока нет активных учеников.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Ученик</th>
                  <th>Прогресс</th>
                  <th>Доступ выдан</th>
                  <th>Действие</th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => {
                  const pct = client.totalLessons > 0
                    ? Math.round((client.completedLessons / client.totalLessons) * 100)
                    : 0;
                  return (
                    <tr key={client.id}>
                      <td>
                        <strong>{client.name}</strong>
                        <div className={styles.labelHint}>{client.email}</div>
                      </td>
                      <td>
                        <div className={styles.row}>
                          <div className={styles.progressTrack}>
                            <span style={{ width: `${pct}%` }} />
                          </div>
                          <span className={styles.labelHint}>
                            {client.completedLessons} / {client.totalLessons} ({pct}%)
                          </span>
                        </div>
                      </td>
                      <td>{new Date(client.grantedAt).toLocaleDateString('ru-RU')}</td>
                      <td>
                        <button
                          type='button'
                          className={`${styles.btnDanger} ${styles.btnSm}`}
                          disabled={busy}
                          onClick={() => void handleRevoke(client)}
                        >
                          <Trash2 size={13} /> Отозвать
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Team & Roles */}
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>Команда и права доступа ({teamUsers.length})</h2>
            <p className={styles.panelSub}>
              Администраторы получают доступ к этой CMS прямо из личного кабинета.
            </p>
          </div>
        </div>

        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Пользователь</th>
                <th>Роль</th>
                <th>Активные курсы</th>
                <th>Управление</th>
              </tr>
            </thead>
            <tbody>
              {teamUsers.map((user) => {
                const isSelf = user.id === currentUserId;
                return (
                  <tr key={user.id}>
                    <td>
                      <strong>{user.name}</strong> {isSelf ? <span className={`${styles.badge} ${styles.badgeNeutral}`}>Вы</span> : null}
                      <div className={styles.labelHint}>{user.email}</div>
                    </td>
                    <td>
                      <span className={`${styles.badge} ${user.role === 'admin' ? styles.badgeAccent : styles.badgeNeutral}`}>
                        {user.role === 'admin' ? 'Администратор' : 'Ученик'}
                      </span>
                    </td>
                    <td>
                      {user.activeCourseSlugs.length > 0 ? (
                        <div className={styles.row} style={{ gap: 5 }}>
                          {user.activeCourseSlugs.map((slug) => (
                            <span key={slug} className={`${styles.badge} ${styles.badgeSuccess}`}>{slug}</span>
                          ))}
                        </div>
                      ) : (
                        <span className={styles.labelHint}>—</span>
                      )}
                    </td>
                    <td>
                      <button
                        type='button'
                        className={`${styles.btn} ${styles.btnSm}`}
                        disabled={busy || isSelf}
                        onClick={() => void handleToggleRole(user)}
                      >
                        {user.role === 'admin' ? <ShieldOff size={13} /> : <Shield size={13} />}
                        {user.role === 'admin' ? 'Снять админа' : 'Сделать админом'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
