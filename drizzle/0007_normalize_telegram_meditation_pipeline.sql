INSERT INTO "telegram_deliveries" (
  "subscriber_id",
  "content_key",
  "status",
  "attempts",
  "telegram_message_id",
  "last_error",
  "sent_at",
  "created_at",
  "updated_at"
)
SELECT DISTINCT ON (dynamic_delivery."subscriber_id")
  dynamic_delivery."subscriber_id",
  'welcome_meditation_v1',
  'sent'::"telegram_delivery_status",
  dynamic_delivery."attempts",
  dynamic_delivery."telegram_message_id",
  dynamic_delivery."last_error",
  dynamic_delivery."sent_at",
  dynamic_delivery."created_at",
  dynamic_delivery."updated_at"
FROM "telegram_deliveries" AS dynamic_delivery
WHERE dynamic_delivery."content_key" LIKE 'welcome_meditation_v1:update:%'
  AND dynamic_delivery."status" = 'sent'
ORDER BY dynamic_delivery."subscriber_id", dynamic_delivery."sent_at", dynamic_delivery."created_at"
ON CONFLICT ("subscriber_id", "content_key") DO NOTHING;

INSERT INTO "telegram_deliveries" (
  "subscriber_id",
  "content_key",
  "status",
  "attempts",
  "telegram_message_id",
  "last_error",
  "scheduled_at",
  "sent_at",
  "created_at",
  "updated_at"
)
SELECT DISTINCT ON (dynamic_delivery."subscriber_id")
  dynamic_delivery."subscriber_id",
  'meditation_follow_up_v1',
  CASE
    WHEN dynamic_delivery."status" = 'processing' THEN 'pending'::"telegram_delivery_status"
    ELSE dynamic_delivery."status"
  END,
  dynamic_delivery."attempts",
  dynamic_delivery."telegram_message_id",
  dynamic_delivery."last_error",
  dynamic_delivery."scheduled_at",
  dynamic_delivery."sent_at",
  dynamic_delivery."created_at",
  dynamic_delivery."updated_at"
FROM "telegram_deliveries" AS dynamic_delivery
WHERE dynamic_delivery."content_key" LIKE 'meditation_follow_up_v1:update:%'
  AND dynamic_delivery."status" IN ('pending', 'processing', 'sent')
ORDER BY
  dynamic_delivery."subscriber_id",
  CASE dynamic_delivery."status"
    WHEN 'sent' THEN 0
    WHEN 'processing' THEN 1
    ELSE 2
  END,
  dynamic_delivery."scheduled_at"
ON CONFLICT ("subscriber_id", "content_key") DO NOTHING;

UPDATE "telegram_deliveries"
SET
  "status" = 'failed',
  "last_error" = 'Superseded by one-time meditation pipeline',
  "updated_at" = now()
WHERE "content_key" LIKE 'meditation_follow_up_v1:update:%'
  AND "status" IN ('pending', 'processing');
