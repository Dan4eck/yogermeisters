export interface TelegramUserProfile {
  readonly telegramUserId: number;
  readonly chatId: number;
  readonly username?: string;
  readonly firstName: string;
  readonly lastName?: string;
  readonly languageCode?: string;
}

export interface TelegramStartInput {
  readonly updateId: number;
  readonly profile: TelegramUserProfile;
  readonly startPayload?: string;
}

export interface TelegramInlineButton {
  readonly text: string;
  readonly url: string;
}

export type TelegramDeliveryContent =
  | {
      readonly type: 'audio';
      readonly audio: string;
      readonly caption?: string;
      readonly title?: string;
    }
  | {
      readonly type: 'text';
      readonly text: string;
      readonly buttons?: readonly (readonly TelegramInlineButton[])[];
    };

export interface TelegramFunnelStep {
  readonly contentKey: string;
  readonly delayMs: number;
  readonly content: TelegramDeliveryContent;
}

export interface TelegramFunnelPlan {
  readonly key: string;
  readonly version: string;
  readonly steps: readonly TelegramFunnelStep[];
}

export interface ScheduledTelegramDelivery {
  readonly id: string;
  readonly subscriberId: string;
  readonly chatId: number;
  readonly contentKey: string;
  readonly attempts: number;
}

export type DeliveryCompletion =
  | { readonly status: 'sent'; readonly telegramMessageId: number }
  | { readonly status: 'retry'; readonly errorMessage: string; readonly scheduledAt: Date }
  | { readonly status: 'failed'; readonly errorMessage: string; readonly blockSubscriber?: boolean }
  | { readonly status: 'ambiguous'; readonly errorMessage: string };

export interface TelegramFunnelStore {
  enrollFromStart(input: TelegramStartInput, plan: TelegramFunnelPlan): Promise<'enrolled' | 'duplicate_update'>;
  claimDueDeliveries(
    plan: TelegramFunnelPlan,
    limit: number,
  ): Promise<readonly ScheduledTelegramDelivery[]>;
  completeDelivery(
    deliveryId: string,
    subscriberId: string,
    completion: DeliveryCompletion,
  ): Promise<void>;
}

export interface TelegramFunnel {
  acceptStart(input: TelegramStartInput): Promise<void>;
  runDueBatch(): Promise<number>;
}

export interface TelegramClient {
  sendAudio(chatId: number, audio: string, caption?: string, title?: string): Promise<number>;
  sendMessage(
    chatId: number,
    text: string,
    buttons?: readonly (readonly TelegramInlineButton[])[],
  ): Promise<number>;
  setWebhook(url: string, secretToken: string): Promise<void>;
}
