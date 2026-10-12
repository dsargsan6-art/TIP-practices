import { demoTasks, variantNumber, variantTasks } from "./data.js";
import {
  createTask,
  findTaskById,
  getPendingTasks,
  getTaskTitles,
  getTaskStats,
  addTask,
  setTaskCompleted,
  renameTask,
  removeTask,
} from "./task-service.js";
import { searchTasks, getPrioritySummary } from "./task-extra.js";

function printStats(label, stats) {
  console.log(`[${label}] Всего: ${stats.total}, Выполнено: ${stats.completed}, В работе: ${stats.pending}, Прогресс: ${stats.progress.toFixed(1)}%`);
}

console.log("================================================================================");
console.log("ПРАКТИЧЕСКАЯ РАБОТА № 2: ФУНКЦИИ, ОБЪЕКТЫ, МАССИВЫ И ОРГАНИЗАЦИЯ КОДА");
console.log("Студент: Саргсян Давид | Группа: ЭФБО-13-25 | Вариант: 8");
console.log("================================================================================\n");

// -----------------------------------------------------------------------------
// 1. ОБЩИЙ ДЕМОНСТРАЦИОННЫЙ СЦЕНАРИЙ (demoTasks)
// -----------------------------------------------------------------------------
console.log(">>> 1. ОБЩИЙ СЦЕНАРИЙ (demoTasks) <<<");
let currentDemo = demoTasks;
printStats("Этап 1: Исходное состояние", getTaskStats(currentDemo));

// Добавление id: 20
const addDemoResult = addTask(currentDemo, 20, "Добавить проверку", "high");
if (addDemoResult.ok) {
  currentDemo = addDemoResult.tasks;
  printStats("Этап 2: После добавления id: 20", getTaskStats(currentDemo));
} else {
  console.error("Ошибка добавления:", addDemoResult.error);
}

// Изменение статуса id: 4
const toggleDemoResult = setTaskCompleted(currentDemo, 4, true);
if (toggleDemoResult.ok) {
  currentDemo = toggleDemoResult.tasks;
  printStats("Этап 3: После выполнения id: 4", getTaskStats(currentDemo));
} else {
  console.error("Ошибка изменения статуса:", toggleDemoResult.error);
}

// Переименование id: 10
const renameDemoResult = renameTask(currentDemo, 10, "Подготовить инструкцию запуска");
if (renameDemoResult.ok) {
  currentDemo = renameDemoResult.tasks;
  printStats("Этап 4: После переименования id: 10", getTaskStats(currentDemo));
} else {
  console.error("Ошибка переименования:", renameDemoResult.error);
}

// Удаление id: 7
const removeDemoResult = removeTask(currentDemo, 7);
if (removeDemoResult.ok) {
  currentDemo = removeDemoResult.tasks;
  printStats("Этап 5: После удаления id: 7", getTaskStats(currentDemo));
} else {
  console.error("Ошибка удаления:", removeDemoResult.error);
}

console.log("\nИтоговый список задач общего сценария:");
console.table(currentDemo.map((t) => ({ id: t.id, title: t.title, completed: t.completed, priority: t.priority })));
console.log("Проверка иммутабельности исходного demoTasks (длина 4):", demoTasks.length === 4 ? "СОХРАНЕН" : "НАРУШЕН");

// -----------------------------------------------------------------------------
// 2. ИНДИВИДУАЛЬНЫЙ СЦЕНАРИЙ ДЛЯ ВАРИАНТА 8
// -----------------------------------------------------------------------------
console.log("\n--------------------------------------------------------------------------------");
console.log(`>>> 2. ИНДИВИДУАЛЬНЫЙ СЦЕНАРИЙ (Вариант ${variantNumber}: Оформление технической документации) <<<`);
console.log("--------------------------------------------------------------------------------");

let currentVariant = variantTasks;
printStats("Шаг 1: Исходное состояние Варианта 8", getTaskStats(currentVariant));
console.log("Исходные задачи варианта 8:");
console.table(currentVariant.map((t) => ({ id: t.id, title: t.title, completed: t.completed, priority: t.priority })));

