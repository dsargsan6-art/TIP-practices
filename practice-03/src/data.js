// Общий контрольный набор.
// Идентификатор задачи не совпадает с её индексом в массиве.
export const demoTasks = [
  { id: 1, title: "Изучить функции", completed: true, priority: "medium" },
  { id: 4, title: "Подготовить модель задач", completed: false, priority: "high" },
  { id: 7, title: "Проверить методы массивов", completed: false, priority: "low" },
  { id: 10, title: "Оформить README", completed: true, priority: "medium" },
];

// Индивидуальный вариант: 8
// Тематика: Оформление технической документации
// Идентификаторы: 11, 23, 37, 41, 58, 64
// Первые K = 3 задач выполнены изначально (id: 11, 23, 37)
export const variantNumber = 8;
export const variantTasks = [
  { id: 11, title: "Составить план технической документации", completed: true, priority: "high" },
  { id: 23, title: "Описать архитектуру и структуру каталогов", completed: true, priority: "medium" },
  { id: 37, title: "Подготовить руководство по установке окружения", completed: true, priority: "low" },
  { id: 41, title: "Сформировать справочник API сервисов", completed: false, priority: "high" },
  { id: 58, title: "Написать инструкцию по развертыванию", completed: false, priority: "medium" },
  { id: 64, title: "Провести финальную вычитку и рецензирование", completed: false, priority: "low" },
];
