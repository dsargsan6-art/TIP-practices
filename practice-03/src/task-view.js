import { getTaskStats } from "./task-service.js";

const PRIORITY_LABELS = {
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
};

/**
 * Создает DOM-элемент карточки задачи (li.task-card).
 * @param {Object} task
 * @returns {HTMLLIElement}
 */
export function createTaskElement(task) {
  const card = document.createElement("li");
  card.className = "task-card";
  if (task.completed) {
    card.classList.add("is-completed");
  }
  card.dataset.taskId = String(task.id);

  const titleEl = document.createElement("h3");
  titleEl.className = "task-title";
  titleEl.textContent = task.title;

  const statusEl = document.createElement("span");
  statusEl.className = "task-status";
  statusEl.textContent = task.completed ? "Выполнена" : "В работе";

  const priorityEl = document.createElement("span");
  priorityEl.className = "task-priority";
  priorityEl.textContent = PRIORITY_LABELS[task.priority] ?? task.priority;

  const actionsEl = document.createElement("div");
  actionsEl.className = "task-actions";

  const toggleBtn = document.createElement("button");
  toggleBtn.type = "button";
  toggleBtn.dataset.action = "toggle";
  toggleBtn.setAttribute("aria-pressed", task.completed ? "true" : "false");

  const toggleLabel = document.createElement("span");
  toggleLabel.className = "action-label";
  toggleLabel.textContent = "Выполнена";
  toggleBtn.append(toggleLabel);

  const deleteBtn = document.createElement("button");
  deleteBtn.type = "button";
  deleteBtn.dataset.action = "delete";

  const deleteLabel = document.createElement("span");
  deleteLabel.className = "action-label";
  deleteLabel.textContent = "Удалить";
  deleteBtn.append(deleteLabel);

  actionsEl.append(toggleBtn, deleteBtn);
  card.append(titleEl, statusEl, priorityEl, actionsEl);

  return card;
}

/**
 * Отрисовывает список карточек задач внутри контейнера listElement.
 * @param {HTMLElement} listElement
 * @param {Array} tasks
 */
export function renderTaskList(listElement, tasks) {
  const cards = tasks.map(createTaskElement);
  listElement.replaceChildren(...cards);
}

/**
 * Обновляет блок сводки по всему набору задач.
 * @param {HTMLElement} summaryElement
 * @param {Array} tasks - полный массив текущих задач
 * @param {number} visibleCount - количество видимых задач
 */
export function renderSummary(summaryElement, tasks, visibleCount) {
  const stats = getTaskStats(tasks);

  const totalEl = summaryElement.querySelector('[data-stat="total"]');
  const completedEl = summaryElement.querySelector('[data-stat="completed"]');
  const pendingEl = summaryElement.querySelector('[data-stat="pending"]');
  const progressEl = summaryElement.querySelector('[data-stat="progress"]');
  const visibleEl = summaryElement.querySelector('[data-stat="visible"]');

  if (totalEl) totalEl.textContent = String(stats.total);
  if (completedEl) completedEl.textContent = String(stats.completed);
  if (pendingEl) pendingEl.textContent = String(stats.pending);
  if (progressEl) progressEl.textContent = `${stats.progress.toFixed(1)}%`;
  if (visibleEl) visibleEl.textContent = String(visibleCount);
}

/**
 * Управляет отображением сообщения о пустом состоянии.
 * @param {HTMLElement} messageElement
 * @param {number} total
 * @param {number} visibleCount
 */
export function renderEmptyState(messageElement, total, visibleCount) {
  if (total === 0 && visibleCount === 0) {
    messageElement.hidden = false;
    messageElement.textContent = "Список задач пуст.";
  } else if (total > 0 && visibleCount === 0) {
    messageElement.hidden = false;
    messageElement.textContent = "Нет задач по выбранному фильтру.";
  } else {
    messageElement.hidden = true;
    messageElement.textContent = "";
  }
}
