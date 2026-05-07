"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { SidebarNav } from "./SidebarNav";

interface AdminShellProps {
  children: React.ReactNode;
}

export function AdminShell({ children }: AdminShellProps) {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[var(--color-surface-muted)] text-sm text-[var(--color-ink-muted)]">
        Loading…
      </div>
    );
  }

  if (!user || !user.is_staff) {
    router.push("/login");
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-surface-muted)]">
      <SidebarNav email={user.email} onLogout={handleLogout} />
      <main className="flex-1 min-w-0">
        <div className="mx-auto w-full max-w-6xl px-6 py-8 md:px-10 space-y-6">
          {children}
        </div>
      </main>
    </div>
  );
}
