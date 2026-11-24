import type {
  BroadcastTargetFilter,
  BroadcastTargetType,
  CmsBroadcastInput,
  CmsScenarioButton,
  CmsScenarioInput,
  CmsScenarioStepInput,
  CmsUrlButton,
  ScenarioStatus,
  ScenarioStepTrigger,
  TelegramMediaType,
  TelegramParseMode,
} from '@shared/cms';

import { RequestValidationError } from './admin-validation';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const PAYLOAD_REGEX = /^[A-Za-z0-9_-]{1,64}$/;
const STEP_KEY_REGEX = /^[a-zA-Z0-9_-]{1,40}$/;
const ALLOWED_MIME_TYPES = new Set(['image/png', 'image/jpeg', 'image/webp']);
const MAX_MEDIA_BYTES = 5 * 1024 * 1024;
const TARGET_TYPES = new Set<BroadcastTargetType>(['all_active', 'funnel', 'source', 'language', 'manual']);
const SCENARIO_STATUSES = new Set<ScenarioStatus>(['draft', 'active', 'archived']);
const STEP_TRIGGERS = new Set<ScenarioStepTrigger>(['delay', 'button']);
const PARSE_MODES = new Set<TelegramParseMode>(['HTML', 'plain']);
const MEDIA_TYPES = new Set<TelegramMediaType>(['photo', 'audio', 'video']);

export interface ParsedMediaUpload {
  readonly filename: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly dataBase64: string;
}

export function parseUuid(value: string, field: string): string {
  if (!UUID_REGEX.test(value)) {
    throw new RequestValidationError(`${field} must be a valid UUID`);
  }
  return value;
}

export function parseMediaUpload(body: unknown): ParsedMediaUpload {
  const record = requireRecord(body, 'Request body');
  const filename = requireNonEmptyString(record.filename, 'filename').slice(0, 255);
  const mimeType = requireNonEmptyString(record.mimeType, 'mimeType').toLowerCase();
  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    throw new RequestValidationError('Only PNG, JPEG, and WEBP images are supported');
  }
  const rawData = requireNonEmptyString(record.dataBase64, 'dataBase64').trim();
  const base64Payload = rawData.includes(',') ? rawData.slice(rawData.indexOf(',') + 1) : rawData;
  if (!/^[A-Za-z0-9+/=\r\n]+$/.test(base64Payload)) {
    throw new RequestValidationError('dataBase64 must be valid base64 data');
  }
  const cleanBase64 = base64Payload.replace(/\s+/g, '');
  const buffer = Buffer.from(cleanBase64, 'base64');
  if (buffer.length === 0 || buffer.length > MAX_MEDIA_BYTES) {
    throw new RequestValidationError('Image must be between 1 byte and 5 MB');
  }

  return {
    filename,
    mimeType,
    sizeBytes: buffer.length,
    dataBase64: cleanBase64,
  };
}

export function parseBroadcastInput(body: unknown): CmsBroadcastInput {
  const record = requireRecord(body, 'Request body');
  const title = requireNonEmptyString(record.title, 'title').trim().slice(0, 255);
  const messageText = requireNonEmptyString(record.messageText, 'messageText').trim();
  const parseMode = parseOptionalParseMode(record.parseMode);
  const mediaAssetId = parseOptionalUuid(record.mediaAssetId, 'mediaAssetId');
  const mediaUrl = parseOptionalString(record.mediaUrl, 'mediaUrl');
  const mediaType = parseOptionalMediaType(record.mediaType);

  if (mediaAssetId && mediaUrl) {
    throw new RequestValidationError('Specify either mediaAssetId or mediaUrl, not both');
  }
  const resolvedMediaType: TelegramMediaType | null = mediaAssetId ? 'photo' : mediaUrl ? (mediaType ?? 'photo') : null;
  validateTelegramTextLength(messageText, parseMode, Boolean(resolvedMediaType), 'messageText');

  const buttons = parseUrlButtons(record.buttons);
  const targetType = parseTargetType(record.targetType);
  const targetFilter = parseTargetFilter(record.targetFilter, targetType);
  const scheduledAt = parseOptionalIsoTimestamp(record.scheduledAt, 'scheduledAt');

  return {
    title,
    messageText,
    parseMode,
    mediaAssetId,
    mediaUrl,
    mediaType: resolvedMediaType,
    buttons,
    targetType,
    targetFilter,
    scheduledAt,
  };
}

