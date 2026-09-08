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

export type TelegramInlineButton = { readonly text: string } & (
  | { readonly url: string; readonly callback_data?: never }
  | { readonly callback_data: string; readonly url?: never }
);

export interface PracticeConversation {
  readonly step: 'intro' | 'state' | 'experience' | 'recommendation' | 'practice' | 'interest';
  readonly state?: number;
  readonly experience?: number;
  readonly interest?: 'practice' | 'travel';
}

export interface TelegramCallbackInput {
  readonly updateId: number;
  readonly callbackId: string;
  readonly telegramUserId: number;
  readonly chatId: number;
  readonly data: string;
}

export type TelegramDeliveryContent =
  | {
      readonly type: 'video';
      readonly video: string;
      readonly caption?: string;
      readonly buttons?: readonly (readonly TelegramInlineButton[])[];
    }
  | {
      readonly type: 'audio';
      readonly audio: string;
      readonly caption?: string;
      readonly title?: string;
      readonly buttons?: readonly (readonly TelegramInlineButton[])[];
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
  readonly initialContentKeys?: readonly string[];
  readonly initialConversation?: PracticeConversation;
  readonly restartOnStart?: boolean;
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
  acceptCallback?(input: TelegramCallbackInput): Promise<void>;
  runDueBatch(): Promise<number>;
}

export interface TelegramClient {
  sendVideo?(
    chatId: number,
    video: string,
    caption?: string,
    buttons?: readonly (readonly TelegramInlineButton[])[],
  ): Promise<number>;
  answerCallbackQuery?(callbackId: string): Promise<void>;
  sendAudio(
    chatId: number,
    audio: string,
    caption?: string,
    title?: string,
    buttons?: readonly (readonly TelegramInlineButton[])[],
  ): Promise<number>;
  sendMessage(
    chatId: number,
    text: string,
    buttons?: readonly (readonly TelegramInlineButton[])[],
  ): Promise<number>;
  setWebhook(url: string, secretToken: string): Promise<void>;
}
