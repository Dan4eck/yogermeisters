import { describe, expect, it, vi } from 'vitest';

import {
  createMeditationFunnelPlan,
  DAY_ONE_MESSAGE,
  DAY_ONE_MESSAGE_CONTENT_KEY,
  DAY_TWO_MESSAGE,
  DAY_TWO_MESSAGE_CONTENT_KEY,
  MEDITATION_AUDIO_CAPTION,
} from './content';
import { createTelegramFunnel } from './funnel';
import { TelegramApiError, TelegramTransportError } from './telegram-api';
import type { TelegramClient, TelegramFunnelPlan, TelegramFunnelStore, TelegramStartInput } from './types';

const startInput: TelegramStartInput = {
  updateId: 100,
  profile: {
    telegramUserId: 123456789,
    chatId: 123456789,
    firstName: 'Анна',
  },
  startPayload: 'instagram_reels_01',
};

function createDependencies(sendError?: Error, attempts = 1, contentKey = 'welcome_meditation_v1'): {
  readonly store: TelegramFunnelStore;
  readonly telegramClient: TelegramClient;
} {
  return {
    store: {
      enrollFromStart: vi.fn().mockResolvedValue('enrolled'),
      claimDueDeliveries: vi.fn().mockResolvedValue([
        {
          id: 'delivery-id',
          subscriberId: 'subscriber-id',
          chatId: 123456789,
          contentKey,
          attempts,
        },
      ]),
      completeDelivery: vi.fn().mockResolvedValue(undefined),
    },
    telegramClient: {
      sendAudio: sendError ? vi.fn().mockRejectedValue(sendError) : vi.fn().mockResolvedValue(456),
      sendMessage: vi.fn().mockResolvedValue(789),
      setWebhook: vi.fn().mockResolvedValue(undefined),
    },
  };
}

function createPlan(): TelegramFunnelPlan {
  return createMeditationFunnelPlan('audio-file-id');
}

