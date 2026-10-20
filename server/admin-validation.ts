import type {
  RetreatBlockSeed,
  RetreatBlockTranslationSeed,
  RetreatEditableData,
  RetreatLanguage,
  RetreatTranslationSeed,
  RetreatUpdate,
  RetreatView,
} from '@shared/retreats';
import type { RetreatDay, RetreatDayLayout, RetreatExperience, RetreatMedia } from '@shared/retreats/experience';

const RETREAT_UPDATE_KEYS = new Set<keyof RetreatEditableData>([
  'status',
  'title',
  'location',
  'startDate',
  'endDate',
  'dateLabel',
  'price',
  'bookingUrl',
  'coverImage',
  'translations',
  'blocks',
  'experience',
]);
const RETREAT_STATUSES = new Set(['draft', 'active', 'archived']);
const BLOCK_TYPES = new Set(['paragraph', 'image', 'heading', 'callout', 'countdown']);
const CALLOUT_VARIANTS = new Set(['soft', 'cta', 'outline', 'sunrise', 'lagoon']);
const LANGUAGES: readonly RetreatLanguage[] = ['en', 'ru'];

export class RequestValidationError extends Error {}

export function parseClientEmail(body: unknown): string {
  const record = requireRecord(body, 'Request body');
  rejectUnknownKeys(record, new Set(['email']), 'Request body');
  const email = requireString(record.email, 'email').toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new RequestValidationError('email must be a valid email address');
  }
  return email;
}

export function parseUserId(value: string): string {
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new RequestValidationError('userId must be a valid UUID');
  }
  return value;
}

export function parseRetreatLanguage(value: unknown): RetreatLanguage {
  if (value === undefined) {
    return 'en';
  }
  if (value !== 'en' && value !== 'ru') {
    throw new RequestValidationError('language must be en or ru');
  }
  return value;
}

export function parseRetreatView(value: unknown): RetreatView {
  if (value === undefined) {
    return 'all';
  }
  if (value !== 'upcoming' && value !== 'archive' && value !== 'all') {
    throw new RequestValidationError('view must be upcoming, archive, or all');
  }
  return value;
}

export function parseRetreatUpdate(body: unknown): RetreatUpdate {
  const record = requireRecord(body, 'Request body');
  rejectUnknownKeys(record, RETREAT_UPDATE_KEYS, 'Request body');
  if (Object.keys(record).length === 0) {
    throw new RequestValidationError('At least one retreat field is required');
  }

  const update: Record<string, unknown> = {};
  copyOptionalString(record, update, 'title');
  copyOptionalString(record, update, 'location');
  copyOptionalDate(record, update, 'startDate');
  copyOptionalDate(record, update, 'endDate');
  copyOptionalString(record, update, 'dateLabel');
  copyOptionalString(record, update, 'price');
  copyOptionalUrl(record, update, 'bookingUrl');
  copyOptionalString(record, update, 'coverImage');

  if (record.status !== undefined) {
    const status = requireString(record.status, 'status');
    if (!RETREAT_STATUSES.has(status)) {
      throw new RequestValidationError('status must be draft, active, or archived');
    }
    update.status = status;
  }
  if (record.translations !== undefined) {
    update.translations = parseRetreatTranslations(record.translations);
  }
  if (record.blocks !== undefined) {
    if (!Array.isArray(record.blocks)) {
      throw new RequestValidationError('blocks must be an array');
    }
    update.blocks = record.blocks.map((block, index) => parseBlock(block, index));
  }
  if (record.experience !== undefined) {
    update.experience = parseRetreatExperience(record.experience, 'experience');
  }

  return update as RetreatUpdate;
}

function parseRetreatTranslations(value: unknown): Partial<Record<RetreatLanguage, RetreatTranslationSeed>> {
  const record = requireRecord(value, 'translations');
  rejectUnknownKeys(record, new Set(LANGUAGES), 'translations');
  const translations: Partial<Record<RetreatLanguage, RetreatTranslationSeed>> = {};

  for (const language of LANGUAGES) {
    if (record[language] === undefined) {
      continue;
    }
    const translation = requireRecord(record[language], `translations.${language}`);
    rejectUnknownKeys(translation, new Set(['title', 'location', 'dateLabel', 'experience']), `translations.${language}`);
    translations[language] = {
      title: requireString(translation.title, `translations.${language}.title`),
      location: requireString(translation.location, `translations.${language}.location`),
      ...(translation.dateLabel === undefined
        ? {}
        : { dateLabel: requireString(translation.dateLabel, `translations.${language}.dateLabel`) }),
      ...(translation.experience === undefined
        ? {}
        : { experience: parseRetreatExperience(translation.experience, `translations.${language}.experience`) }),
    };
  }

  return translations;
}

