import { and, asc, desc, eq, inArray, sql } from 'drizzle-orm';

import type {
  BroadcastStatus,
  BroadcastTargetFilter,
  BroadcastTargetType,
  CmsBroadcastDeliveryItem,
  CmsBroadcastInput,
  CmsBroadcastRecord,
  CmsBroadcastStats,
  CmsCourseClientWithProgress,
  CmsCourseSummary,
  CmsMediaAsset,
  CmsOverview,
  CmsScenarioInput,
  CmsScenarioRecord,
  CmsScenarioStepRecord,
  CmsSubscriberDetail,
  CmsSubscriberSummary,
  CmsTeamUser,
} from '@shared/cms';

import type { ParsedMediaUpload } from './cms-validation';
import type { Database } from './db/client';
import {
  courseAccess,
  courses,
  lessonProgress,
  lessons,
  telegramBroadcastDeliveries,
  telegramBroadcasts,
  telegramDeliveries,
  telegramFunnelEnrollments,
  telegramMediaAssets,
  telegramScenarios,
  telegramScenarioSteps,
  telegramSubscribers,
  users,
} from './db/schema';

const DEFAULT_BOT_USERNAME = 'yogermeisters_bot';

export interface SubscriberFilters {
  readonly search?: string;
  readonly status?: 'active' | 'blocked';
  readonly funnelKey?: string;
  readonly source?: string;
  readonly language?: string;
}

export interface CmsRepository {
  getOverview(): Promise<CmsOverview>;
  listSubscribers(filters?: SubscriberFilters): Promise<readonly CmsSubscriberSummary[]>;
  getSubscriberDetail(subscriberId: string): Promise<CmsSubscriberDetail | null>;
  enrollSubscriberInScenario(
    subscriberId: string,
    scenarioId: string,
  ): Promise<'enrolled' | 'subscriber_not_found' | 'subscriber_blocked' | 'scenario_not_found' | 'scenario_inactive'>;
  createMediaAsset(upload: ParsedMediaUpload): Promise<CmsMediaAsset>;
  getMediaAssetBinary(id: string): Promise<{ readonly mimeType: string; readonly filename: string; readonly buffer: Buffer } | null>;
  listBroadcasts(): Promise<readonly CmsBroadcastRecord[]>;
  createBroadcast(input: CmsBroadcastInput, createdByUserId?: string): Promise<CmsBroadcastRecord>;
  updateBroadcast(id: string, input: CmsBroadcastInput): Promise<CmsBroadcastRecord | null | 'not_editable'>;
  deleteOrCancelBroadcast(id: string): Promise<'deleted' | 'cancelled' | 'not_found'>;
  enqueueTestBroadcast(id: string, subscriberIds: readonly string[]): Promise<{ readonly queued: number } | 'not_found'>;
  launchBroadcast(
    id: string,
    scheduledAt: string | null,
  ): Promise<{ readonly queued: number; readonly status: BroadcastStatus } | 'not_found' | 'already_launched' | 'no_recipients'>;
  listBroadcastDeliveries(id: string): Promise<readonly CmsBroadcastDeliveryItem[] | null>;
  listScenarios(): Promise<readonly CmsScenarioRecord[]>;
  createScenario(input: CmsScenarioInput): Promise<CmsScenarioRecord | 'duplicate_payload'>;
  updateScenario(id: string, input: CmsScenarioInput): Promise<CmsScenarioRecord | null | 'duplicate_payload'>;
  deleteScenario(id: string): Promise<'deleted' | 'not_found' | 'active_cannot_delete'>;
  listAdminCourses(): Promise<readonly CmsCourseSummary[]>;
  listCourseClientsWithProgress(courseSlug: string): Promise<readonly CmsCourseClientWithProgress[] | null>;
  listTeamUsers(): Promise<readonly CmsTeamUser[]>;
  updateUserRole(userId: string, role: 'student' | 'admin'): Promise<'updated' | 'not_found'>;
}

export class DrizzleCmsRepository implements CmsRepository {
  constructor(
    private readonly db: Database,
    private readonly botUsername: string = DEFAULT_BOT_USERNAME,
  ) {}

  async getOverview(): Promise<CmsOverview> {
    const now = Date.now();
    const sevenDaysAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);

    const [
      allSubscribers,
      allBroadcasts,
      sentBroadcastDeliveries,
      allScenarios,
      allEnrollments,
      allCourses,
      allUsers,
      activeAccesses,
    ] = await Promise.all([
      this.db
        .select({
          status: telegramSubscribers.status,
          startedAt: telegramSubscribers.startedAt,
          firstStartPayload: telegramSubscribers.firstStartPayload,
          languageCode: telegramSubscribers.languageCode,
        })
        .from(telegramSubscribers),
      this.db.select({ status: telegramBroadcasts.status }).from(telegramBroadcasts),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(telegramBroadcastDeliveries)
        .where(and(eq(telegramBroadcastDeliveries.status, 'sent'), eq(telegramBroadcastDeliveries.isTest, false))),
      this.db.select({ status: telegramScenarios.status, slug: telegramScenarios.slug }).from(telegramScenarios),
      this.db.select({ funnelKey: telegramFunnelEnrollments.funnelKey }).from(telegramFunnelEnrollments),
      this.db.select({ id: courses.id }).from(courses),
      this.db.select({ role: users.role }).from(users),
      this.db
        .select({ count: sql<number>`count(*)::int` })
        .from(courseAccess)
        .where(eq(courseAccess.status, 'active')),
    ]);

    const funnelSet = new Set<string>();
    for (const enrollment of allEnrollments) {
      funnelSet.add(enrollment.funnelKey);
    }
    for (const scenario of allScenarios) {
      funnelSet.add(`scenario:${scenario.slug}`);
    }

