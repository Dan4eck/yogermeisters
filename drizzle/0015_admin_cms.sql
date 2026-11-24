CREATE TABLE "telegram_media_assets" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "filename" varchar(255) NOT NULL,
  "mime_type" varchar(100) NOT NULL,
  "size_bytes" integer NOT NULL,
  "data_base64" text NOT NULL,
  "telegram_file_id" text,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE TABLE "telegram_broadcasts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "title" varchar(255) NOT NULL,
  "message_text" text NOT NULL,
  "parse_mode" varchar(16) DEFAULT 'HTML' NOT NULL,
  "media_asset_id" uuid REFERENCES "telegram_media_assets"("id") ON DELETE SET NULL,
  "media_url" text,
  "media_type" varchar(16),
  "buttons" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "target_type" varchar(32) DEFAULT 'all_active' NOT NULL,
  "target_filter" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "status" varchar(32) DEFAULT 'draft' NOT NULL,
  "scheduled_at" timestamp with time zone,
  "started_at" timestamp with time zone,
  "completed_at" timestamp with time zone,
  "created_by_user_id" uuid REFERENCES "users"("id") ON DELETE SET NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX "telegram_broadcasts_status_idx" ON "telegram_broadcasts" USING btree ("status","scheduled_at");--> statement-breakpoint
CREATE TABLE "telegram_broadcast_deliveries" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "broadcast_id" uuid NOT NULL REFERENCES "telegram_broadcasts"("id") ON DELETE CASCADE,
  "subscriber_id" uuid NOT NULL REFERENCES "telegram_subscribers"("id") ON DELETE CASCADE,
  "is_test" boolean DEFAULT false NOT NULL,
  "status" "telegram_delivery_status" DEFAULT 'pending' NOT NULL,
  "attempts" integer DEFAULT 0 NOT NULL,
  "telegram_message_id" bigint,
  "last_error" text,
  "scheduled_at" timestamp with time zone DEFAULT now() NOT NULL,
  "sent_at" timestamp with time zone,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX "telegram_broadcast_deliveries_live_unique" ON "telegram_broadcast_deliveries" USING btree ("broadcast_id","subscriber_id") WHERE "telegram_broadcast_deliveries"."is_test" = false;--> statement-breakpoint
CREATE INDEX "telegram_broadcast_deliveries_due_idx" ON "telegram_broadcast_deliveries" USING btree ("status","scheduled_at");--> statement-breakpoint
CREATE INDEX "telegram_broadcast_deliveries_broadcast_idx" ON "telegram_broadcast_deliveries" USING btree ("broadcast_id","is_test","status");--> statement-breakpoint
CREATE TABLE "telegram_scenarios" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "slug" varchar(100) NOT NULL UNIQUE,
  "title" varchar(255) NOT NULL,
  "description" text DEFAULT '' NOT NULL,
  "start_payload" varchar(64) NOT NULL UNIQUE,
  "status" varchar(24) DEFAULT 'draft' NOT NULL,
  "is_default" boolean DEFAULT false NOT NULL,
  "restart_on_start" boolean DEFAULT true NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE INDEX "telegram_scenarios_payload_status_idx" ON "telegram_scenarios" USING btree ("start_payload","status");--> statement-breakpoint
CREATE UNIQUE INDEX "telegram_scenarios_single_default_unique" ON "telegram_scenarios" USING btree ("is_default") WHERE "telegram_scenarios"."is_default" = true;--> statement-breakpoint
CREATE TABLE "telegram_scenario_steps" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "scenario_id" uuid NOT NULL REFERENCES "telegram_scenarios"("id") ON DELETE CASCADE,
  "step_order" integer NOT NULL,
  "step_key" varchar(120) NOT NULL,
  "trigger_type" varchar(24) DEFAULT 'delay' NOT NULL,
  "delay_minutes" integer DEFAULT 0 NOT NULL,
  "message_text" text NOT NULL,
  "parse_mode" varchar(16) DEFAULT 'HTML' NOT NULL,
  "media_asset_id" uuid REFERENCES "telegram_media_assets"("id") ON DELETE SET NULL,
  "media_url" text,
  "media_type" varchar(16),
  "buttons" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);--> statement-breakpoint
CREATE UNIQUE INDEX "telegram_scenario_steps_order_unique" ON "telegram_scenario_steps" USING btree ("scenario_id","step_order");--> statement-breakpoint
CREATE UNIQUE INDEX "telegram_scenario_steps_key_unique" ON "telegram_scenario_steps" USING btree ("scenario_id","step_key");
