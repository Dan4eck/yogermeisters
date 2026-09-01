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
      meditationCaption: undefined,
      testMode: false,
      testMessage:
        'Бот работает. Аудиозапись с медитацией будет добавлена ' +
        'немного позже.',
      followUpMessage:
        'После практики не спеши возвращаться к обычным делам. ' +
        'Посиди ещё несколько минут в тишине.\n\n' +
        'И просто спроси себя: «Если моя жизнь действительно ' +
        'конечна, ' +
        'что для меня сейчас самое важное?»\n\n' +
        'Не ищи правильный ответ. Просто побудь с этим вопросом.\n\n' +
        'Если еще не выполнил практику, найди удобное время и место ' +
        'и включи запись. Эта медитация останется с тобой навсегда. ' +
        'Старайся практиковать регулярно 🙏',
      followUpDelayMs: 30 * 60_000,
      workerPollIntervalMs: 15_000,
      port: 3002,
    });
  });

  it('requires the Telegram token', () => {
    expect(() => readTelegramBotConfig({ ...validEnv, TELEGRAM_BOT_TOKEN: '' })).toThrow(
      'TELEGRAM_BOT_TOKEN is required',
    );
  });

  it('requires an audio source outside test mode', () => {
    expect(() =>
      readTelegramBotConfig({ ...validEnv, MEDITATION_AUDIO_FILE_ID: '', MEDITATION_AUDIO_URL: '' }),
    ).toThrow('MEDITATION_AUDIO_FILE_ID or MEDITATION_AUDIO_URL is required unless TELEGRAM_TEST_MODE=true');
  });

  it('allows startup without audio in test mode', () => {
    const config = readTelegramBotConfig({
      ...validEnv,
      MEDITATION_AUDIO_FILE_ID: '',
      TELEGRAM_TEST_MODE: 'true',
    });

    expect(config.meditationAudio).toBeUndefined();
    expect(config.testMode).toBe(true);
  });

  it('rejects an insecure webhook URL', () => {
    expect(() =>
      readTelegramBotConfig({ ...validEnv, TELEGRAM_WEBHOOK_URL: 'http://bot.example.com/telegram/webhook' }),
    ).toThrow('TELEGRAM_WEBHOOK_URL must use HTTPS');
  });
});
