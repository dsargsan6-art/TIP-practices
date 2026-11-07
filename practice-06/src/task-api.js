import { ApiError } from "./api-client.js";

const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);
const ALLOWED_FILTERS = new Set(["completed", "priority", "categoryId", "q"]);

function invalidResponse(message) {
  return new ApiError(message, { kind: "invalid-response" });
}

function isPositiveSafeInteger(value) {
  return Number.isSafeInteger(value) && value > 0;
}

export function isTask(value) {
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

export function isCategory(value) {
  return Boolean(
    value
    && typeof value === "object"
    && isPositiveSafeInteger(value.id)
    && typeof value.name === "string"
    && value.name.trim().length >= 1
    && value.name.trim().length <= 100,
  );
}

function normalizeFilters(filters = {}) {
  if (filters === null || typeof filters !== "object" || Array.isArray(filters)) {
    throw new TypeError("Фильтры должны быть объектом.");
  }
  const result = {};
  for (const [name, value] of Object.entries(filters)) {
    if (!ALLOWED_FILTERS.has(name)) throw new TypeError(`Неизвестный фильтр: ${name}.`);
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

function requireId(id) {
  if (!isPositiveSafeInteger(id)) {
    throw new TypeError("id задачи должен быть положительным целым числом.");
  }
}

function requireObject(value, message) {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError(message);
  }
}

// В options попадает signal только если он передан.
function withSignal(options, signal) {
  return signal ? { ...options, signal } : options;
}

function parseTask(payload, expectedId) {
  const task = payload?.data;
  if (!isTask(task) || (expectedId !== undefined && task.id !== expectedId)) {
    throw invalidResponse("Ответ сервера содержит некорректную задачу.");
  }
  return task;
}

// Методы результата:
// getTasks, getTaskById, getCategories, loadInitialData, createTask, updateTask,
// setTaskCompleted, deleteTask и resetDemoData.
// Последний аргумент каждого метода данных — { signal }.
export function createTaskApi(client) {
  if (!client || typeof client.requestJson !== "function") {
    throw new TypeError("Клиент должен иметь метод requestJson.");
  }

  async function getTasks(filters, { signal } = {}) {
    const query = normalizeFilters(filters);
    const payload = await client.requestJson("/tasks", withSignal({ query }, signal));
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

  async function getTaskById(id, { signal } = {}) {
    requireId(id);
    const payload = await client.requestJson(`/tasks/${id}`, withSignal({}, signal));
    return parseTask(payload, id);
  }

  async function getCategories({ signal } = {}) {
    const payload = await client.requestJson("/categories", withSignal({}, signal));
    if (!payload || typeof payload !== "object" || !Array.isArray(payload.data)) {
      throw invalidResponse("Ответ сервера не содержит массив категорий.");
    }
    if (!payload.data.every(isCategory) || !hasUniqueIds(payload.data)) {
      throw invalidResponse("Ответ сервера содержит некорректные или повторяющиеся категории.");
    }
    return payload.data;
  }

  async function loadInitialData(filters, { signal } = {}) {
    // Два независимых запроса выполняются параллельно.
    const [{ tasks, meta }, categories] = await Promise.all([
      getTasks(filters, { signal }),
      getCategories({ signal }),
    ]);
    return { tasks, categories, meta };
  }

  async function createTask(draft, { signal } = {}) {
    requireObject(draft, "Данные задачи должны быть объектом.");
    const payload = await client.requestJson(
      "/tasks",
      withSignal({ method: "POST", body: draft }, signal),
    );
    return parseTask(payload);
  }

  async function updateTask(id, changes, { signal } = {}) {
    requireId(id);
    requireObject(changes, "Изменения должны быть объектом.");
    const payload = await client.requestJson(
      `/tasks/${id}`,
      withSignal({ method: "PATCH", body: changes }, signal),
    );
    return parseTask(payload, id);
  }

  async function setTaskCompleted(id, completed, { signal } = {}) {
    requireId(id);
    if (typeof completed !== "boolean") throw new TypeError("completed должен быть boolean.");
    return updateTask(id, { completed }, { signal });
  }

  async function deleteTask(id, { signal } = {}) {
    requireId(id);
    const payload = await client.requestJson(
      `/tasks/${id}`,
      withSignal({ method: "DELETE" }, signal),
    );
    // Успешное удаление: ответ 204, который клиент преобразует в null.
    if (payload !== null) throw invalidResponse("Ожидался ответ 204 без тела.");
    return null;
  }

  async function resetDemoData({ signal } = {}) {
    const payload = await client.requestJson(
      "/debug/reset",
      withSignal({ method: "POST" }, signal),
    );
    const data = payload?.data;
    if (!data || data.reset !== true || !Number.isSafeInteger(data.total)) {
      throw invalidResponse("Сервер не подтвердил восстановление данных.");
    }
    return data;
  }

  return {
    getTasks,
    getTaskById,
    getCategories,
    loadInitialData,
    createTask,
    updateTask,
    setTaskCompleted,
    deleteTask,
    resetDemoData,
  };
}
