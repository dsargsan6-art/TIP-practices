import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

function isTask(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.title === "string"
    && value.title.trim().length >= 1
    && value.title.trim().length <= 100
    && typeof value.completed === "boolean"
    && ALLOWED_PRIORITIES.has(value.priority)
    && isPositiveSafeInteger(value.categoryId),
  );
}

function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

// client — объект, созданный createApiClient.
// Контракт результата:
// getTasks(filters) -> Promise<{ tasks, meta }>
// getTaskById(id) -> Promise<task>
// getCategories() -> Promise<category[]>
// loadInitialData(filters) -> Promise<{ tasks, categories, meta }>
function normalizeFilters(filters = {}) {
  if (filters === null || typeof filters !== "object" || Array.isArray(filters)) {
    throw new TypeError("Фильтры должны быть объектом.");
  }
  const result = {};
  for (const [name, value] of Object.entries(filters)) {
    if (!ALLOWED_FILTERS.has(name)) {
      throw new TypeError(`Неизвестный фильтр: ${name}.`);
    }
    if (value === undefined) continue;
    if (name === "completed") {
      if (typeof value !== "boolean") throw new TypeError("completed должен быть boolean.");
      result.completed = value;
    } else if (name === "priority") {
      if (!ALLOWED_PRIORITIES.has(value)) throw new TypeError("Недопустимый priority.");
      result.priority = value;
    } else if (name === "categoryId") {
      if (!isPositiveSafeInteger(value)) throw new TypeError("categoryId должен быть положительным целым.");
      result.categoryId = value;
    } else if (name === "q") {
      if (typeof value !== "string") throw new TypeError("q должен быть строкой.");
      const text = value.trim();
      if (text.length > 100) throw new TypeError("q не должен быть длиннее 100 символов.");
      if (text.length > 0) result.q = text;
    }
  }
  return result;
}

function hasUniqueIds(items) {
  return new Set(items.map((item) => item.id)).size === items.length;
}

function parseTasksPayload(payload) {
  if (!payload || typeof payload !== "object" || !Array.isArray(payload.data)) {
    throw invalidResponse("Ответ сервера не содержит массив задач.");
  }
  if (!payload.data.every(isTask) || !hasUniqueIds(payload.data)) {
    throw invalidResponse("Ответ сервера содержит некорректные или повторяющиеся задачи.");
  }
  const { meta } = payload;
  if (!meta || typeof meta !== "object" || meta.total !== payload.data.length) {
    throw invalidResponse("Поле meta.total не совпадает с количеством задач.");
  }
  return { tasks: payload.data, meta };
}

export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") {
    throw new TypeError("Клиент должен иметь метод requestJson.");
  }

  async function getTasks(filters) {
    const query = normalizeFilters(filters);
    // Фильтры уходят серверу в query-параметрах, а не применяются к локальному массиву.
    const payload = await client.requestJson("/tasks", { query });
    return parseTasksPayload(payload);
  }

  async function getTaskById(id) {
    if (!isPositiveSafeInteger(id)) {
      throw new TypeError("id задачи должен быть положительным целым числом.");
    }
    const payload = await client.requestJson(`/tasks/${id}`);
    if (!payload || typeof payload !== "object" || !isTask(payload.data) || payload.data.id !== id) {
      throw invalidResponse("Ответ сервера содержит некорректную задачу.");
    }
    return payload.data;
  }

  async function getCategories() {
    const payload = await client.requestJson("/categories");
    if (!payload || typeof payload !== "object" || !Array.isArray(payload.data)) {
      throw invalidResponse("Ответ сервера не содержит массив категорий.");
    }
    if (!payload.data.every(isCategory) || !hasUniqueIds(payload.data)) {
      throw invalidResponse("Ответ сервера содержит некорректные или повторяющиеся категории.");
    }
    return payload.data;
  }

  async function loadInitialData(filters) {
    // Два независимых запроса выполняются параллельно.
    const [{ tasks, meta }, categories] = await Promise.all([
      getTasks(filters),
      getCategories(),
    ]);
    return { tasks, categories, meta };
  }

  return { getTasks, getTaskById, getCategories, loadInitialData };
}
