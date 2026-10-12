"use strict";

// Входные данные (Вариант 8)
const totalTasks = 14;
const completedTasks = 4;

function calculateProgress(total, completed) {
  // 1. Проверка типов данных на число и исключение NaN / Infinity
  if (typeof total !== "number" || typeof completed !== "number" || Number.isNaN(total) || Number.isNaN(completed) || !Number.isFinite(total) || !Number.isFinite(completed)) {
    console.log("Ошибка: вместо числа передано некорректное значение или строка");
    return;
  }

  // 2. Проверка на целочисленность
  if (!Number.isInteger(total) || !Number.isInteger(completed)) {
    console.log("Ошибка: дробное количество задач недопустимо");
    return;
  }

  // 3. Проверка неотрицательности
  if (total < 0 || completed < 0) {
    console.log("Ошибка: отрицательное количество задач недопустимо");
    return;
  }

  // 4. Проверка верхней границы
  if (total > 1000) {
    console.log("Ошибка: превышена верхняя граница общего количества задач (максимум 1000)");
    return;
  }

  // 5. Проверка соотношения выполненных и общего количества
  if (completed > total) {
    console.log("Ошибка: выполнено больше задач, чем существует");
    return;
  }

  // 6. Частный случай: задач нет
  if (total === 0 && completed === 0) {
    console.log("Задач пока нет");
    return;
  }

  // 7. Расчёт показателей
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

  console.log(`Всего задач: ${total}`);
  console.log(`Выполнено: ${completed}`);
  console.log(`Осталось: ${remaining}`);
  console.log(`Прогресс: ${progressPercent}%`);
  console.log(`Статус: ${status}`);
}

calculateProgress(totalTasks, completedTasks);
