"use strict";

// Исправленная версия программы после отладки в DevTools
// Студент: Саргсян Давид | Группа: ЭФБО-13-25 | Вариант: 8

const plannedText = "8";
const completedText = "3";
const additionalText = "2";

// Исправление 1: явное числовое преобразование через Number()
// Вместо конкатенации строк "3" + "2" = "32" получаем сложение чисел 3 + 2 = 5
const completedTotal = Number(completedText) + Number(additionalText);
const remainingTasks = Number(plannedText) - completedTotal;

console.log("Выполнено:", completedTotal);
console.log("Осталось:", remainingTasks);

let controlSum = 0;

// Исправление 2: условие границы цикла taskNumber <= 4 (включение 4-й задачи)
// Было taskNumber < 4 (суммировались только 1, 2, 3 = 6), стало 1 + 2 + 3 + 4 = 10
for (let taskNumber = 1; taskNumber <= 4; taskNumber += 1) {
  controlSum += taskNumber;
}

console.log("Контрольная сумма:", controlSum);
