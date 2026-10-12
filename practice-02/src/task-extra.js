// Дополнительные функции для ПР2 (Варианты А и Б)
// Студент: Саргсян Давид | Группа: ЭФБО-13-25 | Вариант: 8

/**
 * Вариант А: Поиск задач по фрагменту названия
 * @param {Array} tasks - массив задач
 * @param {string} query - строка поиска
 * @returns {Array} новый массив подходящих задач
 */
export function searchTasks(tasks, query) {
  if (!Array.isArray(tasks) || typeof query !== "string") {
    return [];
  }
  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery.length === 0) {
    return tasks.map((t) => ({ ...t }));
  }
  return tasks
    .filter((task) => task.title.toLowerCase().includes(cleanQuery))
    .map((task) => ({ ...task }));
}

/**
 * Вариант Б: Сводка распределения задач по приоритетам
 * @param {Array} tasks - массив задач
 * @returns {Object} { low, medium, high }
 */
export function getPrioritySummary(tasks) {
  const summary = { low: 0, medium: 0, high: 0 };
  if (!Array.isArray(tasks)) return summary;

  for (const task of tasks) {
    if (task.priority in summary) {
      summary[task.priority] += 1;
    }
  }
  return summary;
}