// Шаг 2: Добавить задачу id = 80 с приоритетом 'low'
console.log("\nШаг 2: Добавление задачи id: 80 (Создать диаграммы компонентов для отчета, priority: low)");
const addVarResult = addTask(currentVariant, 80, "Создать диаграммы компонентов для отчета", "low");
if (addVarResult.ok) {
  currentVariant = addVarResult.tasks;
  printStats("После добавления id: 80", getTaskStats(currentVariant));
} else {
  console.error("Ошибка добавления:", addVarResult.error);
}

// Шаг 3: Установить completed = true для id = 11
console.log("\nШаг 3: Установка completed = true для id: 11 (проверка контракта)");
const toggleVarResult = setTaskCompleted(currentVariant, 11, true);
if (toggleVarResult.ok) {
  currentVariant = toggleVarResult.tasks;
  printStats("После подтверждения completed для id: 11", getTaskStats(currentVariant));
} else {
  console.error("Ошибка изменения статуса:", toggleVarResult.error);
}

// Шаг 4: Переименовать id = 23
console.log("\nШаг 4: Переименование задачи id: 23");
const renameVarResult = renameTask(currentVariant, 23, "Описать архитектуру, структуру каталогов и сервисов");
if (renameVarResult.ok) {
  currentVariant = renameVarResult.tasks;
  printStats("После переименования id: 23", getTaskStats(currentVariant));
} else {
  console.error("Ошибка переименования:", renameVarResult.error);
}

// Шаг 5: Удалить id = 37
console.log("\nШаг 5: Удаление задачи id: 37");
const removeVarResult = removeTask(currentVariant, 37);
if (removeVarResult.ok) {
  currentVariant = removeVarResult.tasks;
  printStats("После удаления id: 37", getTaskStats(currentVariant));
} else {
  console.error("Ошибка удаления:", removeVarResult.error);
}

// Шаг 6: Попытка повторного добавления дублирующегося id = 80 (обработка ошибок)
console.log("\nШаг 6: Попытка повторно добавить задачу с id: 80 (ожидается отказ)");
const dupResult = addTask(currentVariant, 80, "Повторная задача с тем же id", "high");
if (!dupResult.ok) {
  console.log(`[УСПЕХ ОБРАБОТКИ ОШИБКИ] Получен ожидаемый отказ: "${dupResult.error}"`);
  console.log("Длина массива задач осталась прежней:", currentVariant.length);
} else {
  console.error("ОШИБКА: дубликат id не был отклонен!");
}

// Дополнительная проверка ошибок: передача неверного приоритета
console.log("\nПроверка отклонения некорректного приоритета:");
const badPriorityResult = createTask(99, "Тестовая задача", "super-urgent");
if (!badPriorityResult.ok) {
  console.log(`[УСПЕХ ОБРАБОТКИ ОШИБКИ] Получен отказ: "${badPriorityResult.error}"`);
}

// Шаг 7: Зафиксировать итоговые задачи и сводку варианта
console.log("\nШаг 7: Итоговый список задач Варианта 8:");
console.table(currentVariant.map((t) => ({ id: t.id, title: t.title, completed: t.completed, priority: t.priority })));
printStats("Итоговая сводка Варианта 8", getTaskStats(currentVariant));

// Подтверждение неизменности исходного variantTasks
const isVariantIntact = variantTasks.length === 6 && variantTasks[0].id === 11 && variantTasks.find((t) => t.id === 37) !== undefined;
console.log("\nПодтверждение сохранности variantTasks (длина 6, id 37 на месте):", isVariantIntact ? "СОХРАНЕН И НЕ ИЗМЕНЕН" : "НАРУШЕН");

// -----------------------------------------------------------------------------
// 3. ДЕМОНСТРАЦИЯ ДОПОЛНИТЕЛЬНЫХ ФУНКЦИЙ (task-extra.js)
// -----------------------------------------------------------------------------
console.log("\n--------------------------------------------------------------------------------");
console.log(">>> 3. ДОПОЛНИТЕЛЬНЫЕ ФУНКЦИИ (Варианты А и Б) <<<");
console.log("--------------------------------------------------------------------------------");
console.log("Поиск по запросу 'инструкци':");
const searchFound = searchTasks(currentVariant, "инструкци");
console.table(searchFound.map((t) => ({ id: t.id, title: t.title, priority: t.priority })));

console.log("Сводка по приоритетам (getPrioritySummary):");
console.log(getPrioritySummary(currentVariant));
