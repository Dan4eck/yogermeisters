import type { Language } from '@/lib/i18n';

function parseLocalDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatMonthWithDayContext(date: Date, locale: string): string {
  const formatter = new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'long',
  });

  const monthPart = formatter.formatToParts(date).find((part) => part.type === 'month');
  return monthPart?.value ?? '';
}

export function formatRetreatDateLabel(
  startDate: string,
  endDate: string,
  dateLabel: string | undefined,
  locale: string,
  language: Language,
): string {
  if (dateLabel) {
    return dateLabel;
  }

  const start = parseLocalDate(startDate);
  const end = parseLocalDate(endDate);
  const dayFormat = new Intl.DateTimeFormat(locale, { day: '2-digit' });
  const monthDayFormat = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: '2-digit',
  });
  const fullFormat = new Intl.DateTimeFormat(locale, {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
  });
  const sameMonth = start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear();

  if (sameMonth && language === 'ru') {
    return `${dayFormat.format(start)} - ${dayFormat.format(end)} ${formatMonthWithDayContext(start, locale)}`;
  }

  if (sameMonth) {
    return `${monthDayFormat.format(start)} - ${dayFormat.format(end)}`;
  }

  return `${fullFormat.format(start)} - ${fullFormat.format(end)}`;
}

