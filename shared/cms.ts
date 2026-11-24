export type TelegramParseMode = 'HTML' | 'plain';
export type TelegramMediaType = 'photo' | 'audio' | 'video';

export interface CmsUrlButton {
  readonly text: string;
  readonly url: string;
}

export interface CmsScenarioButton {
  readonly text: string;
  readonly url?: string;
  readonly nextStepKey?: string;
}

export type BroadcastTargetType = 'all_active' | 'funnel' | 'source' | 'language' | 'manual';

export interface BroadcastTargetFilter {
  readonly funnelKey?: string;
  readonly startPayload?: string;
  readonly languageCode?: string;
  readonly subscriberIds?: readonly string[];
}

export type BroadcastStatus = 'draft' | 'scheduled' | 'sending' | 'completed' | 'cancelled';
export type DeliveryStatus = 'pending' | 'processing' | 'sent' | 'failed' | 'ambiguous';
export type ScenarioStatus = 'draft' | 'active' | 'archived';
export type ScenarioStepTrigger = 'delay' | 'button';

export interface CmsMediaAsset {
  readonly id: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly sizeBytes: number;
  readonly previewUrl: string;
  readonly hasTelegramFileId: boolean;
  readonly createdAt: string;
}

export interface CmsBroadcastStats {
  readonly total: number;
  readonly pending: number;
  readonly processing: number;
  readonly sent: number;
  readonly failed: number;
  readonly ambiguous: number;
  readonly testSent: number;
}

export interface CmsBroadcastRecord {
  readonly id: string;
  readonly title: string;
  readonly messageText: string;
  readonly parseMode: TelegramParseMode;
  readonly mediaAssetId: string | null;
  readonly mediaPreviewUrl: string | null;
  readonly mediaUrl: string | null;
  readonly mediaType: TelegramMediaType | null;
  readonly buttons: readonly (readonly CmsUrlButton[])[];
  readonly targetType: BroadcastTargetType;
  readonly targetFilter: BroadcastTargetFilter;
  readonly status: BroadcastStatus;
  readonly scheduledAt: string | null;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly stats: CmsBroadcastStats;
}

export interface CmsBroadcastDeliveryItem {
  readonly id: string;
  readonly subscriberId: string;
  readonly telegramUserId: number;
  readonly username: string | null;
  readonly firstName: string;
  readonly lastName: string | null;
  readonly isTest: boolean;
  readonly status: DeliveryStatus;
  readonly attempts: number;
  readonly telegramMessageId: number | null;
  readonly lastError: string | null;
  readonly scheduledAt: string;
  readonly sentAt: string | null;
}

export interface CmsBroadcastInput {
  readonly title: string;
  readonly messageText: string;
  readonly parseMode?: TelegramParseMode;
  readonly mediaAssetId?: string | null;
  readonly mediaUrl?: string | null;
  readonly mediaType?: TelegramMediaType | null;
  readonly buttons?: readonly (readonly CmsUrlButton[])[];
  readonly targetType: BroadcastTargetType;
  readonly targetFilter?: BroadcastTargetFilter;
  readonly scheduledAt?: string | null;
}

export interface CmsScenarioStepRecord {
  readonly id: string;
  readonly stepOrder: number;
  readonly stepKey: string;
  readonly triggerType: ScenarioStepTrigger;
  readonly delayMinutes: number;
  readonly messageText: string;
  readonly parseMode: TelegramParseMode;
  readonly mediaAssetId: string | null;
  readonly mediaPreviewUrl: string | null;
  readonly mediaUrl: string | null;
  readonly mediaType: TelegramMediaType | null;
  readonly buttons: readonly (readonly CmsScenarioButton[])[];
}

export interface CmsScenarioStepInput {
  readonly stepKey: string;
  readonly triggerType: ScenarioStepTrigger;
  readonly delayMinutes: number;
  readonly messageText: string;
  readonly parseMode?: TelegramParseMode;
  readonly mediaAssetId?: string | null;
  readonly mediaUrl?: string | null;
  readonly mediaType?: TelegramMediaType | null;
  readonly buttons?: readonly (readonly CmsScenarioButton[])[];
}