export function parseBroadcastTestInput(body: unknown): readonly string[] {
  const record = requireRecord(body, 'Request body');
  if (!Array.isArray(record.subscriberIds) || record.subscriberIds.length === 0 || record.subscriberIds.length > 20) {
    throw new RequestValidationError('subscriberIds must contain 1–20 subscriber UUIDs');
  }
  return Array.from(new Set(record.subscriberIds.map((id, idx) => parseUuid(String(id), `subscriberIds[${idx}]`))));
}

export function parseBroadcastLaunchInput(body: unknown): { readonly scheduledAt: string | null } {
  if (body === undefined || body === null) {
    return { scheduledAt: null };
  }
  const record = requireRecord(body, 'Request body');
  return {
    scheduledAt: parseOptionalIsoTimestamp(record.scheduledAt, 'scheduledAt'),
  };
}

export function parseScenarioInput(body: unknown): CmsScenarioInput {
  const record = requireRecord(body, 'Request body');
  const title = requireNonEmptyString(record.title, 'title').trim().slice(0, 255);
  const description = typeof record.description === 'string' ? record.description.trim().slice(0, 2000) : '';
  const startPayload = requireNonEmptyString(record.startPayload, 'startPayload').trim();
  if (!PAYLOAD_REGEX.test(startPayload)) {
    throw new RequestValidationError('startPayload must contain 1–64 Latin letters, digits, underscores, or hyphens');
  }

  const status = parseOptionalScenarioStatus(record.status);
  const isDefault = record.isDefault === undefined ? false : Boolean(record.isDefault);
  const restartOnStart = record.restartOnStart === undefined ? true : Boolean(record.restartOnStart);

  if (!Array.isArray(record.steps) || record.steps.length === 0 || record.steps.length > 50) {
    throw new RequestValidationError('steps must contain 1–50 scenario steps');
  }

  const steps = record.steps.map((raw, index) => parseScenarioStep(raw, index));
  const stepKeys = new Set<string>();
  for (const step of steps) {
    if (stepKeys.has(step.stepKey)) {
      throw new RequestValidationError(`Duplicate stepKey: ${step.stepKey}`);
    }
    stepKeys.add(step.stepKey);
  }
  if (steps[0]?.triggerType !== 'delay') {
    throw new RequestValidationError('First step must use triggerType "delay"');
  }
  for (const step of steps) {
    for (const row of step.buttons ?? []) {
      for (const button of row) {
        if (button.nextStepKey && !stepKeys.has(button.nextStepKey)) {
          throw new RequestValidationError(`Button points to unknown stepKey: ${button.nextStepKey}`);
        }
      }
    }
  }

  return {
    title,
    description,
    startPayload,
    status,
    isDefault,
    restartOnStart,
    steps,
  };
}

export function parseManualEnrollInput(body: unknown): { readonly scenarioId: string } {
  const record = requireRecord(body, 'Request body');
  return { scenarioId: parseUuid(requireNonEmptyString(record.scenarioId, 'scenarioId'), 'scenarioId') };
}

export function parseUserRoleUpdate(body: unknown): 'student' | 'admin' {
  const record = requireRecord(body, 'Request body');
  if (record.role !== 'student' && record.role !== 'admin') {
    throw new RequestValidationError('role must be student or admin');
  }
  return record.role;
}

