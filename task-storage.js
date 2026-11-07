export const STORAGE_VERSION = 1;
const ALLOWED_PRIORITY_LIST = ["low", "medium", "high"];

// Все функции принимают объект storage явно, чтобы их можно было проверить
// без обращения к глобальному window.localStorage.

function copyTasks(tasks) {
  return Array.isArray(tasks) ? tasks.map((task) => ({ ...task })) : [];
}

export function isValidTaskList(value) {
  if (!Array.isArray(value)) return false;
  const ids = new Set();
  for (const task of value) {
    if (task === null || typeof task !== "object" || Array.isArray(task)) return false;
    if (!Number.isSafeInteger(task.id) || task.id <= 0) return false;
    if (typeof task.title !== "string") return false;
    const title = task.title.trim();
    if (title.length < 1 || title.length > 100) return false;
    if (typeof task.completed !== "boolean") return false;
    if (!ALLOWED_PRIORITY_LIST.includes(task.priority)) return false;
    if (ids.has(task.id)) return false;
    ids.add(task.id);
  }
  return true;
}

function fallbackResult(fallbackTasks, error) {
  return { ok: false, source: "fallback", tasks: copyTasks(fallbackTasks), error };
}

export function loadTasks(storage, key, fallbackTasks) {
  let raw;
  try {
    raw = storage.getItem(key);
  } catch (error) {
    return fallbackResult(
      fallbackTasks,
      "Не удалось прочитать localStorage; используется исходный набор.",
    );
  }
  if (raw === null || raw === undefined) {
    return { ok: true, source: "initial", tasks: copyTasks(fallbackTasks) };
  }

  let data;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    return fallbackResult(
      fallbackTasks,
      "Сохранённые данные повреждены (некорректный JSON); используется исходный набор.",
    );
  }
  if (data === null || typeof data !== "object" || data.version !== STORAGE_VERSION) {
    return fallbackResult(
      fallbackTasks,
      "Неизвестная версия сохранённых данных; используется исходный набор.",
    );
  }
  if (!isValidTaskList(data.tasks)) {
    return fallbackResult(
      fallbackTasks,
      "Сохранённые задачи не прошли проверку; используется исходный набор.",
    );
  }
  return { ok: true, source: "storage", tasks: copyTasks(data.tasks) };
}

export function saveTasks(storage, key, tasks) {
  if (!isValidTaskList(tasks)) {
    return { ok: false, error: "Список задач некорректен и не был сохранён." };
  }
  try {
    storage.setItem(key, JSON.stringify({ version: STORAGE_VERSION, tasks }));
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "Не удалось записать данные в localStorage." };
  }
}

export function removeSavedTasks(storage, key) {
  try {
    storage.removeItem(key);
    return { ok: true };
  } catch (error) {
    return { ok: false, error: "Не удалось удалить сохранённые данные." };
  }
}
