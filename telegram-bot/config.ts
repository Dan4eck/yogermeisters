export interface TelegramBotConfig {
  readonly token: string;
  readonly webhookSecret: string;
  readonly webhookUrl?: string;
  readonly databaseUrl: string;
  readonly meditationAudio: string;
  readonly port: number;
}

export function readTelegramBotConfig(env: NodeJS.ProcessEnv = process.env): TelegramBotConfig {
  const token = requireValue(env.TELEGRAM_BOT_TOKEN, 'TELEGRAM_BOT_TOKEN');
  const webhookSecret = requireValue(env.TELEGRAM_WEBHOOK_SECRET, 'TELEGRAM_WEBHOOK_SECRET');
  const databaseUrl = requireValue(env.DATABASE_URL, 'DATABASE_URL');
  const meditationAudioFileId = emptyToUndefined(env.MEDITATION_AUDIO_FILE_ID);
  const meditationAudioUrl = emptyToUndefined(env.MEDITATION_AUDIO_URL);
  if (meditationAudioFileId && meditationAudioUrl) {
    throw new Error('Set only one of MEDITATION_AUDIO_FILE_ID or MEDITATION_AUDIO_URL');
  }
  const meditationAudio = meditationAudioFileId || meditationAudioUrl;

  if (!meditationAudio) {
    throw new Error('MEDITATION_AUDIO_FILE_ID or MEDITATION_AUDIO_URL is required');
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
  const rawValue = value || '3002';
  const port = /^\d+$/.test(rawValue) ? Number(rawValue) : Number.NaN;
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT must be a valid TCP port');
  }
  return port;
}
