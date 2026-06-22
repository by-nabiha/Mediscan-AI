type TokenGetter = () => string | null;

let authTokenGetter: TokenGetter = () => null;

export function setAuthTokenGetter(getter: TokenGetter) {
  authTokenGetter = getter;
}

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function customFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const headers = new Headers(options.headers);
  const token = authTokenGetter();

  if (token) {
    headers.set("authorization", `Bearer ${token}`);
  }

  if (options.body && !headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let message = "Request failed";
    try {
      const errorBody = (await response.json()) as { message?: string };
      message = errorBody.message ?? message;
    } catch {
      message = response.statusText || message;
    }
    throw new ApiError(message, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json() as Promise<T>;
}

export const api = {
  get: <T>(endpoint: string) => customFetch<T>(endpoint),
  post: <T>(endpoint: string, data?: unknown) =>
    customFetch<T>(endpoint, {
      method: "POST",
      body: data !== undefined ? JSON.stringify(data) : undefined,
    }),
};

export interface MutationPayload<T = unknown> {
  data: T;
}

export function createMutationFn<TPayload, TResult>(
  endpoint: string,
) {
  return ({ data }: MutationPayload<TPayload>) =>
    api.post<TResult>(endpoint, data);
}
