-- Restore Cirali early-bird promo (1 spot left at €750) removed by 0013.
-- Re-adds the callout block and the promo sentences in the price block,
-- matching the updated seed in shared/retreats/cirali.ts.

UPDATE "retreats"
SET
	"data" = jsonb_insert("data", '{blocks,1}', '{"id":"cirali-price-callout","sortOrder":2,"type":"callout","variant":"sunrise","text":"🔥 Only 1 spot left at the special price of €750 (standard price: €790).","translations":{"ru":{"text":"🔥 Осталось всего 1 место по специальной цене €750 (обычная цена - €790)."}}}'::jsonb),
	"updated_at" = now()
WHERE "slug" = 'cirali-yoga-tour'
	AND NOT ("data"->'blocks') @> '[{"id":"cirali-price-callout"}]'::jsonb;

UPDATE "retreats"
SET
	"data" = jsonb_set(
		"data",
		'{blocks}',
		(
			SELECT jsonb_agg(
				CASE
					WHEN block->>'id' = 'not-included-and-price' THEN jsonb_set(
						jsonb_set(
							block,
							'{text}',
							to_jsonb('Flights, meals other than breakfasts, bicycle rental, and personal expenses are not included. Retreat price: €790. Special promo: €750 for the first participants (1 spot left). Deposit to reserve a place: €200.'::text)
						),
						'{translations,ru,text}',
						to_jsonb('Не включены в стоимость: перелёты, питание кроме завтраков, аренда велосипедов и прочие личные расходы. Стоимость ретрита - €790. Спецпредложение: €750 для первых участников (осталось 1 место). Залог для брони места - €200.'::text)
					)
					ELSE block
				END
				ORDER BY ordinality
			)
			FROM jsonb_array_elements("data"->'blocks') WITH ORDINALITY AS items(block, ordinality)
		)
	),
	"updated_at" = now()
WHERE "slug" = 'cirali-yoga-tour';
