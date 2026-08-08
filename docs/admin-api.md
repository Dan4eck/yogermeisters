# API управления курсами и ретритами

Полный контракт для программного агента: [`docs/agent-api.md`](./agent-api.md).

Все административные маршруты принимают либо активную серверную сессию пользователя с ролью `admin`, либо единый
Bearer-ключ. Ответы со списками содержат `Cache-Control: private, no-store`.

## Единый API-ключ

Сгенерируйте криптографически случайный ключ минимум из 32 символов, например:

```bash
openssl rand -hex 32
```

Запишите полученное значение только в переменную окружения Railway и локальный `.env`:

```dotenv
ADMIN_API_KEY=полученное-секретное-значение
```

Перезапустите сервис. Агент должен передавать ключ стандартным заголовком, только через HTTPS:

```http
Authorization: Bearer полученное-секретное-значение
```

Пример проверки:

```bash
curl \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  https://ваш-домен/api/admin/retreats
```

Пример изменения ретрита:

```bash
curl \
  -X PATCH \
  -H "Authorization: Bearer $ADMIN_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"price":"€850"}' \
  https://ваш-домен/api/admin/retreats/cirali-yoga-tour
```

Ключ открывает все маршруты `/api/admin/*`: чтение и изменение ретритов, а также просмотр, выдачу и отзыв доступа
к курсам. Он не хранится в БД и не должен попадать в клиентский JavaScript, URL, Git или сообщения. Для ротации
замените `ADMIN_API_KEY` в Railway и перезапустите сервис — старый ключ сразу перестанет приниматься.

Назначить роль первому администратору можно вручную после его первого входа:

```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

## Клиенты курса

### Получить активных клиентов

```http
GET /api/admin/courses/:slug/clients
```

Ответ:

```json
{
  "clients": [
    {
      "id": "13c9c4b8-2e6f-4f68-9dd2-1b73f82ca924",
      "email": "student@example.com",
      "name": "Student",
      "avatarUrl": null,
      "grantedAt": "2026-08-01T12:00:00.000Z"
    }
  ]
}
```

### Добавить клиента

```http
POST /api/admin/courses/:slug/clients
Content-Type: application/json

{
  "email": "student@example.com"
}
```

Предварительный вход не требуется. Если email ещё отсутствует в БД, API атомарно создаёт предварительного
пользователя без Google ID и выдаёт ему доступ. При первом входе через Google с тем же подтверждённым email
предварительная запись привязывается к аккаунту, сохраняя UUID и доступы. До первого входа в списке клиентов
поле `name` равно нормализованному email, а `avatarUrl` равно `null`.

Повторный запрос безопасен: он сохраняет активный доступ или восстанавливает ранее отозванный и обновляет
`grantedAt`. Успешный ответ: `204 No Content` без JSON-тела. Для проверки результата выполните `GET` списка и
найдите нормализованный email.

### Убрать клиента

```http
DELETE /api/admin/courses/:slug/clients/:userId
```

Доступ переводится в состояние `revoked`, а не удаляется физически. Успешный ответ: `204 No Content`.

## Ретриты

Публичные страницы читают актуальные отредактированные данные через:

```http
GET /api/retreats?language=ru&view=all
GET /api/retreats/:slug?language=ru
```

Поддерживаемые языки: `en`, `ru`; представления списка: `all`, `upcoming`, `archive`. Эти два маршрута не требуют
авторизации и кешируются браузером не более 60 секунд. Если БД временно недоступна, клиент сохраняет статические
seed-данные как fallback.

### Получить фиксированный список

```http
GET /api/admin/retreats
```

Ответ содержит полные записи ретритов, включая переводы и контентные блоки:

```json
{
  "retreats": []
}
```

### Изменить существующий ретрит

```http
PATCH /api/admin/retreats/:slug
Content-Type: application/json

{
  "title": "New wording",
  "price": "€810",
  "status": "active"
}
```

Поддерживаются поля `status`, `title`, `location`, `startDate`, `endDate`, `dateLabel`, `price`, `bookingUrl`,
`coverImage`, `translations` и `blocks`. При передаче `translations` или `blocks` соответствующий вложенный объект
или массив заменяется целиком. Поля `id` и `slug` неизменяемы.

Маршрутов `POST /api/admin/retreats` и `DELETE /api/admin/retreats/:slug` намеренно нет: API не позволяет
создавать или удалять ретриты.

## Ошибки

- `400 invalid_request` — неверный JSON-контракт или значение поля;
- `401 unauthorized` — нет активной сессии или API-ключа;
- `401 invalid_api_key` — передан неверный Bearer-ключ;
- `403 admin_required` — пользователь не администратор;
- `404 course_not_found`, `access_not_found` или `retreat_not_found`;
- `503 service_not_configured` — PostgreSQL не настроен.

## Подготовка БД

После деплоя новой версии:

```bash
npm run db:migrate
npm run db:seed
```

Seed добавляет отсутствующие ретриты, но не перезаписывает уже отредактированные через API записи.
