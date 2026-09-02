import {
  bigint,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from 'drizzle-orm/pg-core';

import type { RetreatEditableData } from '@shared/retreats';

export const userRole = pgEnum('user_role', ['student', 'admin']);
export const contentStatus = pgEnum('content_status', ['draft', 'published', 'archived']);
export const accessStatus = pgEnum('access_status', ['active', 'revoked']);
export const telegramSubscriberStatus = pgEnum('telegram_subscriber_status', ['active', 'blocked']);
export const telegramFunnelStatus = pgEnum('telegram_funnel_status', ['active', 'completed', 'cancelled']);
export const telegramDeliveryStatus = pgEnum('telegram_delivery_status', [
  'pending',
  'processing',
  'sent',
  'failed',
  'ambiguous',
]);

export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  googleSubject: varchar('google_subject', { length: 255 }).unique(),
  email: varchar('email', { length: 320 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  avatarUrl: text('avatar_url'),
  role: userRole('role').notNull().default('student'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const courses = pgTable('courses', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description').notNull(),
  introMediaObjectKey: text('intro_media_object_key'),
  status: contentStatus('status').notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const courseModules = pgTable(
  'course_modules',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    sortOrder: integer('sort_order').notNull(),
    status: contentStatus('status').notNull().default('draft'),
  },
  (table) => [uniqueIndex('course_modules_course_sort_unique').on(table.courseId, table.sortOrder)],
);

export const lessons = pgTable(
  'lessons',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    moduleId: uuid('module_id').notNull().references(() => courseModules.id, { onDelete: 'cascade' }),
    slug: varchar('slug', { length: 160 }).notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description').notNull().default(''),
    sortOrder: integer('sort_order').notNull(),
    status: contentStatus('status').notNull().default('draft'),
    mediaObjectKey: text('media_object_key'),
  },
  (table) => [uniqueIndex('lessons_course_slug_unique').on(table.courseId, table.slug)],
);

export const courseAccess = pgTable(
  'course_access',
  {
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    courseId: uuid('course_id').notNull().references(() => courses.id, { onDelete: 'cascade' }),
    status: accessStatus('status').notNull().default('active'),
    grantedAt: timestamp('granted_at', { withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
  },
  (table) => [primaryKey({ columns: [table.userId, table.courseId] })],
);

export const lessonProgress = pgTable(
  'lesson_progress',
  {
    userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
    lessonId: uuid('lesson_id').notNull().references(() => lessons.id, { onDelete: 'cascade' }),
    completedAt: timestamp('completed_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.userId, table.lessonId] })],
);

export const retreats = pgTable('retreats', {
  id: integer('id').primaryKey(),
  slug: varchar('slug', { length: 160 }).notNull().unique(),
  data: jsonb('data').$type<RetreatEditableData>().notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const telegramSubscribers = pgTable(
  'telegram_subscribers',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    telegramUserId: bigint('telegram_user_id', { mode: 'number' }).notNull().unique(),
    chatId: bigint('chat_id', { mode: 'number' }).notNull().unique(),
    username: varchar('username', { length: 255 }),
    firstName: varchar('first_name', { length: 255 }).notNull(),
    lastName: varchar('last_name', { length: 255 }),
    languageCode: varchar('language_code', { length: 35 }),
    firstStartPayload: varchar('first_start_payload', { length: 255 }),
    latestStartPayload: varchar('latest_start_payload', { length: 255 }),
    status: telegramSubscriberStatus('status').notNull().default('active'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    lastInteractionAt: timestamp('last_interaction_at', { withTimezone: true }).notNull().defaultNow(),
    blockedAt: timestamp('blocked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('telegram_subscribers_status_idx').on(table.status)],
);

export const telegramUpdates = pgTable('telegram_updates', {
  updateId: bigint('update_id', { mode: 'number' }).primaryKey(),
  receivedAt: timestamp('received_at', { withTimezone: true }).notNull().defaultNow(),
});

export const telegramFunnelEnrollments = pgTable(
  'telegram_funnel_enrollments',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    subscriberId: uuid('subscriber_id')
      .notNull()
      .references(() => telegramSubscribers.id, { onDelete: 'cascade' }),
    funnelKey: varchar('funnel_key', { length: 160 }).notNull(),
    funnelVersion: varchar('funnel_version', { length: 80 }).notNull(),
    status: telegramFunnelStatus('status').notNull().default('active'),
    startedAt: timestamp('started_at', { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp('completed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('telegram_funnel_enrollments_subscriber_funnel_unique').on(
      table.subscriberId,
      table.funnelKey,
      table.funnelVersion,
    ),
    index('telegram_funnel_enrollments_status_idx').on(table.status),
  ],
);

export const telegramDeliveries = pgTable(
  'telegram_deliveries',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    enrollmentId: uuid('enrollment_id')
      .notNull()
      .references(() => telegramFunnelEnrollments.id, { onDelete: 'cascade' }),
    contentKey: varchar('content_key', { length: 160 }).notNull(),
    stepOrder: integer('step_order').notNull(),
    status: telegramDeliveryStatus('status').notNull().default('pending'),
    attempts: integer('attempts').notNull().default(0),
    telegramMessageId: bigint('telegram_message_id', { mode: 'number' }),
    lastError: text('last_error'),
    scheduledAt: timestamp('scheduled_at', { withTimezone: true }).notNull(),
    sentAt: timestamp('sent_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('telegram_deliveries_enrollment_content_unique').on(table.enrollmentId, table.contentKey),
    uniqueIndex('telegram_deliveries_enrollment_step_unique').on(table.enrollmentId, table.stepOrder),
    index('telegram_deliveries_status_idx').on(table.status),
    index('telegram_deliveries_schedule_idx').on(table.status, table.contentKey, table.scheduledAt),
  ],
);
