import { useCallback, useEffect, useState, type ChangeEvent } from 'react';
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  ImagePlus,
  Plus,
  Save,
  Trash2,
  X,
} from 'lucide-react';

import type {
  CmsOverview,
  CmsScenarioButton,
  CmsScenarioInput,
  CmsScenarioRecord,
  ScenarioStatus,
  ScenarioStepTrigger,
  TelegramMediaType,
} from '@shared/cms';

import {
  createScenario,
  deleteScenario,
  fetchScenarios,
  updateScenario,
  uploadBotMediaFile,
} from '@/lib/admin-cms-api';
import { ApiError } from '@/lib/cabinet-api';
import styles from './AdminCms.module.css';

interface ScenariosTabProps {
  readonly overview: CmsOverview;
  readonly onDataChanged: () => void;
}

interface EditableStep {
  readonly stepKey: string;
  readonly triggerType: ScenarioStepTrigger;
  readonly delayMinutes: number;
  readonly messageText: string;
  readonly mediaAssetId: string | null;
  readonly mediaPreviewUrl: string | null;
  readonly mediaUrl: string;
  readonly mediaType: TelegramMediaType;
  readonly buttons: readonly EditableButton[];
}

interface EditableButton {
  readonly text: string;
  readonly kind: 'url' | 'step';
  readonly value: string;
}

interface ScenarioFormState {
  readonly id: string | null;
  readonly title: string;
  readonly description: string;
  readonly startPayload: string;
  readonly status: ScenarioStatus;
  readonly isDefault: boolean;
  readonly restartOnStart: boolean;
  readonly steps: readonly EditableStep[];
}

function createEmptyStep(index: number): EditableStep {
  return {
    stepKey: `step_${index + 1}`,
    triggerType: 'delay',
    delayMinutes: index === 0 ? 0 : 60,
    messageText: '',
    mediaAssetId: null,
    mediaPreviewUrl: null,
    mediaUrl: '',
    mediaType: 'photo',
    buttons: [],
  };
}

const EMPTY_SCENARIO_FORM: ScenarioFormState = {
  id: null,
  title: '',
  description: '',
  startPayload: '',
  status: 'active',
  isDefault: false,
  restartOnStart: true,
  steps: [createEmptyStep(0)],
};

