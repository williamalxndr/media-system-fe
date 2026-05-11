const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL?.trim() || "http://localhost:8000/api";

export const API_BASE_URL = apiBaseUrl.replace(/\/+$/, "");
