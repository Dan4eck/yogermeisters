# Retreat Content Guide

Основная документация по архитектуре страниц ретритов и правилам редактирования контента находится в [docs/retreats.md](/Users/daniel/myai/coding/Yogermeisters/docs/retreats.md).

Коротко:

- исходные данные каждого ретрита живут в `shared/retreats/*.ts`, рабочие данные — в PostgreSQL
- страница ретрита собирается из блоков `paragraph`, `heading`, `image`, `callout`, `countdown`
- у `callout` есть варианты `soft`, `cta`, `outline`, `sunrise`, `lagoon`
- рабочий контент редактируется через admin API, описанный в `docs/admin-api.md`
- картинки подключаются по имени файла из `attached_assets/`

Для полной инструкции открой [docs/retreats.md](/Users/daniel/myai/coding/Yogermeisters/docs/retreats.md).
