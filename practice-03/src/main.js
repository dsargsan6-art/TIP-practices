import { demoTasks, variantTasks, variantNumber } from "./data.js";
import { findTaskById, setTaskCompleted, removeTask } from "./task-service.js";
import { getVisibleTasks } from "./task-selectors.js";
import { renderTaskList, renderSummary, renderEmptyState } from "./task-view.js";

const elements = {
  list: document.querySelector("#task-list"),
  filters: document.querySelector("#task-filters"),
  summary: document.querySelector("#task-summary"),
  empty: document.querySelector("#empty-message"),
  message: document.querySelector("#operation-message"),
  datasetLabel: document.querySelector("#dataset-label"),
};

// Служебная часть: ?dataset=variant включает данные своего варианта
const urlParams = new URLSearchParams(window.location.search);
const isVariant = urlParams.get("dataset") === "variant";
const initialTasks = isVariant ? variantTasks : demoTasks;
let currentTasks = initialTasks.map((task) => ({ ...task }));
let currentFilter = "all";

const filterParam = urlParams.get("filter");
if (filterParam && ["all", "pending", "completed"].includes(filterParam)) {
  currentFilter = filterParam;
}

const actionParam = urlParams.get("action");
if (actionParam === "variant_actions") {
  // Выполнить 2 действия сценария Варианта 8:
  // 1) переключить статус задачи 23 (из true в false)
  // 2) удалить задачу 37
  const toggleRes = setTaskCompleted(currentTasks, 23, false);
  if (toggleRes.ok) currentTasks = toggleRes.tasks;
  const removeRes = removeTask(currentTasks, 37);
  if (removeRes.ok) currentTasks = removeRes.tasks;
} else if (actionParam === "empty_all") {
  currentTasks = [];
}

elements.datasetLabel.textContent = isVariant
  ? `Индивидуальный вариант: ${variantNumber ?? "не указан"} (Оформление технической документации)`
  : "Общий контрольный набор";

function renderApp() {
  const visibleTasks = getVisibleTasks(currentTasks, currentFilter);
  renderTaskList(elements.list, visibleTasks);
  renderSummary(elements.summary, currentTasks, visibleTasks.length);
  renderEmptyState(elements.empty, currentTasks.length, visibleTasks.length);

  const filterButtons = elements.filters.querySelectorAll("button[data-filter]");
  for (const button of filterButtons) {
    const isActive = button.dataset.filter === currentFilter;
    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
  }
}

function handleTaskListClick(event) {
  const button = event.target.closest("button[data-action]");
  if (!button || !elements.list.contains(button)) {
    return;
  }

  const action = button.dataset.action;
  if (action !== "toggle" && action !== "delete") {
    return;
  }

  const card = button.closest("[data-task-id]");
  if (!card) {
    return;
  }

  const rawId = card.dataset.taskId;
  if (!/^\d+$/.test(rawId)) {
    elements.message.textContent = "Ошибка: идентификатор задачи должен быть числом";
    return;
  }

  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    elements.message.textContent = "Ошибка: некорректный идентификатор задачи";
    return;
  }

  const targetTask = findTaskById(currentTasks, id);
  if (!targetTask) {
    elements.message.textContent = "Ошибка: задача с указанным идентификатором не найдена";
    return;
  }

  if (action === "toggle") {
    const result = setTaskCompleted(currentTasks, id, !targetTask.completed);
    if (result.ok) {
      currentTasks = result.tasks;
      elements.message.textContent = "";
      renderApp();
      restoreTaskFocus(id, action);
    } else {
      elements.message.textContent = result.error;
    }
  } else if (action === "delete") {
    const result = removeTask(currentTasks, id);
    if (result.ok) {
      currentTasks = result.tasks;
      elements.message.textContent = "";
      renderApp();
      restoreTaskFocus(id, action);
    } else {
      elements.message.textContent = result.error;
    }
  }
}

function handleFilterClick(event) {
  const button = event.target.closest("button[data-filter]");
  if (!button || !elements.filters.contains(button)) {
    return;
  }

  const filter = button.dataset.filter;
  if (!["all", "pending", "completed"].includes(filter)) {
    return;
  }

  currentFilter = filter;
  elements.message.textContent = "";
  renderApp();
}

function restoreTaskFocus(id, action) {
  const actionButton = elements.list.querySelector(
    `[data-task-id="${id}"] button[data-action="${action}"]`,
  );
  const filterButton = elements.filters.querySelector(`[data-filter="${currentFilter}"]`);
  (actionButton ?? filterButton)?.focus();
}

// Подписки выполняются один раз
elements.list.addEventListener("click", handleTaskListClick);
elements.filters.addEventListener("click", handleFilterClick);

try {
  renderApp();
} catch (error) {
  elements.message.textContent = `Ошибка запуска: ${error.message}`;
  console.error(error);
}
