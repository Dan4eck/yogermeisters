# MVP личного кабинета

## Что уже реализовано

Приложение сохраняет существующую схему деплоя: один Node.js/Express-сервис на Railway раздаёт React SPA и API на одном домене. К нему добавлены:

- PostgreSQL-схема и миграции Drizzle;
- Google OAuth с проверкой `state`, серверной сессией и `httpOnly` cookie;
- постоянное хранение сессий в PostgreSQL;
- API текущего пользователя, доступных курсов, уроков и приватного медиа;
- постоянный прогресс уроков с процентом прохождения курса;
- проверка `active course_access` на сервере;
- выдача временного presigned GET URL для приватного S3-бакета Selectel;
- страницы `/login`, `/cabinet` и `/cabinet/courses/:slug`;
- seed курса `the-yoga-method`;
- CLI для ручной выдачи и отзыва доступа;
- автоматические тесты основных правил доступа.

`media_object_key` хранит ключ объекта внутри бакета, например `courses/the-yoga-method/module-1/lesson-1.mp4`. Публичный URL и ключи Selectel в БД не хранятся. S3 credentials используются только сервером.

## Что нужно сделать вручную

### 1. Подготовить локальный `.env`

Создайте локальный файл из безопасного шаблона и замените плейсхолдеры только у себя:

```bash
cp .env.example .env
```

Сервер, миграции, seed и CLI управления доступами автоматически загружают этот файл. `.env` уже исключён из Git. Переменные, которые Railway или shell передали процессу, имеют приоритет и не перезаписываются значениями из файла.

Для локальной проверки кабинета без Google OAuth задайте `DEV_AUTH_EMAIL` с email уже созданного ученика. Этот режим работает только при `NODE_ENV=development` и `APP_URL` на `localhost` или `127.0.0.1`; в production он не включается.

### 2. Добавить PostgreSQL в Railway

1. В существующем Railway project добавьте PostgreSQL service.
2. Откройте Variables приложения и добавьте reference на `DATABASE_URL` PostgreSQL-сервиса.
3. Если миграции запускаются с локального компьютера по публичному адресу, добавьте `DATABASE_DIRECT_URL` с внешним connection URL. Не коммитьте его.
4. Для production задайте `NODE_ENV=production`, `APP_URL=https://ваш-домен` и длинный случайный `SESSION_SECRET` минимум из 32 символов.
5. Включите доступные в вашем тарифе backups/snapshots PostgreSQL и проверьте процедуру восстановления.

Приложение использует `trust proxy = 1`, поэтому `Secure` session cookie корректно работает за Railway HTTPS proxy. В production cookie имеет `httpOnly`, `SameSite=Lax` и `Secure`.

### 3. Выполнить миграцию и seed

В окружении с настроенным `DATABASE_DIRECT_URL` или `DATABASE_URL`:

```bash
npm run db:migrate
npm run db:seed
```

Миграция создаёт пользователей, курсы, модули, уроки, отдельные права на каждый курс, прогресс уроков и таблицу PostgreSQL-сессий. Seed можно запускать повторно.

### 4. Настроить Google OAuth

1. Создайте проект или выберите существующий в Google Cloud Console.
2. Настройте OAuth consent screen.
3. Создайте OAuth Client ID типа Web application.
4. Добавьте разрешённые redirect URI:
   - `http://localhost:3001/auth/google/callback` для локальной разработки;
   - `https://ваш-production-домен/auth/google/callback` для Railway.
5. Для локальной разработки задайте `APP_URL=http://localhost:3001`.
6. В Railway добавьте `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` и при необходимости точный `GOOGLE_CALLBACK_URL`.

Redirect URI должен полностью совпадать с адресом в Google, включая протокол, домен, путь и отсутствие лишнего завершающего `/`. OAuth использует серверную сессию и одноразовый `state` для защиты callback от CSRF.

### 5. Создать приватный бакет Selectel

