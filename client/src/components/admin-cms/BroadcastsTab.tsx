import { useCallback, useEffect, useMemo, useState, type ChangeEvent } from 'react';
import {
  CalendarClock,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  ImagePlus,
  Plus,
  RefreshCw,
  Send,
  Trash2,
  X,
} from 'lucide-react';

import type {
  BroadcastStatus,
  BroadcastTargetType,
  CmsBroadcastDeliveryItem,
  CmsBroadcastInput,
  CmsBroadcastRecord,
  CmsOverview,
  CmsSubscriberSummary,
  CmsUrlButton,
} from '@shared/cms';

import {
  createBroadcast,
  deleteOrCancelBroadcast,
  fetchBroadcastDeliveries,
  fetchBroadcasts,
  launchBroadcast,
  sendTestBroadcast,
  updateBroadcast,
  uploadBotMediaFile,
} from '@/lib/admin-cms-api';
import { ApiError } from '@/lib/cabinet-api';
import styles from './AdminCms.module.css';

interface BroadcastsTabProps {
  readonly overview: CmsOverview;
  readonly subscribers: readonly CmsSubscriberSummary[];
  readonly onDataChanged: () => void;
}

interface DraftFormState {
  readonly id: string | null;
  readonly title: string;
  readonly messageText: string;
  readonly mediaAssetId: string | null;
  readonly mediaPreviewUrl: string | null;
  readonly mediaUrl: string;
  readonly buttons: readonly CmsUrlButton[];
  readonly targetType: BroadcastTargetType;
  readonly funnelKey: string;
  readonly startPayload: string;
  readonly languageCode: string;
  readonly manualSubscriberIds: readonly string[];
  readonly scheduleMode: 'now' | 'later';
  readonly scheduledLocal: string;
}

const EMPTY_FORM: DraftFormState = {
  id: null,
  title: '',
  messageText: '',
  mediaAssetId: null,
  mediaPreviewUrl: null,
  mediaUrl: '',
  buttons: [],
  targetType: 'all_active',
  funnelKey: '',
  startPayload: '',
  languageCode: '',
  manualSubscriberIds: [],
  scheduleMode: 'now',
  scheduledLocal: '',
};

