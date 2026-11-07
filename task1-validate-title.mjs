// КР2, задание 1: проверка названия задачи в validateTaskDraft (ПР4).
import { validateTaskDraft } from "../practice-04/src/form-validation.js";

// Общие условия обоих вызовов: tasks = [], draft.id = "20", draft.priority = "high"
const tasks = [];
const base = { id: "20", priority: "high" };

console.log('Вызов 1: title = "  Изучить localStorage  "');
console.log(validateTaskDraft({ ...base, title: "  Изучить localStorage  " }, tasks));

console.log('Вызов 2: title = "   "');
console.log(validateTaskDraft({ ...base, title: "   " }, tasks));
