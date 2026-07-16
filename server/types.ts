export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly role: 'student' | 'admin';
}

export interface CourseSummary {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
}

export interface LessonSummary {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly sortOrder: number;
}

export interface CourseModuleSummary {
  readonly title: string;
  readonly sortOrder: number;
  readonly lessons: readonly LessonSummary[];
}

export interface CourseDetails extends CourseSummary {
  readonly modules: readonly CourseModuleSummary[];
}

export interface LessonMedia {
  readonly objectKey: string | null;
}
