# Telegram-бот с приветственной медитацией

Бот работает отдельным Railway Service из того же Git-репозитория, что и сайт. Сайт и бот используют общий PostgreSQL, но имеют независимые команды сборки, переменные, логи и деплои.

## Текущее поведение

1. Пользователь открывает бота и нажимает Start.
2. Telegram отправляет `/start` на защищённый webhook `POST /telegram/webhook`.
3. Бот сохраняет Telegram user ID, chat ID, username, имя, язык и параметр источника из deep link.
4. Бот резервирует постоянную выдачу `welcome_meditation_v1` для пользователя.
5. Бот отправляет медитацию только при первом `/start` и сохраняет Telegram message ID и время успешной доставки.
6. После успешной отправки бот создаёт в PostgreSQL отложенную доставку follow-up сообщения через 30 минут.
7. Встроенный worker забирает наступившие доставки, отправляет сообщение и повторяет временно неудачные попытки.
8. Все последующие `/start` не отправляют медитацию и не запускают follow-up повторно.
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

Таблица `telegram_deliveries` содержит журнал отправок, количество попыток, статус, ошибку и Telegram message ID. В будущем эта таблица станет основой для сегментированных рассылок и повторных попыток.

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
MEDITATION_CAPTION=Ваша медитация
MEDITATION_FOLLOW_UP_DELAY_MINUTES=30
MEDITATION_FOLLOW_UP_MESSAGE=Сообщение после практики
TELEGRAM_WORKER_POLL_SECONDS=15
TELEGRAM_TEST_MODE=false
TELEGRAM_TEST_MESSAGE=Бот работает. Аудиозапись с медитацией будет добавлена немного позже.
```

`TELEGRAM_WEBHOOK_SECRET` должен состоять минимум из 32 латинских букв, цифр, `_` или `-`. Его можно сгенерировать локально:

```bash
openssl rand -hex 32
```

Предпочтительный production-вариант для аудио — `MEDITATION_AUDIO_FILE_ID`: после первой загрузки Telegram хранит файл у себя, а бот повторно использует его идентификатор. Временная альтернатива — `MEDITATION_AUDIO_URL` с доступным Telegram HTTPS-адресом. Нужно задать только один из этих вариантов.

Для временного запуска без аудио задайте `TELEGRAM_TEST_MODE=true`. После `/start` бот сохранит пользователя и отправит
`TELEGRAM_TEST_MESSAGE`. Тестовая доставка хранится отдельно от медитации, поэтому после подключения аудио пользователь
сможет получить настоящую запись.

Перед production-запуском с медитацией задайте `TELEGRAM_TEST_MODE=false` и добавьте аудио. Без аудио и без тестового режима
сервис не запускается.

Follow-up создаётся только после успешной отправки настоящего аудио. Расписание хранится в PostgreSQL и не теряется при
перезапуске Railway. Worker проверяет очередь каждые `TELEGRAM_WORKER_POLL_SECONDS` секунд. Временные ошибки повторяются с
увеличивающейся задержкой, максимум пять попыток.

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
