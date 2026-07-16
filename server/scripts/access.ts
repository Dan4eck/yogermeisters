import 'dotenv/config';

import { and, eq } from 'drizzle-orm';

import { createDatabase } from '../db/client';
import { courseAccess, courses, users } from '../db/schema';

type AccessAction = 'grant' | 'revoke';

async function updateAccess(action: AccessAction, email: string, courseSlug: string): Promise<void> {
  const databaseUrl = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_DIRECT_URL or DATABASE_URL is required');
  }

  const { db, pool } = createDatabase(databaseUrl);
  try {
    const [record] = await db
      .select({ userId: users.id, courseId: courses.id })
      .from(users)
      .crossJoin(courses)
      .where(and(eq(users.email, email.toLowerCase()), eq(courses.slug, courseSlug)))
      .limit(1);

    if (!record) {
      throw new Error('User or course was not found. The user must sign in once before access can be granted.');
    }

    if (action === 'grant') {
      await db
        .insert(courseAccess)
        .values({ userId: record.userId, courseId: record.courseId, status: 'active', revokedAt: null })
        .onConflictDoUpdate({
          target: [courseAccess.userId, courseAccess.courseId],
          set: { status: 'active', grantedAt: new Date(), revokedAt: null },
        });
    } else {
      await db
        .update(courseAccess)
        .set({ status: 'revoked', revokedAt: new Date() })
        .where(and(eq(courseAccess.userId, record.userId), eq(courseAccess.courseId, record.courseId)));
    }

    console.log(`${action} completed for ${email.toLowerCase()} and ${courseSlug}`);
  } finally {
    await pool.end();
  }
}

const [action, email, courseSlug] = process.argv.slice(2);
if ((action !== 'grant' && action !== 'revoke') || !email || !courseSlug) {
  console.error('Usage: npm run access -- <grant|revoke> <email> <course-slug>');
  process.exit(1);
}

void updateAccess(action, email, courseSlug).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown access update error';
  console.error(message);
  process.exit(1);
});
