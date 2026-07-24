import 'dotenv/config';

import { and, eq } from 'drizzle-orm';

import { createDatabase } from './client';
import { courseModules, courses, lessons } from './schema';

const courseSeed = {
  slug: 'the-yoga-method',
  title: 'the yoga method',
  description: 'Фундамент гималайской йоги – Крепкое тело, прогибы, шпагаты, пранаямы и техники глубокого расслабления',
  introMediaObjectKey: 'yoger-intro.mp4',
  modules: [
    {
      title: 'Здоровое тело — фундамент практики',
      lessons: [
        'Здоровье спины и осанка',
        'Мышцы кора, сила и прогибы',
        'Общая практика на всё тело',
        'Короткая сбалансированная практика',
      ],
    },
    {
      title: 'Гибкость без травм',
      lessons: ['Углубление прогибов', 'Углубление продольного шпагата', 'Углубление поперечного шпагата'],
    },
    {
      title: 'Техника выполнения асан',
      lessons: ['Отстройка базовых асан', 'Разбор Сурья Намаскар'],
    },
    {
      title: 'Восстановление и расслабление',
      lessons: [
        'Медитация No Mind',
        'Практика для раскрытия таза и пробуждения энергии',
        'Йога-нидра',
      ],
    },
  ],
} as const;

interface LessonSeedContent {
  readonly mediaObjectKey?: string;
  readonly description?: string;
}

const lessonContent: Readonly<Partial<Record<string, LessonSeedContent>>> = {
  'module-1-lesson-1': { mediaObjectKey: 'yoger-2305.mp4' },
  'module-1-lesson-2': { mediaObjectKey: 'yoger-1805.mp4' },
  'module-1-lesson-3': { mediaObjectKey: 'yoger-1505.mp4' },
  'module-1-lesson-4': { mediaObjectKey: 'yoger2406_f.mp4' },
  'module-2-lesson-1': { mediaObjectKey: 'yoger-1905.mp4' },
  'module-2-lesson-3': { mediaObjectKey: 'yoger-2105.mp4' },
  'module-3-lesson-1': { mediaObjectKey: 'отстрои\u0306ки-f.mp4' },
  'module-4-lesson-1': { mediaObjectKey: 'yoger2005-nomind.mp4' },
  'module-4-lesson-2': { mediaObjectKey: 'либид.mp4' },
  'module-4-lesson-3': { mediaObjectKey: 'nidra-f.mp3' },
};

const archivedLessonSlugs = ['module-4-lesson-4'] as const;

async function seed(): Promise<void> {
  const databaseUrl = process.env.DATABASE_DIRECT_URL || process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_DIRECT_URL or DATABASE_URL is required');
  }

  const { db, pool } = createDatabase(databaseUrl);
  try {
    await db.transaction(async (tx) => {
      const [course] = await tx
        .insert(courses)
        .values({
          slug: courseSeed.slug,
          title: courseSeed.title,
          description: courseSeed.description,
          introMediaObjectKey: courseSeed.introMediaObjectKey,
          status: 'published',
        })
        .onConflictDoUpdate({
          target: courses.slug,
          set: {
            title: courseSeed.title,
            description: courseSeed.description,
            introMediaObjectKey: courseSeed.introMediaObjectKey,
            status: 'published',
            updatedAt: new Date(),
          },
        })
        .returning({ id: courses.id });

      if (!course) {
        throw new Error('Could not seed the course');
      }

      for (let moduleIndex = 0; moduleIndex < courseSeed.modules.length; moduleIndex += 1) {
        const moduleSeed = courseSeed.modules[moduleIndex];
        const [courseModule] = await tx
          .insert(courseModules)
          .values({
            courseId: course.id,
            title: moduleSeed.title,
            sortOrder: moduleIndex + 1,
            status: 'published',
          })
          .onConflictDoUpdate({
            target: [courseModules.courseId, courseModules.sortOrder],
            set: { title: moduleSeed.title, status: 'published' },
          })
          .returning({ id: courseModules.id });

        if (!courseModule) {
          throw new Error(`Could not seed module ${moduleIndex + 1}`);
        }

        for (let lessonIndex = 0; lessonIndex < moduleSeed.lessons.length; lessonIndex += 1) {
          const title = moduleSeed.lessons[lessonIndex];
          const slug = `module-${moduleIndex + 1}-lesson-${lessonIndex + 1}`;
          const content = lessonContent[slug];
          const mediaObjectKey = content?.mediaObjectKey;
          const description = content?.description;
          await tx
            .insert(lessons)
            .values({
              courseId: course.id,
              moduleId: courseModule.id,
              slug,
              title,
              sortOrder: lessonIndex + 1,
              status: 'published',
              ...(mediaObjectKey ? { mediaObjectKey } : {}),
              ...(description !== undefined ? { description } : {}),
            })
            .onConflictDoUpdate({
              target: [lessons.courseId, lessons.slug],
              set: {
                moduleId: courseModule.id,
                title,
                sortOrder: lessonIndex + 1,
                status: 'published',
                ...(mediaObjectKey ? { mediaObjectKey } : {}),
                ...(description !== undefined ? { description } : {}),
              },
            });
        }
      }

      for (const lessonSlug of archivedLessonSlugs) {
        await tx
          .update(lessons)
          .set({ status: 'archived' })
          .where(and(eq(lessons.courseId, course.id), eq(lessons.slug, lessonSlug)));
      }
    });
    console.log('Seeded the-yoga-method course');
  } finally {
    await pool.end();
  }
}

void seed().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : 'Unknown seed error';
  console.error(message);
  process.exit(1);
});
