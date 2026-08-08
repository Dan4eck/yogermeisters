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
    const normalizedEmail = email.toLowerCase();
    if (action === 'grant') {
      await db
        .insert(users)
        .values({ email: normalizedEmail, name: normalizedEmail })
        .onConflictDoUpdate({
          target: users.email,
          set: { updatedAt: new Date() },
        });
    }

    const [record] = await db
      .select({ userId: users.id, courseId: courses.id })
      .from(users)
      .crossJoin(courses)
      .where(and(eq(users.email, normalizedEmail), eq(courses.slug, courseSlug)))
      .limit(1);

    if (!record) {
      throw new Error(action === 'grant' ? 'Course was not found.' : 'User or course was not found.');
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

    console.log(`${action} completed for ${normalizedEmail} and ${courseSlug}`);
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
