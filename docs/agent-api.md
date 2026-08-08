# Yogermeisters Agent API Contract

Этот документ — контракт для программного агента, который управляет существующими ретритами и доступом клиентов
к курсам. Он описывает фактически реализованное API.

## 1. Подключение

Агенту нужны два секрета/параметра:

```dotenv
YOGERMEISTERS_API_BASE_URL=https://ваш-домен
YOGERMEISTERS_ADMIN_API_KEY=секретное-значение-ADMIN_API_KEY
```

Названия переменных на стороне агента рекомендательные. На сервере ключ хранится в `ADMIN_API_KEY`.

Каждый запрос к `/api/admin/*` должен передавать:

```http
Authorization: Bearer <API_KEY>
Accept: application/json
```

Для запросов с JSON-телом дополнительно требуется:

```http
Content-Type: application/json
```

Ключ разрешено передавать только через HTTPS и только в заголовке `Authorization`. Запрещено помещать его в URL,
query string, JSON-тело, логи, сообщения или клиентский JavaScript.

Проверка подключения:

```bash
curl \
  --fail-with-body \
  -H "Authorization: Bearer $YOGERMEISTERS_ADMIN_API_KEY" \
  -H "Accept: application/json" \
  "$YOGERMEISTERS_API_BASE_URL/api/admin/retreats"
```

## 2. Карта API

| Метод | Путь | Авторизация | Назначение |
|---|---|---|---|
| `GET` | `/api/retreats?language=en&view=all` | нет | Публичный локализованный список |
| `GET` | `/api/retreats/:slug?language=en` | нет | Публичная локализованная карточка |
| `GET` | `/api/admin/retreats` | Bearer | Полные редактируемые ретриты |
| `PATCH` | `/api/admin/retreats/:slug` | Bearer | Изменить существующий ретрит |
| `GET` | `/api/admin/courses/:slug/clients` | Bearer | Активные клиенты курса |
| `POST` | `/api/admin/courses/:slug/clients` | Bearer | Выдать доступ по email |
| `DELETE` | `/api/admin/courses/:slug/clients/:userId` | Bearer | Отозвать активный доступ |

API не содержит операций создания и удаления ретритов. Запросы `POST /api/admin/retreats` и
`DELETE /api/admin/retreats/:slug` не поддерживаются.

## 3. Общие типы

```ts
type RetreatLanguage = 'en' | 'ru';
type RetreatStatus = 'draft' | 'active' | 'archived';
type RetreatView = 'upcoming' | 'archive' | 'all';

type RetreatBlockType =
  | 'paragraph'
  | 'image'
  | 'heading'
  | 'callout'
  | 'countdown';

type RetreatCalloutVariant =
  | 'soft'
  | 'cta'
  | 'outline'
  | 'sunrise'
  | 'lagoon';

interface ErrorResponse {
  code?: string;
  message: string;
}
```

## 4. Полная административная модель ретрита

`GET /api/admin/retreats` возвращает исходную редактируемую структуру. Только этот endpoint следует использовать
перед изменением `translations` или `blocks`.

```ts
interface RetreatTranslation {
  title: string;
  location: string;
  dateLabel?: string;
}

interface RetreatBlockTranslation {
  text?: string;
  alt?: string;
}

interface RetreatBlock {
  id: string;
  sortOrder: number;
  type: RetreatBlockType;
  variant?: RetreatCalloutVariant;
  deadline?: string;
  priceCurrent?: string;
  priceCompare?: string;
  text?: string;
  image?: string;
  alt?: string;
  translations?: Partial<Record<RetreatLanguage, RetreatBlockTranslation>>;
}

interface Retreat {
  id: number;
  slug: string;
  status: RetreatStatus;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  dateLabel?: string;
  price: string;
  bookingUrl: string;
  coverImage: string;
  translations?: Partial<Record<RetreatLanguage, RetreatTranslation>>;
  blocks: RetreatBlock[];
}

interface AdminRetreatListResponse {
  retreats: Retreat[];
}

type RetreatUpdate = Partial<Omit<Retreat, 'id' | 'slug'>>;

interface RetreatUpdateResponse {
  retreat: Retreat;
}
```

