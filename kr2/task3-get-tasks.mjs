// КР2, задание 3: получение задач с сервера через getTasks (ПР5).
// Перед запуском: npm start в папке practice-05 (API на http://127.0.0.1:5505/api).
import { createApiClient } from "../practice-05/src/api-client.js";
import { createTaskApi } from "../practice-05/src/task-api.js";

const client = createApiClient({ baseUrl: "http://127.0.0.1:5505/api", timeoutMs: 2000 });
const api = createTaskApi(client);

// Фильтры уходят серверу в query-параметрах: /tasks?completed=false&priority=high
const { tasks, meta } = await api.getTasks({ completed: false, priority: "high" });

console.log("id задач:", tasks.map((task) => task.id));
console.log("meta.total:", meta.total);