function parseScenarioStep(value: unknown, index: number): CmsScenarioStepInput {
  const field = `steps[${index}]`;
  const record = requireRecord(value, field);
  const stepKey = requireNonEmptyString(record.stepKey, `${field}.stepKey`).trim();
  if (!STEP_KEY_REGEX.test(stepKey)) {
    throw new RequestValidationError(`${field}.stepKey must contain 1–40 Latin letters, digits, underscores, or hyphens`);
  }
  const triggerType = parseStepTrigger(record.triggerType, `${field}.triggerType`);
  const delayMinutes = parseDelayMinutes(record.delayMinutes, `${field}.delayMinutes`);
  const messageText = requireNonEmptyString(record.messageText, `${field}.messageText`).trim();
  const parseMode = parseOptionalParseMode(record.parseMode);
  const mediaAssetId = parseOptionalUuid(record.mediaAssetId, `${field}.mediaAssetId`);
  const mediaUrl = parseOptionalString(record.mediaUrl, `${field}.mediaUrl`);
  const mediaType = parseOptionalMediaType(record.mediaType);

  if (mediaAssetId && mediaUrl) {
    throw new RequestValidationError(`${field} cannot specify both mediaAssetId and mediaUrl`);
  }
  const resolvedMediaType: TelegramMediaType | null = mediaAssetId ? 'photo' : mediaUrl ? (mediaType ?? 'photo') : null;
  validateTelegramTextLength(messageText, parseMode, Boolean(resolvedMediaType), `${field}.messageText`);

  const buttons = parseScenarioButtons(record.buttons, `${field}.buttons`);

  return {
    stepKey,
    triggerType,
    delayMinutes: triggerType === 'button' ? 0 : delayMinutes,
    messageText,
    parseMode,
    mediaAssetId,
    mediaUrl,
    mediaType: resolvedMediaType,
    buttons,
  };
}

function parseUrlButtons(value: unknown): readonly (readonly CmsUrlButton[])[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value) || value.length > 8) {
    throw new RequestValidationError('buttons must be an array of up to 8 rows');
  }
  return value.map((row, rowIdx) => {
    if (!Array.isArray(row) || row.length === 0 || row.length > 4) {
      throw new RequestValidationError(`buttons[${rowIdx}] must contain 1–4 buttons`);
    }
    return row.map((btn, btnIdx) => {
      const rec = requireRecord(btn, `buttons[${rowIdx}][${btnIdx}]`);
      const text = requireNonEmptyString(rec.text, `buttons[${rowIdx}][${btnIdx}].text`).trim().slice(0, 64);
      const url = validateHttpUrl(requireNonEmptyString(rec.url, `buttons[${rowIdx}][${btnIdx}].url`).trim(), `buttons[${rowIdx}][${btnIdx}].url`);
      return { text, url };
    });
  });
}

function parseScenarioButtons(value: unknown, field: string): readonly (readonly CmsScenarioButton[])[] {
  if (value === undefined || value === null) {
    return [];
  }
  if (!Array.isArray(value) || value.length > 8) {
    throw new RequestValidationError(`${field} must be an array of up to 8 rows`);
  }
  return value.map((row, rowIdx) => {
    if (!Array.isArray(row) || row.length === 0 || row.length > 4) {
      throw new RequestValidationError(`${field}[${rowIdx}] must contain 1–4 buttons`);
    }
    return row.map((btn, btnIdx) => {
      const bField = `${field}[${rowIdx}][${btnIdx}]`;
      const rec = requireRecord(btn, bField);
      const text = requireNonEmptyString(rec.text, `${bField}.text`).trim().slice(0, 64);
      const url = parseOptionalString(rec.url, `${bField}.url`);
      const nextStepKey = parseOptionalString(rec.nextStepKey, `${bField}.nextStepKey`);
      if (Boolean(url) === Boolean(nextStepKey)) {
        throw new RequestValidationError(`${bField} must specify either url or nextStepKey`);
      }
      if (url) {
        return { text, url: validateHttpUrl(url, `${bField}.url`) };
      }
      return { text, nextStepKey: nextStepKey! };
    });
  });
}

function parseTargetType(value: unknown): BroadcastTargetType {
  if (typeof value !== 'string' || !TARGET_TYPES.has(value as BroadcastTargetType)) {
    throw new RequestValidationError('targetType must be all_active, funnel, source, language, or manual');
  }
  return value as BroadcastTargetType;
}