### Ограничения полей

- `id` и `slug` неизменяемы и запрещены в `PATCH`-теле.
- Все переданные строковые поля должны быть непустыми строками. `null` и `""` не принимаются.
- `startDate` и `endDate` передаются в формате `YYYY-MM-DD`.
- `bookingUrl` должен начинаться с `http://` или `https://`.
- Разрешённые языки переводов: только `en` и `ru`.
- Если передан `translations.en` или `translations.ru` верхнего уровня, внутри обязательны одновременно `title`
  и `location`; `dateLabel` необязателен.
- `blocks` должен быть массивом; допустим пустой массив.
- Каждый блок обязан содержать непустой `id`, целочисленный `sortOrder >= 0` и поддерживаемый `type`.
- Сервер отклоняет неизвестные поля на всех уровнях редактируемого JSON.

### Назначение блоков

| `type` | Основные поля | Назначение |
|---|---|---|
| `paragraph` | `text`, `translations.*.text` | Абзац текста |
| `heading` | `text`, `translations.*.text` | Заголовок секции |
| `image` | `image`, `alt`, `translations.*.alt` | Изображение из карты ресурсов приложения |
| `callout` | `text`, `variant`, `translations.*.text` | Выделенный текстовый блок |
| `countdown` | `deadline`, `priceCurrent`, `priceCompare` | Таймер и цены |

Поле `deadline` должно быть строкой, которую JavaScript может разобрать как дату, предпочтительно ISO 8601:

```text
2026-10-01T00:00:00+03:00
```

`image` и `coverImage` содержат имя/ключ уже известного приложению файла, а не Base64 и не бинарные данные. Этот API
не загружает и не удаляет файлы изображений.

## 5. Получение полных ретритов

```http
GET /api/admin/retreats
Authorization: Bearer <API_KEY>
Accept: application/json
```

Успех: `200 OK`.

```json
{
  "retreats": [
    {
      "id": 1,
      "slug": "cirali-yoga-tour",
      "status": "active",
      "title": "Cirali Yoga Tour",
      "location": "Cirali, Lycian Coast, Turkey",
      "startDate": "2026-10-10",
      "endDate": "2026-10-16",
      "price": "€790",
      "bookingUrl": "https://t.me/AnastasiaPagliacci",
      "coverImage": "cirali-beach-cover.jpeg",
      "translations": {
        "ru": {
          "title": "Чиралы Йога Тур",
          "location": "Чиралы, Ликийское побережье, Турция"
        }
      },
      "blocks": [
        {
          "id": "intro",
          "sortOrder": 1,
          "type": "paragraph",
          "text": "A seven-day retreat...",
          "translations": {
            "ru": {
              "text": "Семидневный ретрит..."
            }
          }
        }
      ]
    }
  ]
}
```

Порядок ретритов соответствует `id`. Для выбора записи агент должен использовать точное совпадение `slug`.

## 6. Изменение ретрита

```http
PATCH /api/admin/retreats/:slug
Authorization: Bearer <API_KEY>
Accept: application/json
Content-Type: application/json
```

Тело должно содержать минимум одно из полей:

```text
status, title, location, startDate, endDate, dateLabel, price,
bookingUrl, coverImage, translations, blocks
```

Простое изменение верхнеуровневых полей:

```json
{
  "price": "€850",
  "status": "active"
}
```

Успех: `200 OK`. Ответ содержит полный обновлённый `Retreat`:

```json
{
  "retreat": {
    "id": 1,
    "slug": "cirali-yoga-tour",
    "status": "active",
    "title": "Cirali Yoga Tour",
    "location": "Cirali, Lycian Coast, Turkey",
    "startDate": "2026-10-10",
    "endDate": "2026-10-16",
    "price": "€850",
    "bookingUrl": "https://t.me/AnastasiaPagliacci",
    "coverImage": "cirali-beach-cover.jpeg",
    "blocks": []
  }
}
```

