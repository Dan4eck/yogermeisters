CREATE TABLE "retreats" (
	"id" integer PRIMARY KEY NOT NULL,
	"slug" varchar(160) NOT NULL,
	"data" jsonb NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "retreats_slug_unique" UNIQUE("slug")
);
