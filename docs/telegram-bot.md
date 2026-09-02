# Telegram-бот с приветственной медитацией

Бот работает отдельным Railway Service из того же Git-репозитория, что и сайт. Сайт и бот используют общий PostgreSQL, но имеют независимые команды сборки, переменные, логи и деплои.

## Текущее поведение

1. Пользователь открывает бота и нажимает Start.
2. Telegram отправляет `/start` на защищённый webhook `POST /telegram/webhook`.
3. Бот сохраняет Telegram user ID, chat ID, username, имя, язык и параметр источника из deep link.
4. Бот атомарно регистрирует Telegram `update_id`, подписчика, enrollment версии воронки и все её delivery-шаги.
5. Первый шаг получает `scheduled_at` равный времени старта, поэтому webhook сразу отвечает Telegram, а отправку выполняет worker.
6. При первом `/start` создаются пять шагов: медитация сразу, напоминание через 30 минут, текст через 24 часа,
   напоминание через 24 часа 50 минут и текст через 48 часов.
7. Worker забирает наступившие доставки, отправляет сообщения и повторяет только подтверждённые временные ошибки.
8. Повтор одного `update_id` и последующие `/start` не создают дубли шагов уже существующего enrollment.
9. Если Telegram сообщает, что пользователь заблокировал бота, подписчик получает статус `blocked` и исключается из будущих рассылок.

Ссылки из разных источников могут выглядеть так:

```text
https://t.me/your_bot?start=instagram_reels_01
https://t.me/your_bot?start=instagram_stories_01
```

Первый и последний `start`-параметры сохраняются отдельно. Это позволяет сохранить первоначальный источник пользователя и одновременно видеть его последнее возвращение в бота.

## Хранение аудитории

Таблица `telegram_subscribers` содержит:

- внутренний UUID;
- Telegram user ID и chat ID;
- username, имя и фамилию;
- язык Telegram;
- первый и последний `start`-параметр;
- статус `active` или `blocked`;
- даты регистрации, последнего взаимодействия и блокировки.

Таблица `telegram_funnel_enrollments` фиксирует прохождение конкретной версии воронки пользователем.

Таблица `telegram_deliveries` содержит шаги enrollment: порядок, ключ контента, расписание, количество попыток, статус, ошибку и Telegram message ID. Уникальности `(enrollment_id, content_key)` и `(enrollment_id, step_order)` не позволяют создать шаг дважды. Worker не берёт следующий шаг, пока предыдущий не получил статус `sent`, поэтому накопившиеся после простоя сообщения не отправляются одновременно или в неправильном порядке.

Таблица `telegram_updates` дедуплицирует входящие webhook по Telegram `update_id`. Запись update, подписчика, enrollment и всех шагов выполняется в одной транзакции.

Статус `ambiguous` означает, что Telegram мог принять сообщение, но бот не получил надёжного подтверждения. Такие доставки не повторяются автоматически, чтобы не создавать дубли, и требуют ручной проверки.

## Миграция существующей аудитории

Миграции `0008_lush_toad_men.sql`, `0009_concerned_goliath.sql` и
`0010_schedule_existing_funnel_steps.sql` сохраняют текущий прогресс и добавляют новое расписание:

- `active` и `blocked` в `telegram_subscribers` не изменяются;
- test-доставка переносится в enrollment `welcome_meditation / test-v1`;
- настоящая медитация и follow-up переносятся в enrollment `welcome_meditation / v1`;
- старые динамические delivery `*:update:*` сохраняются в закрытом enrollment `legacy-v0` и не блокируют новую очередь;
- статусы, число попыток, ошибки, Telegram message ID и время отправки delivery сохраняются;
- шаги через 24 часа, 24 часа 50 минут и 48 часов создаются со статусом `pending` относительно исходного начала воронки;
- завершённый двухшаговый production enrollment снова становится `active`, пока новые шаги не отправлены;
- повторный запуск data migration не создаёт дубли.

Проверить состояние аудитории после миграции можно запросом:

```sql
SELECT
  subscriber.telegram_user_id,
  subscriber.status AS subscriber_status,
  enrollment.funnel_version,
  enrollment.status AS funnel_status,
  delivery.content_key,
  delivery.status AS delivery_status,
  delivery.scheduled_at,
  delivery.sent_at
FROM telegram_subscribers AS subscriber
LEFT JOIN telegram_funnel_enrollments AS enrollment ON enrollment.subscriber_id = subscriber.id
LEFT JOIN telegram_deliveries AS delivery ON delivery.enrollment_id = enrollment.id
ORDER BY subscriber.started_at, enrollment.started_at, delivery.scheduled_at;
```

