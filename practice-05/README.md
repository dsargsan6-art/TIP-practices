# Практическая работа № 5. Асинхронное программирование и HTTP API

## Данные работы

| Поле | Значение |
|---|---|
| Студент | Саргсян Давид |
| Группа | ЭФБО-13-25 |
| Вариант | 8 (Оформление технической документации) |

## Запуск

Рабочая папка: `practice-05`. Установка пакетов не требуется.

```bash
npm start            # учебный API: http://127.0.0.1:5505/api
npm test             # проверки сервера, клиента и интеграции
npm run client       # консольный клиент (в другом терминале при работающем API)
```

Проверка работы API: `http://127.0.0.1:5505/api/health`.

## Что реализовано

| Файл | Назначение |
|---|---|
| `api/server.mjs`, `api/data.js` | Готовый учебный сервер (из заготовки курса). |
| `src/api-client.js` | `ApiError`, `buildUrl`, `createApiClient` с `requestJson`: заголовок `Accept`, тайм-аут, внешняя отмена, явная проверка `response.ok`, проверка `Content-Type`, разбор JSON. |
| `src/task-api.js` | `createTaskApi`: `getTasks`, `getTaskById`, `getCategories`, `loadInitialData` (параллельная загрузка через `Promise.all`), проверка ответов по схеме. |
| `src/variant.js` | Вариант 8: `{ completed: false, priority: "high", categoryId: 2 }`. |
| `src/main.js` | Консольный клиент: запрос по фильтрам варианта и контрольная ошибка 404. |

Виды ошибок `ApiError.kind`: `http`, `network`, `invalid-response`, `timeout`, `aborted`.

## Результаты проверок

| Проверка | Результат |
|---|---|
| `npm run check:api` | 18 из 18 |
| `npm run check:client` | 26 из 26 |
| `npm run check:integration` | 13 из 13 |

Контрольные запросы на исходном наборе:

- `getTasks({ completed: false, priority: "high" })` возвращает задачи с id 4, 13, 34; `meta.total = 3`;
- вариант 8 (`categoryId: 2`) возвращает id 4 и 34;
- `getTaskById(999)` завершается ошибкой `kind: "http"`, `status: 404`.
