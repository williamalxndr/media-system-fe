import { api } from "@/shared/lib/apiFetch";
import type { User } from "../types";

export async function login(username: string, password: string): Promise<User> {
  const response = await api.post<User>("/auth/login/", {
    username,
    password,
  });
  return response;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout/", {});
}

export async function getMe(): Promise<User | null> {
  try {
    const response = await api.get<User>("/auth/me/");
    return response;
  } catch {
    return null;
  }
}
