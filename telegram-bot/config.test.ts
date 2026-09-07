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
      practiceMedia: { yogaVideo: undefined, nidraAudio: undefined },
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

it('accepts missing practice media and validates explicit independent sources', () => {
  expect(readTelegramBotConfig(validEnv).practiceMedia).toEqual({});
  expect(readTelegramBotConfig({ ...validEnv, PERSONAL_PRACTICE_YOGA_VIDEO_FILE_ID: 'new-yoga' }).practiceMedia)
    .toEqual({ yogaVideo: 'new-yoga' });
  expect(() => readTelegramBotConfig({ ...validEnv,
    PERSONAL_PRACTICE_NIDRA_AUDIO_FILE_ID: 'new-nidra', PERSONAL_PRACTICE_NIDRA_AUDIO_URL: 'https://example.com/a.mp3',
  })).toThrow('Set only one');
  expect(() => readTelegramBotConfig({ ...validEnv, PERSONAL_PRACTICE_YOGA_VIDEO_URL: 'http://example.com/a.mp4' }))
    .toThrow('HTTPS');
});
