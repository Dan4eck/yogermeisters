CREATE TYPE "public"."telegram_funnel_status" AS ENUM('active', 'completed', 'cancelled');--> statement-breakpoint
ALTER TYPE "public"."telegram_delivery_status" ADD VALUE 'ambiguous';--> statement-breakpoint
CREATE TABLE "telegram_funnel_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscriber_id" uuid NOT NULL,
	"funnel_key" varchar(160) NOT NULL,
	"funnel_version" varchar(80) NOT NULL,
	"status" "telegram_funnel_status" DEFAULT 'active' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telegram_updates" (
	"update_id" bigint PRIMARY KEY NOT NULL,
	"received_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "telegram_deliveries" DROP CONSTRAINT "telegram_deliveries_subscriber_id_telegram_subscribers_id_fk";
--> statement-breakpoint
DROP INDEX "telegram_deliveries_subscriber_content_unique";--> statement-breakpoint
DROP INDEX "telegram_deliveries_schedule_idx";--> statement-breakpoint
ALTER TABLE "telegram_deliveries" ALTER COLUMN "attempts" SET DEFAULT 0;--> statement-breakpoint
ALTER TABLE "telegram_deliveries" ADD COLUMN "enrollment_id" uuid;--> statement-breakpoint
INSERT INTO "telegram_funnel_enrollments" (
	"subscriber_id",
	"funnel_key",
	"funnel_version",
	"status",
	"started_at",
	"completed_at",
	"created_at",
	"updated_at"
)
SELECT
	delivery."subscriber_id",
	'welcome_meditation',
	'v1',
	CASE
		WHEN bool_or(delivery."content_key" = 'welcome_meditation_v1' AND delivery."status" = 'sent')
			AND bool_or(delivery."content_key" = 'meditation_follow_up_v1' AND delivery."status" = 'sent')
		THEN 'completed'::"telegram_funnel_status"
		ELSE 'active'::"telegram_funnel_status"
	END,
	min(delivery."created_at"),
	CASE
		WHEN bool_or(delivery."content_key" = 'welcome_meditation_v1' AND delivery."status" = 'sent')
			AND bool_or(delivery."content_key" = 'meditation_follow_up_v1' AND delivery."status" = 'sent')
		THEN max(delivery."sent_at")
		ELSE NULL
	END,
	min(delivery."created_at"),
	max(delivery."updated_at")
FROM "telegram_deliveries" AS delivery
WHERE delivery."content_key" IN ('welcome_meditation_v1', 'meditation_follow_up_v1')
GROUP BY delivery."subscriber_id";--> statement-breakpoint
INSERT INTO "telegram_funnel_enrollments" (
	"subscriber_id",
	"funnel_key",
	"funnel_version",
	"status",
	"started_at",
	"completed_at",
	"created_at",
	"updated_at"
)
SELECT
	delivery."subscriber_id",
	'welcome_meditation',
	'test-v1',
	CASE
		WHEN bool_or(delivery."status" = 'sent') THEN 'completed'::"telegram_funnel_status"
		ELSE 'active'::"telegram_funnel_status"
	END,
	min(delivery."created_at"),
	CASE WHEN bool_or(delivery."status" = 'sent') THEN max(delivery."sent_at") ELSE NULL END,
	min(delivery."created_at"),
	max(delivery."updated_at")
FROM "telegram_deliveries" AS delivery
WHERE delivery."content_key" = 'welcome_test_v1'
GROUP BY delivery."subscriber_id";--> statement-breakpoint
INSERT INTO "telegram_funnel_enrollments" (
	"subscriber_id",
	"funnel_key",
	"funnel_version",
	"status",
	"started_at",
	"created_at",
	"updated_at"
)
SELECT
	delivery."subscriber_id",
	'welcome_meditation',
	'legacy-v0',
	'cancelled'::"telegram_funnel_status",
	min(delivery."created_at"),
	min(delivery."created_at"),
	max(delivery."updated_at")
FROM "telegram_deliveries" AS delivery
WHERE delivery."content_key" NOT IN (
	'welcome_meditation_v1',
	'meditation_follow_up_v1',
	'welcome_test_v1'
)
GROUP BY delivery."subscriber_id";--> statement-breakpoint
UPDATE "telegram_deliveries" AS delivery
SET "enrollment_id" = enrollment."id"
FROM "telegram_funnel_enrollments" AS enrollment
WHERE enrollment."subscriber_id" = delivery."subscriber_id"
	AND enrollment."funnel_key" = 'welcome_meditation'
	AND enrollment."funnel_version" = CASE
		WHEN delivery."content_key" = 'welcome_test_v1' THEN 'test-v1'
		WHEN delivery."content_key" IN ('welcome_meditation_v1', 'meditation_follow_up_v1') THEN 'v1'
		ELSE 'legacy-v0'
	END;--> statement-breakpoint
UPDATE "telegram_deliveries"
SET "scheduled_at" = COALESCE("scheduled_at", "sent_at", "created_at");--> statement-breakpoint
ALTER TABLE "telegram_deliveries" ALTER COLUMN "scheduled_at" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "telegram_deliveries" ALTER COLUMN "enrollment_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "telegram_funnel_enrollments" ADD CONSTRAINT "telegram_funnel_enrollments_subscriber_id_telegram_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."telegram_subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "telegram_funnel_enrollments_subscriber_funnel_unique" ON "telegram_funnel_enrollments" USING btree ("subscriber_id","funnel_key","funnel_version");--> statement-breakpoint
CREATE INDEX "telegram_funnel_enrollments_status_idx" ON "telegram_funnel_enrollments" USING btree ("status");--> statement-breakpoint
ALTER TABLE "telegram_deliveries" ADD CONSTRAINT "telegram_deliveries_enrollment_id_telegram_funnel_enrollments_id_fk" FOREIGN KEY ("enrollment_id") REFERENCES "public"."telegram_funnel_enrollments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "telegram_deliveries_enrollment_content_unique" ON "telegram_deliveries" USING btree ("enrollment_id","content_key");--> statement-breakpoint
CREATE INDEX "telegram_deliveries_schedule_idx" ON "telegram_deliveries" USING btree ("status","content_key","scheduled_at");--> statement-breakpoint
ALTER TABLE "telegram_deliveries" DROP COLUMN "subscriber_id";
