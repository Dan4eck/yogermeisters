CREATE TYPE "public"."telegram_delivery_status" AS ENUM('pending', 'sent', 'failed');--> statement-breakpoint
CREATE TYPE "public"."telegram_subscriber_status" AS ENUM('active', 'blocked');--> statement-breakpoint
CREATE TABLE "telegram_deliveries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subscriber_id" uuid NOT NULL,
	"content_key" varchar(160) NOT NULL,
	"status" "telegram_delivery_status" DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 1 NOT NULL,
	"telegram_message_id" bigint,
	"last_error" text,
	"sent_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "telegram_subscribers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"telegram_user_id" bigint NOT NULL,
	"chat_id" bigint NOT NULL,
	"username" varchar(255),
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255),
	"language_code" varchar(35),
	"first_start_payload" varchar(255),
	"latest_start_payload" varchar(255),
	"status" "telegram_subscriber_status" DEFAULT 'active' NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_interaction_at" timestamp with time zone DEFAULT now() NOT NULL,
	"blocked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "telegram_subscribers_telegram_user_id_unique" UNIQUE("telegram_user_id"),
	CONSTRAINT "telegram_subscribers_chat_id_unique" UNIQUE("chat_id")
);
--> statement-breakpoint
ALTER TABLE "telegram_deliveries" ADD CONSTRAINT "telegram_deliveries_subscriber_id_telegram_subscribers_id_fk" FOREIGN KEY ("subscriber_id") REFERENCES "public"."telegram_subscribers"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "telegram_deliveries_subscriber_content_unique" ON "telegram_deliveries" USING btree ("subscriber_id","content_key");--> statement-breakpoint
CREATE INDEX "telegram_deliveries_status_idx" ON "telegram_deliveries" USING btree ("status");--> statement-breakpoint
CREATE INDEX "telegram_subscribers_status_idx" ON "telegram_subscribers" USING btree ("status");