describe('createTelegramFunnel', () => {
  it('uses the complete introductory text as the audio caption', () => {
    expect(MEDITATION_AUDIO_CAPTION).toBe(
      [
        'Ты здесь. Значит, тема непостоянства и смерти тебя чем-то задела.',
        'Я подготовила для тебя медитацию на непостоянство и смерть. Она не о том, чтобы пугать себя смертью.',
        'Она о том, чтобы посмотреть на конечность жизни прямо - и благодаря этому почувствовать её ценность. ' +
          'Найди спокойное место, где тебя никто не будет отвлекать.',
        'Если готов - начинай.',
      ].join('\n\n'),
    );
    expect(MEDITATION_AUDIO_CAPTION.length).toBeLessThanOrEqual(1_024);
  });

  it('defines all five funnel steps with fixed delays from start', () => {
    const plan = createPlan();

    expect(plan.steps.map((step) => step.delayMs)).toEqual([
      0,
      30 * 60_000,
      24 * 60 * 60_000,
      (24 * 60 + 50) * 60_000,
      48 * 60 * 60_000,
    ]);
    expect(plan.steps.map((step) => step.contentKey)).toEqual([
      'welcome_meditation_v1',
      'meditation_follow_up_v1',
      'meditation_day_one_message_v1',
      'meditation_day_one_reminder_v1',
      'meditation_day_two_message_v1',
    ]);
  });

  it('enrolls a start update into the configured funnel', async () => {
    const dependencies = createDependencies();
    const plan = createPlan();
    const funnel = createTelegramFunnel({ ...dependencies, plan });

    await funnel.acceptStart(startInput);

    expect(dependencies.store.enrollFromStart).toHaveBeenCalledWith(startInput, plan);
  });

  it('sends due audio with its title and records the delivery', async () => {
    const dependencies = createDependencies();
    const funnel = createTelegramFunnel({ ...dependencies, plan: createPlan() });

    expect(await funnel.runDueBatch()).toBe(1);

    expect(dependencies.telegramClient.sendAudio).toHaveBeenCalledWith(
      123456789,
      'audio-file-id',
      MEDITATION_AUDIO_CAPTION,
      'Медитация на непостоянство',
    );
    expect(dependencies.store.completeDelivery).toHaveBeenCalledWith(
      'delivery-id',
      'subscriber-id',
      { status: 'sent', telegramMessageId: 456 },
    );
  });

  it('sends the trial lesson with its inline button', async () => {
    const dependencies = createDependencies(undefined, 1, DAY_ONE_MESSAGE_CONTENT_KEY);
    const funnel = createTelegramFunnel({ ...dependencies, plan: createPlan() });

    await funnel.runDueBatch();

    expect(dependencies.telegramClient.sendMessage).toHaveBeenCalledWith(
      123456789,
      DAY_ONE_MESSAGE,
      [[{ text: 'Посмотреть Урок', url: 'https://yogermeisters.com/login?next=%2Fcabinet%2Ffree-lesson' }]],
    );
  });

  it('sends both offer buttons in the final message', async () => {
    const dependencies = createDependencies(undefined, 1, DAY_TWO_MESSAGE_CONTENT_KEY);
    const funnel = createTelegramFunnel({ ...dependencies, plan: createPlan() });

    await funnel.runDueBatch();

    expect(dependencies.telegramClient.sendMessage).toHaveBeenCalledWith(
      123456789,
      DAY_TWO_MESSAGE,
      [
        [{ text: '🧘 The Yoga Method', url: 'https://yogermeisters.com/the-yoga-method' }],
        [{ text: '🌿 Чиралы', url: 'https://yogermeisters.com/retreats/cirali-yoga-tour' }],
      ],
    );
  });

  it('reschedules flood-control responses using retry_after', async () => {
    const dependencies = createDependencies(new TelegramApiError('Too Many Requests', 429, 429, 17));
    const now = new Date('2026-09-01T12:00:00.000Z');
    const funnel = createTelegramFunnel({ ...dependencies, plan: createPlan(), now: () => now });

    await funnel.runDueBatch();

    expect(dependencies.store.completeDelivery).toHaveBeenCalledWith(
      'delivery-id',
      'subscriber-id',
      {
        status: 'retry',
        errorMessage: 'Too Many Requests',
        scheduledAt: new Date('2026-09-01T12:00:17.000Z'),
      },
    );
  });

  it('blocks subscribers after a forbidden response', async () => {
    const dependencies = createDependencies(new TelegramApiError('Forbidden', 403, 403));
    const funnel = createTelegramFunnel({ ...dependencies, plan: createPlan() });

    await funnel.runDueBatch();

    expect(dependencies.store.completeDelivery).toHaveBeenCalledWith(
      'delivery-id',
      'subscriber-id',
      { status: 'failed', errorMessage: 'Forbidden', blockSubscriber: true },
    );
  });

  it('marks transport failures as ambiguous instead of risking a duplicate', async () => {
    const dependencies = createDependencies(new TelegramTransportError('Request timed out'));
    const funnel = createTelegramFunnel({ ...dependencies, plan: createPlan() });

    await funnel.runDueBatch();

    expect(dependencies.store.completeDelivery).toHaveBeenCalledWith(
      'delivery-id',
      'subscriber-id',
      { status: 'ambiguous', errorMessage: 'Request timed out' },
    );
  });

  it('stops retrying Telegram server errors after the attempt limit', async () => {
    const dependencies = createDependencies(new TelegramApiError('Telegram unavailable', 503), 5);
    const funnel = createTelegramFunnel({ ...dependencies, plan: createPlan() });

    await funnel.runDueBatch();

    expect(dependencies.store.completeDelivery).toHaveBeenCalledWith(
      'delivery-id',
      'subscriber-id',
      { status: 'failed', errorMessage: 'Telegram unavailable' },
    );
  });
});
