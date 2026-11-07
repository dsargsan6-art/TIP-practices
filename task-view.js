const PRIORITY_LABELS = Object.freeze({
  low: "Низкий",
  medium: "Средний",
  high: "Высокий",
});

function createActionButton(action, label) {
  const button = document.createElement("button");
  button.type = "button";
  button.dataset.action = action;
  const text = document.createElement("span");
  text.className = "action-label";
  text.textContent = label;
  button.append(text);
  return button;
}

export function createTaskElement(task, category) {
  const card = document.createElement("li");
  card.className = "task-card";
  card.classList.toggle("is-completed", task.completed);
  card.dataset.taskId = String(task.id);

  // Пользовательские данные выводятся только через textContent.
  const title = document.createElement("h3");
  title.className = "task-title";
  title.textContent = task.title;

  const meta = document.createElement("div");
  meta.className = "task-meta";

  const status = document.createElement("span");
  status.className = "task-status";
  status.textContent = task.completed ? "Выполнена" : "В работе";

  const priority = document.createElement("span");
  priority.className = "task-priority";
  priority.textContent = PRIORITY_LABELS[task.priority] ?? task.priority;

  const categoryNode = document.createElement("span");
  categoryNode.className = "task-category";
  categoryNode.textContent = category?.name ?? "Без категории";

  meta.append(status, priority, categoryNode);

  const actions = document.createElement("div");
  actions.className = "task-actions";
  const toggle = createActionButton("toggle", task.completed ? "Вернуть в работу" : "Выполнена");
  toggle.setAttribute("aria-pressed", task.completed ? "true" : "false");
  actions.append(
    toggle,
    createActionButton("edit", "Изменить"),
    createActionButton("delete", "Удалить"),
  );

  card.append(title, meta, actions);
  return card;
}

export function renderTaskList(list, tasks, categories) {
  const byId = new Map((categories ?? []).map((category) => [category.id, category]));
  const cards = tasks.map((task) => createTaskElement(task, byId.get(task.categoryId)));
  list.replaceChildren(...cards);
}
