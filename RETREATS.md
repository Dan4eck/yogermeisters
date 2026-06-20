# Retreat Content Guide

Основная документация по архитектуре страниц ретритов и правилам редактирования контента находится в [docs/retreats.md](/Users/daniel/myai/coding/Yogermeisters/docs/retreats.md).

Коротко:

- данные каждого ретрита живут в `shared/retreats/*.ts`
- страница ретрита собирается из блоков `paragraph`, `heading`, `image`, `callout`, `countdown`
- у `callout` есть варианты `soft`, `cta`, `outline`, `sunrise`, `lagoon`
- после изменения контента достаточно пройти `npm run check` и `npm run build`
- картинки подключаются по имени файла из `attached_assets/`

Для полной инструкции открой [docs/retreats.md](/Users/daniel/myai/coding/Yogermeisters/docs/retreats.md).
