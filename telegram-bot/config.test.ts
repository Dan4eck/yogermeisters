import { describe, expect, it } from 'vitest';

import { readTelegramBotConfig } from './config';

const validEnv: NodeJS.ProcessEnv = {
  TELEGRAM_BOT_TOKEN: '123456:example-token',
  TELEGRAM_WEBHOOK_SECRET: 'abcdefghijklmnopqrstuvwxyz_123456',
  TELEGRAM_WEBHOOK_URL: 'https://bot.example.com/telegram/webhook',
  DATABASE_URL: 'postgresql://user:password@localhost/database',
  MEDITATION_AUDIO_FILE_ID: 'CQACAgIAAxkBAAIBexample',
  PORT: '3002',
};

describe('readTelegramBotConfig', () => {
  it('reads a complete bot configuration', () => {
    expect(readTelegramBotConfig(validEnv)).toEqual({
      token: '123456:example-token',
      webhookSecret: 'abcdefghijklmnopqrstuvwxyz_123456',
      webhookUrl: 'https://bot.example.com/telegram/webhook',
      databaseUrl: 'postgresql://user:password@localhost/database',
      meditationAudio: 'CQACAgIAAxkBAAIBexample',
      port: 3002,
    });
  });

  it('requires the Telegram token', () => {
    expect(() => readTelegramBotConfig({ ...validEnv, TELEGRAM_BOT_TOKEN: '' })).toThrow(
      'TELEGRAM_BOT_TOKEN is required',
    );
  });

  it('requires an audio source', () => {
    expect(() =>
      readTelegramBotConfig({ ...validEnv, MEDITATION_AUDIO_FILE_ID: '', MEDITATION_AUDIO_URL: '' }),
    ).toThrow('MEDITATION_AUDIO_FILE_ID or MEDITATION_AUDIO_URL is required');
  });

  it('rejects two competing audio sources', () => {
    expect(() =>
      readTelegramBotConfig({ ...validEnv, MEDITATION_AUDIO_URL: 'https://example.com/meditation.mp3' }),
    ).toThrow('Set only one of MEDITATION_AUDIO_FILE_ID or MEDITATION_AUDIO_URL');
  });

  it('rejects an insecure webhook URL', () => {
    expect(() =>
      readTelegramBotConfig({ ...validEnv, TELEGRAM_WEBHOOK_URL: 'http://bot.example.com/telegram/webhook' }),
    ).toThrow('TELEGRAM_WEBHOOK_URL must use HTTPS');
  });
});