### Семантика объединения

Поля верхнего уровня объединяются с текущим документом:

```ts
updatedData = { ...currentData, ...requestBody };
```

Это означает:

- `{ "price": "€850" }` меняет только цену;
- переданный `translations` полностью заменяет весь объект переводов;
- переданный `blocks` полностью заменяет весь массив блоков;
- частичного обновления одного элемента `blocks` по `id` сейчас нет;
- удалить опциональное строковое поле через `null` или пустую строку сейчас нельзя.

## 7. Безопасное изменение блоков

Для добавления, удаления, перестановки или редактирования фотографии/абзаца агент обязан выполнять
read–modify–write:

1. Вызвать `GET /api/admin/retreats`.
2. Найти ретрит по точному `slug`.
3. Скопировать весь текущий массив `blocks`.
4. Изменить копию, сохранив все остальные блоки и их переводы.
5. Нормализовать `sortOrder` в требуемой последовательности.
6. Отправить полный массив через `PATCH`.
7. Проверить полный объект в ответе или повторным `GET`.

Нельзя строить новое значение `blocks` из публичного `/api/retreats`: публичная проекция не содержит `sortOrder`
и исходных переводов.

### Добавить фотографию

```json
{
  "blocks": [
    {
      "id": "intro",
      "sortOrder": 1,
      "type": "paragraph",
      "text": "Existing paragraph"
    },
    {
      "id": "garden-photo",
      "sortOrder": 2,
      "type": "image",
      "image": "cirali-garden-mountains.jpeg",
      "alt": "Garden and mountains in Cirali",
      "translations": {
        "ru": {
          "alt": "Сад и горы в Чиралы"
        }
      }
    }
  ]
}
```

Перед отправкой необходимо убедиться, что `cirali-garden-mountains.jpeg` уже поддерживается картой ресурсов
приложения. Запись неизвестного имени пройдёт JSON-валидацию, но изображение не отобразится на сайте.

### Удалить фотографию или абзац

Удалите соответствующий объект из локальной копии `blocks`, перенумеруйте `sortOrder` и отправьте оставшийся массив
целиком. Удаление блока изображения не удаляет файл из хранилища или репозитория.

### Переставить блоки

Измените `sortOrder` у требуемых элементов и отправьте весь массив. Публичная страница сортирует блоки по
`sortOrder`, а не обязательно по физическому порядку объектов в JSON-массиве. Рекомендуется сохранять одинаковый
физический порядок массива и значения `sortOrder`.

### Изменить формулировку одного блока

Найдите блок по `id`, измените его `text` и/или `translations`, сохранив остальные поля блока и все остальные
элементы массива. Затем отправьте полный `blocks`.

### Конкурентное редактирование

API не возвращает версию документа и не поддерживает `ETag`/`If-Match`. Если два агента отправят разные полные
массивы `blocks`, сохранится последний запрос. Поэтому агент должен читать ретрит непосредственно перед изменением
и не выполнять параллельные изменения одного `slug`.

## 8. Публичная проекция ретритов

Публичные endpoints не требуют ключа и предназначены для проверки отображаемого результата.

```ts
interface PublicRetreatBlock {
  id: string;
  type: RetreatBlockType;
  variant?: RetreatCalloutVariant;
  deadline?: string;
  priceCurrent?: string;
  priceCompare?: string;
  text?: string;
  image?: string;
  alt?: string;
}

interface PublicRetreat {
  id: number;
  slug: string;
  status: RetreatStatus;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  dateLabel?: string;
  price: string;
  bookingUrl: string;
  coverImage: string;
  postBlocks: PublicRetreatBlock[];
}
```

### Список

```http
GET /api/retreats?language=ru&view=all
```

Query parameters:

