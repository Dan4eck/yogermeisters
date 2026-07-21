import { and, asc, count, eq } from 'drizzle-orm';

import { courseAccess, courseModules, courses, lessonProgress, lessons, users } from './db/schema';
import type { Database } from './db/client';
import type { AuthenticatedUser, CourseDetails, CourseSummary, LessonMedia } from './types';

export interface GoogleProfileInput {
  readonly googleSubject: string;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;
}

export interface CourseRepository {
  findUserById(id: string): Promise<AuthenticatedUser | null>;
  findUserByEmail(email: string): Promise<AuthenticatedUser | null>;
  upsertGoogleUser(profile: GoogleProfileInput): Promise<AuthenticatedUser>;
  listCoursesForUser(userId: string): Promise<readonly CourseSummary[]>;
  getCourseForUser(userId: string, slug: string): Promise<CourseDetails | null>;
  getLessonMediaForUser(userId: string, courseSlug: string, lessonSlug: string): Promise<LessonMedia | null>;
  completeLessonForUser(userId: string, courseSlug: string, lessonSlug: string): Promise<boolean>;
}

export class DrizzleCourseRepository implements CourseRepository {
  constructor(private readonly db: Database) {}

  async findUserById(id: string): Promise<AuthenticatedUser | null> {
    const [user] = await this.db
      .select(userSelection)
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    return user ?? null;
  }

  async findUserByEmail(email: string): Promise<AuthenticatedUser | null> {
    const [user] = await this.db
      .select(userSelection)
      .from(users)
      .where(eq(users.email, email.toLowerCase()))
      .limit(1);

    return user ?? null;
  }

  async upsertGoogleUser(profile: GoogleProfileInput): Promise<AuthenticatedUser> {
    const [user] = await this.db
      .insert(users)
      .values(profile)
      .onConflictDoUpdate({
        target: users.googleSubject,
        set: {
          email: profile.email,
          name: profile.name,
          avatarUrl: profile.avatarUrl,
          updatedAt: new Date(),
        },
      })
      .returning(userSelection);

    if (!user) {
      throw new Error('Could not create the user');
    }

    return user;
  }

  async listCoursesForUser(userId: string): Promise<readonly CourseSummary[]> {
    const rows = await this.db
      .select({
        slug: courses.slug,
        title: courses.title,
        description: courses.description,
        totalLessons: count(lessons.id),
        completedLessons: count(lessonProgress.lessonId),
      })
      .from(courses)
      .innerJoin(
        courseAccess,
        and(eq(courseAccess.courseId, courses.id), eq(courseAccess.userId, userId)),
      )
      .leftJoin(
        lessons,
        and(eq(lessons.courseId, courses.id), eq(lessons.status, 'published')),
      )
      .leftJoin(
        lessonProgress,
        and(eq(lessonProgress.lessonId, lessons.id), eq(lessonProgress.userId, userId)),
      )
      .where(and(eq(courseAccess.status, 'active'), eq(courses.status, 'published')))
      .groupBy(courses.id)
      .orderBy(asc(courses.createdAt));

    return rows.map((course) => ({
      ...course,
      progressPercent: calculateProgressPercent(course.completedLessons, course.totalLessons),
    }));
  }

  async getCourseForUser(userId: string, slug: string): Promise<CourseDetails | null> {
    const [course] = await this.db
      .select({
        id: courses.id,
        slug: courses.slug,
        title: courses.title,
        description: courses.description,
      })
      .from(courses)
      .innerJoin(
        courseAccess,
        and(eq(courseAccess.courseId, courses.id), eq(courseAccess.userId, userId)),
      )
      .where(
        and(
          eq(courses.slug, slug),
          eq(courses.status, 'published'),
          eq(courseAccess.status, 'active'),
        ),
      )
      .limit(1);

    if (!course) {
      return null;
    }

    const moduleRows = await this.db
      .select({ id: courseModules.id, title: courseModules.title, sortOrder: courseModules.sortOrder })
      .from(courseModules)
      .where(and(eq(courseModules.courseId, course.id), eq(courseModules.status, 'published')))
      .orderBy(asc(courseModules.sortOrder));

    const lessonRows = await this.db
      .select({
        moduleId: lessons.moduleId,
        slug: lessons.slug,
        title: lessons.title,
        description: lessons.description,
        sortOrder: lessons.sortOrder,
        completedAt: lessonProgress.completedAt,
      })
      .from(lessons)
      .leftJoin(
        lessonProgress,
        and(eq(lessonProgress.lessonId, lessons.id), eq(lessonProgress.userId, userId)),
      )
      .where(and(eq(lessons.courseId, course.id), eq(lessons.status, 'published')))
      .orderBy(asc(lessons.sortOrder));

    const completedLessons = lessonRows.filter((lesson) => lesson.completedAt !== null).length;
    const totalLessons = lessonRows.length;

    return {
      slug: course.slug,
      title: course.title,
      description: course.description,
      completedLessons,
      totalLessons,
      progressPercent: calculateProgressPercent(completedLessons, totalLessons),
      modules: moduleRows.map((module) => ({
        title: module.title,
        sortOrder: module.sortOrder,
        lessons: lessonRows
          .filter((lesson) => lesson.moduleId === module.id)
          .map(({ moduleId: _moduleId, completedAt, ...lesson }) => ({
            ...lesson,
            completed: completedAt !== null,
          })),
      })),
    };
  }

  async getLessonMediaForUser(
    userId: string,
    courseSlug: string,
    lessonSlug: string,
  ): Promise<LessonMedia | null> {
    const [lesson] = await this.db
      .select({ objectKey: lessons.mediaObjectKey })
      .from(lessons)
      .innerJoin(courses, eq(lessons.courseId, courses.id))
      .innerJoin(
        courseAccess,
        and(eq(courseAccess.courseId, courses.id), eq(courseAccess.userId, userId)),
      )
      .where(
        and(
          eq(courses.slug, courseSlug),
          eq(lessons.slug, lessonSlug),
          eq(courses.status, 'published'),
          eq(lessons.status, 'published'),
          eq(courseAccess.status, 'active'),
        ),
      )
      .limit(1);

    return lesson ?? null;
  }

  async completeLessonForUser(
    userId: string,
    courseSlug: string,
    lessonSlug: string,
  ): Promise<boolean> {
    const [lesson] = await this.db
      .select({ id: lessons.id })
      .from(lessons)
      .innerJoin(courses, eq(lessons.courseId, courses.id))
      .innerJoin(
        courseAccess,
        and(eq(courseAccess.courseId, courses.id), eq(courseAccess.userId, userId)),
      )
      .where(
        and(
          eq(courses.slug, courseSlug),
          eq(lessons.slug, lessonSlug),
          eq(courses.status, 'published'),
          eq(lessons.status, 'published'),
          eq(courseAccess.status, 'active'),
        ),
      )
      .limit(1);

    if (!lesson) {
      return false;
    }

    await this.db
      .insert(lessonProgress)
      .values({ userId, lessonId: lesson.id })
      .onConflictDoNothing({ target: [lessonProgress.userId, lessonProgress.lessonId] });

    return true;
  }
}

function calculateProgressPercent(completedLessons: number, totalLessons: number): number {
  return totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);
}

const userSelection = {
  id: users.id,
  email: users.email,
  name: users.name,
  avatarUrl: users.avatarUrl,
  role: users.role,
} as const;
