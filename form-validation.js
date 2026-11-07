const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

function isValidId(id) {
  return Number.isSafeInteger(id) && id > 0;
}

// Приводит значение поля id (строка или число) к числу либо возвращает null.
function parseId(raw) {
  const text = typeof raw === "number" ? String(raw) : typeof raw === "string" ? raw.trim() : "";
  if (!/^\d+$/.test(text)) return null;
  const id = Number(text);
  return isValidId(id) ? id : null;
}

// Чистая проверка данных формы. DOM и показ сообщений выполняются в main.js.
// draft: { id, title, priority }; editingId: null либо id редактируемой задачи.
export function validateTaskDraft(draft, tasks, editingId = null) {
  const errors = {};
  const list = Array.isArray(tasks) ? tasks : [];
  let id = null;

  if (editingId !== null) {
    // Режим редактирования: id берётся из editingId, а не из формы.
    if (!isValidId(editingId) || !list.some((task) => task.id === editingId)) {
      errors.id = "Редактируемая задача не найдена";
    } else {
      id = editingId;
    }
  } else {
    id = parseId(draft?.id);
    if (id === null) {
      errors.id = "Идентификатор должен быть положительным целым числом";
    } else if (list.some((task) => task.id === id)) {
      errors.id = "Задача с таким идентификатором уже существует";
      id = null;
    }
  }

  // Название: строка длиной от 1 до 100 символов после trim()
  const rawTitle = draft?.title;
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  if (typeof rawTitle !== "string" || title.length < 1 || title.length > 100) {
    errors.title = "Название должно содержать от 1 до 100 символов";
  }

  // Приоритет: строго одно из трёх значений, без нормализации
  const priority = draft?.priority;
  if (typeof priority !== "string" || !ALLOWED_PRIORITIES.has(priority)) {
    errors.priority = "Допустимые приоритеты: low, medium, high";
  }

  if (Object.keys(errors).length > 0) {
    return { ok: false, errors };
  }
  return { ok: true, value: { id, title, priority } };
}
