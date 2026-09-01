export interface TelegramBotConfig {
  readonly token: string;
  readonly webhookSecret: string;
  readonly webhookUrl?: string;
  readonly databaseUrl: string;
  readonly meditationAudio?: string;
  readonly meditationCaption?: string;
  readonly testMode: boolean;
  readonly testMessage: string;
  readonly followUpMessage: string;
  readonly followUpDelayMs: number;
  readonly workerPollIntervalMs: number;
  readonly port: number;
}

const DEFAULT_FOLLOW_UP_MESSAGE = [
  'После практики не спеши возвращаться к обычным делам. ' +
    'Посиди ещё несколько минут в тишине.',
  'И просто спроси себя: «Если моя жизнь действительно конечна, ' +
    'что для меня сейчас самое важное?»',
  'Не ищи правильный ответ. Просто побудь с этим вопросом.',
  'Если еще не выполнил практику, найди удобное время и место ' +
    'и включи запись. Эта медитация останется с тобой навсегда. ' +
    'Старайся практиковать регулярно 🙏',
].join('\n\n');

export function readTelegramBotConfig(env: NodeJS.ProcessEnv = process.env): TelegramBotConfig {
  const token = requireValue(env.TELEGRAM_BOT_TOKEN, 'TELEGRAM_BOT_TOKEN');
  const webhookSecret = requireValue(env.TELEGRAM_WEBHOOK_SECRET, 'TELEGRAM_WEBHOOK_SECRET');
  const databaseUrl = requireValue(env.DATABASE_URL, 'DATABASE_URL');
  const meditationAudio = emptyToUndefined(env.MEDITATION_AUDIO_FILE_ID || env.MEDITATION_AUDIO_URL);
  const testMode = env.TELEGRAM_TEST_MODE === 'true';

  if (!meditationAudio && !testMode) {
    throw new Error('MEDITATION_AUDIO_FILE_ID or MEDITATION_AUDIO_URL is required unless TELEGRAM_TEST_MODE=true');
  }

  if (webhookSecret.length < 32 || !/^[A-Za-z0-9_-]+$/.test(webhookSecret)) {
    throw new Error('TELEGRAM_WEBHOOK_SECRET must contain at least 32 letters, digits, underscores, or hyphens');
  }

  return {
    token,
    webhookSecret,
    webhookUrl: readOptionalUrl(env.TELEGRAM_WEBHOOK_URL),
    databaseUrl,
    meditationAudio,
    meditationCaption: emptyToUndefined(env.MEDITATION_CAPTION),
    testMode,
    testMessage:
      emptyToUndefined(env.TELEGRAM_TEST_MESSAGE) ||
      'Бот работает. Аудиозапись с медитацией будет добавлена ' +
        'немного позже.',
    followUpMessage:
      emptyToUndefined(env.MEDITATION_FOLLOW_UP_MESSAGE) || DEFAULT_FOLLOW_UP_MESSAGE,
    followUpDelayMs: readPositiveInteger(env.MEDITATION_FOLLOW_UP_DELAY_MINUTES, 30) * 60_000,
    workerPollIntervalMs: readPositiveInteger(env.TELEGRAM_WORKER_POLL_SECONDS, 15) * 1_000,
    port: readPort(env.PORT),
  };
}

function requireValue(value: string | undefined, name: string): string {
  const result = emptyToUndefined(value);
  if (!result) {
    throw new Error(`${name} is required`);
  }
  return result;
}

function readOptionalUrl(value: string | undefined): string | undefined {
  const result = emptyToUndefined(value);
  if (!result) {
    return undefined;
  }
  const url = new URL(result);
  if (url.protocol !== 'https:') {
    throw new Error('TELEGRAM_WEBHOOK_URL must use HTTPS');
  }
  return url.toString().replace(/\/$/, '');
}

function emptyToUndefined(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed ? trimmed : undefined;
}

function readPort(value: string | undefined): number {
  const port = Number.parseInt(value || '3002', 10);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid TCP port');
  }
  return port;
}

function readPositiveInteger(value: string | undefined, fallback: number): number {
  if (!value) {
    return fallback;
  }
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}