| Параметр | Допустимые значения | По умолчанию |
|---|---|---|
| `language` | `en`, `ru` | `en` |
| `view` | `all`, `upcoming`, `archive` | `all` |

```ts
interface PublicRetreatListResponse {
  view: RetreatView;
  language: RetreatLanguage;
  retreats: PublicRetreat[];
}
```

`upcoming` возвращает активные ретриты, дата окончания которых ещё не прошла. `archive` возвращает ретриты со
статусом `archived` или прошедшей датой окончания. `all` не фильтрует по статусу или дате.

### Один ретрит

```http
GET /api/retreats/:slug?language=ru
```

Успех: `200 OK`.

```json
{
  "retreat": {
    "id": 1,
    "slug": "cirali-yoga-tour",
    "status": "active",
    "title": "Чиралы Йога Тур",
    "location": "Чиралы, Ликийское побережье, Турция",
    "startDate": "2026-10-10",
    "endDate": "2026-10-16",
    "price": "€850",
    "bookingUrl": "https://t.me/AnastasiaPagliacci",
    "coverImage": "cirali-beach-cover.jpeg",
    "postBlocks": []
  }
}
```

Переводы уже применены. Объекты `translations`, `blocks` и `sortOrder` в публичном ответе отсутствуют.

## 9. Клиенты курса

```ts
interface CourseClient {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  grantedAt: string;
}

interface CourseClientListResponse {
  clients: CourseClient[];
}
```

`id` — UUID пользователя. `grantedAt` сериализуется как ISO 8601 timestamp.
До первого Google-входа предварительный пользователь также присутствует в списке: его `name` равен email,
а `avatarUrl` равен `null`. После входа эти поля обновляются из Google-профиля, UUID и доступы не меняются.

### Получить активных клиентов

```http
GET /api/admin/courses/:courseSlug/clients
Authorization: Bearer <API_KEY>
Accept: application/json
```

Успех: `200 OK`.

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

Возвращаются только доступы со статусом `active`, отсортированные по имени и email.

### Выдать доступ

```http
POST /api/admin/courses/:courseSlug/clients
Authorization: Bearer <API_KEY>
Accept: application/json
Content-Type: application/json

{
  "email": "student@example.com"
}
```

Правила:

- тело содержит только поле `email`;
- email приводится к нижнему регистру;
- если пользователь ещё не входил через Google, API создаёт предварительную запись в `users` без Google ID;
- при первом Google-входе предварительная запись привязывается по подтверждённому email, сохраняя доступы;
- повторная выдача активирует ранее отозванный доступ и обновляет `grantedAt`.

`user_not_found` при выдаче больше не возвращается. Отсутствие пользователя до запроса является штатным сценарием.

Успех: `204 No Content`. У ответа нет JSON-тела; агент не должен пытаться его разобрать.

### Workflow добавления нового пользователя в курс

Предварительная авторизация не требуется. Агент выполняет:

1. Получить точный email пользователя у оператора.
2. Выдать доступ запросом `POST /api/admin/courses/:courseSlug/clients`.
3. Получить `GET /api/admin/courses/:courseSlug/clients`.
4. Проверить, что в ответе присутствует клиент с тем же email и UUID.

Пользователь сможет открыть курс после входа через Google с тем же email, на который выдан доступ.

Полный запрос выдачи:

```bash
curl \
  --fail-with-body \
  -X POST \
  -H "Authorization: Bearer $YOGERMEISTERS_ADMIN_API_KEY" \
  -H "Accept: application/json" \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com"}' \
  "$YOGERMEISTERS_API_BASE_URL/api/admin/courses/the-yoga-method/clients"
```

Ожидаемый результат — `204 No Content`. Затем проверить список:

```bash
curl \
  --fail-with-body \
  -H "Authorization: Bearer $YOGERMEISTERS_ADMIN_API_KEY" \
  -H "Accept: application/json" \
  "$YOGERMEISTERS_API_BASE_URL/api/admin/courses/the-yoga-method/clients"
```

