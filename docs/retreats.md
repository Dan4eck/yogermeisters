# Retreat Pages Guide

Эта инструкция описывает, как у вас сейчас устроены страницы ретритов, где лежат данные, как с ними работать инженеру и как контент-менеджеру безопасно обновлять текст, картинки и вовлекающие блоки.

## 1. Что это за система

Страница ретрита сейчас не зашита в JSX вручную. Она собирается из данных ретрита и набора контентных блоков.

У каждого ретрита есть:

- верхнеуровневые поля: `title`, `location`, `startDate`, `endDate`, `dateLabel`, `price`, `bookingUrl`, `coverImage`, `status`
- переводы на разные языки
- массив `blocks`, который определяет структуру страницы

Блоки рендерятся в том порядке, который задан через `sortOrder`.

## 2. Где лежат данные

Основные файлы:

- [shared/retreats/cirali.ts](/Users/daniel/myai/coding/Yogermeisters/shared/retreats/cirali.ts)
- [shared/retreats/nepal.ts](/Users/daniel/myai/coding/Yogermeisters/shared/retreats/nepal.ts)
- [shared/retreats/mountains.ts](/Users/daniel/myai/coding/Yogermeisters/shared/retreats/mountains.ts)
- [shared/retreats/index.ts](/Users/daniel/myai/coding/Yogermeisters/shared/retreats/index.ts)
- [shared/retreats/types.ts](/Users/daniel/myai/coding/Yogermeisters/shared/retreats/types.ts)

Файл страницы:

- [client/src/pages/RetreatPage.tsx](/Users/daniel/myai/coding/Yogermeisters/client/src/pages/RetreatPage.tsx)

Карточки ретритов на главной:

- [client/src/components/ToursSection.tsx](/Users/daniel/myai/coding/Yogermeisters/client/src/components/ToursSection.tsx)

Сервер и база:

- [server/retreats.ts](/Users/daniel/myai/coding/Yogermeisters/server/retreats.ts)
- [server/routes.ts](/Users/daniel/myai/coding/Yogermeisters/server/routes.ts)
- [shared/schema.ts](/Users/daniel/myai/coding/Yogermeisters/shared/schema.ts)

## 3. Как устроен контент ретрита

Каждый ретрит — это один объект `RetreatSeed`.

Внутри него есть массив `blocks`.

Сейчас поддерживаются такие типы блоков:

- `paragraph`
- `heading`
- `image`
- `callout`

Смысл каждого:

- `paragraph` — обычный абзац
- `heading` — подзаголовок, например день программы
- `image` — картинка по имени файла
- `callout` — вовлекающая плашка внутри описания

У `callout` есть варианты оформления через поле `variant`:

- `soft` — спокойная glass-плашка, универсальный вариант
- `cta` — вариант в стилистике нижнего CTA-блока страницы ретрита
- `outline` — более сдержанный вариант с акцентом на рамку
- `sunrise` — теплая версия с оранжево-розовым настроением
- `lagoon` — более свежая морская версия с бирюзовыми оттенками

Пример текстового блока:

```ts
{
  id: 'day-1-text',
  sortOrder: 6,
  type: 'paragraph',
  text: 'English text',
  translations: {
    ru: {
      text: 'Русский текст',
    },
  },
}
```

Пример картинки:

```ts
{
  id: 'day-1-image',
  sortOrder: 7,
  type: 'image',
  image: 'cirali-bungalows-exterior.png',
  alt: 'Retreat bungalows with mountain views in Cirali',
  translations: {
    ru: {
      alt: 'Бунгало ретрита с видом на горы в Чиралы',
    },
  },
}
```

Пример callout:

```ts
{
  id: 'booking-callout',
  sortOrder: 3,
  type: 'callout',
  variant: 'cta',
  text: 'A few spots are still open.',
  translations: {
    ru: {
      text: '✨ Осталось несколько мест.',
    },
  },
}
```

Если `variant` не указан, по умолчанию используется `soft`.

## 4. Как страница собирается в UI

Страница ретрита получает данные из API и рендерит блоки по очереди.

Логика рендера сейчас такая:

- `heading` → подзаголовок
- `paragraph` → абзац текста
- `callout` → стилизованная плашка
- `image` → картинка

То есть сам UI не решает, что именно показывать первым или вторым. Порядок полностью определяется контентом.

## 5. Как это хранится в базе

В Postgres система разложена на несколько таблиц:

- `retreats` — верхний уровень ретрита
- `retreat_blocks` — блоки контента
- `retreat_translations` — переводы полей ретрита
- `retreat_block_translations` — переводы блоков

