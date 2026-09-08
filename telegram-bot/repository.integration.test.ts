import { randomUUID } from 'node:crypto';
import path from 'node:path';

import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import { Pool } from 'pg';
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';

import { createMeditationFunnelPlan } from './content';
import { createTelegramFunnel } from './funnel';
import {
  PRACTICE_FOLLOW_UP,
  PRACTICE_RECOMMENDATIONS,
  PRACTICE_START_PAYLOAD,
  YOGA_LESSON_URL,
  type PracticeMedia,
} from './practice-content';
import { createPracticeRouter } from './practice-funnel';
import { DrizzleTelegramFunnelStore } from './repository';
import type { TelegramCallbackInput, TelegramClient, TelegramFunnel } from './types';

const databaseUrl = process.env.TEST_TELEGRAM_DATABASE_URL;
const schema = `funnel_test_${randomUUID().replaceAll('-', '')}`;
const profile = { telegramUserId: 101, chatId: 101, firstName: 'Test' };

describe.skipIf(!databaseUrl)('Telegram funnel with isolated PostgreSQL database', (): void => {
  let admin: Pool;
  let pool: Pool;
  let store: DrizzleTelegramFunnelStore;
  let updateId = 0;
  let messageId = 0;
  const telegramClient = {
    sendMessage: vi.fn(async (): Promise<number> => ++messageId),
    sendAudio: vi.fn(async (): Promise<number> => ++messageId),
    sendVideo: vi.fn(async (): Promise<number> => ++messageId),
    answerCallbackQuery: vi.fn(async (): Promise<void> => {}),
    setWebhook: vi.fn(async (): Promise<void> => {}),
  } satisfies TelegramClient;

  beforeAll(async (): Promise<void> => {
    admin = new Pool({ connectionString: databaseUrl });
    await admin.query(`CREATE DATABASE "${schema}"`);
    const isolatedUrl = new URL(databaseUrl!);
    isolatedUrl.pathname = `/${schema}`;
    pool = new Pool({ connectionString: isolatedUrl.toString() });
    await migrate(drizzle(pool), {
      migrationsFolder: path.resolve('drizzle'),
    });
    store = new DrizzleTelegramFunnelStore(drizzle(pool));
  });

  afterAll(async (): Promise<void> => {
    await pool?.end();
    if (admin) {
      await admin.query(`DROP DATABASE IF EXISTS "${schema}"`);
      await admin.end();
    }
  });

  beforeEach(async (): Promise<void> => {
    vi.clearAllMocks();
    await pool.query('TRUNCATE telegram_subscribers, telegram_updates CASCADE');
    updateId = 0;
    messageId = 0;
  });

  function router(media: PracticeMedia = {}): TelegramFunnel {
    return createPracticeRouter({
      store,
      telegramClient,
      media,
      legacyFunnel: createTelegramFunnel({
        store,
        telegramClient,
        plan: createMeditationFunnelPlan('existing-meditation-fixture'),
      }),
    });
  }

  function callback(data: string): TelegramCallbackInput {
    const id = ++updateId;
    return { updateId: id, callbackId: `test-${id}`, telegramUserId: 101, chatId: 101, data };
  }

  async function press(funnel: TelegramFunnel, data: string): Promise<void> {
    await funnel.acceptCallback!(callback(data));
    await drain(funnel);
  }

  async function drain(funnel: TelegramFunnel): Promise<void> {
    for (let batch = 0; batch < 12; batch += 1) {
      if (await funnel.runDueBatch() === 0) return;
    }
    throw new Error('Delivery queue did not drain');
  }

  async function begin(funnel: TelegramFunnel): Promise<void> {
    await funnel.acceptStart({ updateId: ++updateId, profile, startPayload: PRACTICE_START_PAYLOAD });
    await drain(funnel);
    await press(funnel, 'pp1:begin');
  }

  const combinations = Array.from({ length: 16 }, (_value: unknown, index: number) => ({
    state: Math.floor(index / 4), experience: index % 4, index,
  }));

  it.each(combinations)('persists and delivers combination $state / $experience', async ({
    state, experience, index,
  }): Promise<void> => {
    const funnel = router({ nidraAudio: 'test-nidra' });
    await begin(funnel);
    await press(funnel, `pp1:state:${state}`);
    await press(funnel, `pp1:experience:${experience}`);
    expect(telegramClient.sendMessage).toHaveBeenLastCalledWith(
      101, PRACTICE_RECOMMENDATIONS[index], [[expect.objectContaining({ callback_data: 'pp1:practice' })]],
    );
    await press(funnel, 'pp1:practice');
    const yoga = state === 0 || state === 3;
    expect(telegramClient.sendVideo).not.toHaveBeenCalled();
    expect(telegramClient.sendAudio).toHaveBeenCalledTimes(yoga ? 0 : 1);
    if (yoga) {
      expect(telegramClient.sendMessage).toHaveBeenCalledWith(
        101,
        expect.any(String),
        [
          [expect.objectContaining({ url: YOGA_LESSON_URL })],
          [expect.objectContaining({ callback_data: 'pp1:continue' })],
        ],
      );
    }
    expect(telegramClient.sendMessage).not.toHaveBeenLastCalledWith(101, PRACTICE_FOLLOW_UP, expect.any(Array));
    await press(funnel, 'pp1:continue');
    expect(telegramClient.sendMessage).toHaveBeenLastCalledWith(101, PRACTICE_FOLLOW_UP, expect.any(Array));
    const interest = experience % 2 === 0 ? 'practice' : 'travel';
    await press(funnel, `pp1:interest:${interest}`);
    const { rows } = await pool.query('SELECT conversation_state FROM telegram_funnel_enrollments');
    expect(rows).toHaveLength(1);
    expect(rows[0].conversation_state).toEqual({ step: 'interest', state, experience, interest });
    const destination = interest === 'practice' ? '/the-yoga-method' : '/retreats/cirali-yoga-tour';
    expect(telegramClient.sendMessage).toHaveBeenLastCalledWith(101, expect.any(String), [[
      expect.objectContaining({ url: `https://yogermeisters.com${destination}` }),
    ]]);
    const sent = await pool.query('SELECT status FROM telegram_deliveries');
    expect(sent.rows.every((row: { status: string }): boolean => row.status === 'sent')).toBe(true);
  });

  it('keeps the original schedule and enrollment independent for the same subscriber', async (): Promise<void> => {
    const funnel = router();
    await funnel.acceptStart({ updateId: ++updateId, profile, startPayload: 'instagram_reels_01' });
    const before = await pool.query('SELECT * FROM telegram_deliveries ORDER BY step_order');
    expect(before.rows).toHaveLength(5);
    expect(before.rows.map((row: { scheduled_at: Date }): number =>
      row.scheduled_at.getTime() - before.rows[0].scheduled_at.getTime(),
    )).toEqual([0, 30 * 60_000, 24 * 3_600_000, 24 * 3_600_000 + 50 * 60_000, 48 * 3_600_000]);
    await begin(funnel);
    expect(telegramClient.sendAudio).toHaveBeenCalledTimes(1);
    const enrollments = await pool.query('SELECT funnel_key, conversation_state FROM telegram_funnel_enrollments');
    expect(enrollments.rows).toHaveLength(2);
    expect(enrollments.rows.find((row: { funnel_key: string }): boolean =>
      row.funnel_key === 'welcome_meditation',
    ).conversation_state).toBeNull();
    await funnel.acceptStart({ updateId: ++updateId, profile });
    const legacy = await pool.query(`SELECT d.id FROM telegram_deliveries d
      JOIN telegram_funnel_enrollments e ON e.id = d.enrollment_id
      WHERE e.funnel_key = 'welcome_meditation' ORDER BY d.step_order`);
    expect(legacy.rows.map((row: { id: string }): string => row.id)).toEqual(
      before.rows.map((row: { id: string }): string => row.id),
    );
  });

  it('starts a fresh personal practice conversation when the deep link is opened again', async (): Promise<void> => {
    const funnel = router();
    await begin(funnel);
    await press(funnel, 'pp1:state:2');

    vi.clearAllMocks();
    await funnel.acceptStart({ updateId: ++updateId, profile, startPayload: PRACTICE_START_PAYLOAD });
    await drain(funnel);

    expect(telegramClient.sendMessage).toHaveBeenCalledExactlyOnceWith(
      101,
      expect.any(String),
      [[expect.objectContaining({ callback_data: 'pp1:begin' })]],
    );
    const enrollments = await pool.query(
      "SELECT status, conversation_state FROM telegram_funnel_enrollments WHERE funnel_key = 'personal_practice' " +
      'ORDER BY started_at',
    );
    expect(enrollments.rows).toEqual([
      expect.objectContaining({ status: 'cancelled' }),
      { status: 'active', conversation_state: { step: 'intro' } },
    ]);
  });

  it('survives restart and serializes duplicate and competing callbacks', async (): Promise<void> => {
    const first = router();
    await begin(first);
    const answer = callback('pp1:state:2');
    await Promise.all([first.acceptCallback!(answer), first.acceptCallback!(answer)]);
    await drain(first);
    store = new DrizzleTelegramFunnelStore(drizzle(pool));
    const restarted = router();
    await Promise.all([
      restarted.acceptCallback!(callback('pp1:experience:1')),
      restarted.acceptCallback!(callback('pp1:experience:3')),
    ]);
    await drain(restarted);
    await press(restarted, 'pp1:state:0');
    const { rows } = await pool.query('SELECT conversation_state FROM telegram_funnel_enrollments');
    expect(rows[0].conversation_state.state).toBe(2);
    expect([1, 3]).toContain(rows[0].conversation_state.experience);
    const deliveries = await pool.query('SELECT content_key FROM telegram_deliveries');
    expect(deliveries.rows).toHaveLength(4);
    expect(deliveries.rows.filter((row: { content_key: string }): boolean =>
      row.content_key.startsWith('pp_recommendation_'),
    )).toHaveLength(1);
  });

  it('keeps missing media undelivered, continues to text5 and delivers after media is configured', async (): Promise<void> => {
    const empty = router();
    await begin(empty);
    await press(empty, 'pp1:state:2');
    await press(empty, 'pp1:experience:0');
    await press(empty, 'pp1:practice');
    expect(telegramClient.sendVideo).not.toHaveBeenCalled();
    expect(telegramClient.sendAudio).not.toHaveBeenCalled();
    const before = await pool.query("SELECT * FROM telegram_deliveries WHERE content_key = 'pp_nidra'");
    expect(before.rows).toHaveLength(0);
    const configured = router({ nidraAudio: 'new-nidra-file' });
    await press(configured, 'pp1:practice');
    await press(configured, 'pp1:practice');
    expect(telegramClient.sendAudio).toHaveBeenCalledTimes(1);
    await press(configured, 'pp1:continue');
    await press(configured, 'pp1:continue');
    const followUps = telegramClient.sendMessage.mock.calls.filter((args: unknown[]): boolean =>
      args[1] === PRACTICE_FOLLOW_UP,
    );
    expect(followUps).toHaveLength(1);
  });

  it('ignores callbacks from a different chat or subscriber', async (): Promise<void> => {
    const funnel = router();
    await begin(funnel);
    await funnel.acceptCallback!({ ...callback('pp1:state:1'), chatId: 999 });
    await funnel.acceptCallback!({ ...callback('pp1:state:1'), telegramUserId: 999 });
    await drain(funnel);
    const { rows } = await pool.query('SELECT conversation_state FROM telegram_funnel_enrollments');
    expect(rows[0].conversation_state).toEqual({ step: 'state' });
  });
});
