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
							to_jsonb('Flights, meals other than breakfasts, bicycle rental, and personal expenses are not included. Retreat price: €790. Deposit to reserve a place: €200.'::text)
						),
						'{translations,ru,text}',
						to_jsonb('Не включены в стоимость: перелёты, питание кроме завтраков, аренда велосипедов и прочие личные расходы. Стоимость ретрита - €790. Залог для брони места - €200.'::text)
					)
					ELSE block
				END
				ORDER BY ordinality
			)
			FROM jsonb_array_elements("data"->'blocks') WITH ORDINALITY AS items(block, ordinality)
			WHERE block->>'id' <> 'cirali-price-callout'
		)
	),
	"updated_at" = now()
WHERE "slug" = 'cirali-yoga-tour';
