type HttpMethod = "GET" | "POST" | "PATCH" | "DELETE"

type RequestOptions = {
  method?: HttpMethod
  body?: unknown
  headers?: HeadersInit
  signal?: AbortSignal
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "/api"

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`
  const url = API_BASE_URL.startsWith("http")
    ? new URL(normalizedPath, API_BASE_URL).toString()
    : `${API_BASE_URL}${normalizedPath}`
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  }

  let response: Response

  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: options.signal,
    })
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw error
    }

    throw new Error("Nao foi possivel conectar com a API")
  }

  if (!response.ok) {
    const message = await response.text()
    throw new Error(message || "Erro na requisicao")
  }

  if (response.status === 204) {
    return undefined as T
  }

  return (await response.json()) as T
}

export const api = {
  get: <T>(path: string, options?: Omit<RequestOptions, "method" | "body">) =>
    request<T>(path, options),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "POST", body }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: "PATCH", body }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
}
