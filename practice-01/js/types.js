"use strict";

console.log("=== Исследование типов данных и преобразований ===");
console.log("Студент: Саргсян Давид | Группа: ЭФБО-13-25 | Вариант: 8\n");

// 1. "8" + 2
const res1 = "8" + 2;
console.log('1. "8" + 2:');
console.log("Результат:", res1);
console.log("Тип результата:", typeof res1, "\n");

// 2. "8" - 2
const res2 = "8" - 2;
console.log('2. "8" - 2:');
console.log("Результат:", res2);
console.log("Тип результата:", typeof res2, "\n");

// 3. Number("8") + 2
const res3 = Number("8") + 2;
console.log('3. Number("8") + 2:');
console.log("Результат:", res3);
console.log("Тип результата:", typeof res3, "\n");

// 4. "12" > "3"
const res4 = "12" > "3";
console.log('4. "12" > "3":');
console.log("Результат:", res4);
console.log("Тип результата:", typeof res4, "\n");

// 5. 12 === "12"
const res5 = 12 === "12";
console.log('5. 12 === "12":');
console.log("Результат:", res5);
console.log("Тип результата:", typeof res5, "\n");

// 6. Number("")
const res6 = Number("");
console.log('6. Number(""):');
console.log("Результат:", res6);
console.log("Тип результата:", typeof res6, "\n");

// 7. Number("text")
const res7 = Number("text");
console.log('7. Number("text"):');
console.log("Результат:", res7);
console.log("Тип результата:", typeof res7, "\n");

// 8. Boolean("false")
const res8 = Boolean("false");
console.log('8. Boolean("false"):');
console.log("Результат:", res8);
console.log("Тип результата:", typeof res8, "\n");

// 9. typeof null
const res9 = typeof null;
console.log("9. typeof null:");
console.log("Результат:", res9);
console.log("Тип результата:", typeof res9, "\n");

// 10. typeof NaN
const res10 = typeof NaN;
console.log("10. typeof NaN:");
console.log("Результат:", res10);
console.log("Тип результата:", typeof res10, "\n");
