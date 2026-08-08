import { and, asc, eq } from 'drizzle-orm';

import type { RetreatEditableData, RetreatSeed, RetreatUpdate } from '@shared/retreats';

import type { Database } from './db/client';
import { courseAccess, courses, retreats, users } from './db/schema';

export interface CourseClient {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly grantedAt: Date;
}

export type CourseAccessChangeResult =
  | 'changed'
  | 'course_not_found'
  | 'access_not_found';

export interface AdminRepository {
  listCourseClients(courseSlug: string): Promise<readonly CourseClient[] | null>;
  grantCourseAccess(courseSlug: string, email: string): Promise<CourseAccessChangeResult>;
  revokeCourseAccess(courseSlug: string, userId: string): Promise<CourseAccessChangeResult>;
  listRetreats(): Promise<readonly RetreatSeed[]>;
  updateRetreat(slug: string, update: RetreatUpdate): Promise<RetreatSeed | null>;
}

export class DrizzleAdminRepository implements AdminRepository {
  constructor(private readonly db: Database) {}

  async listCourseClients(courseSlug: string): Promise<readonly CourseClient[] | null> {
    const [course] = await this.db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.slug, courseSlug))
      .limit(1);

    if (!course) {
      return null;
    }

    return this.db
      .select({
        id: users.id,
        email: users.email,
        name: users.name,
        avatarUrl: users.avatarUrl,
        grantedAt: courseAccess.grantedAt,
      })
      .from(courseAccess)
      .innerJoin(users, eq(users.id, courseAccess.userId))
      .where(and(eq(courseAccess.courseId, course.id), eq(courseAccess.status, 'active')))
      .orderBy(asc(users.name), asc(users.email));
  }

  async grantCourseAccess(courseSlug: string, email: string): Promise<CourseAccessChangeResult> {
    return this.db.transaction(async (tx) => {
      const [course] = await tx
        .select({ id: courses.id })
        .from(courses)
        .where(eq(courses.slug, courseSlug))
        .limit(1);
      if (!course) {
        return 'course_not_found';
      }

      const normalizedEmail = email.toLowerCase();
      const [user] = await tx
        .insert(users)
        .values({ email: normalizedEmail, name: normalizedEmail })
        .onConflictDoUpdate({
          target: users.email,
          set: { updatedAt: new Date() },
        })
        .returning({ id: users.id });

      if (!user) {
        throw new Error('Could not create or find the course client');
      }

      await tx
        .insert(courseAccess)
        .values({ userId: user.id, courseId: course.id })
        .onConflictDoUpdate({
          target: [courseAccess.userId, courseAccess.courseId],
          set: { status: 'active', grantedAt: new Date(), revokedAt: null },
        });

      return 'changed';
    });
  }

  async revokeCourseAccess(courseSlug: string, userId: string): Promise<CourseAccessChangeResult> {
    const [course] = await this.db
      .select({ id: courses.id })
      .from(courses)
      .where(eq(courses.slug, courseSlug))
      .limit(1);
    if (!course) {
      return 'course_not_found';
    }

    const changed = await this.db
      .update(courseAccess)
      .set({ status: 'revoked', revokedAt: new Date() })
      .where(and(
        eq(courseAccess.courseId, course.id),
        eq(courseAccess.userId, userId),
        eq(courseAccess.status, 'active'),
      ))
      .returning({ userId: courseAccess.userId });

    return changed.length > 0 ? 'changed' : 'access_not_found';
  }

  async listRetreats(): Promise<readonly RetreatSeed[]> {
    const rows = await this.db
      .select({ id: retreats.id, slug: retreats.slug, data: retreats.data })
      .from(retreats)
      .orderBy(asc(retreats.id));

    return rows.map(({ id, slug, data }) => ({ id, slug, ...data }));
  }

  async updateRetreat(slug: string, update: RetreatUpdate): Promise<RetreatSeed | null> {
    return this.db.transaction(async (tx) => {
      const [current] = await tx
        .select({ id: retreats.id, slug: retreats.slug, data: retreats.data })
        .from(retreats)
        .where(eq(retreats.slug, slug))
        .limit(1)
        .for('update');

      if (!current) {
        return null;
      }

      const data: RetreatEditableData = { ...current.data, ...update };
      await tx
        .update(retreats)
        .set({ data, updatedAt: new Date() })
        .where(eq(retreats.id, current.id));

      return { id: current.id, slug: current.slug, ...data };
    });
  }
}
