INSERT INTO "telegram_deliveries" (
	"enrollment_id",
	"content_key",
	"step_order",
	"status",
	"attempts",
	"scheduled_at",
	"created_at",
	"updated_at"
)
SELECT
	enrollment."id",
	step."content_key",
	step."step_order",
	'pending'::"telegram_delivery_status",
	0,
	enrollment."started_at" + step."delay",
	now(),
	now()
FROM "telegram_funnel_enrollments" AS enrollment
CROSS JOIN (
	VALUES
		('meditation_day_one_message_v1', 2, interval '24 hours'),
		('meditation_day_one_reminder_v1', 3, interval '24 hours 50 minutes'),
		('meditation_day_two_message_v1', 4, interval '48 hours')
) AS step("content_key", "step_order", "delay")
WHERE enrollment."funnel_key" = 'welcome_meditation'
	AND enrollment."funnel_version" = 'v1'
	AND NOT EXISTS (
		SELECT 1
		FROM "telegram_deliveries" AS existing_delivery
		WHERE existing_delivery."enrollment_id" = enrollment."id"
			AND (
				existing_delivery."content_key" = step."content_key"
				OR existing_delivery."step_order" = step."step_order"
			)
	)
ON CONFLICT DO NOTHING;--> statement-breakpoint
UPDATE "telegram_funnel_enrollments" AS enrollment
SET
	"status" = 'active'::"telegram_funnel_status",
	"completed_at" = NULL,
	"updated_at" = now()
WHERE enrollment."funnel_key" = 'welcome_meditation'
	AND enrollment."funnel_version" = 'v1'
	AND enrollment."status" = 'completed'
	AND EXISTS (
		SELECT 1
		FROM "telegram_deliveries" AS delivery
		WHERE delivery."enrollment_id" = enrollment."id"
			AND delivery."content_key" IN (
				'meditation_day_one_message_v1',
				'meditation_day_one_reminder_v1',
				'meditation_day_two_message_v1'
			)
			AND delivery."status" <> 'sent'
	);
