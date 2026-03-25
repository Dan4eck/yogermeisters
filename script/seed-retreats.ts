import { db, pool } from '../server/db';
import {
  retreatBlockTranslations,
  retreatBlocks,
  retreats,
  retreatTranslations,
} from '../shared/schema';
import { retreatSeedData } from '../shared/retreat-content';

async function main() {
  if (!db || !pool) {
    throw new Error('DATABASE_URL is required to seed retreats');
  }

  await db.transaction(async (tx) => {
    await tx.delete(retreatBlockTranslations);
    await tx.delete(retreatTranslations);
    await tx.delete(retreatBlocks);
    await tx.delete(retreats);

    for (const retreat of retreatSeedData) {
      await tx.insert(retreats).values({
        id: retreat.id,
        slug: retreat.slug,
        status: retreat.status,
        title: retreat.title,
        location: retreat.location,
        startDate: retreat.startDate,
        endDate: retreat.endDate,
        dateLabel: retreat.dateLabel ?? null,
        price: retreat.price,
        bookingUrl: retreat.bookingUrl,
        coverAssetKey: retreat.coverAssetKey,
      });

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
            text: block.text ?? null,
            imageAssetKey: block.imageAssetKey ?? null,
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
    }
  });

  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

