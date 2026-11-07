import { ApiError } from "./api-client.js";
import { validateTaskDraft } from "./form-validation.js";

export function messageForError(error) {
  if (!(error instanceof ApiError)) return "Не удалось выполнить операцию.";
  if (error.kind === "timeout") return "Сервер не ответил вовремя. Попробуйте ещё раз.";
  if (error.kind === "network") return "Нет соединения с учебным API. Проверьте, запущен ли npm start.";
  if (error.kind === "invalid-response") return "Сервер вернул ответ неожиданного формата.";
  if (error.kind === "http" && error.status === 404) return "Запись уже отсутствует на сервере. Обновите список.";
  if (error.kind === "http") return error.message || `Сервер вернул ошибку ${error.status}.`;
  return "Не удалось выполнить операцию.";
}

const API_METHODS = [
  "loadInitialData", "getTasks", "createTask", "updateTask",
  "setTaskCompleted", "deleteTask", "resetDemoData",
];
const VIEW_METHODS = [
  "setListState", "setTasks", "setCategories", "setTotal",
  "setFormTask", "showFormErrors", "setMutationPending", "notify",
];

// view — адаптер из dom-app.js. Контроллер не должен обращаться к document.
// Обязательные методы результата:
// start, applyFilters, refresh, submit, beginEdit, cancelEdit,
// toggleTask, deleteTask, resetData и destroy.
export function createAppController({ api, view, validateDraft = validateTaskDraft } = {}) {
  if (!api || API_METHODS.some((name) => typeof api[name] !== "function")) {
    throw new TypeError("api должен содержать все методы доменного API.");
  }
  if (!view || VIEW_METHODS.some((name) => typeof view[name] !== "function")) {
    throw new TypeError("view должен содержать все методы интерфейса.");
  }
  if (typeof validateDraft !== "function") {
    throw new TypeError("validateDraft должен быть функцией.");
  }

  let tasks = [];
  let categories = null; // null, пока категории не были получены
  let filters = {};
  let editingId = null;
  let loadController = null;
  let loadSeq = 0;
  let mutationPending = false;

  // Загрузка списка: предыдущий запрос отменяется, устаревший ответ игнорируется.
  async function load(nextFilters = filters) {
    filters = { ...nextFilters };
    loadController?.abort();
    const controller = new AbortController();
    loadController = controller;
    const seq = ++loadSeq;
    const options = { signal: controller.signal };
    view.setListState("loading");

    try {
      let result;
      if (categories === null) {
        // Категорий ещё нет (первая загрузка или повтор после ошибки).
        result = await api.loadInitialData(filters, options);
        if (seq !== loadSeq) return false;
        categories = result.categories;
        view.setCategories(categories);
      } else {
        result = await api.getTasks(filters, options);
        if (seq !== loadSeq) return false;
      }
      tasks = result.tasks;
      view.setTasks(tasks, categories);
      view.setTotal(result.meta.total);
      view.setListState(tasks.length === 0 ? "empty" : "ready");
      return true;
    } catch (error) {
      if (seq !== loadSeq) return false; // ответ уже устарел
      if (error instanceof ApiError && error.kind === "aborted") return false;
      view.setListState("error", messageForError(error));
      return false;
    }
  }

  function showEditing(task) {
    editingId = task ? task.id : null;
    view.setFormTask(task ?? null);
    view.showFormErrors({});
  }

  // Общая схема изменения: блокировка действий, запрос, повторная загрузка списка.
  async function mutate(action, successMessage) {
    if (mutationPending) return false;
    mutationPending = true;
    view.setMutationPending(true);
    try {
      await action();
      await load(filters); // после успеха список запрашивается заново с текущими фильтрами
      view.notify(successMessage, "success");
      return true;
    } catch (error) {
      if (error instanceof ApiError && error.kind === "aborted") return false;
      if (error instanceof ApiError && error.kind === "http" && error.status === 404) {
        await load(filters);
      }
      view.notify(messageForError(error), "error");
      return false;
    } finally {
      mutationPending = false;
      view.setMutationPending(false);
    }
  }

  return {
    start: (initialFilters = {}) => load(initialFilters),
    applyFilters: (nextFilters = {}) => load(nextFilters),
    refresh: () => load(filters),

    async submit(draft) {
      if (mutationPending) return false;
      const checked = validateDraft(draft, categories ?? []);
      view.showFormErrors(checked.errors);
      if (!checked.valid) return false;

      const wasEditing = editingId !== null;
      const id = editingId;
      const done = await mutate(
        () => (wasEditing ? api.updateTask(id, checked.value) : api.createTask(checked.value)),
        wasEditing ? "Задача изменена." : "Задача добавлена.",
      );
      if (done) showEditing(null);
      return done;
    },

    beginEdit(id) {
      const task = tasks.find((item) => item.id === id);
      if (!task) {
        view.notify("Задача для редактирования не найдена.", "error");
        return;
      }
      showEditing(task);
    },

    cancelEdit() {
      showEditing(null);
    },

    async toggleTask(id) {
      const task = tasks.find((item) => item.id === id);
      if (!task) return false;
      return mutate(
        () => api.setTaskCompleted(id, !task.completed),
        "Статус задачи изменён.",
      );
    },

    async deleteTask(id) {
      const done = await mutate(() => api.deleteTask(id), "Задача удалена.");
      if (done && editingId === id) showEditing(null);
      return done;
    },

    async resetData() {
      const done = await mutate(() => api.resetDemoData(), "Учебные данные восстановлены.");
      if (done) showEditing(null);
      return done;
    },

    destroy() {
      loadSeq += 1;
      loadController?.abort();
      loadController = null;
    },
  };
}
