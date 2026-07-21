import type { Language } from '@/lib/i18n';

type CabinetCopy = {
  readonly login: {
    readonly title: string;
    readonly description: string;
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
    readonly openCourse: string;
  };
  readonly course: {
    readonly back: string;
    readonly loading: string;
    readonly errorTitle: string;
    readonly watch: string;
    readonly close: string;
    readonly loadingMedia: string;
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
    cabinet: {
      title: 'Student cabinet',
      logout: 'Log out',
      loading: 'Loading your cabinet…',
      errorTitle: 'Something went wrong',
      coursesTitle: 'My courses',
      emptyTitle: 'No courses available yet',
      emptyText: 'Your course will appear here after an administrator activates access.',
      openCourse: 'Open course',
    },
    course: {
      back: 'My courses',
      loading: 'Loading course…',
      errorTitle: 'Unable to open course',
      watch: 'Watch',
      close: 'Close',
      loadingMedia: 'Loading…',
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
    cabinet: {
      title: 'Личный кабинет',
      logout: 'Выйти',
      loading: 'Загружаем кабинет…',
      errorTitle: 'Что-то пошло не так',
      coursesTitle: 'Мои курсы',
      emptyTitle: 'Пока нет доступных курсов',
      emptyText: 'Доступ появится здесь после того, как администратор активирует его.',
      openCourse: 'Открыть курс',
    },
    course: {
      back: 'Мои курсы',
      loading: 'Загружаем курс…',
      errorTitle: 'Не удалось открыть курс',
      watch: 'Смотреть',
      close: 'Свернуть',
      loadingMedia: 'Загрузка…',
    },
    errors: {
      unavailable: 'Попробуйте ещё раз через минуту.',
      accessDenied: 'Этот курс недоступен для данного аккаунта.',
      mediaNotReady: 'Этот урок станет доступен совсем скоро.',
      storageNotConfigured: 'Видео готовится к публикации. Вернитесь немного позже.',
    },
  },
};
