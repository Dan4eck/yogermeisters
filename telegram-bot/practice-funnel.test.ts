import { readFileSync } from 'node:fs';
import { describe, expect, it, vi } from 'vitest';

import {
  createPracticeFunnelPlan,
  PRACTICE_RECOMMENDATIONS,
  PRACTICE_START_PAYLOAD,
  transitionPractice,
  YOGA_LESSON_URL,
} from './practice-content';
import { createPracticeRouter } from './practice-funnel';
import type { TelegramClient, TelegramFunnelStore } from './types';

const media = { nidraAudio: 'new-nidra-audio' };

describe('personal practice funnel', () => {
  it('uses all 16 complete approved messages verbatim', () => {
    const source = readFileSync(new URL('../funnel.md', import.meta.url), 'utf8');
    const section = source.split('## текст4')[1].split('## текст5')[0];
    const approved = [...section.matchAll(/### \d+\. [^\n]+\n\n([\s\S]*?)(?=\n### |$)/g)]
      .map((match) => match[1].trim().replace(/\n\n\[.*\]$/, ''));
    expect(approved).toHaveLength(16);
    expect(PRACTICE_RECOMMENDATIONS).toEqual(approved);
  });

  for (let state = 0; state < 4; state += 1) {
    for (let experience = 0; experience < 4; experience += 1) {
      it(`routes state ${state}, experience ${experience} and preserves both answers`, () => {
        const begin = transitionPractice({ step: 'intro' }, 'pp1:begin', media)!;
        const answer = transitionPractice(begin.conversation, `pp1:state:${state}`, media)!;
        const recommendation = transitionPractice(answer.conversation, `pp1:experience:${experience}`, media)!;
        expect(recommendation.conversation).toEqual({ step: 'recommendation', state, experience });
        expect(recommendation.contentKeys).toEqual([`pp_recommendation_${state * 4 + experience}`]);
        const plan = createPracticeFunnelPlan(media);
        const content = plan.steps.find((step) => step.contentKey === recommendation.contentKeys[0])!.content;
        expect(content.type).toBe('text');
        if (content.type !== 'text') throw new Error('Expected recommendation text');
        expect(content.buttons?.flat()).toHaveLength(1);
        const practice = transitionPractice(recommendation.conversation, 'pp1:practice', media)!;
        expect(practice.contentKeys).toEqual([state === 0 || state === 3 ? 'pp_yoga' : 'pp_nidra', 'pp_interest']);
        for (const interest of ['practice', 'travel']) {
          const next = transitionPractice(practice.conversation, `pp1:interest:${interest}`, media)!;
          expect(next.conversation).toMatchObject({ state, experience, interest });
          expect(next.contentKeys).toEqual([`pp_destination_${interest}`]);
        }
      });
    }
  }

  it('continues honestly without media, and can request media after it is configured', () => {
    const result = transitionPractice({ step: 'recommendation', state: 2, experience: 1 }, 'pp1:practice', {})!;
    expect(result.contentKeys).toEqual(['pp_unavailable', 'pp_interest']);
    const yoga = createPracticeFunnelPlan({}).steps.find((step) => step.contentKey === 'pp_yoga')?.content;
    expect(yoga).toEqual(expect.objectContaining({
      type: 'text',
      buttons: [[expect.objectContaining({ url: YOGA_LESSON_URL })]],
    }));
    expect(createPracticeFunnelPlan({}).steps.some((step) => step.contentKey === 'pp_nidra')).toBe(false);
    expect(transitionPractice(result.conversation, 'pp1:practice', media)?.contentKeys).toEqual(['pp_nidra', 'pp_interest']);
  });

  it('rejects stale, invalid, and out-of-order choices', () => {
    for (const action of ['pp1:state:0', 'pp1:experience:3', 'pp1:practice', 'pp1:interest:travel', 'pp1:state:4']) {
      expect(transitionPractice({ step: 'intro' }, action, media)).toBeUndefined();
    }
    expect(transitionPractice({ step: 'experience', state: 1 }, 'pp1:state:2', media)).toBeUndefined();
  });

  it('reserves only its unique entry and preserves all legacy starts', async () => {
    const legacyFunnel = { acceptStart: vi.fn(), runDueBatch: vi.fn().mockResolvedValue(0) };
    const store: TelegramFunnelStore & { acceptPracticeCallback: ReturnType<typeof vi.fn> } = {
      enrollFromStart: vi.fn().mockResolvedValue('enrolled'), claimDueDeliveries: vi.fn().mockResolvedValue([]),
      completeDelivery: vi.fn(), acceptPracticeCallback: vi.fn(),
    };
    const client: TelegramClient = { sendAudio: vi.fn(), sendMessage: vi.fn(), setWebhook: vi.fn(), answerCallbackQuery: vi.fn() };
    const router = createPracticeRouter({ legacyFunnel, store, telegramClient: client, media });
    const input = { updateId: 1, profile: { telegramUserId: 1, chatId: 1, firstName: 'Анна' } };
    await router.acceptStart({ ...input, startPayload: PRACTICE_START_PAYLOAD });
    expect(store.enrollFromStart).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({ initialContentKeys: ['pp_intro'] }));
    for (const startPayload of [undefined, 'instagram_reels_01', 'personal_practice_v2']) {
      await router.acceptStart({ ...input, startPayload });
    }
    expect(legacyFunnel.acceptStart).toHaveBeenCalledTimes(3);
    expect(store.enrollFromStart).toHaveBeenCalledTimes(1);
    await router.runDueBatch();
    expect(legacyFunnel.runDueBatch).toHaveBeenCalledOnce();
  });
});
