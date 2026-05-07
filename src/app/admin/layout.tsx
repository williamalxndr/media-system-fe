"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, loading, logout } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user || !user.is_admin) {
    router.push("/login");
    return null;
  }

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="w-64 bg-white border-r border-slate-200 p-6">
        <h2 className="text-lg font-semibold mb-6">Admin</h2>
        <nav className="space-y-2">
          <Link href="/admin" className="block px-4 py-2 rounded hover:bg-slate-100">
            Dashboard
          </Link>
          <Link href="/admin/events" className="block px-4 py-2 rounded hover:bg-slate-100">
            Events
          </Link>
          <Link href="/admin/content" className="block px-4 py-2 rounded hover:bg-slate-100">
            Content
          </Link>
          <Link href="/admin/tokens" className="block px-4 py-2 rounded hover:bg-slate-100">
            Tokens
          </Link>
        </nav>
        <div className="mt-8 pt-6 border-t border-slate-200">
          <p className="text-sm text-slate-600 mb-4">{user.email}</p>
          <Button variant="outline" className="w-full" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </aside>
      <main className="flex-1 p-8">{children}</main>
    </div>
  );
}
