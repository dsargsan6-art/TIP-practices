"use strict";

// Дополнительное задание (Вариант А): Входные данные в виде строк
// Студент: Саргсян Давид | Группа: ЭФБО-13-25 | Вариант: 8

function parseTaskInput(rawValue, paramName) {
  // 1. Проверка, что передана именно строка
  if (typeof rawValue !== "string") {
    return { ok: false, error: `Параметр "${paramName}" должен быть строкой, получено: ${typeof rawValue}` };
  }

  // 2. Удаление краевых пробелов
  const trimmed = rawValue.trim();

  // 3. Отклонение пустых строк и строк из одних пробелов
  if (trimmed.length === 0) {
    return { ok: false, error: `Параметр "${paramName}" не должен быть пустой строкой` };
  }

  // 4. Преобразование через Number()
  const parsed = Number(trimmed);

  // 5. Проверка на NaN, Infinity и конечность числа
  if (Number.isNaN(parsed) || !Number.isFinite(parsed)) {
    return { ok: false, error: `Параметр "${paramName}" содержит некорректное числовое значение: "${rawValue}"` };
  }

  // 6. Проверка целочисленности
  if (!Number.isInteger(parsed)) {
    return { ok: false, error: `Параметр "${paramName}" должен быть целым числом: "${rawValue}"` };
  }

  return { ok: true, value: parsed };
}

function processStringProgress(rawTotal, rawCompleted) {
  const totalResult = parseTaskInput(rawTotal, "totalTasks");
  if (!totalResult.ok) {
    console.log(`Ошибка: ${totalResult.error}`);
    return;
  }

  const completedResult = parseTaskInput(rawCompleted, "completedTasks");
  if (!completedResult.ok) {
    console.log(`Ошибка: ${completedResult.error}`);
    return;
  }

  const total = totalResult.value;
  const completed = completedResult.value;

  if (total < 0 || completed < 0) {
    console.log("Ошибка: отрицательное количество задач недопустимо");
    return;
  }

  if (total > 1000) {
    console.log("Ошибка: превышена верхняя граница общего количества задач (максимум 1000)");
    return;
  }

  if (completed > total) {
    console.log("Ошибка: выполнено больше задач, чем существует");
    return;
  }

  if (total === 0 && completed === 0) {
    console.log("Задач пока нет");
    return;
  }

  const remaining = total - completed;
  const progressPercent = ((completed / total) * 100).toFixed(1);

  let status;
  if (completed === 0) {
    status = "Не начато";
  } else if (completed === total) {
    status = "Завершено";
  } else {
    status = "В работе";
  }

  console.log(`Всего: ${total}, Выполнено: ${completed}, Осталось: ${remaining}, Прогресс: ${progressPercent}%, Статус: ${status}`);
}

// Тестовые запуски
console.log("--- Вариант 8 (строки '14' и '4') ---");
processStringProgress("14", "4");

console.log("\n--- Проверка различных входных данных ---");
const testCases = [
  [" 14 ", " 4 "],
  ["", "5"],
  ["   ", "2"],
  ["abc", "2"],
  ["14", "2.5"],
  ["Infinity", "2"],
  [null, "2"],
  [undefined, "2"],
  ["0", "0"],
  ["10", "15"],
];

testCases.forEach(([tot, comp]) => {
  console.log(`\nВход: total=${JSON.stringify(tot)}, completed=${JSON.stringify(comp)}`);
  processStringProgress(tot, comp);
});