export default function BroadcastsTab({ overview, subscribers, onDataChanged }: BroadcastsTabProps) {
  const [broadcasts, setBroadcasts] = useState<readonly CmsBroadcastRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState<DraftFormState>(EMPTY_FORM);
  const [testTargetIds, setTestTargetIds] = useState<readonly string[]>([]);
  const [expandedBroadcastId, setExpandedBroadcastId] = useState<string | null>(null);
  const [deliveries, setDeliveries] = useState<readonly CmsBroadcastDeliveryItem[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(false);

  const activeSubscribers = useMemo(
    () => subscribers.filter((sub) => sub.status === 'active'),
    [subscribers],
  );

  const loadBroadcasts = useCallback(async (): Promise<void> => {
    try {
      setLoading(true);
      const list = await fetchBroadcasts();
      setBroadcasts(list);
    } catch (error) {
      setNotice({ kind: 'error', text: getErr(error, 'Не удалось загрузить рассылки') });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadBroadcasts();
  }, [loadBroadcasts]);

  const hasPhoto = Boolean(form.mediaAssetId || form.mediaUrl.trim());
  const plainTextLength = form.messageText.replace(/<[^>]+>/g, '').length;
  const maxChars = hasPhoto ? 1024 : 4096;
  const isOverLimit = plainTextLength > maxChars;

  const estimatedRecipients = useMemo(() => {
    if (form.targetType === 'all_active') return activeSubscribers.length;
    if (form.targetType === 'manual') return form.manualSubscriberIds.length;
    if (form.targetType === 'funnel') {
      return activeSubscribers.filter((s) => s.funnels.some((f) => f.funnelKey === form.funnelKey)).length;
    }
    if (form.targetType === 'language') {
      return activeSubscribers.filter((s) => s.languageCode === form.languageCode).length;
    }
    if (form.targetType === 'source') {
      if (form.startPayload === '__none__') {
        return activeSubscribers.filter((s) => s.firstStartPayload === null).length;
      }
      return activeSubscribers.filter(
        (s) => s.firstStartPayload === form.startPayload || s.latestStartPayload === form.startPayload,
      ).length;
    }
    return 0;
  }, [activeSubscribers, form]);

  const handlePhotoUpload = async (event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;
    setNotice(null);
    setUploading(true);
    try {
      const asset = await uploadBotMediaFile(file);
      setForm((prev) => ({
        ...prev,
        mediaAssetId: asset.id,
        mediaPreviewUrl: asset.previewUrl,
        mediaUrl: '',
      }));
      setNotice({ kind: 'success', text: `Изображение «${asset.filename}» загружено` });
    } catch (error) {
      setNotice({ kind: 'error', text: getErr(error, 'Ошибка загрузки изображения') });
    } finally {
      setUploading(false);
      event.target.value = '';
    }
  };

  const buildPayload = (): CmsBroadcastInput => {
    const cleanButtons = form.buttons
      .filter((btn) => btn.text.trim() && btn.url.trim())
      .map((btn) => [{ text: btn.text.trim(), url: btn.url.trim() }]);

    const targetFilter = form.targetType === 'funnel'
      ? { funnelKey: form.funnelKey }
      : form.targetType === 'source'
        ? { startPayload: form.startPayload }
        : form.targetType === 'language'
          ? { languageCode: form.languageCode }
          : form.targetType === 'manual'
            ? { subscriberIds: form.manualSubscriberIds }
            : {};

    return {
      title: form.title.trim(),
      messageText: form.messageText.trim(),
      parseMode: 'HTML',
      mediaAssetId: form.mediaAssetId,
      mediaUrl: form.mediaAssetId ? null : (form.mediaUrl.trim() || null),
      mediaType: hasPhoto ? 'photo' : null,
      buttons: cleanButtons,
      targetType: form.targetType,
      targetFilter,
      scheduledAt: form.scheduleMode === 'later' && form.scheduledLocal
        ? new Date(form.scheduledLocal).toISOString()
        : null,
    };
  };

  const saveDraft = async (): Promise<CmsBroadcastRecord | null> => {
    setNotice(null);
    setBusy(true);
    try {
      const payload = buildPayload();
      const saved = form.id
        ? await updateBroadcast(form.id, payload)
        : await createBroadcast(payload);
      setForm((prev) => ({ ...prev, id: saved.id }));
      await loadBroadcasts();
      onDataChanged();
      setNotice({ kind: 'success', text: `Черновик «${saved.title}» сохранён` });
      return saved;
    } catch (error) {
      setNotice({ kind: 'error', text: getErr(error, 'Не удалось сохранить черновик') });
      return null;
    } finally {
      setBusy(false);
    }
  };

  const handleSendTest = async (): Promise<void> => {
    if (testTargetIds.length === 0) {
      setNotice({ kind: 'error', text: 'Выберите хотя бы одного получателя для теста' });
      return;
    }
    const saved = await saveDraft();
    if (!saved) return;
    setBusy(true);
    try {
      const res = await sendTestBroadcast(saved.id, testTargetIds);
      await loadBroadcasts();
      setNotice({
        kind: 'success',
        text: `Тест поставлен в очередь (${res.queued} чел.). Бот доставит сообщение в течение ~15 секунд.`,
      });
    } catch (error) {
      setNotice({ kind: 'error', text: getErr(error, 'Не удалось отправить тест') });
    } finally {
      setBusy(false);
    }
  };

  const handleLaunch = async (): Promise<void> => {
    if (estimatedRecipients === 0) {
      setNotice({ kind: 'error', text: 'По выбранному фильтру нет активных получателей' });
      return;
    }
    const confirmText = form.scheduleMode === 'later'
      ? `Запланировать рассылку для ${estimatedRecipients} активных подписчиков?`
      : `Запустить рассылку прямо сейчас для ${estimatedRecipients} активных подписчиков?`;
    if (!window.confirm(confirmText)) return;

    const saved = await saveDraft();
    if (!saved) return;

    setBusy(true);
    try {
      const scheduledAt = form.scheduleMode === 'later' && form.scheduledLocal
        ? new Date(form.scheduledLocal).toISOString()
        : null;
      const res = await launchBroadcast(saved.id, scheduledAt);
      setForm(EMPTY_FORM);
      await loadBroadcasts();
      onDataChanged();
      setNotice({
        kind: 'success',
        text: res.status === 'scheduled'
          ? `Рассылка запланирована для ${res.queued} получателей`
          : `Рассылка запущена! В очереди ${res.queued} получателей — бот отправит сообщения в ближайшие секунды.`,
      });
    } catch (error) {
      setNotice({ kind: 'error', text: getErr(error, 'Не удалось запустить рассылку') });
    } finally {
      setBusy(false);
    }
  };

  const handleEditDraft = (item: CmsBroadcastRecord): void => {
    setForm({
      id: item.id,
      title: item.title,
      messageText: item.messageText,
      mediaAssetId: item.mediaAssetId,
      mediaPreviewUrl: item.mediaPreviewUrl,
      mediaUrl: item.mediaUrl ?? '',
      buttons: item.buttons.flat(),
      targetType: item.targetType,
      funnelKey: item.targetFilter.funnelKey ?? '',
      startPayload: item.targetFilter.startPayload ?? '',
      languageCode: item.targetFilter.languageCode ?? '',
      manualSubscriberIds: item.targetFilter.subscriberIds ?? [],
      scheduleMode: item.scheduledAt ? 'later' : 'now',
      scheduledLocal: item.scheduledAt ? toLocalDateTimeInput(item.scheduledAt) : '',
    });
    setNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteOrCancel = async (item: CmsBroadcastRecord): Promise<void> => {
    const actionLabel = item.status === 'draft' || item.status === 'cancelled' ? 'удалить' : 'отменить';
    if (!window.confirm(`Точно ${actionLabel} рассылку «${item.title}»?`)) return;
    setBusy(true);
    try {
      await deleteOrCancelBroadcast(item.id);
      if (form.id === item.id) setForm(EMPTY_FORM);
      await loadBroadcasts();
      onDataChanged();
    } catch (error) {
      setNotice({ kind: 'error', text: getErr(error, 'Не удалось обновить статус рассылки') });
    } finally {
      setBusy(false);
    }
  };

  const toggleDeliveries = async (broadcastId: string): Promise<void> => {
    if (expandedBroadcastId === broadcastId) {
      setExpandedBroadcastId(null);
      return;
    }
    setExpandedBroadcastId(broadcastId);
    setLoadingDeliveries(true);
    try {
      setDeliveries(await fetchBroadcastDeliveries(broadcastId));
    } catch (error) {
      setNotice({ kind: 'error', text: getErr(error, 'Не удалось загрузить лог доставки') });
    } finally {
      setLoadingDeliveries(false);
    }
  };

  const previewImageSrc = form.mediaPreviewUrl || (form.mediaUrl.startsWith('http') ? form.mediaUrl : null);

  return (
    <div className={styles.stack}>
      {notice ? (
        <div className={notice.kind === 'error' ? styles.noticeError : styles.noticeSuccess}>
          <span>{notice.text}</span>
          <button type='button' className={styles.btnGhost} onClick={() => setNotice(null)} aria-label='Закрыть'>
            <X size={15} />
          </button>
        </div>
      ) : null}

      <div className={styles.twoCol}>
        {/* Left: Composer */}
        <section className={styles.panel}>
          <div className={styles.panelHeader}>
            <div>
              <h2 className={styles.panelTitle}>{form.id ? 'Редактирование рассылки' : 'Новая рассылка'}</h2>
              <p className={styles.panelSub}>Поддерживается HTML-форматирование Telegram: &lt;b&gt;, &lt;i&gt;, &lt;a href="..."&gt;</p>
            </div>
            {form.id ? (
              <button type='button' className={`${styles.btn} ${styles.btnSm}`} onClick={() => setForm(EMPTY_FORM)}>
                Новый черновик
              </button>
            ) : null}
          </div>

          <div className={styles.stack}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor='bc-title'>
                Название рассылки (внутреннее)
              </label>
              <input
                id='bc-title'
                className={styles.input}
                placeholder='Например: Приглашение на ретриты (Чехия + Шри-Ланка)'
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor='bc-text'>
                <span>Текст сообщения</span>
                <span className={styles.labelHint} style={isOverLimit ? { color: '#b4362a', fontWeight: 700 } : undefined}>
                  {plainTextLength} / {maxChars} симв. {hasPhoto ? '(лимит подписи к фото)' : ''}
                </span>
              </label>
              <textarea
                id='bc-text'
                className={styles.textarea}
                rows={7}
                placeholder='Привет! 🌿 Хочу лично пригласить тебя...'
                value={form.messageText}
                onChange={(e) => setForm((p) => ({ ...p, messageText: e.target.value }))}
              />
            </div>

            {/* Photo upload */}
            <div className={styles.field}>
              <span className={styles.label}>Картинка / Афиша (необязательно)</span>
              <div className={styles.uploadBox}>
                <div className={styles.row}>
                  {previewImageSrc ? <img src={previewImageSrc} alt='' className={styles.uploadThumb} /> : null}
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500 }}>
                      {form.mediaAssetId ? 'Файл загружен в базу' : 'Загрузите PNG, JPG или WEBP до 5 МБ'}
                    </div>
                    <div className={styles.labelHint}>Бот сам закэширует Telegram file_id после первой отправки</div>
                  </div>
                </div>
                <div className={styles.row}>
                  <label className={`${styles.btn} ${styles.btnSm}`}>
                    <ImagePlus size={14} />
                    {uploading ? 'Загрузка...' : 'Выбрать файл'}
                    <input
                      type='file'
                      accept='image/png,image/jpeg,image/webp'
                      style={{ display: 'none' }}
                      onChange={(e) => void handlePhotoUpload(e)}
                      disabled={uploading}
                    />
                  </label>
                  {form.mediaAssetId || form.mediaUrl ? (
                    <button
                      type='button'
                      className={`${styles.btnDanger} ${styles.btnSm}`}
                      onClick={() => setForm((p) => ({ ...p, mediaAssetId: null, mediaPreviewUrl: null, mediaUrl: '' }))}
                    >
                      Убрать
                    </button>
                  ) : null}
                </div>
              </div>
              {!form.mediaAssetId ? (
                <input
                  className={styles.input}
                  placeholder='Или вставьте HTTPS-ссылку / Telegram file_id'
                  value={form.mediaUrl}
                  onChange={(e) => setForm((p) => ({ ...p, mediaUrl: e.target.value }))}
                />
              ) : null}
            </div>

            {/* Inline URL buttons */}
            <div className={styles.field}>
              <div className={styles.label}>
                <span>Inline-кнопки со ссылками</span>
                <button
                  type='button'
                  className={`${styles.btn} ${styles.btnSm}`}
                  onClick={() => setForm((p) => ({ ...p, buttons: [...p.buttons, { text: '', url: '' }] }))}
                >
                  <Plus size={13} /> Добавить кнопку
                </button>
              </div>
              {form.buttons.map((btn, idx) => (
                <div key={idx} className={styles.row}>
                  <input
                    className={styles.input}
                    style={{ flex: '1 1 170px' }}
                    placeholder='Текст кнопки (напр. 🌊 Шри-Ланка)'
                    value={btn.text}
                    onChange={(e) => {
                      const next = [...form.buttons];
                      next[idx] = { ...btn, text: e.target.value };
                      setForm((p) => ({ ...p, buttons: next }));
                    }}
                  />
                  <input
                    className={styles.input}
                    style={{ flex: '1.4 1 220px' }}
                    placeholder='https://...'
                    value={btn.url}
                    onChange={(e) => {
                      const next = [...form.buttons];
                      next[idx] = { ...btn, url: e.target.value };
                      setForm((p) => ({ ...p, buttons: next }));
                    }}
                  />
                  <button
                    type='button'
                    className={`${styles.btnGhost} ${styles.btnSm}`}
                    onClick={() => setForm((p) => ({ ...p, buttons: p.buttons.filter((_, i) => i !== idx) }))}
                    aria-label='Удалить кнопку'
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>

            {/* Audience targeting */}
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor='bc-target'>Аудитория</label>
                <select
                  id='bc-target'
                  className={styles.select}
                  value={form.targetType}
                  onChange={(e) => setForm((p) => ({ ...p, targetType: e.target.value as BroadcastTargetType }))}
                >
                  <option value='all_active'>Все активные подписчики ({activeSubscribers.length})</option>
                  <option value='funnel'>По воронке / сценарию</option>
                  <option value='source'>По диплинк-источнику</option>
                  <option value='language'>По языку Telegram</option>
                  <option value='manual'>Выбрать вручную</option>
                </select>
              </div>

              {form.targetType === 'funnel' ? (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor='bc-funnel'>Воронка</label>
                  <select
                    id='bc-funnel'
                    className={styles.select}
                    value={form.funnelKey}
                    onChange={(e) => setForm((p) => ({ ...p, funnelKey: e.target.value }))}
                  >
                    <option value=''>Выберите воронку...</option>
                    {overview.filterOptions.funnels.map((f) => (
                      <option key={f} value={f}>{f}</option>
                    ))}
                  </select>
                </div>
              ) : null}

              {form.targetType === 'source' ? (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor='bc-source'>Источник входа</label>
                  <select
                    id='bc-source'
                    className={styles.select}
                    value={form.startPayload}
                    onChange={(e) => setForm((p) => ({ ...p, startPayload: e.target.value }))}
                  >
                    <option value=''>Выберите источник...</option>
                    <option value='__none__'>(обычный /start без параметра)</option>
                    {overview.filterOptions.sources.map((src) => (
                      <option key={src} value={src}>{src}</option>
                    ))}
                  </select>
                </div>
              ) : null}

              {form.targetType === 'language' ? (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor='bc-lang'>Язык</label>
                  <select
                    id='bc-lang'
                    className={styles.select}
                    value={form.languageCode}
                    onChange={(e) => setForm((p) => ({ ...p, languageCode: e.target.value }))}
                  >
                    <option value=''>Выберите язык...</option>
                    {overview.filterOptions.languages.map((lang) => (
                      <option key={lang} value={lang}>{lang}</option>
                    ))}
                  </select>
                </div>
              ) : null}
            </div>

            {form.targetType === 'manual' ? (
              <div className={styles.field}>
                <span className={styles.label}>
                  Выберите получателей ({form.manualSubscriberIds.length} выбрано)
                </span>
                <div className={styles.subListScroll}>
                  {activeSubscribers.map((sub) => {
                    const checked = form.manualSubscriberIds.includes(sub.id);
                    return (
                      <label key={sub.id} className={styles.subCheckItem}>
                        <span className={styles.row}>
                          <input
                            type='checkbox'
                            checked={checked}
                            onChange={() => {
                              setForm((p) => ({
                                ...p,
                                manualSubscriberIds: checked
                                  ? p.manualSubscriberIds.filter((id) => id !== sub.id)
                                  : [...p.manualSubscriberIds, sub.id],
                              }));
                            }}
                          />
                          <span>{sub.firstName} {sub.lastName ?? ''}</span>
                          {sub.username ? <span className={styles.labelHint}>@{sub.username}</span> : null}
                        </span>
                        <span className={styles.mono}>{sub.languageCode ?? '—'}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Schedule */}
            <div className={styles.fieldGrid}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor='bc-when'>Когда отправить</label>
                <select
                  id='bc-when'
                  className={styles.select}
                  value={form.scheduleMode}
                  onChange={(e) => setForm((p) => ({ ...p, scheduleMode: e.target.value as 'now' | 'later' }))}
                >
                  <option value='now'>Сразу после запуска</option>
                  <option value='later'>По расписанию (дата и время)</option>
                </select>
              </div>
              {form.scheduleMode === 'later' ? (
                <div className={styles.field}>
                  <label className={styles.label} htmlFor='bc-dt'>Дата и время отправки</label>
                  <input
                    id='bc-dt'
                    type='datetime-local'
                    className={styles.input}
                    value={form.scheduledLocal}
                    onChange={(e) => setForm((p) => ({ ...p, scheduledLocal: e.target.value }))}
                  />
                </div>
              ) : null}
            </div>

            <div className={styles.rowBetween} style={{ paddingTop: 6 }}>
              <button
                type='button'
                className={styles.btn}
                disabled={busy || !form.title.trim() || !form.messageText.trim() || isOverLimit}
                onClick={() => void saveDraft()}
              >
                Сохранить черновик
              </button>
              <button
                type='button'
                className={styles.btnAccent}
                disabled={busy || !form.title.trim() || !form.messageText.trim() || isOverLimit || estimatedRecipients === 0}
                onClick={() => void handleLaunch()}
              >
                {form.scheduleMode === 'later' ? <CalendarClock size={15} /> : <Send size={15} />}
                {form.scheduleMode === 'later'
                  ? `Запланировать (${estimatedRecipients} чел.)`
                  : `Запустить рассылку (${estimatedRecipients} чел.)`}
              </button>
            </div>
          </div>
        </section>

        {/* Right: Telegram Live Preview + Test Send */}
        <aside className={styles.stack}>
          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <h3 className={styles.panelTitle}>Превью в Telegram</h3>
              <span className={`${styles.badge} ${styles.badgeNeutral}`}>@{overview.botUsername}</span>
            </div>

            <div className={styles.tgPhone}>
              <div className={styles.tgHeader}>
                <span>Yogermeisters Bot</span>
                <span>сейчас</span>
              </div>
              <div className={styles.tgBubble}>
                {previewImageSrc ? <img src={previewImageSrc} alt='Превью' className={styles.tgPhoto} /> : null}
                <div className={styles.tgText}>
                  {form.messageText.trim()
                    ? form.messageText.replace(/<[^>]+>/g, '')
                    : 'Здесь появится текст вашей рассылки...'}
                </div>
              </div>
              {form.buttons.some((b) => b.text.trim()) ? (
                <div className={styles.tgButtons}>
                  {form.buttons
                    .filter((b) => b.text.trim())
                    .map((btn, i) => (
                      <div key={i} className={styles.tgButtonRow}>
                        <div className={styles.tgButton}>{btn.text} ↗</div>
                      </div>
                    ))}
                </div>
              ) : null}
            </div>
          </section>

          <section className={styles.panel}>
            <div className={styles.panelHeader}>
              <div>
                <h3 className={styles.panelTitle}>Тестовая отправка</h3>
                <p className={styles.panelSub}>Проверьте, как сообщение выглядит в Telegram, до запуска по всей базе.</p>
              </div>
            </div>
            <div className={styles.stack}>
              <div className={styles.subListScroll}>
                {activeSubscribers.map((sub) => {
                  const checked = testTargetIds.includes(sub.id);
                  return (
                    <label key={sub.id} className={styles.subCheckItem}>
                      <span className={styles.row}>
                        <input
                          type='checkbox'
                          checked={checked}
                          onChange={() =>
                            setTestTargetIds((prev) =>
                              checked ? prev.filter((id) => id !== sub.id) : [...prev, sub.id],
                            )
                          }
                        />
                        <span>{sub.firstName}</span>
                        {sub.username ? <span className={styles.labelHint}>@{sub.username}</span> : null}
                      </span>
                    </label>
                  );
                })}
              </div>
              <button
                type='button'
                className={styles.btnPrimary}
                disabled={busy || testTargetIds.length === 0 || !form.title.trim() || !form.messageText.trim() || isOverLimit}
                onClick={() => void handleSendTest()}
              >
                <FlaskConical size={15} />
                Отправить тест ({testTargetIds.length})
              </button>
            </div>
          </section>
        </aside>
      </div>

      {/* History Table */}
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>История и статусы рассылок</h2>
            <p className={styles.panelSub}>Живой прогресс доставки от воркера Telegram-бота</p>
          </div>
          <button type='button' className={`${styles.btn} ${styles.btnSm}`} onClick={() => void loadBroadcasts()}>
            <RefreshCw size={13} /> Обновить
          </button>
        </div>

        {loading ? (
          <div className={styles.emptyState}>Загрузка рассылок...</div>
        ) : broadcasts.length === 0 ? (
          <div className={styles.emptyState}>Рассылок пока нет — создайте первую выше.</div>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Название</th>
                  <th>Статус</th>
                  <th>Доставка</th>
                  <th>Тесты</th>
                  <th>Создана</th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                {broadcasts.map((item) => (
                  <BroadcastRow
                    key={item.id}
                    item={item}
                    expanded={expandedBroadcastId === item.id}
                    deliveries={deliveries}
                    loadingDeliveries={loadingDeliveries}
                    onEdit={() => handleEditDraft(item)}
                    onDeleteOrCancel={() => void handleDeleteOrCancel(item)}
                    onToggleLog={() => void toggleDeliveries(item.id)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function BroadcastRow({
  item,
  expanded,
  deliveries,
  loadingDeliveries,
  onEdit,
  onDeleteOrCancel,
  onToggleLog,
}: {
  readonly item: CmsBroadcastRecord;
  readonly expanded: boolean;
  readonly deliveries: readonly CmsBroadcastDeliveryItem[];
  readonly loadingDeliveries: boolean;
  readonly onEdit: () => void;
  readonly onDeleteOrCancel: () => void;
  readonly onToggleLog: () => void;
}) {
  return (
    <>
      <tr>
        <td>
          <strong>{item.title}</strong>
          <div className={styles.labelHint}>
            {item.mediaAssetId || item.mediaUrl ? '🖼 Фото + текст' : '💬 Текст'} · сегмент: {targetLabel(item.targetType)}
          </div>
        </td>
        <td><StatusBadge status={item.status} /></td>
        <td>
          {item.stats.total > 0 ? (
            <span>
              <strong>{item.stats.sent}</strong> / {item.stats.total}
              {item.stats.failed > 0 ? <span style={{ color: '#b4362a' }}> · ошибок: {item.stats.failed}</span> : null}
              {item.stats.pending > 0 ? <span className={styles.labelHint}> · в очереди: {item.stats.pending}</span> : null}
            </span>
          ) : (
            <span className={styles.labelHint}>—</span>
          )}
        </td>
        <td>{item.stats.testSent > 0 ? `${item.stats.testSent} отпр.` : '—'}</td>
        <td>{formatDateTime(item.createdAt)}</td>
        <td>
          <div className={styles.row}>
            {item.status === 'draft' || item.status === 'scheduled' ? (
              <button type='button' className={`${styles.btn} ${styles.btnSm}`} onClick={onEdit}>
                Править
              </button>
            ) : null}
            <button type='button' className={`${styles.btn} ${styles.btnSm}`} onClick={onToggleLog}>
              Лог {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            <button type='button' className={`${styles.btnDanger} ${styles.btnSm}`} onClick={onDeleteOrCancel}>
              {item.status === 'draft' || item.status === 'cancelled' ? 'Удалить' : 'Отменить'}
            </button>
          </div>
        </td>
      </tr>
      {expanded ? (
        <tr>
          <td colSpan={6} style={{ background: 'rgba(255,255,255,0.65)' }}>
            {loadingDeliveries ? (
              <div className={styles.labelHint}>Загрузка лога...</div>
            ) : deliveries.length === 0 ? (
              <div className={styles.labelHint}>Доставок по этой рассылке ещё не было.</div>
            ) : (
              <div className={styles.timeline}>
                {deliveries.map((d) => (
                  <div key={d.id} className={styles.timelineItem}>
                    <div>
                      <strong>{d.firstName} {d.lastName ?? ''}</strong>{' '}
                      {d.username ? <span className={styles.labelHint}>@{d.username}</span> : null}{' '}
                      {d.isTest ? <span className={`${styles.badge} ${styles.badgeAccent}`}>ТЕСТ</span> : null}
                      {d.lastError ? <div style={{ color: '#b4362a', marginTop: 3 }}>{d.lastError}</div> : null}
                    </div>
                    <div className={styles.row}>
                      <span className={styles.labelHint}>
                        {d.sentAt ? formatDateTime(d.sentAt) : formatDateTime(d.scheduledAt)}
                      </span>
                      <span className={`${styles.badge} ${deliveryBadgeClass(d.status)}`}>{d.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </td>
        </tr>
      ) : null}
    </>
  );
}

function StatusBadge({ status }: { readonly status: BroadcastStatus }) {
  const map: Record<BroadcastStatus, { label: string; cls: string }> = {
    draft: { label: 'Черновик', cls: styles.badgeNeutral },
    scheduled: { label: 'Запланирована', cls: styles.badgeWarn },
    sending: { label: 'Отправляется', cls: styles.badgeAccent },
    completed: { label: 'Завершена', cls: styles.badgeSuccess },
    cancelled: { label: 'Отменена', cls: styles.badgeDanger },
  };
  const entry = map[status];
  return <span className={`${styles.badge} ${entry.cls}`}>{entry.label}</span>;
}

function deliveryBadgeClass(status: string): string {
  if (status === 'sent') return styles.badgeSuccess;
  if (status === 'failed') return styles.badgeDanger;
  if (status === 'ambiguous') return styles.badgeWarn;
  return styles.badgeNeutral;
}

function targetLabel(targetType: BroadcastTargetType): string {
  const labels: Record<BroadcastTargetType, string> = {
    all_active: 'все активные',
    funnel: 'по воронке',
    source: 'по источнику',
    language: 'по языку',
    manual: 'вручную',
  };
  return labels[targetType];
}

function toLocalDateTimeInput(iso: string): string {
  const d = new Date(iso);
  const pad = (n: number): string => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getErr(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}
