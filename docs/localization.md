# Локализация

Сайт поддерживает два языка: `en` и `ru`.

## Где хранится язык

- Текущий язык хранится в `localStorage` по ключу `language`.
- Инициализация и сохранение языка находятся в `client/src/hooks/use-language.ts`.
- Переключатель языка находится в `client/src/components/landing-v2/Header.tsx`.
- Язык передается в страницы и секции через проп `language`.

## Где менять тексты лендинга V2

Основные тексты главной страницы, навигации, секций, карточек и страницы деталей ретрита находятся в:

`client/src/components/landing-v2/content.ts`

Файл содержит единый объект:

```ts
landingCopy.en
landingCopy.ru
```

Чтобы поменять текст в обеих версиях, меняйте одно и то же поле в блоках `en` и `ru`.

## Где менять тексты ретритов

Длинный контент ретритов и переводы хранятся в seed-файлах:

- `shared/retreats/cirali.ts`
- `shared/retreats/nepal.ts`
- `shared/retreats/mountains.ts`

Общая модель и локализация seed-данных находятся в:

- `shared/retreats/types.ts`
- `shared/retreats/index.ts`

Клиент импортирует ретриты напрямую из `@shared/retreat-content`; отдельного API и базы для ретритов больше нет.
