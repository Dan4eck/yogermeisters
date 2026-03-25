import { sql } from 'drizzle-orm';
import {
  date,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const users = pgTable('users', {
  id: varchar('id').primaryKey().default(sql`gen_random_uuid()`),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const retreatStatusSchema = z.enum(['draft', 'active', 'archived']);
export const retreatLanguageSchema = z.enum(['en', 'ru']);
export const retreatBlockTypeSchema = z.enum(['paragraph', 'image']);

export const retreats = pgTable('retreats', {
  id: integer('id').primaryKey(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  status: varchar('status', { length: 16 }).notNull().default('draft'),
  title: text('title').notNull(),
  location: text('location').notNull(),
  startDate: date('start_date', { mode: 'string' }).notNull(),
  endDate: date('end_date', { mode: 'string' }).notNull(),
  dateLabel: text('date_label'),
  price: text('price').notNull(),
  bookingUrl: text('booking_url').notNull(),
  coverAssetKey: text('cover_asset_key').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const retreatBlocks = pgTable(
  'retreat_blocks',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    retreatId: integer('retreat_id')
      .notNull()
      .references(() => retreats.id, { onDelete: 'cascade' }),
    blockKey: varchar('block_key', { length: 120 }).notNull(),
    sortOrder: integer('sort_order').notNull(),
    type: varchar('type', { length: 16 }).notNull(),
    text: text('text'),
    imageAssetKey: text('image_asset_key'),
    alt: text('alt'),
  },
  (table) => ({
    retreatBlockKeyIdx: uniqueIndex('retreat_blocks_retreat_id_block_key_idx').on(
      table.retreatId,
      table.blockKey,
    ),
  }),
);

export const retreatTranslations = pgTable(
  'retreat_translations',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    retreatId: integer('retreat_id')
      .notNull()
      .references(() => retreats.id, { onDelete: 'cascade' }),
    language: varchar('language', { length: 8 }).notNull(),
    title: text('title').notNull(),
    location: text('location').notNull(),
    dateLabel: text('date_label'),
  },
  (table) => ({
    retreatLanguageIdx: uniqueIndex('retreat_translations_retreat_id_language_idx').on(
      table.retreatId,
      table.language,
    ),
  }),
);

export const retreatBlockTranslations = pgTable(
  'retreat_block_translations',
  {
    id: integer('id').primaryKey().generatedAlwaysAsIdentity(),
    blockId: integer('block_id')
      .notNull()
      .references(() => retreatBlocks.id, { onDelete: 'cascade' }),
    language: varchar('language', { length: 8 }).notNull(),
    text: text('text'),
    alt: text('alt'),
  },
  (table) => ({
    retreatBlockLanguageIdx: uniqueIndex('retreat_block_translations_block_id_language_idx').on(
      table.blockId,
      table.language,
    ),
  }),
);

export const updateRetreatStatusSchema = z.object({
  status: retreatStatusSchema,
});

export type RetreatRow = typeof retreats.$inferSelect;
export type RetreatBlockRow = typeof retreatBlocks.$inferSelect;
export type RetreatTranslationRow = typeof retreatTranslations.$inferSelect;
export type RetreatBlockTranslationRow = typeof retreatBlockTranslations.$inferSelect;
