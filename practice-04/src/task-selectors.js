// Модуль выборки задач по текущему фильтру (ПР3)

/**
 * Возвращает новый массив задач в соответствии с выбранным фильтром.
 * @param {Array} tasks - массив задач
 * @param {string} filter - "all" | "pending" | "completed"
 * @returns {Array} новый отфильтрованный массив задач
 */
export function getVisibleTasks(tasks, filter = "all") {
  if (!Array.isArray(tasks)) {
    return [];
  }

  switch (filter) {
    case "completed":
      return tasks.filter((task) => task.completed);
    case "pending":
      return tasks.filter((task) => !task.completed);
    case "all":
    default:
      return [...tasks];
  }
}