1. В Selectel создайте приватный S3-совместимый bucket. Не разрешайте anonymous/public read.
2. Создайте отдельный сервисный ключ приложения с минимальными правами: чтение объектов только из этого бакета. Не используйте личный или административный ключ.
3. Возьмите endpoint и region из настроек конкретного S3 pool/project Selectel.
4. Настройте CORS бакета только для production-домена и localhost, если локальное воспроизведение необходимо. Разрешите `GET` и `HEAD`, заголовок `Range`, а клиенту откройте как минимум `Content-Length`, `Content-Range`, `Accept-Ranges` и `Content-Type`. Не используйте `*` для production origin.
5. Проверьте поддержку byte-range запросов: видео должно перематываться, а ответы на Range-запросы должны возвращать `206 Partial Content`.
6. Загрузите видео с непредсказуемыми объектными ключами, например `courses/the-yoga-method/<lesson-id>/video.mp4`. Для MP4 задайте метаданные объекта `Content-Type: video/mp4`, иначе браузер или CDN может некорректно обрабатывать воспроизведение.
7. Запишите только object key в `lessons.media_object_key`. Не записывайте полный URL.
8. Добавьте в Railway:
   - `S3_ENDPOINT`;
   - `S3_REGION`;
   - `S3_BUCKET`;
   - `S3_ACCESS_KEY_ID`;
   - `S3_SECRET_ACCESS_KEY`;
   - `S3_SIGNED_URL_TTL_SECONDS`, по умолчанию `5400`.
9. Перезапустите приложение.

Пример записи object key после загрузки файла:

```sql
UPDATE lessons
SET media_object_key = 'courses/the-yoga-method/module-1/lesson-1.mp4'
WHERE course_id = (SELECT id FROM courses WHERE slug = 'the-yoga-method')
  AND slug = 'module-1-lesson-1';
```

До настройки всех S3-переменных endpoint медиа безопасно отвечает `503 storage_not_configured`. Публичного fallback нет. Если у урока ещё нет object key, endpoint отвечает `409 media_not_ready`.

TTL в 5400 секунд рассчитан на уроки продолжительностью 30–50 минут с паузами: браузер может отправлять новые Range-запросы во время просмотра, и слишком короткая ссылка истечёт раньше окончания занятия. Уже выданная ссылка остаётся рабочей до конца TTL даже после отзыва доступа. Если этот риск важнее удобства длинного просмотра, уменьшите `S3_SIGNED_URL_TTL_SECONDS`, учитывая продолжительность видео и возможные паузы.

После настройки проверьте:

1. Прямой анонимный URL объекта возвращает отказ.
2. Ученик без доступа получает `403` и не получает signed URL.
3. Ученик с доступом получает signed URL и может воспроизвести/перемотать видео.
4. Signed URL перестаёт работать после указанного TTL.
5. После отзыва доступа новый signed URL получить нельзя. Уже выданная ссылка живёт до конца короткого TTL.

### 6. Выдать или отозвать доступ

Ученик должен сначала один раз войти через Google, чтобы запись пользователя появилась в БД.

```bash
npm run access -- grant student@example.com the-yoga-method
npm run access -- revoke student@example.com the-yoga-method
```

Эквивалентно это можно сделать через Railway Database View или SQL. Для выдачи доступа:

```sql
INSERT INTO course_access (user_id, course_id, status, granted_at, revoked_at)
SELECT users.id, courses.id, 'active', now(), NULL
FROM users, courses
WHERE users.email = 'student@example.com'
  AND courses.slug = 'the-yoga-method'
ON CONFLICT (user_id, course_id)
DO UPDATE SET status = 'active', granted_at = now(), revoked_at = NULL;
```

Для отзыва:

```sql
UPDATE course_access
SET status = 'revoked', revoked_at = now()
WHERE user_id = (SELECT id FROM users WHERE email = 'student@example.com')
  AND course_id = (SELECT id FROM courses WHERE slug = 'the-yoga-method');
```

### 7. Проверить production

1. Откройте `/healthz` и убедитесь, что сервер отвечает `{"ok":true}`.
2. Откройте `/login`, войдите через Google и проверьте redirect в `/cabinet`.
3. До выдачи доступа кабинет должен показать пустое состояние.
4. Выдайте доступ CLI или через SQL и обновите кабинет.
5. Откройте курс и урок с настроенным `media_object_key`.
6. Досмотрите урок до конца: рядом с названием должна появиться зелёная галочка, а процент курса — обновиться.
7. Вернитесь в `/cabinet` и убедитесь, что карточка курса показывает тот же процент.
8. Выйдите и убедитесь, что `/api/me` и `/api/courses` отвечают `401`.

## Переменные окружения

Полный безопасный шаблон находится в `.env.example`. Настоящий `.env` не должен попадать в Git. Google secret, session secret, database URL и S3 secret нельзя использовать во фронтенд-переменных с префиксом `VITE_`.

## Что отложено

- система оплат и автоматическая выдача доступа;
- полноценная CMS/admin-панель;
- загрузка файлов в Selectel через интерфейс;
- управление сроком доступа;
- email-уведомления и аналитика.

Пока данные курса редактируются seed/SQL, object keys добавляются после ручной загрузки файлов, а доступы управляются CLI или БД.