## Добавление будущих шагов

Состав действующей воронки находится в `telegram-bot/content.ts`. В коде зафиксированы тексты, подпись и название аудио,
inline-кнопки, порядок шагов и задержка каждого шага от первого `/start`.

При последующем расширении воронки вместе с изменением плана нужна data migration, которая создаст отсутствующие delivery
для уже существующих enrollment. Для пользователей, у которых расчётная дата нового шага уже прошла, сначала нужно выбрать
продуктовую политику: отправить шаг сразу, пропустить его или назначить новую дату.

Telegram ID и связанные данные являются пользовательскими данными. До запуска в Instagram-воронке нужно добавить пользователю доступную политику конфиденциальности и описать использование данных для сообщений и рассылок.

## Где хранить токен

Production-токен хранится только в Variables отдельного Railway Service `telegram-bot`:

```text
Railway Project → telegram-bot → Variables → TELEGRAM_BOT_TOKEN
```

Токен нельзя добавлять в Git, исходный код, клиентские `VITE_*` переменные или Variables сервиса сайта. Для локальной разработки токен можно положить в `.env`; этот файл исключён из Git.

Токен создаётся в официальном боте `@BotFather` командой `/newbot`. Если токен случайно попал в логи, Git или переписку, его нужно сразу отозвать через BotFather и выпустить новый.

## Переменные сервиса

```env
TELEGRAM_BOT_TOKEN=token-from-botfather
TELEGRAM_WEBHOOK_SECRET=random-secret-at-least-32-characters
TELEGRAM_WEBHOOK_URL=https://bot-service-domain.up.railway.app/telegram/webhook
DATABASE_URL=reference-to-the-existing-postgresql-service
MEDITATION_AUDIO_FILE_ID=telegram-file-id
```

`TELEGRAM_WEBHOOK_SECRET` должен состоять минимум из 32 латинских букв, цифр, `_` или `-`. Его можно сгенерировать локально:

```bash
openssl rand -hex 32
```

Предпочтительный production-вариант для аудио — `MEDITATION_AUDIO_FILE_ID`: после первой загрузки Telegram хранит файл у
себя, а бот повторно использует его идентификатор. Это не текст воронки, а адрес внешнего бинарного ресурса. Временная
альтернатива — `MEDITATION_AUDIO_URL` с доступным Telegram HTTPS-адресом. Нужно задать только один из этих вариантов.

В Railway остаются только токен, секрет webhook, адрес webhook, строка подключения к базе, системный `PORT` и указатель
на аудиофайл. Контентные настройки в Variables больше не используются.

Все пять шагов воронки создаются при первом `/start`. Расписание хранится в PostgreSQL и не теряется при перезапуске
Railway. Технический интервал проверки очереди зафиксирован в коде и равен 15 секундам; worker дополнительно просыпается
сразу после принятого `/start`. Временные ошибки повторяются с увеличивающейся задержкой, максимум пять попыток; Telegram
`retry_after` имеет приоритет над локальной задержкой.

## Настройка Railway

1. В текущем Railway Project добавьте новый Service из того же GitHub-репозитория.
2. Назовите его `telegram-bot`.
3. Укажите Build Command: `npm run build:bot`.
4. Укажите Start Command: `npm run start:bot`.
5. Укажите Healthcheck Path: `/healthz`.
6. Создайте для сервиса публичный Railway domain.
7. Добавьте Variables из раздела выше. `DATABASE_URL` должен быть reference на существующий PostgreSQL Service.
8. Один раз примените миграции командой `npm run db:migrate` в окружении с доступом к базе.
9. Перезапустите `telegram-bot`. При запуске он автоматически зарегистрирует `TELEGRAM_WEBHOOK_URL` в Telegram.

Сайт продолжает использовать свои текущие команды `npm run build` и `npm start`. В сервис сайта Telegram-переменные добавлять не нужно.

## Локальная разработка

После настройки `.env`:

```bash
npm run db:migrate
npm run dev:bot
```

Telegram требует публичный HTTPS webhook, поэтому для полноценной локальной проверки нужен HTTPS tunnel. Без `TELEGRAM_WEBHOOK_URL` сервис можно запустить для проверки `/healthz`, но Telegram не будет отправлять ему обновления.

## Команды сборки и проверки

```bash
npm run check
npm test
npm run build:bot
npm run start:bot
```
