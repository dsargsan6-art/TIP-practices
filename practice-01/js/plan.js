"use strict";

// Входные данные (Вариант 8)
const totalTasks = 14;
const completedTasks = 4;
const dailyLimit = 4;

function calculatePlan(total, completed, limit) {
  // 1. Проверка totalTasks и completedTasks
  if (typeof total !== "number" || typeof completed !== "number" || Number.isNaN(total) || Number.isNaN(completed) || !Number.isFinite(total) || !Number.isFinite(completed)) {
    console.log("Ошибка: общее или выполненное количество задач задано не числом");
    return;
  }
  if (!Number.isInteger(total) || !Number.isInteger(completed)) {
    console.log("Ошибка: дробное количество задач недопустимо");
    return;
  }
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

  // 2. Проверка dailyLimit
  if (typeof limit !== "number" || Number.isNaN(limit) || !Number.isFinite(limit)) {
    console.log("Ошибка: дневная норма задана не числом");
    return;
  }
  if (!Number.isInteger(limit)) {
    console.log("Ошибка: дробной дневной нормы быть не должно");
    return;
  }
  if (limit < 1) {
    console.log("Ошибка: дневная норма должна быть не менее 1");
    return;
  }
  if (limit > 1000) {
    console.log("Ошибка: превышена верхняя граница дневной нормы (максимум 1000)");
    return;
  }

  // 3. Вычисление остатка
  let remaining = total - completed;
  console.log(`Осталось задач: ${remaining}`);

  if (remaining === 0) {
    console.log("Все задачи уже выполнены");
    console.log("Потребуется дней: 0");
    return;
  }

  // 4. Пошаговое планирование через цикл while
  let day = 0;
  while (remaining > 0) {
    day += 1;
    const tasksToday = Math.min(limit, remaining);
    remaining -= tasksToday;
    console.log(`День ${day}: выполнено ${tasksToday}, осталось ${remaining}`);
  }

  console.log(`Потребуется дней: ${day}`);
}

calculatePlan(totalTasks, completedTasks, dailyLimit);