function parseBlock(value: unknown, index: number): RetreatBlockSeed {
  const field = `blocks[${index}]`;
  const record = requireRecord(value, field);
  rejectUnknownKeys(record, new Set([
    'id',
    'sortOrder',
    'type',
    'variant',
    'deadline',
    'priceCurrent',
    'priceCompare',
    'text',
    'image',
    'alt',
    'translations',
  ]), field);

  const type = requireString(record.type, `${field}.type`);
  if (!BLOCK_TYPES.has(type)) {
    throw new RequestValidationError(`${field}.type is not supported`);
  }
  if (!Number.isInteger(record.sortOrder) || Number(record.sortOrder) < 0) {
    throw new RequestValidationError(`${field}.sortOrder must be a non-negative integer`);
  }

  const block: Record<string, unknown> = {
    id: requireString(record.id, `${field}.id`),
    sortOrder: record.sortOrder,
    type,
  };
  for (const key of ['deadline', 'priceCurrent', 'priceCompare', 'text', 'image', 'alt'] as const) {
    copyOptionalString(record, block, key, field);
  }
  if (record.variant !== undefined) {
    const variant = requireString(record.variant, `${field}.variant`);
    if (!CALLOUT_VARIANTS.has(variant)) {
      throw new RequestValidationError(`${field}.variant is not supported`);
    }
    block.variant = variant;
  }
  if (record.translations !== undefined) {
    block.translations = parseBlockTranslations(record.translations, field);
  }

  return block as unknown as RetreatBlockSeed;
}

function parseBlockTranslations(
  value: unknown,
  blockField: string,
): Partial<Record<RetreatLanguage, RetreatBlockTranslationSeed>> {
  const field = `${blockField}.translations`;
  const record = requireRecord(value, field);
  rejectUnknownKeys(record, new Set(LANGUAGES), field);
  const translations: Partial<Record<RetreatLanguage, RetreatBlockTranslationSeed>> = {};

  for (const language of LANGUAGES) {
    if (record[language] === undefined) {
      continue;
    }
    const translationField = `${field}.${language}`;
    const translation = requireRecord(record[language], translationField);
    rejectUnknownKeys(translation, new Set(['text', 'alt']), translationField);
    translations[language] = {
      ...(translation.text === undefined ? {} : { text: requireString(translation.text, `${translationField}.text`) }),
      ...(translation.alt === undefined ? {} : { alt: requireString(translation.alt, `${translationField}.alt`) }),
    };
  }

  return translations;
}

function copyOptionalString(
  source: Record<string, unknown>,
  target: Record<string, unknown>,
  key: string,
  prefix?: string,
): void {
  if (source[key] !== undefined) {
    target[key] = requireString(source[key], prefix ? `${prefix}.${key}` : key);
  }
}

function copyOptionalDate(source: Record<string, unknown>, target: Record<string, unknown>, key: string): void {
  if (source[key] === undefined) {
    return;
  }
  const value = requireString(source[key], key);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw new RequestValidationError(`${key} must use YYYY-MM-DD format`);
  }
  target[key] = value;
}

function copyOptionalUrl(source: Record<string, unknown>, target: Record<string, unknown>, key: string): void {
  if (source[key] === undefined) {
    return;
  }
  const value = requireString(source[key], key);
  try {
    const url = new URL(value);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
      throw new Error();
    }
  } catch {
    throw new RequestValidationError(`${key} must be an HTTP or HTTPS URL`);
  }
  target[key] = value;
}

function requireRecord(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new RequestValidationError(`${field} must be a JSON object`);
  }
  return value as Record<string, unknown>;
}

function requireString(value: unknown, field: string): string {
  if (typeof value !== 'string' || value.trim() === '') {
    throw new RequestValidationError(`${field} must be a non-empty string`);
  }
  return value;
}

