import { api } from "@/shared/lib/apiFetch";
import type { User, LoginRequest, AuthResponse } from "../types";

export async function login(username: string, password: string): Promise<User> {
  const response = await api.post<AuthResponse>("/api/auth/login/", {
    username,
    password,
  });
  return response.user;
}

export async function logout(): Promise<void> {
  await api.post("/api/auth/logout/", {});
}

export async function getMe(): Promise<User | null> {
  try {
    const response = await api.get<AuthResponse>("/api/auth/me/");
    return response.user;
  } catch {
    return null;
  }
}