Важно:

- отдельная таблица под `callout` не нужна
- новый тип блока хранится в уже существующей таблице `retreat_blocks`
- порядок на странице определяется `sort_order`

## 6. Что важно знать инженеру

1. Источник правды для контента сейчас — файлы в `shared/retreats/`.
2. JSX в [RetreatPage.tsx](/Users/daniel/myai/coding/Yogermeisters/client/src/pages/RetreatPage.tsx) отвечает только за рендер.
3. Если нужен новый визуальный паттерн, его лучше вводить как новый `block.type`, а не как спецполе у ретрита.
4. После правок в `shared/retreats/*.ts` нужно синхронизировать данные в базу.
5. Картинки подключаются по имени файла, а не через старый `assetKey`.
6. Для callout можно менять не только текст, но и `variant`, не меняя UI-код.

Если нужен новый тип блока, правильный путь такой:

1. добавить тип в [shared/retreats/types.ts](/Users/daniel/myai/coding/Yogermeisters/shared/retreats/types.ts)
2. разрешить его в [shared/schema.ts](/Users/daniel/myai/coding/Yogermeisters/shared/schema.ts)
3. добавить рендер в [client/src/pages/RetreatPage.tsx](/Users/daniel/myai/coding/Yogermeisters/client/src/pages/RetreatPage.tsx)
4. использовать его в нужном файле ретрита

## 7. Что важно знать контент-менеджеру

Чтобы редактировать конкретный ретрит, почти всегда нужен один файл.

Примеры:

- Чиралы: [shared/retreats/cirali.ts](/Users/daniel/myai/coding/Yogermeisters/shared/retreats/cirali.ts)
- Непал: [shared/retreats/nepal.ts](/Users/daniel/myai/coding/Yogermeisters/shared/retreats/nepal.ts)
- Горы: [shared/retreats/mountains.ts](/Users/daniel/myai/coding/Yogermeisters/shared/retreats/mountains.ts)

Обычно можно безопасно менять:

- `title`
- `location`
- `price`
- `dateLabel`
- `text`
- `alt`
- `image`
- `variant`
- `sortOrder`

Не нужно лезть в React-компоненты, если меняется только текст или картинки.

## 8. Как добавлять картинки

Картинки лежат в `attached_assets/`.

Для Чиралы:

- [attached_assets/cirali](/Users/daniel/myai/coding/Yogermeisters/attached_assets/cirali)

Для подключения картинки в блоке нужно указать только имя файла:

```ts
image: 'cirali-bicycle.jpg'
```

Важно:

- имя должно совпадать точно
- лучше использовать понятные названия файлов
- для каждой картинки желательно заполнять `alt`
- для RU и EN можно держать разные `alt`

## 9. Как менять порядок контента

За порядок отвечает `sortOrder`.

Если нужно вставить новый блок после второго абзаца:

1. создается новый блок
2. ему дается нужный `sortOrder`
3. у следующих блоков номера сдвигаются

Именно так сейчас вставлены `callout`-плашки.

Для выбора стиля callout:

- `variant: 'soft'` — нейтральный и универсальный
- `variant: 'cta'` — вариант в стиле нижнего CTA, с крупным заголовочным ритмом
- `variant: 'outline'` — более легкий и сдержанный
- `variant: 'sunrise'` — теплая, мягкая, более эмоциональная подача
- `variant: 'lagoon'` — более свежая и воздушная морская подача

## 10. Как обновить данные в базе

После редактирования файла ретрита нужно синхронизировать его в Postgres.

Команда:

```bash
cd /Users/daniel/myai/coding/Yogermeisters
set -a
source .env
set +a
npx tsx script/sync-retreat.ts cirali-yoga-tour
```

Для другого ретрита меняется только slug.

Примеры:

```bash
npx tsx script/sync-retreat.ts nepal-buddhist-pilgrimage-tour
npx tsx script/sync-retreat.ts yoga-and-mountains-retreat
```

## 11. Что уже умеет текущая система

- отдельные страницы ретритов по `slug`
- RU и EN версии
- архив и upcoming на уровне API
- изображения по именам файлов
- блоки `heading`, `paragraph`, `image`, `callout`
- детальная страница, которая собирается только из контента

## 12. Практическое правило

Если меняется только наполнение ретрита, почти всегда достаточно:

1. открыть нужный файл в `shared/retreats/`
2. поправить текст, картинки или порядок блоков
3. выполнить `sync-retreat.ts`

Если меняется способ отображения или нужен новый визуальный формат, тогда уже меняется UI и, при необходимости, типы.