export default function ScenariosTab({ overview, onDataChanged }: ScenariosTabProps) {
  const [scenarios, setScenarios] = useState<readonly CmsScenarioRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ kind: 'success' | 'error'; text: string } | null>(null);
  const [form, setForm] = useState<ScenarioFormState>(EMPTY_SCENARIO_FORM);
  const [collapsedSteps, setCollapsedSteps] = useState<ReadonlySet<number>>(new Set());

  const loadScenarios = useCallback(async (): Promise<void> => {
    setLoading(true);
    try {
      setScenarios(await fetchScenarios());
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof ApiError ? error.message : 'Не удалось загрузить сценарии' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadScenarios();
  }, [loadScenarios]);

  const copyLink = async (key: string, url: string): Promise<void> => {
    await navigator.clipboard.writeText(url);
    setCopiedKey(key);
    window.setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleEditScenario = (scenario: CmsScenarioRecord): void => {
    const editableSteps: EditableStep[] = scenario.steps.map((step) => ({
      stepKey: step.stepKey,
      triggerType: step.triggerType,
      delayMinutes: step.delayMinutes,
      messageText: step.messageText,
      mediaAssetId: step.mediaAssetId,
      mediaPreviewUrl: step.mediaPreviewUrl,
      mediaUrl: step.mediaUrl ?? '',
      mediaType: step.mediaType ?? 'photo',
      buttons: step.buttons.flat().map((btn): EditableButton => ({
        text: btn.text,
        kind: btn.nextStepKey ? 'step' : 'url',
        value: btn.nextStepKey ?? btn.url ?? '',
      })),
    }));
    setForm({
      id: scenario.id,
      title: scenario.title,
      description: scenario.description,
      startPayload: scenario.startPayload,
      status: scenario.status,
      isDefault: scenario.isDefault,
      restartOnStart: scenario.restartOnStart,
      steps: editableSteps,
    });
    if (editableSteps.length > 6) {
      setCollapsedSteps(new Set(editableSteps.map((_, idx) => idx).filter((idx) => idx > 0)));
    } else {
      setCollapsedSteps(new Set());
    }
    setNotice(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleStepCollapsed = (index: number): void => {
    setCollapsedSteps((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  const handleUploadStepPhoto = async (stepIndex: number, event: ChangeEvent<HTMLInputElement>): Promise<void> => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const asset = await uploadBotMediaFile(file);
      updateStep(stepIndex, (step) => ({
        ...step,
        mediaAssetId: asset.id,
        mediaPreviewUrl: asset.previewUrl,
        mediaUrl: '',
        mediaType: 'photo',
      }));
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof ApiError ? error.message : 'Не удалось загрузить картинку' });
    } finally {
      event.target.value = '';
    }
  };

  const updateStep = (index: number, updater: (step: EditableStep) => EditableStep): void => {
    setForm((prev) => ({
      ...prev,
      steps: prev.steps.map((step, i) => (i === index ? updater(step) : step)),
    }));
  };

  const moveStep = (index: number, direction: -1 | 1): void => {
    const target = index + direction;
    if (target < 0 || target >= form.steps.length) return;
    setForm((prev) => {
      const next = [...prev.steps];
      [next[index], next[target]] = [next[target], next[index]];
      if (next[0].triggerType !== 'delay') {
        next[0] = { ...next[0], triggerType: 'delay' };
      }
      return { ...prev, steps: next };
    });
  };

  const handleSave = async (): Promise<void> => {
    setNotice(null);
    setSaving(true);
    try {
      const payload: CmsScenarioInput = {
        title: form.title.trim(),
        description: form.description.trim(),
        startPayload: form.startPayload.trim(),
        status: form.status,
        isDefault: form.isDefault,
        restartOnStart: form.restartOnStart,
        steps: form.steps.map((step) => {
          const buttons: readonly (readonly CmsScenarioButton[])[] = step.buttons
            .filter((b) => b.text.trim() && b.value.trim())
            .map((b) => [
              b.kind === 'step'
                ? { text: b.text.trim(), nextStepKey: b.value.trim() }
                : { text: b.text.trim(), url: b.value.trim() },
            ]);
          const hasMedia = Boolean(step.mediaAssetId || step.mediaUrl.trim());
          return {
            stepKey: step.stepKey.trim(),
            triggerType: step.triggerType,
            delayMinutes: step.triggerType === 'button' ? 0 : step.delayMinutes,
            messageText: step.messageText.trim(),
            parseMode: 'HTML',
            mediaAssetId: step.mediaAssetId,
            mediaUrl: step.mediaAssetId ? null : (step.mediaUrl.trim() || null),
            mediaType: hasMedia ? (step.mediaAssetId ? 'photo' : step.mediaType) : null,
            buttons,
          };
        }),
      };

      const saved = form.id ? await updateScenario(form.id, payload) : await createScenario(payload);
      setForm(EMPTY_SCENARIO_FORM);
      setCollapsedSteps(new Set());
      await loadScenarios();
      onDataChanged();
      setNotice({
        kind: 'success',
        text: `Сценарий «${saved.title}» сохранён! Диплинк: ${saved.deepLinkUrl}`,
      });
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof ApiError ? error.message : 'Не удалось сохранить сценарий' });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteScenario = async (scenario: CmsScenarioRecord): Promise<void> => {
    if (!window.confirm(`Удалить сценарий «${scenario.title}»?`)) return;
    try {
      await deleteScenario(scenario.id);
      if (form.id === scenario.id) {
        setForm(EMPTY_SCENARIO_FORM);
        setCollapsedSteps(new Set());
      }
      await loadScenarios();
      onDataChanged();
    } catch (error) {
      setNotice({ kind: 'error', text: error instanceof ApiError ? error.message : 'Не удалось удалить сценарий' });
    }
  };

  const liveDeepLink = `https://t.me/${overview.botUsername}?start=${form.startPayload.trim() || 'your_code'}`;
  const defaultScenario = scenarios.find((s) => s.isDefault && s.status === 'active');

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

      <div className={styles.notice}>
        <span>
          Основная ссылка бота <span className={styles.mono}>https://t.me/{overview.botUsername}</span>:{' '}
          {defaultScenario ? (
            <>привязана к сценарию <strong>«{defaultScenario.title}»</strong>.</>
          ) : (
            <><strong>свободна</strong> — обычный /start просто сохраняет клиента в базу без запуска воронок.</>
          )}
        </span>
      </div>

      {/* Unified Scenarios List */}
      <section className={styles.panel}>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>Диплинк-сценарии ({scenarios.length})</h2>
            <p className={styles.panelSub}>
              Все воронки бота управляются здесь: можно менять тексты, кнопки, таймеры, диплинк-код и статус
            </p>
          </div>
          <button
            type='button'
            className={`${styles.btnPrimary} ${styles.btnSm}`}
            onClick={() => {
              setForm(EMPTY_SCENARIO_FORM);
              setCollapsedSteps(new Set());
              document.getElementById('scenario-editor')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Plus size={14} /> Новый сценарий
          </button>
        </div>

        {loading ? (
          <div className={styles.emptyState}>Загрузка сценариев...</div>
        ) : scenarios.length === 0 ? (
          <div className={styles.emptyState}>Пока нет диплинк-сценариев. Создайте первый в конструкторе ниже.</div>
        ) : (
          <div className={styles.stack}>
            {scenarios.map((scenario) => (
              <div key={scenario.id} className={styles.stepCard}>
                <div className={styles.rowBetween}>
                  <div>
                    <div className={styles.row}>
                      <strong>{scenario.title}</strong>
                      <span
                        className={`${styles.badge} ${
                          scenario.status === 'active'
                            ? styles.badgeSuccess
                            : scenario.status === 'draft'
                              ? styles.badgeWarn
                              : styles.badgeNeutral
                        }`}
                      >
                        {scenario.status === 'active' ? 'Активен' : scenario.status === 'draft' ? 'Черновик' : 'Архив'}
                      </span>
                      {scenario.isDefault ? (
                        <span className={`${styles.badge} ${styles.badgeAccent}`}>По умолчанию (/start)</span>
                      ) : null}
                      <span className={`${styles.badge} ${styles.badgeNeutral}`}>{scenario.steps.length} шаг.</span>
                    </div>
                    {scenario.description ? <p className={styles.panelSub}>{scenario.description}</p> : null}
                  </div>
                  <div className={styles.row}>
                    <button type='button' className={`${styles.btn} ${styles.btnSm}`} onClick={() => handleEditScenario(scenario)}>
                      Редактировать
                    </button>
                    {scenario.status !== 'active' ? (
                      <button type='button' className={`${styles.btnDanger} ${styles.btnSm}`} onClick={() => void handleDeleteScenario(scenario)}>
                        Удалить
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className={styles.deepLinkBox}>
                  <span>{scenario.deepLinkUrl}</span>
                  <button
                    type='button'
                    className={`${styles.btn} ${styles.btnSm}`}
                    onClick={() => void copyLink(scenario.id, scenario.deepLinkUrl)}
                  >
                    {copiedKey === scenario.id ? <Check size={13} /> : <Copy size={13} />}
                    {copiedKey === scenario.id ? 'Скопировано' : 'Копировать'}
                  </button>
                </div>

                <div className={styles.row} style={{ fontSize: 12.5, color: '#706962' }}>
                  <span>Участников: <strong>{scenario.enrolledSubscribers}</strong></span>
                  <span>·</span>
                  <span>Активных: <strong>{scenario.activeEnrollments}</strong></span>
                  <span>·</span>
                  <span>Завершили: <strong>{scenario.completedEnrollments}</strong></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Scenario Builder */}
      <section className={styles.panel} id='scenario-editor'>
        <div className={styles.panelHeader}>
          <div>
            <h2 className={styles.panelTitle}>{form.id ? `Редактирование: ${form.title}` : 'Конструктор диплинк-сценария'}</h2>
            <p className={styles.panelSub}>
              Настройте ссылку и цепочку сообщений — бот подхватит изменения сразу после сохранения.
            </p>
          </div>
          {form.id ? (
            <button
              type='button'
              className={`${styles.btn} ${styles.btnSm}`}
              onClick={() => {
                setForm(EMPTY_SCENARIO_FORM);
                setCollapsedSteps(new Set());
              }}
            >
              Создать новый
            </button>
          ) : null}
        </div>

        <div className={styles.stack}>
          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor='sc-title'>Название воронки</label>
              <input
                id='sc-title'
                className={styles.input}
                placeholder='Например: Лид-магнит Шри-Ланка 2027'
                value={form.title}
                onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
              />
            </div>

            <div className={styles.field}>
              <label className={styles.label} htmlFor='sc-payload'>
                <span>Код диплинка (start parameter)</span>
                <span className={styles.labelHint}>латиница, цифры, _ или -</span>
              </label>
              <input
                id='sc-payload'
                className={styles.input}
                placeholder='sri_lanka_2027'
                value={form.startPayload}
                onChange={(e) => setForm((p) => ({ ...p, startPayload: e.target.value.replace(/[^A-Za-z0-9_-]/g, '') }))}
              />
            </div>
          </div>

          <div className={styles.deepLinkBox}>
            <span>{liveDeepLink}</span>
            <button
              type='button'
              className={`${styles.btn} ${styles.btnSm}`}
              onClick={() => void copyLink('draft', liveDeepLink)}
            >
              {copiedKey === 'draft' ? <Check size={13} /> : <Copy size={13} />}
              {copiedKey === 'draft' ? 'Скопировано' : 'Копировать'}
            </button>
          </div>

          <div className={styles.fieldGrid}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor='sc-status'>Статус</label>
              <select
                id='sc-status'
                className={styles.select}
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ScenarioStatus }))}
              >
                <option value='active'>Активен (сразу работает в боте)</option>
                <option value='draft'>Черновик (не срабатывает)</option>
                <option value='archived'>Архив</option>
              </select>
            </div>

            <div className={styles.field} style={{ justifyContent: 'center', gap: 10 }}>
              <label className={styles.checkboxRow}>
                <input
                  type='checkbox'
                  checked={form.restartOnStart}
                  onChange={(e) => setForm((p) => ({ ...p, restartOnStart: e.target.checked }))}
                />
                Перезапускать воронку при повторном переходе по диплинку
              </label>
              <label className={styles.checkboxRow}>
                <input
                  type='checkbox'
                  checked={form.isDefault}
                  onChange={(e) => setForm((p) => ({ ...p, isDefault: e.target.checked }))}
                />
                Сделать сценарием по умолчанию для обычного /start (без диплинка)
              </label>
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor='sc-desc'>Заметка для менеджеров (необязательно)</label>
            <input
              id='sc-desc'
              className={styles.input}
              placeholder='Где используется ссылка (Reels, сторис, реклама...)'
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
            />
          </div>

          {/* Steps */}
          <div className={styles.stack}>
            <div className={styles.rowBetween}>
              <div className={styles.row}>
                <span className={styles.label}>Шаги сценария ({form.steps.length})</span>
                {form.steps.length > 3 ? (
                  <button
                    type='button'
                    className={`${styles.btnGhost} ${styles.btnSm}`}
                    onClick={() =>
                      setCollapsedSteps((prev) =>
                        prev.size > 0 ? new Set() : new Set(form.steps.map((_, idx) => idx)),
                      )
                    }
                  >
                    {collapsedSteps.size > 0 ? 'Развернуть все' : 'Свернуть все'}
                  </button>
                ) : null}
              </div>
              <button
                type='button'
                className={`${styles.btn} ${styles.btnSm}`}
                onClick={() => setForm((p) => ({ ...p, steps: [...p.steps, createEmptyStep(p.steps.length)] }))}
              >
                <Plus size={14} /> Добавить шаг
              </button>
            </div>

            {form.steps.map((step, index) => {
              const isCollapsed = collapsedSteps.has(index);
              return (
                <div key={index} className={styles.stepCard}>
                  <div className={styles.rowBetween}>
                    <div className={styles.row}>
                      <span className={styles.stepBadge}>{index + 1}</span>
                      <input
                        className={styles.input}
                        style={{ width: 170 }}
                        value={step.stepKey}
                        onChange={(e) =>
                          updateStep(index, (s) => ({ ...s, stepKey: e.target.value.replace(/[^A-Za-z0-9_-]/g, '') }))
                        }
                        aria-label='Ключ шага'
                      />
                      {index > 0 ? (
                        <select
                          className={styles.select}
                          style={{ width: 'auto' }}
                          value={step.triggerType}
                          onChange={(e) =>
                            updateStep(index, (s) => ({ ...s, triggerType: e.target.value as ScenarioStepTrigger }))
                          }
                        >
                          <option value='delay'>Автоматически по таймеру</option>
                          <option value='button'>Только по нажатию кнопки</option>
                        </select>
                      ) : (
                        <span className={`${styles.badge} ${styles.badgeAccent}`}>Стартовый шаг</span>
                      )}
                      {isCollapsed ? (
                        <span className={styles.labelHint} style={{ maxWidth: 320, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {step.messageText.slice(0, 70)}
                        </span>
                      ) : null}
                    </div>

                    <div className={styles.row}>
                      <button
                        type='button'
                        className={`${styles.btnGhost} ${styles.btnSm}`}
                        onClick={() => toggleStepCollapsed(index)}
                        aria-label={isCollapsed ? 'Развернуть шаг' : 'Свернуть шаг'}
                      >
                        {isCollapsed ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
                      </button>
                      <button type='button' className={`${styles.btnGhost} ${styles.btnSm}`} disabled={index === 0} onClick={() => moveStep(index, -1)}>
                        <ArrowUp size={14} />
                      </button>
                      <button type='button' className={`${styles.btnGhost} ${styles.btnSm}`} disabled={index === form.steps.length - 1} onClick={() => moveStep(index, 1)}>
                        <ArrowDown size={14} />
                      </button>
                      {form.steps.length > 1 ? (
                        <button
                          type='button'
                          className={`${styles.btnDanger} ${styles.btnSm}`}
                          onClick={() => setForm((p) => ({ ...p, steps: p.steps.filter((_, i) => i !== index) }))}
                        >
                          <Trash2 size={13} />
                        </button>
                      ) : null}
                    </div>
                  </div>

                  {!isCollapsed ? (
                    <>
                      {step.triggerType === 'delay' ? (
                        <div className={styles.row}>
                          <span className={styles.labelHint}>Задержка от старта (в минутах):</span>
                          <input
                            type='number'
                            min={0}
                            max={129600}
                            className={styles.input}
                            style={{ width: 120 }}
                            value={step.delayMinutes}
                            onChange={(e) => updateStep(index, (s) => ({ ...s, delayMinutes: Math.max(0, Number(e.target.value) || 0) }))}
                          />
                          <button type='button' className={`${styles.btnGhost} ${styles.btnSm}`} onClick={() => updateStep(index, (s) => ({ ...s, delayMinutes: 0 }))}>Сразу</button>
                          <button type='button' className={`${styles.btnGhost} ${styles.btnSm}`} onClick={() => updateStep(index, (s) => ({ ...s, delayMinutes: 30 }))}>30 мин</button>
                          <button type='button' className={`${styles.btnGhost} ${styles.btnSm}`} onClick={() => updateStep(index, (s) => ({ ...s, delayMinutes: 1440 }))}>24 ч</button>
                          <button type='button' className={`${styles.btnGhost} ${styles.btnSm}`} onClick={() => updateStep(index, (s) => ({ ...s, delayMinutes: 2880 }))}>48 ч</button>
                        </div>
                      ) : null}

                      <textarea
                        className={styles.textarea}
                        rows={4}
                        placeholder='Текст сообщения для этого шага (HTML поддерживается)...'
                        value={step.messageText}
                        onChange={(e) => updateStep(index, (s) => ({ ...s, messageText: e.target.value }))}
                      />

                      <div className={styles.row}>
                        {step.mediaPreviewUrl ? <img src={step.mediaPreviewUrl} alt='' className={styles.uploadThumb} /> : null}
                        <label className={`${styles.btn} ${styles.btnSm}`}>
                          <ImagePlus size={13} /> Загрузить фото
                          <input
                            type='file'
                            accept='image/png,image/jpeg,image/webp'
                            style={{ display: 'none' }}
                            onChange={(e) => void handleUploadStepPhoto(index, e)}
                          />
                        </label>
                        {step.mediaAssetId ? (
                          <button
                            type='button'
                            className={`${styles.btnDanger} ${styles.btnSm}`}
                            onClick={() => updateStep(index, (s) => ({ ...s, mediaAssetId: null, mediaPreviewUrl: null }))}
                          >
                            Убрать фото
                          </button>
                        ) : (
                          <>
                            <select
                              className={styles.select}
                              style={{ width: 110 }}
                              value={step.mediaType}
                              onChange={(e) => updateStep(index, (s) => ({ ...s, mediaType: e.target.value as TelegramMediaType }))}
                            >
                              <option value='photo'>Фото</option>
                              <option value='audio'>Аудио</option>
                              <option value='video'>Видео</option>
                            </select>
                            <input
                              className={styles.input}
                              style={{ flex: '1 1 200px', minWidth: 180 }}
                              placeholder='Или URL / Telegram file_id (для аудио, видео, фото)'
                              value={step.mediaUrl}
                              onChange={(e) => updateStep(index, (s) => ({ ...s, mediaUrl: e.target.value }))}
                            />
                          </>
                        )}
                      </div>

                      <div className={styles.field}>
                        <div className={styles.label}>
                          <span>Кнопки шага</span>
                          <button
                            type='button'
                            className={`${styles.btn} ${styles.btnSm}`}
                            onClick={() =>
                              updateStep(index, (s) => ({
                                ...s,
                                buttons: [...s.buttons, { text: '', kind: 'url', value: '' }],
                              }))
                            }
                          >
                            <Plus size={13} /> Кнопка
                          </button>
                        </div>
                        {step.buttons.map((btn, bIdx) => (
                          <div key={bIdx} className={styles.row}>
                            <input
                              className={styles.input}
                              style={{ flex: '1 1 160px' }}
                              placeholder='Текст кнопки'
                              value={btn.text}
                              onChange={(e) =>
                                updateStep(index, (s) => ({
                                  ...s,
                                  buttons: s.buttons.map((b, i) => (i === bIdx ? { ...b, text: e.target.value } : b)),
                                }))
                              }
                            />
                            <select
                              className={styles.select}
                              style={{ width: 165 }}
                              value={btn.kind}
                              onChange={(e) =>
                                updateStep(index, (s) => ({
                                  ...s,
                                  buttons: s.buttons.map((b, i) =>
                                    i === bIdx ? { ...b, kind: e.target.value as 'url' | 'step', value: '' } : b,
                                  ),
                                }))
                              }
                            >
                              <option value='url'>Внешняя ссылка</option>
                              <option value='step'>Переход к шагу</option>
                            </select>
                            {btn.kind === 'step' ? (
                              <select
                                className={styles.select}
                                style={{ flex: '1.2 1 180px' }}
                                value={btn.value}
                                onChange={(e) =>
                                  updateStep(index, (s) => ({
                                    ...s,
                                    buttons: s.buttons.map((b, i) => (i === bIdx ? { ...b, value: e.target.value } : b)),
                                  }))
                                }
                              >
                                <option value=''>Выберите шаг...</option>
                                {form.steps.map((candidate) => (
                                  <option key={candidate.stepKey} value={candidate.stepKey}>
                                    {candidate.stepKey}
                                  </option>
                                ))}
                              </select>
                            ) : (
                              <input
                                className={styles.input}
                                style={{ flex: '1.2 1 180px' }}
                                placeholder='https://...'
                                value={btn.value}
                                onChange={(e) =>
                                  updateStep(index, (s) => ({
                                    ...s,
                                    buttons: s.buttons.map((b, i) => (i === bIdx ? { ...b, value: e.target.value } : b)),
                                  }))
                                }
                              />
                            )}
                            <button
                              type='button'
                              className={`${styles.btnGhost} ${styles.btnSm}`}
                              onClick={() =>
                                updateStep(index, (s) => ({ ...s, buttons: s.buttons.filter((_, i) => i !== bIdx) }))
                              }
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : null}
                </div>
              );
            })}
          </div>

          <div className={styles.rowBetween}>
            <span className={styles.labelHint}>
              Сохранение сразу обновит сценарий в PostgreSQL; бот подхватит его без перезапуска.
            </span>
            <button
              type='button'
              className={styles.btnPrimary}
              disabled={saving || !form.title.trim() || !form.startPayload.trim()}
              onClick={() => void handleSave()}
            >
              <Save size={15} />
              {saving ? 'Сохраняем...' : form.id ? 'Сохранить изменения' : 'Создать сценарий'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
