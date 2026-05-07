import { API_BASE_URL } from "@/shared/config";

export interface ApiError {
  status?: number;
  detail?: string;
  [key: string]: unknown;
}

function getCsrfToken(): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : null;
}

const UNSAFE_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const isFormData =
      typeof FormData !== "undefined" && options.body instanceof FormData;
    const headers: Record<string, string> = {
      ...((options.headers as Record<string, string> | undefined) ?? {}),
    };
    if (!isFormData && !("Content-Type" in headers)) {
      headers["Content-Type"] = "application/json";
    }
    const method = (options.method ?? "GET").toUpperCase();
    if (UNSAFE_METHODS.has(method) && !("X-CSRFToken" in headers)) {
      const token = getCsrfToken();
      if (token) headers["X-CSRFToken"] = token;
    }

    const response = await fetch(url, {
      credentials: "include",
      ...options,
      headers,
    });

    if (!response.ok) {
      let error: ApiError = {};
      try {
        error = await response.json();
      } catch {
        error = { detail: `HTTP ${response.status}` };
      }
      error.status = response.status;
      throw error;
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  get<T>(path: string): Promise<T> {
    return this.request<T>(path);
  }

  post<T>(path: string, body: unknown): Promise<T> {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    return this.request<T>(path, {
      method: "POST",
      body: isFormData ? (body as FormData) : JSON.stringify(body),
    });
  }

  patch<T>(path: string, body: unknown): Promise<T> {
    const isFormData = typeof FormData !== "undefined" && body instanceof FormData;
    return this.request<T>(path, {
      method: "PATCH",
      body: isFormData ? (body as FormData) : JSON.stringify(body),
    });
  }

  delete<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "DELETE" });
  }
}

export const api = new ApiClient();
