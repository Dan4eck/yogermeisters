ALTER TYPE "public"."telegram_delivery_status" ADD VALUE 'processing' BEFORE 'sent';--> statement-breakpoint
ALTER TABLE "telegram_deliveries" ADD COLUMN "scheduled_at" timestamp with time zone;--> statement-breakpoint
CREATE INDEX "telegram_deliveries_schedule_idx" ON "telegram_deliveries" USING btree ("status","scheduled_at");