function parseRetreatExperience(value: unknown, field: string): RetreatExperience {
  const record = requireRecord(value, field);
  const textKeys = [
    'heroTitle', 'heroText', 'introTitle', 'introText', 'stayTitle', 'stayText',
    'bookingTitle', 'bookingText', 'bookingNote',
  ] as const;
  rejectUnknownKeys(record, new Set([...textKeys, 'stayImages', 'days', 'bookingSteps', 'reasons', 'inclusions']), field);
  const text = Object.fromEntries(textKeys.map((key) => [key, requireString(record[key], `${field}.${key}`)])) as
    Pick<RetreatExperience, typeof textKeys[number]>;
  const days = requireArray(record.days, `${field}.days`, 1, 31).map((item, index): RetreatDay => {
    const dayField = `${field}.days[${index}]`;
    const day = requireRecord(item, dayField);
    rejectUnknownKeys(day, new Set([
      'id', 'date', 'title', 'summary', 'pace', 'layout', 'highlights', 'images', 'schedule', 'note',
    ]), dayField);
    const id = requireString(day.id, `${dayField}.id`);
    if (!/^[a-z][a-z0-9-]*$/.test(id)) {
      throw new RequestValidationError(`${dayField}.id must be a lowercase anchor identifier`);
    }
    const date = requireString(day.date, `${dayField}.date`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !Number.isFinite(Date.parse(date))
      || new Date(date).toISOString().slice(0, 10) !== date) {
      throw new RequestValidationError(`${dayField}.date must be a valid ISO date`);
    }
    const layout = requireString(day.layout, `${dayField}.layout`);
    if (!['text', 'split', 'panorama', 'collage'].includes(layout)) {
      throw new RequestValidationError(`${dayField}.layout is not supported`);
    }
    const images = parseExperienceMedia(day.images, `${dayField}.images`, layout === 'text' ? 0 : 1);
    return {
      id, date,
      title: requireString(day.title, `${dayField}.title`),
      summary: requireString(day.summary, `${dayField}.summary`),
      pace: requireString(day.pace, `${dayField}.pace`),
      layout: layout as RetreatDayLayout,
      highlights: requireArray(day.highlights, `${dayField}.highlights`, 1, 4)
        .map((text, index): string => requireString(text, `${dayField}.highlights[${index}]`)),
      images,
      schedule: requireArray(day.schedule, `${dayField}.schedule`, 1, 24).map((item, index) => {
        const scheduleField = `${dayField}.schedule[${index}]`;
        const entry = requireRecord(item, scheduleField);
        rejectUnknownKeys(entry, new Set(['time', 'text']), scheduleField);
        return {
          time: requireString(entry.time, `${scheduleField}.time`),
          text: requireString(entry.text, `${scheduleField}.text`),
        };
      }),
      ...(day.note === undefined ? {} : { note: requireString(day.note, `${dayField}.note`) }),
    };
  });
  if (new Set(days.map((day) => day.id)).size !== days.length
    || days.some((day, index) => index > 0 && day.date <= days[index - 1].date)) {
    throw new RequestValidationError(`${field}.days must have unique IDs and increasing dates`);
  }
  let inclusions: RetreatExperience['inclusions'];
  if (record.inclusions !== undefined) {
    const details = requireRecord(record.inclusions, `${field}.inclusions`);
    rejectUnknownKeys(details, new Set(['included', 'excluded']), `${field}.inclusions`);
    const parseItems = (key: 'included' | 'excluded'): readonly string[] =>
      requireArray(details[key], `${field}.inclusions.${key}`, 1, 12)
        .map((item, index): string => requireString(item, `${field}.inclusions.${key}[${index}]`));
    inclusions = { included: parseItems('included'), excluded: parseItems('excluded') };
  }
  return {
    ...text,
    ...(inclusions ? { inclusions } : {}),
    ...(record.reasons === undefined ? {} : {
      reasons: requireArray(record.reasons, `${field}.reasons`, 1, 6).map((item, index) => {
        const reasonField = `${field}.reasons[${index}]`;
        const reason = requireRecord(item, reasonField);
        rejectUnknownKeys(reason, new Set(['title', 'text', 'image']), reasonField);
        return {
          title: requireString(reason.title, `${reasonField}.title`),
          text: requireString(reason.text, `${reasonField}.text`),
          image: parseExperienceMedia([reason.image], `${reasonField}.image`, 1)[0],
        };
      }),
    }),
    stayImages: parseExperienceMedia(record.stayImages, `${field}.stayImages`, 1),
    days,
    bookingSteps: requireArray(record.bookingSteps, `${field}.bookingSteps`, 1, 5)
      .map((text, index): string => requireString(text, `${field}.bookingSteps[${index}]`)),
  };
}

function parseExperienceMedia(value: unknown, field: string, minimum: number): readonly RetreatMedia[] {
  return requireArray(value, field, minimum, 3).map((item, index): RetreatMedia => {
    const imageField = `${field}[${index}]`;
    const image = requireRecord(item, imageField);
    rejectUnknownKeys(image, new Set(['src', 'alt', 'caption']), imageField);
    const src = requireString(image.src, `${imageField}.src`);
    if (!/^\/assets\/[a-zA-Z0-9/_-]+\.(webp|jpe?g|png|avif)$/.test(src)) {
      throw new RequestValidationError(`${imageField}.src must be a local image under /assets/`);
    }
    return {
      src,
      alt: requireString(image.alt, `${imageField}.alt`),
      ...(image.caption === undefined ? {} : { caption: requireString(image.caption, `${imageField}.caption`) }),
    };
  });
}

function requireArray(value: unknown, field: string, minimum: number, maximum: number): readonly unknown[] {
  if (!Array.isArray(value) || value.length < minimum || value.length > maximum) {
    throw new RequestValidationError(`${field} must contain ${minimum}–${maximum} items`);
  }
  return value;
}

function rejectUnknownKeys(record: Record<string, unknown>, allowed: ReadonlySet<string>, field: string): void {
  const unknownKey = Object.keys(record).find((key) => !allowed.has(key));
  if (unknownKey) {
    throw new RequestValidationError(`${field} contains unsupported field: ${unknownKey}`);
  }
}