Повторный `POST` для существующего клиента безопасно восстанавливает ранее отозванный доступ.

### Отозвать доступ

Сначала получите список клиентов, чтобы взять точный UUID пользователя:

```http
DELETE /api/admin/courses/:courseSlug/clients/:userId
Authorization: Bearer <API_KEY>
Accept: application/json
```

`userId` обязан быть UUID. Успех: `204 No Content`, без JSON-тела. Запись доступа не удаляется: её статус становится
`revoked`, а `revokedAt` получает текущее время.

Повторный `DELETE` для уже отозванного доступа возвращает `404 access_not_found`.

## 10. Ошибки

Типичная ошибка:

```json
{
  "code": "invalid_request",
  "message": "status must be draft, active, or archived"
}
```

| HTTP | `code` | Значение | Действие агента |
|---|---|---|---|
| `400` | `invalid_request` | Неверное тело, query или path-параметр | Исправить запрос, не повторять без изменений |
| `401` | `unauthorized` | Не передана авторизация | Передать Bearer-заголовок |
| `401` | `invalid_api_key` | Ключ неверен или отозван | Остановиться и запросить новый ключ |
| `403` | `admin_required` | Сессионный пользователь не admin | Использовать Bearer-ключ или admin-сессию |
| `404` | `course_not_found` | Курс не найден | Проверить `courseSlug` |
| `404` | `access_not_found` | Нет активного доступа для отзыва | Обновить список клиентов |
| `404` | `retreat_not_found` | Ретрит не найден | Обновить список и проверить `slug` |
| `503` | `service_not_configured` | PostgreSQL не настроен | Не выполнять запись, сообщить оператору |

Необработанные серверные ошибки могут вернуть:

```json
{
  "message": "Internal Server Error"
}
```

Для `5xx` агент может сделать ограниченное число повторов с exponential backoff. После ответа с неопределённым
результатом на `PATCH`, `POST` или `DELETE` сначала перечитайте соответствующий ресурс, а не повторяйте изменение
вслепую.

## 11. Рекомендуемый алгоритм агента

1. Никогда не выводить API-ключ в ответах и логах.
2. Перед изменением ретрита получить `GET /api/admin/retreats`.
3. Проверить точный `slug` и сохранить копию исходного объекта для аудита/отката.
4. Для простых полей отправлять минимальный `PATCH`.
5. Для `translations` и `blocks` отправлять полное новое значение соответствующего поля.
6. Не изменять `id` и `slug`, не создавать и не удалять ретриты.
7. После записи проверить `200`-ответ и публичную локализованную проекцию.
8. При добавлении нового клиента сразу выдать доступ по точному email, затем проверить результат через список.
   Предупредить, что для открытия курса пользователь должен войти через Google с тем же email.
9. Перед отзывом доступа повторно получить список активных клиентов и проверить email + UUID.
10. Не выполнять параллельные записи в один ретрит.

## 12. Минимальный TypeScript-клиент

```ts
interface AgentApiConfig {
  baseUrl: string;
  apiKey: string;
}

async function agentRequest<T>(
  config: AgentApiConfig,
  path: string,
  init: RequestInit = {},
): Promise<T | undefined> {
  const response = await fetch(new URL(path, config.baseUrl), {
    ...init,
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${config.apiKey}`,
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...init.headers,
    },
  });

  if (!response.ok) {
    const error = await response.json() as ErrorResponse;
    throw new Error(`${response.status} ${error.code ?? 'error'}: ${error.message}`);
  }

  if (response.status === 204) {
    return undefined;
  }

  return response.json() as Promise<T>;
}
```

Пример изменения цены:

```ts
await agentRequest<RetreatUpdateResponse>(
  config,
  '/api/admin/retreats/cirali-yoga-tour',
  {
    method: 'PATCH',
    body: JSON.stringify({ price: '€850' } satisfies RetreatUpdate),
  },
);
```
