# Локализация (текущее состояние)

Сайт поддерживает 2 языка: `en` и `ru`.

## Где хранится язык

- Текущий язык хранится в `localStorage` по ключу `language`.
- Инициализация и переключение происходят в `/Users/daniel/Coding/Yogermeisters/client/src/pages/Home.tsx`.
- Язык передается в секции через проп `language`.

## Где менять тексты

- Основные тексты интерфейса:
  - `/Users/daniel/Coding/Yogermeisters/client/src/lib/i18n.ts`
  - Блоки: `siteCopy.en` и `siteCopy.ru`

- Тексты ретритов:
  - Базовые данные (EN): `/Users/daniel/Coding/Yogermeisters/client/src/lib/retreats.ts`
  - Русские переводы ретритов: `/Users/daniel/Coding/Yogermeisters/client/src/lib/i18n.ts` в `retreatTranslationById.ru`
  - Применение перевода: функция `localizeRetreat(...)` в `/Users/daniel/Coding/Yogermeisters/client/src/lib/i18n.ts`

## Где кнопка переключения языка

- Переключатель `EN/RU` находится в:
  - `/Users/daniel/Coding/Yogermeisters/client/src/components/Navbar.tsx`