export interface CmsScenarioRecord {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly startPayload: string;
  readonly deepLinkUrl: string;
  readonly status: ScenarioStatus;
  readonly isDefault: boolean;
  readonly restartOnStart: boolean;
  readonly enrolledSubscribers: number;
  readonly activeEnrollments: number;
  readonly completedEnrollments: number;
  readonly steps: readonly CmsScenarioStepRecord[];
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CmsScenarioInput {
  readonly title: string;
  readonly description?: string;
  readonly startPayload: string;
  readonly status?: ScenarioStatus;
  readonly isDefault?: boolean;
  readonly restartOnStart?: boolean;
  readonly steps: readonly CmsScenarioStepInput[];
}

export interface CmsSubscriberSummary {
  readonly id: string;
  readonly telegramUserId: number;
  readonly chatId: number;
  readonly username: string | null;
  readonly firstName: string;
  readonly lastName: string | null;
  readonly languageCode: string | null;
  readonly firstStartPayload: string | null;
  readonly latestStartPayload: string | null;
  readonly status: 'active' | 'blocked';
  readonly startedAt: string;
  readonly lastInteractionAt: string;
  readonly blockedAt: string | null;
  readonly funnels: readonly {
    readonly funnelKey: string;
    readonly funnelVersion: string;
    readonly status: 'active' | 'completed' | 'cancelled';
    readonly sentSteps: number;
    readonly totalSteps: number;
  }[];
  readonly broadcastsReceived: number;
}

export interface CmsSubscriberDetail extends CmsSubscriberSummary {
  readonly enrollments: readonly {
    readonly id: string;
    readonly funnelKey: string;
    readonly funnelVersion: string;
    readonly status: 'active' | 'completed' | 'cancelled';
    readonly conversationState: Record<string, unknown> | null;
    readonly startedAt: string;
    readonly completedAt: string | null;
    readonly deliveries: readonly {
      readonly id: string;
      readonly contentKey: string;
      readonly stepOrder: number;
      readonly status: DeliveryStatus;
      readonly attempts: number;
      readonly lastError: string | null;
      readonly scheduledAt: string;
      readonly sentAt: string | null;
    }[];
  }[];
  readonly broadcastHistory: readonly {
    readonly id: string;
    readonly broadcastId: string;
    readonly broadcastTitle: string;
    readonly isTest: boolean;
    readonly status: DeliveryStatus;
    readonly lastError: string | null;
    readonly scheduledAt: string;
    readonly sentAt: string | null;
  }[];
}

export interface CmsCourseSummary {
  readonly id: string;
  readonly slug: string;
  readonly title: string;
  readonly status: 'draft' | 'published' | 'archived';
  readonly activeClientsCount: number;
  readonly totalLessons: number;
}

export interface CmsCourseClientWithProgress {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly grantedAt: string;
  readonly completedLessons: number;
  readonly totalLessons: number;
}

export interface CmsTeamUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly role: 'student' | 'admin';
  readonly activeCourseSlugs: readonly string[];
  readonly createdAt: string;
}

export interface CmsOverview {
  readonly botUsername: string;
  readonly subscribers: {
    readonly total: number;
    readonly active: number;
    readonly blocked: number;
    readonly joinedLast7d: number;
    readonly joinedLast30d: number;
  };
  readonly broadcasts: {
    readonly total: number;
    readonly completed: number;
    readonly activeOrScheduled: number;
    readonly messagesSent: number;
  };
  readonly scenarios: {
    readonly total: number;
    readonly active: number;
  };
  readonly courses: {
    readonly totalCourses: number;
    readonly totalUsers: number;
    readonly totalAdmins: number;
    readonly activeCourseAccesses: number;
  };
  readonly filterOptions: {
    readonly funnels: readonly string[];
    readonly sources: readonly string[];
    readonly languages: readonly string[];
  };
}
