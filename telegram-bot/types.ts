export interface TelegramUserProfile {
  readonly telegramUserId: number;
  readonly chatId: number;
  readonly username?: string;
  readonly firstName: string;
  readonly lastName?: string;
  readonly languageCode?: string;
}

export interface TelegramSubscriberRecord {
  readonly id: string;
}

export type DeliveryClaimResult = 'claimed' | 'already_sent' | 'in_progress';

export interface TelegramSubscriberRepository {
  upsertFromStart(profile: TelegramUserProfile, startPayload?: string): Promise<TelegramSubscriberRecord>;
  claimDelivery(subscriberId: string, contentKey: string): Promise<DeliveryClaimResult>;
  markDeliverySent(subscriberId: string, contentKey: string, telegramMessageId: number): Promise<void>;
  markDeliveryFailed(subscriberId: string, contentKey: string, errorMessage: string): Promise<void>;
  markBlocked(subscriberId: string): Promise<void>;
}

export interface TelegramClient {
  sendAudio(chatId: number, audio: string, caption?: string): Promise<number>;
  sendMessage(chatId: number, text: string): Promise<number>;
  setWebhook(url: string, secretToken: string): Promise<void>;
}
