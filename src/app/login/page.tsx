"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login, loading, error } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      router.push("/admin");
    } catch {
      // Error is handled by useAuth
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--color-surface-muted)] p-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="block text-xl font-black uppercase tracking-tight text-zinc-950">
            Hahaha Corp
          </span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
            Admin
          </span>
        </div>

        <div className="rounded-md border border-[var(--color-border)] bg-white p-6">
          <div className="mb-5">
            <h1 className="h-page">Sign in</h1>
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
              Use your admin credentials to continue.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="admin"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                required
              />
            </div>

            {error && (
              <p className="text-sm text-[var(--color-destructive)]">{error}</p>
            )}

            <Button
              type="submit"
              variant="pill"
              size="pill"
              className="w-full"
              disabled={loading}
            >
              {loading ? "Signing in…" : "Sign in"}
            </Button>
          </form>
        </div>
      </div>
    </main>
  );
}
