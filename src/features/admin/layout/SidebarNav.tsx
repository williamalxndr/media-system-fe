"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/shared/components/ui/button";

interface NavItem {
  href: string;
  label: string;
}

interface NavGroup {
  eyebrow: string;
  items: NavItem[];
}

const GROUPS: NavGroup[] = [
  {
    eyebrow: "Operations",
    items: [
      { href: "/admin", label: "Dashboard" },
      { href: "/admin/orders", label: "Orders" },
      { href: "/admin/tokens", label: "Tokens" },
    ],
  },
  {
    eyebrow: "Catalog",
    items: [
      { href: "/admin/events", label: "Events" },
      { href: "/admin/content", label: "Content" },
    ],
  },
];

interface SidebarNavProps {
  email?: string;
  onLogout: () => void;
}

export function SidebarNav({ email, onLogout }: SidebarNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="hidden md:flex md:w-60 shrink-0 flex-col border-r border-[var(--color-border)] bg-white sticky top-0 h-screen">
      <div className="px-6 py-6">
        <Link href="/admin" className="block">
          <span className="block text-base font-black tracking-tight uppercase leading-none">
            Hahaha Corp
          </span>
          <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-ink-muted)]">
            Admin
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-3 pb-6 space-y-6">
        {GROUPS.map((group) => (
          <div key={group.eyebrow} className="space-y-1">
            <div className="px-3 pb-1 h-section">{group.eyebrow}</div>
            {group.items.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative flex h-9 items-center rounded-md px-3 text-sm transition-colors ${
                    active
                      ? "bg-zinc-100 text-zinc-950 font-medium"
                      : "text-[var(--color-ink-muted)] hover:bg-zinc-50 hover:text-zinc-950"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1.5 bottom-1.5 w-[2px] rounded-full bg-zinc-950" />
                  )}
                  {item.label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="border-t border-[var(--color-border)] px-4 py-4 space-y-2">
        {email && (
          <p className="truncate text-xs text-[var(--color-ink-muted)]" title={email}>
            {email}
          </p>
        )}
        <Button variant="ghost" size="sm" className="w-full justify-start" onClick={onLogout}>
          Logout
        </Button>
      </div>
    </aside>
  );
}
