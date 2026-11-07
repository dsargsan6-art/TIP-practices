export class ApiError extends Error {
  constructor(message, {
    kind,
    status = null,
    code = null,
    details = null,
    url = null,
    cause,
  } = {}) {
    super(message, cause === undefined ? undefined : { cause });
    this.name = "ApiError";
    this.kind = kind;
    this.status = status;
    this.code = code;
    this.details = details;
    this.url = url;
  }
}

// Создаёт URL относительно baseUrl и добавляет непустые параметры query.
// Значения кодируются средствами URL и URLSearchParams, а не вручную.
export function buildUrl(baseUrl, path, query = {}) {
  const url = new URL(baseUrl);
  const basePath = url.pathname.replace(/\/+$/, "");
  const relativePath = String(path).replace(/^\/+/, "");
  url.pathname = `${basePath}/${relativePath}`;

  for (const [name, value] of Object.entries(query ?? {})) {
    // false и 0 сохраняются; пропускаются только undefined, null и пустая строка
    if (value === undefined || value === null || value === "") continue;
    url.searchParams.append(name, String(value));
  }
  return url.toString();
}

function normalizeBaseUrl(baseUrl) {
  if (typeof baseUrl !== "string") {
    throw new TypeError("baseUrl должен быть строкой с абсолютным http(s)-адресом.");
  }
  const url = new URL(baseUrl); // для относительного адреса выбросит TypeError
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    throw new TypeError("baseUrl должен использовать протокол http или https.");
  }
  if (url.search !== "" || url.hash !== "") {
    throw new TypeError("baseUrl не должен содержать query и hash.");
  }
  return url.toString().replace(/\/+$/, "");
}

function isJsonContentType(response) {
  const type = response.headers.get("content-type") ?? "";
  return /(^|[/+])json\b/i.test(type);
}

// Разбирает тело ошибочного ответа; при неудаче возвращает null.
async function readErrorPayload(response) {
  if (!isJsonContentType(response)) return null;
  try {
    const payload = await response.json();
    return payload && typeof payload === "object" ? payload.error ?? null : null;
  } catch {
    return null;
  }
}

// fetchFn передаётся явно, чтобы модуль можно было проверить без реальной сети.
// Возвращаемый объект: { requestJson(path, { query, signal, timeoutMs } = {}) }.
export function createApiClient({
  baseUrl,
  fetchFn = globalThis.fetch,
  timeoutMs = 2000,
} = {}) {
  const normalizedBase = normalizeBaseUrl(baseUrl);
  if (typeof fetchFn !== "function") {
    throw new TypeError("fetchFn должен быть функцией.");
  }
  if (!Number.isSafeInteger(timeoutMs) || timeoutMs <= 0) {
    throw new TypeError("timeoutMs должен быть положительным целым числом.");
  }

  async function requestJson(path, { query, signal, timeoutMs: ownTimeout } = {}) {
    const url = buildUrl(normalizedBase, path, query);
    const limit = ownTimeout ?? timeoutMs;

    const controller = new AbortController();
    let timedOut = false;
    const timer = setTimeout(() => {
      timedOut = true;
      controller.abort();
    }, limit);
    const forwardAbort = () => controller.abort(signal.reason);
    if (signal) {
      if (signal.aborted) forwardAbort();
      else signal.addEventListener("abort", forwardAbort, { once: true });
    }

    try {
      let response;
      try {
        response = await fetchFn(url, {
          method: "GET",
          headers: { Accept: "application/json" },
          signal: controller.signal,
        });
      } catch (cause) {
        if (timedOut) {
          throw new ApiError("Превышено время ожидания ответа сервера.", { kind: "timeout", url, cause });
        }
        if (controller.signal.aborted) {
          throw new ApiError("Запрос отменён.", { kind: "aborted", url, cause });
        }
        throw new ApiError("Не удалось выполнить запрос: сервер недоступен.", { kind: "network", url, cause });
      }

      if (typeof Response === "undefined" || !(response instanceof Response)) {
        throw new ApiError("Получен ответ неверного типа.", { kind: "invalid-response", url });
      }

      // Явная проверка HTTP-статуса: fetch не отклоняется на ответах 4xx и 5xx.
      if (!response.ok) {
        const apiError = await readErrorPayload(response);
        throw new ApiError(
          apiError?.message ?? `Сервер вернул HTTP ${response.status}.`,
          {
            kind: "http",
            status: response.status,
            code: apiError?.code ?? null,
            details: apiError?.details ?? null,
            url,
          },
        );
      }

      if (response.status === 204) return null;

      if (!isJsonContentType(response)) {
        throw new ApiError("Сервер вернул ответ не в формате JSON.", {
          kind: "invalid-response",
          status: response.status,
          url,
        });
      }
      try {
        return await response.json();
      } catch (cause) {
        if (timedOut) {
          throw new ApiError("Превышено время ожидания ответа сервера.", { kind: "timeout", url, cause });
        }
        throw new ApiError("Ответ сервера содержит некорректный JSON.", {
          kind: "invalid-response",
          status: response.status,
          url,
          cause,
        });
      }
    } finally {
      clearTimeout(timer);
      if (signal) signal.removeEventListener("abort", forwardAbort);
    }
  }

  return { requestJson };
}