function parseTargetFilter(value: unknown, targetType: BroadcastTargetType): BroadcastTargetFilter {
  if (targetType === 'all_active') {
    return {};
  }
  const record = requireRecord(value ?? {}, 'targetFilter');
  if (targetType === 'funnel') {
    return { funnelKey: requireNonEmptyString(record.funnelKey, 'targetFilter.funnelKey').trim() };
  }
  if (targetType === 'source') {
    return { startPayload: requireNonEmptyString(record.startPayload, 'targetFilter.startPayload').trim() };
  }
  if (targetType === 'language') {
    return { languageCode: requireNonEmptyString(record.languageCode, 'targetFilter.languageCode').trim() };
  }
  if (!Array.isArray(record.subscriberIds) || record.subscriberIds.length === 0) {
    throw new RequestValidationError('targetFilter.subscriberIds must contain at least one subscriber UUID');
  }
  return {
    subscriberIds: Array.from(
      new Set(record.subscriberIds.map((id, idx) => parseUuid(String(id), `targetFilter.subscriberIds[${idx}]`))),
    ),
  };
}

function parseStepTrigger(value: unknown, field: string): ScenarioStepTrigger {
  if (value === undefined) {
    return 'delay';
  }
  if (typeof value !== 'string' || !STEP_TRIGGERS.has(value as ScenarioStepTrigger)) {
    throw new RequestValidationError(`${field} must be delay or button`);
  }
  return value as ScenarioStepTrigger;
}

function parseDelayMinutes(value: unknown, field: string): number {
  if (value === undefined) {
    return 0;
  }
  if (typeof value !== 'number' || !Number.isInteger(value) || value < 0 || value > 60 * 24 * 90) {
    throw new RequestValidationError(`${field} must be an integer between 0 and 129600`);
  }
  return value;
}

function parseOptionalParseMode(value: unknown): TelegramParseMode {
  if (value === undefined || value === null) {
    return 'HTML';
  }
  if (typeof value !== 'string' || !PARSE_MODES.has(value as TelegramParseMode)) {
    throw new RequestValidationError('parseMode must be HTML or plain');
  }
  return value as TelegramParseMode;
}

function parseOptionalMediaType(value: unknown): TelegramMediaType | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value !== 'string' || !MEDIA_TYPES.has(value as TelegramMediaType)) {
    throw new RequestValidationError('mediaType must be photo, audio, or video');
  }
  return value as TelegramMediaType;
}

function parseOptionalScenarioStatus(value: unknown): ScenarioStatus {
  if (value === undefined || value === null) {
    return 'draft';
  }
  if (typeof value !== 'string' || !SCENARIO_STATUSES.has(value as ScenarioStatus)) {
    throw new RequestValidationError('status must be draft, active, or archived');
  }
  return value as ScenarioStatus;
}

function validateTelegramTextLength(
  text: string,
  parseMode: TelegramParseMode,
  hasMedia: boolean,
  field: string,
): void {
  const effectiveLength = parseMode === 'HTML' ? text.replace(/<[^>]+>/g, '').length : text.length;
  const maxLength = hasMedia ? 1024 : 4096;
  if (effectiveLength > maxLength) {
    throw new RequestValidationError(`${field} exceeds Telegram limit of ${maxLength} characters`);
  }
}

function parseOptionalUuid(value: unknown, field: string): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return parseUuid(requireNonEmptyString(value, field), field);
}

function parseOptionalString(value: unknown, field: string): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  if (typeof value !== 'string') {
    throw new RequestValidationError(`${field} must be a string`);
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseOptionalIsoTimestamp(value: unknown, field: string): string | null {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const raw = requireNonEmptyString(value, field).trim();
  const parsed = Date.parse(raw);
  if (!Number.isFinite(parsed)) {
    throw new RequestValidationError(`${field} must be a valid ISO timestamp`);
  }
  return new Date(parsed).toISOString();
}

function validateHttpUrl(value: string, field: string): string {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      throw new Error();
    }
    return parsed.toString();
  } catch {
    throw new RequestValidationError(`${field} must be a valid http(s) URL`);
  }
}

function requireRecord(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new RequestValidationError(`${field} must be a JSON object`);
  }
  return value as Record<string, unknown>;
}

function requireNonEmptyString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new RequestValidationError(`${field} must be a non-empty string`);
  }
  return value;
}
