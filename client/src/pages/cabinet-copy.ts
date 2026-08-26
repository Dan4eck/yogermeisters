import type { Language } from '@/lib/i18n';

type CabinetCopy = {
  readonly login: {
    readonly title: string;
    readonly description: string;
    readonly googleAction: string;
    readonly returnHome: string;
  };
  readonly freeLessonLogin: {
    readonly title: string;
    readonly googleAction: string;
    readonly returnHome: string;
  };
  readonly cabinet: {
    readonly title: string;
    readonly logout: string;
    readonly loading: string;
    readonly errorTitle: string;
    readonly coursesTitle: string;
    readonly emptyTitle: string;
    readonly emptyText: string;
    readonly catalogTitle: string;
    readonly catalogEmpty: string;
    readonly catalogCourseDescription: string;
    readonly progressLabel: string;
    readonly openCourse: string;
    readonly viewCourse: string;
  };
  readonly course: {
    readonly back: string;
    readonly loading: string;
    readonly errorTitle: string;
    readonly watch: string;
    readonly read: string;
    readonly close: string;
    readonly loadingMedia: string;
    readonly introLesson: string;
    readonly completed: string;
    readonly progressSaveError: string;
  };
  readonly errors: {
    readonly unavailable: string;
    readonly accessDenied: string;
    readonly mediaNotReady: string;
    readonly storageNotConfigured: string;
  };
};

export const cabinetCopy: Record<Language, CabinetCopy> = {
  en: {
    login: {
      title: 'Sign in to start learning',
      description: 'You’re almost a Yogermeister. Just one more step!',
      googleAction: 'Sign in with Google',
      returnHome: 'Back to home',
    },
    freeLessonLogin: {
      title: 'Sign in to get your free lesson',
      googleAction: 'Sign in with Google',
      returnHome: 'Back to home',
    },
    cabinet: {
      title: 'Yoga shala',
      logout: 'Log out',
      loading: 'Loading yoga shala...',
      errorTitle: 'Something went wrong',
      coursesTitle: 'My courses',
      emptyTitle: 'You don’t have any courses yet',
      emptyText: 'Choose one from the catalog below:',
      catalogTitle: 'Courses available to purchase',
      catalogEmpty: 'You already have access to every available course.',
      catalogCourseDescription: 'A Himalayan yoga course for a strong body, safe flexibility, and deep relaxation.',
      progressLabel: 'Karma earned',
      openCourse: 'Open course',
      viewCourse: 'View course',
    },
    course: {
      back: 'My courses',
      loading: 'Loading course...',
      errorTitle: 'Unable to open course',
      watch: 'Watch',
      read: 'Read',
      close: 'Close',
      loadingMedia: 'Loading…',
      introLesson: 'Intro lesson',
      completed: 'Completed',
      progressSaveError: 'Could not save your progress. Please try again.',
    },
    errors: {
      unavailable: 'Please try again in a moment.',
      accessDenied: 'This course is not available for this account.',
      mediaNotReady: 'This lesson will be available soon.',
      storageNotConfigured: 'Video is being prepared. Please return later.',
    },
  },
  ru: {
    login: {
      title: 'Войдите, чтобы начать обучение',
      description: 'Ты уже почти йогермейстер. Еще один шаг!',
      googleAction: 'Войти через Google',
      returnHome: 'Вернуться на сайт',
    },
    freeLessonLogin: {
      title: 'Авторизуйтесь, чтобы получить бесплатный урок',
      googleAction: 'Войти через Google',
      returnHome: 'Вернуться на сайт',
    },
    cabinet: {
      title: 'Йога-шала',
      logout: 'Выйти',
      loading: 'Загрузка йога-шалы...',
      errorTitle: 'Что-то пошло не так',
      coursesTitle: 'Мои курсы',
      emptyTitle: 'У тебя пока нет курсов',
      emptyText: 'Выбери подходящий курс из каталога ниже.',
      catalogTitle: 'Курсы, доступные к покупке',
      catalogEmpty: 'У тебя уже есть доступ ко всем курсам.',
      catalogCourseDescription: 'Курс гималайской йоги для крепкого тела, безопасной гибкости и глубокого расслабления.',
      progressLabel: 'Наработано кармы',
      openCourse: 'Открыть курс',
      viewCourse: 'Посмотреть курс',
    },
    course: {
      back: 'Мои курсы',
      loading: 'Загрузка курса...',
      errorTitle: 'Не удалось открыть курс',
      watch: 'Смотреть',
      read: 'Читать',
      close: 'Свернуть',
      loadingMedia: 'Загрузка…',
      introLesson: 'Вводный урок',
      completed: 'Пройдено',
      progressSaveError: 'Не удалось сохранить прогресс. Попробуйте ещё раз.',
    },
    errors: {
      unavailable: 'Попробуйте ещё раз через минуту.',
      accessDenied: 'Этот курс недоступен для данного аккаунта.',
      mediaNotReady: 'Этот урок станет доступен совсем скоро.',
      storageNotConfigured: 'Видео готовится к публикации. Вернитесь немного позже.',
    },
  },
};
