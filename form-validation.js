const ALLOWED_PRIORITIES = new Set(["low", "medium", "high"]);

// Возвращает { valid, value, errors }.
// value содержит нормализованные title, priority и числовой categoryId.
export function validateTaskDraft(draft, categories) {
  const errors = {};
  const list = Array.isArray(categories) ? categories : [];

  const rawTitle = draft?.title;
  const title = typeof rawTitle === "string" ? rawTitle.trim() : "";
  if (typeof rawTitle !== "string" || title.length < 1 || title.length > 100) {
    errors.title = "Название должно содержать от 1 до 100 символов";
  }

  const priority = draft?.priority;
  if (typeof priority !== "string" || !ALLOWED_PRIORITIES.has(priority)) {
    errors.priority = "Выберите приоритет: low, medium или high";
  }

  // Значение select приходит строкой; число получается явным преобразованием.
  const rawCategory = draft?.categoryId;
  const text = typeof rawCategory === "number" ? String(rawCategory) : String(rawCategory ?? "").trim();
  const categoryId = /^\d+$/.test(text) ? Number(text) : null;
  if (categoryId === null || !list.some((category) => category.id === categoryId)) {
    errors.categoryId = "Выберите существующую категорию";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, value: null, errors };
  }
  return { valid: true, value: { title, priority, categoryId }, errors: {} };
}