    const sourceSet = new Set<string>();
    const languageSet = new Set<string>();
    let activeSubscribers = 0;
    let blockedSubscribers = 0;
    let joinedLast7d = 0;
    let joinedLast30d = 0;

    for (const sub of allSubscribers) {
      if (sub.status === 'active') activeSubscribers += 1;
      else blockedSubscribers += 1;
      if (sub.startedAt >= sevenDaysAgo) joinedLast7d += 1;
      if (sub.startedAt >= thirtyDaysAgo) joinedLast30d += 1;
      if (sub.firstStartPayload) sourceSet.add(sub.firstStartPayload);
      if (sub.languageCode) languageSet.add(sub.languageCode);
    }

    return {
      botUsername: this.botUsername,
      subscribers: {
        total: allSubscribers.length,
        active: activeSubscribers,
        blocked: blockedSubscribers,
        joinedLast7d,
        joinedLast30d,
      },
      broadcasts: {
        total: allBroadcasts.length,
        completed: allBroadcasts.filter((b) => b.status === 'completed').length,
        activeOrScheduled: allBroadcasts.filter((b) => b.status === 'scheduled' || b.status === 'sending').length,
        messagesSent: sentBroadcastDeliveries[0]?.count ?? 0,
      },
      scenarios: {
        total: allScenarios.length,
        active: allScenarios.filter((s) => s.status === 'active').length,
      },
      courses: {
        totalCourses: allCourses.length,
        totalUsers: allUsers.length,
        totalAdmins: allUsers.filter((u) => u.role === 'admin').length,
        activeCourseAccesses: activeAccesses[0]?.count ?? 0,
      },
      filterOptions: {
        funnels: Array.from(funnelSet).sort(),
        sources: Array.from(sourceSet).sort(),
        languages: Array.from(languageSet).sort(),
      },
    };
  }

  async listSubscribers(filters: SubscriberFilters = {}): Promise<readonly CmsSubscriberSummary[]> {
    const [subscriberRows, enrollmentRows, deliveryRows, broadcastDeliveryRows] = await Promise.all([
      this.db.select().from(telegramSubscribers).orderBy(desc(telegramSubscribers.lastInteractionAt)),
      this.db
        .select({
          id: telegramFunnelEnrollments.id,
          subscriberId: telegramFunnelEnrollments.subscriberId,
          funnelKey: telegramFunnelEnrollments.funnelKey,
          funnelVersion: telegramFunnelEnrollments.funnelVersion,
          status: telegramFunnelEnrollments.status,
          startedAt: telegramFunnelEnrollments.startedAt,
        })
        .from(telegramFunnelEnrollments)
        .orderBy(desc(telegramFunnelEnrollments.startedAt)),
      this.db
        .select({
          enrollmentId: telegramDeliveries.enrollmentId,
          status: telegramDeliveries.status,
        })
        .from(telegramDeliveries),
      this.db
        .select({
          subscriberId: telegramBroadcastDeliveries.subscriberId,
        })
        .from(telegramBroadcastDeliveries)
        .where(and(eq(telegramBroadcastDeliveries.status, 'sent'), eq(telegramBroadcastDeliveries.isTest, false))),
    ]);

    const deliveryCountsByEnrollment = new Map<string, { sent: number; total: number }>();
    for (const delivery of deliveryRows) {
      const current = deliveryCountsByEnrollment.get(delivery.enrollmentId) ?? { sent: 0, total: 0 };
      current.total += 1;
      if (delivery.status === 'sent') {
        current.sent += 1;
      }
      deliveryCountsByEnrollment.set(delivery.enrollmentId, current);
    }

    const funnelsBySubscriber = new Map<
      string,
      Array<{
        readonly funnelKey: string;
        readonly funnelVersion: string;
        readonly status: 'active' | 'completed' | 'cancelled';
        readonly sentSteps: number;
        readonly totalSteps: number;
      }>
    >();

    for (const enrollment of enrollmentRows) {
      const list = funnelsBySubscriber.get(enrollment.subscriberId) ?? [];
      if (list.some((item) => item.funnelKey === enrollment.funnelKey)) {
        continue;
      }
      const counts = deliveryCountsByEnrollment.get(enrollment.id) ?? { sent: 0, total: 0 };
      list.push({
        funnelKey: enrollment.funnelKey,
        funnelVersion: enrollment.funnelVersion,
        status: enrollment.status,
        sentSteps: counts.sent,
        totalSteps: counts.total,
      });
      funnelsBySubscriber.set(enrollment.subscriberId, list);
    }

    const broadcastsCountBySubscriber = new Map<string, number>();
    for (const row of broadcastDeliveryRows) {
      broadcastsCountBySubscriber.set(row.subscriberId, (broadcastsCountBySubscriber.get(row.subscriberId) ?? 0) + 1);
    }

    const searchNeedle = filters.search?.trim().toLowerCase();

    return subscriberRows
      .map((sub): CmsSubscriberSummary => ({
        id: sub.id,
        telegramUserId: sub.telegramUserId,
        chatId: sub.chatId,
        username: sub.username,
        firstName: sub.firstName,
        lastName: sub.lastName,
        languageCode: sub.languageCode,
        firstStartPayload: sub.firstStartPayload,
        latestStartPayload: sub.latestStartPayload,
        status: sub.status,
        startedAt: sub.startedAt.toISOString(),
        lastInteractionAt: sub.lastInteractionAt.toISOString(),
        blockedAt: sub.blockedAt ? sub.blockedAt.toISOString() : null,
        funnels: funnelsBySubscriber.get(sub.id) ?? [],
        broadcastsReceived: broadcastsCountBySubscriber.get(sub.id) ?? 0,
      }))
      .filter((sub) => {
        if (filters.status && sub.status !== filters.status) return false;
        if (filters.language && sub.languageCode !== filters.language) return false;
        if (filters.source) {
          if (filters.source === '__none__') {
            if (sub.firstStartPayload !== null) return false;
          } else if (sub.firstStartPayload !== filters.source && sub.latestStartPayload !== filters.source) {
            return false;
          }
        }
        if (filters.funnelKey && !sub.funnels.some((f) => f.funnelKey === filters.funnelKey)) {
          return false;
        }
        if (searchNeedle) {
          const haystack = [
            sub.firstName,
            sub.lastName ?? '',
            sub.username ?? '',
            String(sub.telegramUserId),
            sub.firstStartPayload ?? '',
          ]
            .join(' ')
            .toLowerCase();
          if (!haystack.includes(searchNeedle)) return false;
        }
        return true;
      });
  }

  async getSubscriberDetail(subscriberId: string): Promise<CmsSubscriberDetail | null> {
    const [subscriber] = await this.db
      .select()
      .from(telegramSubscribers)
      .where(eq(telegramSubscribers.id, subscriberId))
      .limit(1);

    if (!subscriber) {
      return null;
    }

    const [enrollmentRows, broadcastRows] = await Promise.all([
      this.db
        .select()
        .from(telegramFunnelEnrollments)
        .where(eq(telegramFunnelEnrollments.subscriberId, subscriber.id))
        .orderBy(desc(telegramFunnelEnrollments.startedAt)),
      this.db
        .select({
          id: telegramBroadcastDeliveries.id,
          broadcastId: telegramBroadcastDeliveries.broadcastId,
          broadcastTitle: telegramBroadcasts.title,
          isTest: telegramBroadcastDeliveries.isTest,
          status: telegramBroadcastDeliveries.status,
          lastError: telegramBroadcastDeliveries.lastError,
          scheduledAt: telegramBroadcastDeliveries.scheduledAt,
          sentAt: telegramBroadcastDeliveries.sentAt,
        })
        .from(telegramBroadcastDeliveries)
        .innerJoin(telegramBroadcasts, eq(telegramBroadcasts.id, telegramBroadcastDeliveries.broadcastId))
        .where(eq(telegramBroadcastDeliveries.subscriberId, subscriber.id))
        .orderBy(desc(telegramBroadcastDeliveries.createdAt)),
    ]);

    const enrollmentIds = enrollmentRows.map((row) => row.id);
    const deliveryRows = enrollmentIds.length > 0
      ? await this.db
          .select()
          .from(telegramDeliveries)
          .where(inArray(telegramDeliveries.enrollmentId, enrollmentIds))
          .orderBy(asc(telegramDeliveries.stepOrder))
      : [];

    const deliveriesByEnrollment = new Map<string, typeof deliveryRows>();
    for (const delivery of deliveryRows) {
      const list = deliveriesByEnrollment.get(delivery.enrollmentId) ?? [];
      list.push(delivery);
      deliveriesByEnrollment.set(delivery.enrollmentId, list);
    }

    const enrollments = enrollmentRows.map((enrollment) => {
      const steps = deliveriesByEnrollment.get(enrollment.id) ?? [];
      return {
        id: enrollment.id,
        funnelKey: enrollment.funnelKey,
        funnelVersion: enrollment.funnelVersion,
        status: enrollment.status,
        conversationState: enrollment.conversationState
          ? ({ ...enrollment.conversationState } as Record<string, unknown>)
          : null,
        startedAt: enrollment.startedAt.toISOString(),
        completedAt: enrollment.completedAt ? enrollment.completedAt.toISOString() : null,
        deliveries: steps.map((step) => ({
          id: step.id,
          contentKey: step.contentKey,
          stepOrder: step.stepOrder,
          status: step.status,
          attempts: step.attempts,
          lastError: step.lastError,
          scheduledAt: step.scheduledAt.toISOString(),
          sentAt: step.sentAt ? step.sentAt.toISOString() : null,
        })),
      };
    });

    const uniqueFunnels: Array<{
      readonly funnelKey: string;
      readonly funnelVersion: string;
      readonly status: 'active' | 'completed' | 'cancelled';
      readonly sentSteps: number;
      readonly totalSteps: number;
    }> = [];
    for (const enrollment of enrollments) {
      if (uniqueFunnels.some((item) => item.funnelKey === enrollment.funnelKey)) continue;
      uniqueFunnels.push({
        funnelKey: enrollment.funnelKey,
        funnelVersion: enrollment.funnelVersion,
        status: enrollment.status,
        sentSteps: enrollment.deliveries.filter((d) => d.status === 'sent').length,
        totalSteps: enrollment.deliveries.length,
      });
    }

    return {
      id: subscriber.id,
      telegramUserId: subscriber.telegramUserId,
      chatId: subscriber.chatId,
      username: subscriber.username,
      firstName: subscriber.firstName,
      lastName: subscriber.lastName,
      languageCode: subscriber.languageCode,
      firstStartPayload: subscriber.firstStartPayload,
      latestStartPayload: subscriber.latestStartPayload,
      status: subscriber.status,
      startedAt: subscriber.startedAt.toISOString(),
      lastInteractionAt: subscriber.lastInteractionAt.toISOString(),
      blockedAt: subscriber.blockedAt ? subscriber.blockedAt.toISOString() : null,
      funnels: uniqueFunnels,
      broadcastsReceived: broadcastRows.filter((b) => !b.isTest && b.status === 'sent').length,
      enrollments,
      broadcastHistory: broadcastRows.map((row) => ({
        id: row.id,
        broadcastId: row.broadcastId,
        broadcastTitle: row.broadcastTitle,
        isTest: row.isTest,
        status: row.status,
        lastError: row.lastError,
        scheduledAt: row.scheduledAt.toISOString(),
        sentAt: row.sentAt ? row.sentAt.toISOString() : null,
      })),
    };
  }

  async enrollSubscriberInScenario(
    subscriberId: string,
    scenarioId: string,
  ): Promise<'enrolled' | 'subscriber_not_found' | 'subscriber_blocked' | 'scenario_not_found' | 'scenario_inactive'> {
    return this.db.transaction(async (tx) => {
      const [subscriber] = await tx
        .select({ id: telegramSubscribers.id, status: telegramSubscribers.status })
        .from(telegramSubscribers)
        .where(eq(telegramSubscribers.id, subscriberId))
        .limit(1);

      if (!subscriber) return 'subscriber_not_found';
      if (subscriber.status !== 'active') return 'subscriber_blocked';

      const [scenario] = await tx
        .select()
        .from(telegramScenarios)
        .where(eq(telegramScenarios.id, scenarioId))
        .limit(1);

      if (!scenario) return 'scenario_not_found';
      if (scenario.status !== 'active') return 'scenario_inactive';

      const steps = await tx
        .select()
        .from(telegramScenarioSteps)
        .where(eq(telegramScenarioSteps.scenarioId, scenario.id))
        .orderBy(asc(telegramScenarioSteps.stepOrder));

      const funnelKey = `scenario:${scenario.slug}`;
      const now = new Date();

      await tx
        .update(telegramFunnelEnrollments)
        .set({ status: 'cancelled', updatedAt: now })
        .where(
          and(
            eq(telegramFunnelEnrollments.subscriberId, subscriber.id),
            eq(telegramFunnelEnrollments.funnelKey, funnelKey),
            eq(telegramFunnelEnrollments.funnelVersion, 'cms'),
            eq(telegramFunnelEnrollments.status, 'active'),
          ),
        );

      const [enrollment] = await tx
        .insert(telegramFunnelEnrollments)
        .values({
          subscriberId: subscriber.id,
          funnelKey,
          funnelVersion: 'cms',
          startedAt: now,
        })
        .returning({ id: telegramFunnelEnrollments.id, startedAt: telegramFunnelEnrollments.startedAt });

      if (enrollment) {
        const initialSteps = collectInitialAutoSteps(steps);
        if (initialSteps.length > 0) {
          await tx.insert(telegramDeliveries).values(
            initialSteps.map((step, idx) => ({
              enrollmentId: enrollment.id,
              contentKey: step.stepKey,
              stepOrder: idx,
              scheduledAt: new Date(enrollment.startedAt.getTime() + step.delayMinutes * 60_000),
            })),
          );
        }
      }

      return 'enrolled';
    });
  }

  async createMediaAsset(upload: ParsedMediaUpload): Promise<CmsMediaAsset> {
    const [asset] = await this.db
      .insert(telegramMediaAssets)
      .values({
        filename: upload.filename,
        mimeType: upload.mimeType,
        sizeBytes: upload.sizeBytes,
        dataBase64: upload.dataBase64,
      })
      .returning();

    if (!asset) {
      throw new Error('Could not save media asset');
    }

    return {
      id: asset.id,
      filename: asset.filename,
      mimeType: asset.mimeType,
      sizeBytes: asset.sizeBytes,
      previewUrl: `/api/admin/bot/media/${asset.id}`,
      hasTelegramFileId: Boolean(asset.telegramFileId),
      createdAt: asset.createdAt.toISOString(),
    };
  }

  async getMediaAssetBinary(
    id: string,
  ): Promise<{ readonly mimeType: string; readonly filename: string; readonly buffer: Buffer } | null> {
    const [asset] = await this.db
      .select({
        mimeType: telegramMediaAssets.mimeType,
        filename: telegramMediaAssets.filename,
        dataBase64: telegramMediaAssets.dataBase64,
      })
      .from(telegramMediaAssets)
      .where(eq(telegramMediaAssets.id, id))
      .limit(1);

    if (!asset) {
      return null;
    }

    return {
      mimeType: asset.mimeType,
      filename: asset.filename,
      buffer: Buffer.from(asset.dataBase64, 'base64'),
    };
  }

  async listBroadcasts(): Promise<readonly CmsBroadcastRecord[]> {
    const [rows, deliveryRows] = await Promise.all([
      this.db.select().from(telegramBroadcasts).orderBy(desc(telegramBroadcasts.createdAt)),
      this.db
        .select({
          broadcastId: telegramBroadcastDeliveries.broadcastId,
          isTest: telegramBroadcastDeliveries.isTest,
          status: telegramBroadcastDeliveries.status,
        })
        .from(telegramBroadcastDeliveries),
    ]);

    const statsByBroadcast = new Map<string, {
      total: number;
      pending: number;
      processing: number;
      sent: number;
      failed: number;
      ambiguous: number;
      testSent: number;
    }>();

    for (const row of deliveryRows) {
      const current = statsByBroadcast.get(row.broadcastId) ?? {
        total: 0,
        pending: 0,
        processing: 0,
        sent: 0,
        failed: 0,
        ambiguous: 0,
        testSent: 0,
      };
      if (row.isTest) {
        if (row.status === 'sent') current.testSent += 1;
      } else {
        current.total += 1;
        current[row.status] += 1;
      }
      statsByBroadcast.set(row.broadcastId, current);
    }

    return rows.map((row) => mapBroadcastRow(row, statsByBroadcast.get(row.id)));
  }

  async createBroadcast(input: CmsBroadcastInput, createdByUserId?: string): Promise<CmsBroadcastRecord> {
    const [row] = await this.db
      .insert(telegramBroadcasts)
      .values({
        title: input.title,
        messageText: input.messageText,
        parseMode: input.parseMode ?? 'HTML',
        mediaAssetId: input.mediaAssetId ?? null,
        mediaUrl: input.mediaUrl ?? null,
        mediaType: input.mediaType ?? null,
        buttons: input.buttons ?? [],
        targetType: input.targetType,
        targetFilter: input.targetFilter ?? {},
        status: 'draft',
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        createdByUserId: createdByUserId ?? null,
      })
      .returning();

    if (!row) {
      throw new Error('Could not create broadcast');
    }

    return mapBroadcastRow(row);
  }

  async updateBroadcast(id: string, input: CmsBroadcastInput): Promise<CmsBroadcastRecord | null | 'not_editable'> {
    const [existing] = await this.db
      .select()
      .from(telegramBroadcasts)
      .where(eq(telegramBroadcasts.id, id))
      .limit(1);

    if (!existing) return null;
    if (existing.status !== 'draft' && existing.status !== 'scheduled') {
      return 'not_editable';
    }

    const [updated] = await this.db
      .update(telegramBroadcasts)
      .set({
        title: input.title,
        messageText: input.messageText,
        parseMode: input.parseMode ?? 'HTML',
        mediaAssetId: input.mediaAssetId ?? null,
        mediaUrl: input.mediaUrl ?? null,
        mediaType: input.mediaType ?? null,
        buttons: input.buttons ?? [],
        targetType: input.targetType,
        targetFilter: input.targetFilter ?? {},
        scheduledAt: input.scheduledAt ? new Date(input.scheduledAt) : null,
        updatedAt: new Date(),
      })
      .where(eq(telegramBroadcasts.id, id))
      .returning();

    if (!updated) return null;
    return mapBroadcastRow(updated);
  }

  async deleteOrCancelBroadcast(id: string): Promise<'deleted' | 'cancelled' | 'not_found'> {
    return this.db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ id: telegramBroadcasts.id, status: telegramBroadcasts.status })
        .from(telegramBroadcasts)
        .where(eq(telegramBroadcasts.id, id))
        .limit(1);

      if (!existing) return 'not_found';

      if (existing.status === 'draft' || existing.status === 'cancelled') {
        await tx.delete(telegramBroadcasts).where(eq(telegramBroadcasts.id, id));
        return 'deleted';
      }

      const now = new Date();
      await tx
        .update(telegramBroadcasts)
        .set({ status: 'cancelled', updatedAt: now })
        .where(eq(telegramBroadcasts.id, id));
      await tx
        .update(telegramBroadcastDeliveries)
        .set({ status: 'failed', lastError: 'Broadcast cancelled by admin', updatedAt: now })
        .where(
          and(
            eq(telegramBroadcastDeliveries.broadcastId, id),
            eq(telegramBroadcastDeliveries.status, 'pending'),
          ),
        );
      return 'cancelled';
    });
  }

  async enqueueTestBroadcast(
    id: string,
    subscriberIds: readonly string[],
  ): Promise<{ readonly queued: number } | 'not_found'> {
    return this.db.transaction(async (tx) => {
      const [broadcast] = await tx
        .select({ id: telegramBroadcasts.id })
        .from(telegramBroadcasts)
        .where(eq(telegramBroadcasts.id, id))
        .limit(1);

      if (!broadcast) return 'not_found';

      const activeTargets = await tx
        .select({ id: telegramSubscribers.id })
        .from(telegramSubscribers)
        .where(and(inArray(telegramSubscribers.id, [...subscriberIds]), eq(telegramSubscribers.status, 'active')));

      if (activeTargets.length === 0) {
        return { queued: 0 };
      }

      const now = new Date();
      await tx.insert(telegramBroadcastDeliveries).values(
        activeTargets.map((target) => ({
          broadcastId: broadcast.id,
          subscriberId: target.id,
          isTest: true,
          status: 'pending' as const,
          scheduledAt: now,
        })),
      );

      return { queued: activeTargets.length };
    });
  }

  async launchBroadcast(
    id: string,
    scheduledAt: string | null,
  ): Promise<
    { readonly queued: number; readonly status: BroadcastStatus } | 'not_found' | 'already_launched' | 'no_recipients'
  > {
    return this.db.transaction(async (tx) => {
      const [broadcast] = await tx
        .select()
        .from(telegramBroadcasts)
        .where(eq(telegramBroadcasts.id, id))
        .limit(1)
        .for('update');

      if (!broadcast) return 'not_found';
      if (broadcast.status !== 'draft') return 'already_launched';

      const recipientIds = await this.resolveBroadcastRecipients(tx, broadcast.targetType, broadcast.targetFilter);
      if (recipientIds.length === 0) {
        return 'no_recipients';
      }

      const now = new Date();
      const targetTime = scheduledAt ? new Date(scheduledAt) : now;
      const isFuture = targetTime.getTime() > now.getTime() + 15_000;
      const nextStatus: BroadcastStatus = isFuture ? 'scheduled' : 'sending';

      await tx
        .insert(telegramBroadcastDeliveries)
        .values(
          recipientIds.map((subscriberId) => ({
            broadcastId: broadcast.id,
            subscriberId,
            isTest: false,
            status: 'pending' as const,
            scheduledAt: targetTime,
          })),
        )
        .onConflictDoNothing();

      await tx
        .update(telegramBroadcasts)
        .set({
          status: nextStatus,
          scheduledAt: targetTime,
          startedAt: isFuture ? null : now,
          updatedAt: now,
        })
        .where(eq(telegramBroadcasts.id, broadcast.id));

      return { queued: recipientIds.length, status: nextStatus };
    });
  }

  async listBroadcastDeliveries(id: string): Promise<readonly CmsBroadcastDeliveryItem[] | null> {
    const [exists] = await this.db
      .select({ id: telegramBroadcasts.id })
      .from(telegramBroadcasts)
      .where(eq(telegramBroadcasts.id, id))
      .limit(1);

    if (!exists) return null;

    const rows = await this.db
      .select({
        id: telegramBroadcastDeliveries.id,
        subscriberId: telegramBroadcastDeliveries.subscriberId,
        telegramUserId: telegramSubscribers.telegramUserId,
        username: telegramSubscribers.username,
        firstName: telegramSubscribers.firstName,
        lastName: telegramSubscribers.lastName,
        isTest: telegramBroadcastDeliveries.isTest,
        status: telegramBroadcastDeliveries.status,
        attempts: telegramBroadcastDeliveries.attempts,
        telegramMessageId: telegramBroadcastDeliveries.telegramMessageId,
        lastError: telegramBroadcastDeliveries.lastError,
        scheduledAt: telegramBroadcastDeliveries.scheduledAt,
        sentAt: telegramBroadcastDeliveries.sentAt,
      })
      .from(telegramBroadcastDeliveries)
      .innerJoin(telegramSubscribers, eq(telegramSubscribers.id, telegramBroadcastDeliveries.subscriberId))
      .where(eq(telegramBroadcastDeliveries.broadcastId, id))
      .orderBy(desc(telegramBroadcastDeliveries.createdAt));

    return rows.map((row) => ({
      id: row.id,
      subscriberId: row.subscriberId,
      telegramUserId: row.telegramUserId,
      username: row.username,
      firstName: row.firstName,
      lastName: row.lastName,
      isTest: row.isTest,
      status: row.status,
      attempts: row.attempts,
      telegramMessageId: row.telegramMessageId,
      lastError: row.lastError,
      scheduledAt: row.scheduledAt.toISOString(),
      sentAt: row.sentAt ? row.sentAt.toISOString() : null,
    }));
  }

  async listScenarios(): Promise<readonly CmsScenarioRecord[]> {
    const [scenarioRows, stepRows, enrollmentRows] = await Promise.all([
      this.db.select().from(telegramScenarios).orderBy(desc(telegramScenarios.isDefault), desc(telegramScenarios.createdAt)),
      this.db.select().from(telegramScenarioSteps).orderBy(asc(telegramScenarioSteps.stepOrder)),
      this.db
        .select({
          funnelKey: telegramFunnelEnrollments.funnelKey,
          subscriberId: telegramFunnelEnrollments.subscriberId,
          status: telegramFunnelEnrollments.status,
        })
        .from(telegramFunnelEnrollments),
    ]);

    const enrollmentStats = new Map<string, { subscribers: Set<string>; active: number; completed: number }>();
    for (const row of enrollmentRows) {
      const entry = enrollmentStats.get(row.funnelKey) ?? { subscribers: new Set<string>(), active: 0, completed: 0 };
      entry.subscribers.add(row.subscriberId);
      if (row.status === 'active') entry.active += 1;
      if (row.status === 'completed') entry.completed += 1;
      enrollmentStats.set(row.funnelKey, entry);
    }

    const stepsByScenario = new Map<string, CmsScenarioStepRecord[]>();
    for (const step of stepRows) {
      const list = stepsByScenario.get(step.scenarioId) ?? [];
      list.push({
        id: step.id,
        stepOrder: step.stepOrder,
        stepKey: step.stepKey,
        triggerType: step.triggerType,
        delayMinutes: step.delayMinutes,
        messageText: step.messageText,
        parseMode: step.parseMode,
        mediaAssetId: step.mediaAssetId,
        mediaPreviewUrl: step.mediaAssetId ? `/api/admin/bot/media/${step.mediaAssetId}` : null,
        mediaUrl: step.mediaUrl,
        mediaType: step.mediaType,
        buttons: step.buttons,
      });
      stepsByScenario.set(step.scenarioId, list);
    }

    return scenarioRows.map((row): CmsScenarioRecord => {
      const mergedSubscribers = new Set<string>();
      let activeEnrollments = 0;
      let completedEnrollments = 0;
      const keysToMerge = [`scenario:${row.slug}`];
      if (row.slug === 'welcome_meditation') keysToMerge.push('welcome_meditation');
      if (row.slug === 'personal_practice_v1') keysToMerge.push('personal_practice');

      for (const key of keysToMerge) {
        const stats = enrollmentStats.get(key);
        if (!stats) continue;
        stats.subscribers.forEach((subId) => mergedSubscribers.add(subId));
        activeEnrollments += stats.active;
        completedEnrollments += stats.completed;
      }

      return {
        id: row.id,
        slug: row.slug,
        title: row.title,
        description: row.description,
        startPayload: row.startPayload,
        deepLinkUrl: `https://t.me/${this.botUsername}?start=${row.startPayload}`,
        status: row.status,
        isDefault: row.isDefault,
        restartOnStart: row.restartOnStart,
        enrolledSubscribers: mergedSubscribers.size,
        activeEnrollments,
        completedEnrollments,
        steps: stepsByScenario.get(row.id) ?? [],
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
      };
    });
  }

  async createScenario(input: CmsScenarioInput): Promise<CmsScenarioRecord | 'duplicate_payload'> {
    const slug = input.startPayload.toLowerCase();
    try {
      const scenarioId = await this.db.transaction(async (tx) => {
        if (input.isDefault) {
          await tx
            .update(telegramScenarios)
            .set({ isDefault: false, updatedAt: new Date() })
            .where(eq(telegramScenarios.isDefault, true));
        }

        const [scenario] = await tx
          .insert(telegramScenarios)
          .values({
            slug,
            title: input.title,
            description: input.description ?? '',
            startPayload: input.startPayload,
            status: input.status ?? 'draft',
            isDefault: Boolean(input.isDefault),
            restartOnStart: input.restartOnStart ?? true,
          })
          .returning({ id: telegramScenarios.id });

        if (!scenario) {
          throw new Error('Could not create scenario');
        }

        await tx.insert(telegramScenarioSteps).values(
          input.steps.map((step, index) => ({
            scenarioId: scenario.id,
            stepOrder: index,
            stepKey: step.stepKey,
            triggerType: step.triggerType,
            delayMinutes: step.delayMinutes,
            messageText: step.messageText,
            parseMode: step.parseMode ?? 'HTML',
            mediaAssetId: step.mediaAssetId ?? null,
            mediaUrl: step.mediaUrl ?? null,
            mediaType: step.mediaType ?? null,
            buttons: step.buttons ?? [],
          })),
        );

        return scenario.id;
      });

      const list = await this.listScenarios();
      const created = list.find((item) => item.id === scenarioId);
      if (!created) {
        throw new Error('Created scenario could not be loaded');
      }
      return created;
    } catch (error: unknown) {
      if (isUniqueViolation(error)) {
        return 'duplicate_payload';
      }
      throw error;
    }
  }

  async updateScenario(id: string, input: CmsScenarioInput): Promise<CmsScenarioRecord | null | 'duplicate_payload'> {
    const slug = input.startPayload.toLowerCase();
    try {
      const updated = await this.db.transaction(async (tx) => {
        const [existing] = await tx
          .select({ id: telegramScenarios.id })
          .from(telegramScenarios)
          .where(eq(telegramScenarios.id, id))
          .limit(1);

        if (!existing) return false;

        const now = new Date();
        if (input.isDefault) {
          await tx
            .update(telegramScenarios)
            .set({ isDefault: false, updatedAt: now })
            .where(eq(telegramScenarios.isDefault, true));
        }

        await tx
          .update(telegramScenarios)
          .set({
            slug,
            title: input.title,
            description: input.description ?? '',
            startPayload: input.startPayload,
            status: input.status ?? 'draft',
            isDefault: Boolean(input.isDefault),
            restartOnStart: input.restartOnStart ?? true,
            updatedAt: now,
          })
          .where(eq(telegramScenarios.id, id));

        await tx.delete(telegramScenarioSteps).where(eq(telegramScenarioSteps.scenarioId, id));

        await tx.insert(telegramScenarioSteps).values(
          input.steps.map((step, index) => ({
            scenarioId: id,
            stepOrder: index,
            stepKey: step.stepKey,
            triggerType: step.triggerType,
            delayMinutes: step.delayMinutes,
            messageText: step.messageText,
            parseMode: step.parseMode ?? 'HTML',
            mediaAssetId: step.mediaAssetId ?? null,
            mediaUrl: step.mediaUrl ?? null,
            mediaType: step.mediaType ?? null,
            buttons: step.buttons ?? [],
          })),
        );

        return true;
      });

      if (!updated) return null;
      const list = await this.listScenarios();
      return list.find((item) => item.id === id) ?? null;
    } catch (error: unknown) {
      if (isUniqueViolation(error)) {
        return 'duplicate_payload';
      }
      throw error;
    }
  }

  async deleteScenario(id: string): Promise<'deleted' | 'not_found' | 'active_cannot_delete'> {
    const [existing] = await this.db
      .select({ id: telegramScenarios.id, status: telegramScenarios.status })
      .from(telegramScenarios)
      .where(eq(telegramScenarios.id, id))
      .limit(1);

    if (!existing) return 'not_found';
    if (existing.status === 'active') return 'active_cannot_delete';

    await this.db.delete(telegramScenarios).where(eq(telegramScenarios.id, id));
    return 'deleted';
  }

  async listAdminCourses(): Promise<readonly CmsCourseSummary[]> {
    const [courseRows, accessRows, lessonRows] = await Promise.all([
      this.db.select().from(courses).orderBy(asc(courses.createdAt)),
      this.db
        .select({ courseId: courseAccess.courseId })
        .from(courseAccess)
        .where(eq(courseAccess.status, 'active')),
      this.db
        .select({ courseId: lessons.courseId })
        .from(lessons)
        .where(eq(lessons.status, 'published')),
    ]);

    const clientsCount = new Map<string, number>();
    for (const row of accessRows) {
      clientsCount.set(row.courseId, (clientsCount.get(row.courseId) ?? 0) + 1);
    }
    const lessonsCount = new Map<string, number>();
    for (const row of lessonRows) {
      lessonsCount.set(row.courseId, (lessonsCount.get(row.courseId) ?? 0) + 1);
    }

    return courseRows.map((course) => ({
      id: course.id,
      slug: course.slug,
      title: course.title,
      status: course.status,
      activeClientsCount: clientsCount.get(course.id) ?? 0,
      totalLessons: lessonsCount.get(course.id) ?? 0,
    }));
  }

  async listCourseClientsWithProgress(courseSlug: string): Promise<readonly CmsCourseClientWithProgress[] | null> {
    const [course] = await this.db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.slug, courseSlug))
      .limit(1);

    if (!course) return null;

    const [clientRows, publishedLessons, progressRows] = await Promise.all([
      this.db
        .select({
          id: users.id,
          email: users.email,
          name: users.name,
          avatarUrl: users.avatarUrl,
          grantedAt: courseAccess.grantedAt,
        })
        .from(courseAccess)
        .innerJoin(users, eq(users.id, courseAccess.userId))
        .where(and(eq(courseAccess.courseId, course.id), eq(courseAccess.status, 'active')))
        .orderBy(asc(users.name), asc(users.email)),
      this.db
        .select({ id: lessons.id })
        .from(lessons)
        .where(and(eq(lessons.courseId, course.id), eq(lessons.status, 'published'))),
      this.db
        .select({ userId: lessonProgress.userId, lessonId: lessonProgress.lessonId })
        .from(lessonProgress)
        .innerJoin(lessons, eq(lessons.id, lessonProgress.lessonId))
        .where(and(eq(lessons.courseId, course.id), eq(lessons.status, 'published'))),
    ]);

    const completedByUser = new Map<string, number>();
    for (const row of progressRows) {
      completedByUser.set(row.userId, (completedByUser.get(row.userId) ?? 0) + 1);
    }

    const totalLessons = publishedLessons.length;
    return clientRows.map((client) => ({
      id: client.id,
      email: client.email,
      name: client.name,
      avatarUrl: client.avatarUrl,
      grantedAt: client.grantedAt.toISOString(),
      completedLessons: completedByUser.get(client.id) ?? 0,
      totalLessons,
    }));
  }

  async listTeamUsers(): Promise<readonly CmsTeamUser[]> {
    const [userRows, accessRows] = await Promise.all([
      this.db.select().from(users).orderBy(desc(users.role), asc(users.name), asc(users.email)),
      this.db
        .select({ userId: courseAccess.userId, slug: courses.slug })
        .from(courseAccess)
        .innerJoin(courses, eq(courses.id, courseAccess.courseId))
        .where(eq(courseAccess.status, 'active')),
    ]);

    const slugsByUser = new Map<string, string[]>();
    for (const row of accessRows) {
      const list = slugsByUser.get(row.userId) ?? [];
      list.push(row.slug);
      slugsByUser.set(row.userId, list);
    }

    return userRows.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
      activeCourseSlugs: slugsByUser.get(user.id) ?? [],
      createdAt: user.createdAt.toISOString(),
    }));
  }

  async updateUserRole(userId: string, role: 'student' | 'admin'): Promise<'updated' | 'not_found'> {
    const updated = await this.db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, userId))
      .returning({ id: users.id });

    return updated.length > 0 ? 'updated' : 'not_found';
  }

  private async resolveBroadcastRecipients(
    tx: Parameters<Parameters<Database['transaction']>[0]>[0],
    targetType: BroadcastTargetType,
    targetFilter: BroadcastTargetFilter,
  ): Promise<readonly string[]> {
    if (targetType === 'manual') {
      const ids = targetFilter.subscriberIds ?? [];
      if (ids.length === 0) return [];
      const rows = await tx
        .select({ id: telegramSubscribers.id })
        .from(telegramSubscribers)
        .where(and(eq(telegramSubscribers.status, 'active'), inArray(telegramSubscribers.id, [...ids])));
      return rows.map((r) => r.id);
    }

    if (targetType === 'funnel' && targetFilter.funnelKey) {
      const rows = await tx
        .selectDistinct({ id: telegramSubscribers.id })
        .from(telegramSubscribers)
        .innerJoin(telegramFunnelEnrollments, eq(telegramFunnelEnrollments.subscriberId, telegramSubscribers.id))
        .where(
          and(
            eq(telegramSubscribers.status, 'active'),
            eq(telegramFunnelEnrollments.funnelKey, targetFilter.funnelKey),
          ),
        );
      return rows.map((r) => r.id);
    }

    if (targetType === 'language' && targetFilter.languageCode) {
      const rows = await tx
        .select({ id: telegramSubscribers.id })
        .from(telegramSubscribers)
        .where(
          and(
            eq(telegramSubscribers.status, 'active'),
            eq(telegramSubscribers.languageCode, targetFilter.languageCode),
          ),
        );
      return rows.map((r) => r.id);
    }

    if (targetType === 'source' && targetFilter.startPayload) {
      const rows = await tx
        .select({
          id: telegramSubscribers.id,
          firstStartPayload: telegramSubscribers.firstStartPayload,
          latestStartPayload: telegramSubscribers.latestStartPayload,
        })
        .from(telegramSubscribers)
        .where(eq(telegramSubscribers.status, 'active'));
      return rows
        .filter((r) =>
          targetFilter.startPayload === '__none__'
            ? r.firstStartPayload === null
            : r.firstStartPayload === targetFilter.startPayload || r.latestStartPayload === targetFilter.startPayload,
        )
        .map((r) => r.id);
    }

    const rows = await tx
      .select({ id: telegramSubscribers.id })
      .from(telegramSubscribers)
      .where(eq(telegramSubscribers.status, 'active'));
    return rows.map((r) => r.id);
  }
}

