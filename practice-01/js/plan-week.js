"use strict";

// Дополнительное задание (Вариант Б): План с выходными днями
// Студент: Саргсян Давид | Группа: ЭФБО-13-25 | Вариант: 8

function calculateWeekPlan(total, completed, limit) {
  if (typeof total !== "number" || typeof completed !== "number" || typeof limit !== "number" ||
      !Number.isInteger(total) || !Number.isInteger(completed) || !Number.isInteger(limit) ||
      total < 0 || completed < 0 || completed > total || limit < 1 || total > 1000 || limit > 1000) {
    console.log("Ошибка: некорректные входные параметры для планирования недели");
    return;
  }

  let remaining = total - completed;
  console.log(`\nИсходные данные: всего ${total}, выполнено ${completed}, осталось ${remaining}, норма в рабочий день ${limit}`);

  if (remaining === 0) {
    console.log("Все задачи уже выполнены. Рабочих дней: 0, календарных дней: 0.");
    return { workDays: 0, calendarDays: 0 };
  }

  const daysOfWeek = ["Понедельник", "Вторник", "Среда", "Четверг", "Пятница", "Суббота", "Воскресенье"];
  let calendarDay = 0;
  let workDay = 0;

  while (remaining > 0) {
    calendarDay += 1;
    const dayIndex = (calendarDay - 1) % 7; // 0..6: 0 = Пн, 5 = Сб, 6 = Вс
    const dayName = daysOfWeek[dayIndex];
    const isWeekend = dayIndex === 5 || dayIndex === 6;

    if (isWeekend) {
      console.log(`Календарный день ${calendarDay} (${dayName}): Выходной день (задачи не выполняются)`);
    } else {
      workDay += 1;
      const tasksToday = Math.min(limit, remaining);
      remaining -= tasksToday;
      console.log(`Календарный день ${calendarDay} (${dayName}, раб. день ${workDay}): выполнено ${tasksToday}, осталось ${remaining}`);
    }
  }

  console.log(`Итого: рабочих дней: ${workDay}, календарных дней: ${calendarDay}`);
  return { workDays: workDay, calendarDays: calendarDay };
}

console.log("=== Контрольный пример из методички: total=6, completed=0, limit=1 ===");
calculateWeekPlan(6, 0, 1);

console.log("\n=== Расчет для Варианта 8: total=14, completed=4, limit=4 ===");
calculateWeekPlan(14, 4, 4);

console.log("\n=== Дополнительный тест 1: total=10, completed=10, limit=2 ===");
calculateWeekPlan(10, 10, 2);

console.log("\n=== Дополнительный тест 2: total=8, completed=1, limit=2 ===");
calculateWeekPlan(8, 1, 2);
