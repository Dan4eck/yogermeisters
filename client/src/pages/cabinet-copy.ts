import type { Language } from '@/lib/i18n';

type CabinetCopy = {
  readonly login: {
    readonly eyebrow: string;
    readonly title: string;
    readonly description: string;
    readonly googleAction: string;
    readonly note: string;
    readonly returnHome: string;
    readonly sideLabel: string;
    readonly sideTitle: string;
    readonly sideText: string;
  };
  readonly cabinet: {
    readonly eyebrow: string;
    readonly title: string;
    readonly logout: string;
    readonly loading: string;
    readonly errorTitle: string;
    readonly coursesTitle: string;
    readonly courseCount: (count: number) => string;
    readonly emptyTitle: string;
    readonly emptyText: string;
    readonly courseLabel: string;
    readonly openCourse: string;
    readonly practiceLabel: string;
  };
  readonly course: {
    readonly back: string;
    readonly eyebrow: string;
    readonly loading: string;
    readonly errorTitle: string;
    readonly routeTitle: string;
    readonly moduleLabel: string;
    readonly lessonLabel: string;
    readonly watch: string;
    readonly loadingMedia: string;
    readonly mediaHint: string;
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
      eyebrow: 'Student space',
      title: 'Return to your practice.',
      description: 'Your courses, lessons, and a little room to move at your own pace.',
      googleAction: 'Continue with Google',
      note: 'Use the Google email that has been given access to your course.',
      returnHome: 'Back to Yogermeisters',
      sideLabel: 'A practice archive',
      sideTitle: 'Make space for the body to remember.',
      sideText: 'Move slowly, come back often, and let the work settle in.',
    },
    cabinet: {
      eyebrow: 'Student space',
      title: 'Your practice, kept close.',
      logout: 'Log out',
      loading: 'Opening your practice space…',
      errorTitle: 'We could not open your cabinet',
      coursesTitle: 'My courses',
      courseCount: (count) => `${count} ${count === 1 ? 'course' : 'courses'} available`,
      emptyTitle: 'Your practice is on its way',
      emptyText: 'The course will appear here as soon as access is activated.',
      courseLabel: 'Online course',
      openCourse: 'Open course',
      practiceLabel: 'Practice archive',
    },
    course: {
      back: 'All courses',
      eyebrow: 'Course route',
      loading: 'Preparing the course route…',
      errorTitle: 'We could not open this course',
      routeTitle: 'Your route through the practice',
      moduleLabel: 'Module',
      lessonLabel: 'Lesson',
      watch: 'Watch lesson',
      loadingMedia: 'Preparing video…',
      mediaHint: 'Choose a lesson to open its practice.',
    },
    errors: {
      unavailable: 'Please try again in a moment.',
      accessDenied: 'This course is not available for this account.',
      mediaNotReady: 'This lesson will be available soon.',
      storageNotConfigured: 'Video is being prepared. Please return a little later.',
    },
  },
  ru: {
    login: {
      eyebrow: 'Личное пространство',
      title: 'Вернитесь к своей практике.',
      description: 'Ваши курсы, уроки и немного пространства, чтобы двигаться в своём ритме.',
      googleAction: 'Продолжить с Google',
      note: 'Используйте Google-почту, на которую был выдан доступ к курсу.',
      returnHome: 'Вернуться на сайт',
      sideLabel: 'Архив практик',
      sideTitle: 'Дайте телу время вспомнить.',
      sideText: 'Двигайтесь медленно, возвращайтесь чаще и позвольте практике укорениться.',
    },
    cabinet: {
      eyebrow: 'Личное пространство',
      title: 'Ваша практика — рядом.',
      logout: 'Выйти',
      loading: 'Открываем ваше пространство…',
      errorTitle: 'Не удалось открыть кабинет',
      coursesTitle: 'Мои курсы',
      courseCount: (count) => `${count} ${count === 1 ? 'курс' : 'курсов'} доступно`,
      emptyTitle: 'Практика уже на подходе',
      emptyText: 'Курс появится здесь, как только администратор активирует доступ.',
      courseLabel: 'Онлайн-курс',
      openCourse: 'Открыть курс',
      practiceLabel: 'Архив практик',
    },
    course: {
      back: 'Все курсы',
      eyebrow: 'Маршрут курса',
      loading: 'Собираем маршрут практики…',
      errorTitle: 'Не удалось открыть курс',
      routeTitle: 'Ваш маршрут в практике',
      moduleLabel: 'Модуль',
      lessonLabel: 'Урок',
      watch: 'Смотреть урок',
      loadingMedia: 'Готовим видео…',
      mediaHint: 'Выберите урок, чтобы открыть практику.',
    },
    errors: {
      unavailable: 'Попробуйте ещё раз через минуту.',
      accessDenied: 'Этот курс недоступен для данного аккаунта.',
      mediaNotReady: 'Этот урок станет доступен совсем скоро.',
      storageNotConfigured: 'Видео готовится к публикации. Вернитесь немного позже.',
    },
  },
};