export function collectInitialAutoSteps<T extends { readonly triggerType: string }>(steps: readonly T[]): readonly T[] {
  const result: T[] = [];
  for (const step of steps) {
    if (step.triggerType !== 'delay') {
      break;
    }
    result.push(step);
  }
  return result;
}

function mapBroadcastRow(
  row: typeof telegramBroadcasts.$inferSelect,
  stats?: CmsBroadcastStats,
): CmsBroadcastRecord {
  return {
    id: row.id,
    title: row.title,
    messageText: row.messageText,
    parseMode: row.parseMode,
    mediaAssetId: row.mediaAssetId,
    mediaPreviewUrl: row.mediaAssetId ? `/api/admin/bot/media/${row.mediaAssetId}` : null,
    mediaUrl: row.mediaUrl,
    mediaType: row.mediaType,
    buttons: row.buttons,
    targetType: row.targetType,
    targetFilter: row.targetFilter,
    status: row.status,
    scheduledAt: row.scheduledAt ? row.scheduledAt.toISOString() : null,
    startedAt: row.startedAt ? row.startedAt.toISOString() : null,
    completedAt: row.completedAt ? row.completedAt.toISOString() : null,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    stats: stats ?? {
      total: 0,
      pending: 0,
      processing: 0,
      sent: 0,
      failed: 0,
      ambiguous: 0,
      testSent: 0,
    },
  };
}

function isUniqueViolation(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;
  const code = (error as { code?: unknown; cause?: { code?: unknown } }).code
    ?? (error as { cause?: { code?: unknown } }).cause?.code;
  return code === '23505';
}
