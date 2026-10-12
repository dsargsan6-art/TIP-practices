// Модуль сервиса задач для ПР2 и ПР3.
// Чистые функции: не мутируют переданные массивы и объекты.
// При ошибках валидации возвращают { ok: false, error: "..." }.

const ALLOWED_PRIORITIES = ["low", "medium", "high"];

function isValidId(id) {
  return (
    typeof id === "number" &&
    Number.isInteger(id) &&
    !Number.isNaN(id) &&
    Number.isFinite(id) &&
    id > 0 &&
    id <= Number.MAX_SAFE_INTEGER
  );
}

function isValidTitle(title) {
  if (typeof title !== "string") return false;
  const trimmed = title.trim();
  return trimmed.length >= 1 && trimmed.length <= 100;
}

export function createTask(id, title, priority = "medium") {
  if (!isValidId(id)) {
    return { ok: false, error: "Некорректный идентификатор задачи (требуется положительное целое число)" };
  }
  if (!isValidTitle(title)) {
    return { ok: false, error: "Некорректное название задачи (длина от 1 до 100 символов)" };
  }
  if (!ALLOWED_PRIORITIES.includes(priority)) {
    return { ok: false, error: "Недопустимый приоритет задачи (допустимы: low, medium, high)" };
  }

  return {
    ok: true,
    task: {
      id,
      title: title.trim(),
      completed: false,
      priority,
    },
  };
}

export function findTaskById(tasks, id) {
  if (!Array.isArray(tasks)) return undefined;
  return tasks.find((task) => task.id === id);
}

export function getPendingTasks(tasks) {
  if (!Array.isArray(tasks)) return [];
  return tasks.filter((task) => !task.completed);
}

export function getTaskTitles(tasks) {
  if (!Array.isArray(tasks)) return [];
  return tasks.map((task) => task.title);
}

export function getTaskStats(tasks) {
  if (!Array.isArray(tasks) || tasks.length === 0) {
    return { total: 0, completed: 0, pending: 0, progress: 0 };
  }
  const total = tasks.length;
  const completed = tasks.filter((task) => task.completed).length;
  const pending = total - completed;
  const progress = total === 0 ? 0 : (completed / total) * 100;

  return { total, completed, pending, progress };
}

export function addTask(tasks, id, title, priority = "medium") {
  if (!Array.isArray(tasks)) {
    return { ok: false, error: "Передан некорректный список задач" };
  }
  const createResult = createTask(id, title, priority);
  if (!createResult.ok) {
    return createResult;
  }
  if (findTaskById(tasks, id) !== undefined) {
    return { ok: false, error: "Задача с таким идентификатором уже существует" };
  }

  return {
    ok: true,
    tasks: [...tasks, createResult.task],
  };
}

export function setTaskCompleted(tasks, id, completed) {
  if (!Array.isArray(tasks)) {
    return { ok: false, error: "Передан некорректный список задач" };
  }
  if (!isValidId(id)) {
    return { ok: false, error: "Некорректный идентификатор задачи" };
  }
  if (typeof completed !== "boolean") {
    return { ok: false, error: "Статус выполнения задачи должен быть булевым значением (true/false)" };
  }
  const existingTask = findTaskById(tasks, id);
  if (!existingTask) {
    return { ok: false, error: "Задача с указанным идентификатором не найдена" };
  }

  return {
    ok: true,
    tasks: tasks.map((task) => (task.id === id ? { ...task, completed } : task)),
  };
}

export function renameTask(tasks, id, title) {
  if (!Array.isArray(tasks)) {
    return { ok: false, error: "Передан некорректный список задач" };
  }
  if (!isValidId(id)) {
    return { ok: false, error: "Некорректный идентификатор задачи" };
  }
  if (!isValidTitle(title)) {
    return { ok: false, error: "Некорректное название задачи (длина от 1 до 100 символов)" };
  }
  const existingTask = findTaskById(tasks, id);
  if (!existingTask) {
    return { ok: false, error: "Задача с указанным идентификатором не найдена" };
  }

  return {
    ok: true,
    tasks: tasks.map((task) => (task.id === id ? { ...task, title: title.trim() } : task)),
  };
}

export function removeTask(tasks, id) {
  if (!Array.isArray(tasks)) {
    return { ok: false, error: "Передан некорректный список задач" };
  }
  if (!isValidId(id)) {
    return { ok: false, error: "Некорректный идентификатор задачи" };
  }
  const existingTask = findTaskById(tasks, id);
  if (!existingTask) {
    return { ok: false, error: "Задача с указанным идентификатором не найдена" };
  }

  return {
    ok: true,
    tasks: tasks.filter((task) => task.id !== id),
  };
}
