import { eq } from 'drizzle-orm';

import { db, pool } from '../server/db.ts';
import { retreatSeedData } from '../shared/retreat-content.ts';
import {
  retreatBlockTranslations,
  retreatBlocks,
  retreatTranslations,
  retreats,
} from '../shared/schema.ts';

async function main(): Promise<void> {
  const target = process.argv[2];

  if (!target) {
    throw new Error('Provide a retreat slug or id.');
  }

  const retreat = retreatSeedData.find((item) => item.slug === target || String(item.id) === target);

  if (!db || !pool || !retreat) {
    throw new Error(`Retreat "${target}" was not found or database is unavailable.`);
  }

  await db.transaction(async (tx) => {
    const existingBlocks = await tx
      .select({ id: retreatBlocks.id })
      .from(retreatBlocks)
      .where(eq(retreatBlocks.retreatId, retreat.id));

    for (const block of existingBlocks) {
      await tx.delete(retreatBlockTranslations).where(eq(retreatBlockTranslations.blockId, block.id));
    }

    await tx.delete(retreatTranslations).where(eq(retreatTranslations.retreatId, retreat.id));
    await tx.delete(retreatBlocks).where(eq(retreatBlocks.retreatId, retreat.id));

    await tx
      .update(retreats)
      .set({
        slug: retreat.slug,
        status: retreat.status,
        title: retreat.title,
        location: retreat.location,
        startDate: retreat.startDate,
        endDate: retreat.endDate,
        dateLabel: retreat.dateLabel ?? null,
        price: retreat.price,
        bookingUrl: retreat.bookingUrl,
        coverImage: retreat.coverImage,
        updatedAt: new Date(),
      })
      .where(eq(retreats.id, retreat.id));

    for (const [language, translation] of Object.entries(retreat.translations ?? {})) {
      await tx.insert(retreatTranslations).values({
        retreatId: retreat.id,
        language,
        title: translation.title,
        location: translation.location,
        dateLabel: translation.dateLabel ?? null,
      });
    }

    for (const block of retreat.blocks) {
      const [insertedBlock] = await tx
        .insert(retreatBlocks)
        .values({
          retreatId: retreat.id,
          blockKey: block.id,
          sortOrder: block.sortOrder,
          type: block.type,
          variant: block.variant ?? null,
          deadline: block.deadline ?? null,
          priceCurrent: block.priceCurrent ?? null,
          priceCompare: block.priceCompare ?? null,
          text: block.text ?? null,
          image: block.image ?? null,
          alt: block.alt ?? null,
        })
        .returning({ id: retreatBlocks.id });

      for (const [language, translation] of Object.entries(block.translations ?? {})) {
        await tx.insert(retreatBlockTranslations).values({
          blockId: insertedBlock.id,
          language,
          text: translation.text ?? null,
          alt: translation.alt ?? null,
        });
      }
    }
  });

  console.log(`Retreat "${retreat.slug}" synced.`);
  await pool.end();
}

main().catch(async (error) => {
  console.error(error);
  if (pool) {
    await pool.end();
  }
  process.exit(1);
});
