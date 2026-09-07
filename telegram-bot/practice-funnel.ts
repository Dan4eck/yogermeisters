import { createTelegramFunnel } from './funnel';
import { createPracticeFunnelPlan, PRACTICE_CALLBACK_PREFIX, PRACTICE_START_PAYLOAD, transitionPractice } from './practice-content';
import type { PracticeMedia } from './practice-content';
import type { DrizzleTelegramFunnelStore } from './repository';
import type { TelegramCallbackInput, TelegramClient, TelegramFunnel, TelegramFunnelStore, TelegramStartInput } from './types';

export function createPracticeRouter(dependencies: {
  readonly legacyFunnel: TelegramFunnel;
  readonly store: TelegramFunnelStore & Pick<DrizzleTelegramFunnelStore, 'acceptPracticeCallback'>;
  readonly telegramClient: TelegramClient;
  readonly media: PracticeMedia;
  readonly logError?: (message: string) => void;
}): TelegramFunnel {
  const plan = createPracticeFunnelPlan(dependencies.media);
  const personalFunnel = createTelegramFunnel({ ...dependencies, plan });
  return {
    async acceptStart(input: TelegramStartInput): Promise<void> {
      await (input.startPayload === PRACTICE_START_PAYLOAD ? personalFunnel : dependencies.legacyFunnel)
        .acceptStart(input);
    },
    async acceptCallback(input: TelegramCallbackInput): Promise<void> {
      if (!input.data.startsWith(PRACTICE_CALLBACK_PREFIX)) return;
      await dependencies.store.acceptPracticeCallback(input, plan,
        (state) => transitionPractice(state, input.data, dependencies.media));
      try {
        await dependencies.telegramClient.answerCallbackQuery?.(input.callbackId);
      } catch (error) {
        dependencies.logError?.(error instanceof Error ? error.message : 'Could not acknowledge Telegram button');
      }
    },
    async runDueBatch(): Promise<number> {
      const counts = await Promise.all([dependencies.legacyFunnel.runDueBatch(), personalFunnel.runDueBatch()]);
      return counts.reduce((sum, count) => sum + count, 0);
    },
  };
}
