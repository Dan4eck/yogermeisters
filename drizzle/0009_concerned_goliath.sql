ALTER TABLE "telegram_deliveries" ADD COLUMN "step_order" integer;--> statement-breakpoint
WITH ordered_deliveries AS (
	SELECT
		"id",
		row_number() OVER (
			PARTITION BY "enrollment_id"
			ORDER BY "scheduled_at", "created_at", "id"
		) - 1 AS "step_order"
	FROM "telegram_deliveries"
)
UPDATE "telegram_deliveries" AS delivery
SET "step_order" = ordered."step_order"
FROM ordered_deliveries AS ordered
WHERE ordered."id" = delivery."id";--> statement-breakpoint
ALTER TABLE "telegram_deliveries" ALTER COLUMN "step_order" SET NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "telegram_deliveries_enrollment_step_unique" ON "telegram_deliveries" USING btree ("enrollment_id","step_order");
