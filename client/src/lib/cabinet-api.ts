export interface CabinetUser {
  readonly id: string;
  readonly email: string;
  readonly name: string;
  readonly avatarUrl: string | null;
  readonly role: 'student' | 'admin';
}

export interface CabinetCourse {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
}

export interface CabinetLesson {
  readonly slug: string;
  readonly title: string;
  readonly description: string;
  readonly sortOrder: number;
}

export interface CabinetCourseDetails extends CabinetCourse {
  readonly modules: readonly {
    readonly title: string;
    readonly sortOrder: number;
    readonly lessons: readonly CabinetLesson[];
  }[];
}

export class ApiError extends Error {
  constructor(readonly status: number, readonly code: string | undefined, message: string) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { Accept: 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => ({})) as { code?: string; message?: string };
    throw new ApiError(response.status, body.code, body.message || 'Request could not be completed');
  }

  return response.status === 204 ? undefined as T : response.json() as Promise<T>;
}
