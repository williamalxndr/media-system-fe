"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/features/admin/layout/PageHeader";
import { StatCard } from "@/features/admin/components/StatCard";
import { StatusPill, type StatusTone } from "@/features/admin/components/StatusPill";
import { EmptyState } from "@/features/admin/components/EmptyState";
import { api } from "@/shared/lib/apiFetch";

interface Token {
  id: number;
  token: string;
  content_id: number;
  expires_at: string;
  started_at: string | null;
  is_revoked: boolean;
  created_at: string;
}

interface Content {
  id: number;
}

function tokenStatus(token: Token): { tone: StatusTone; label: string } {
  if (token.is_revoked) return { tone: "revoked", label: "Revoked" };
  if (new Date(token.expires_at) < new Date())
    return { tone: "expired", label: "Expired" };
  if (!token.started_at) return { tone: "pending", label: "Unused" };
  return { tone: "active", label: "Active" };
}

function shortToken(value: string): string {
  if (value.length <= 14) return value;
  return `${value.slice(0, 8)}…${value.slice(-4)}`;
}

export default function AdminDashboard() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [contents, setContents] = useState<Content[]>([]);
  const [pendingOrders, setPendingOrders] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api
        .get<{ results: Token[] }>("/access/access-tokens/")
        .then((r) => r.results)
        .catch(() => []),
      api
        .get<{ results: Content[] }>("/contents/")
        .then((r) => r.results)
        .catch(() => []),
      api
        .get<{ results: unknown[] }>("/orders/admin/?status=pending")
        .then((r) => r.results.length)
        .catch(() => 0),
    ]).then(([t, c, p]) => {
      setTokens(t);
      setContents(c);
      setPendingOrders(p);
      setLoading(false);
    });
  }, []);

  const now = Date.now();
  const activeTokens = tokens.filter(
    (t) => !t.is_revoked && new Date(t.expires_at).getTime() > now
  ).length;
  const issuedTotal = tokens.length;

  const recentTokens = [...tokens]
    .sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
    .slice(0, 5);

  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of access tokens, orders, and content."
      />

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active Tokens" value={loading ? "—" : activeTokens} />
        <StatCard
          label="Issued"
          value={loading ? "—" : issuedTotal}
          hint="All tokens ever issued"
        />
        <StatCard
          label="Pending Orders"
          value={loading ? "—" : pendingOrders}
          hint="Orders awaiting a token"
        />
        <StatCard label="Content Items" value={loading ? "—" : contents.length} />
      </div>

      <section className="rounded-md border border-[var(--color-border)] bg-white">
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-3">
          <div className="h-section">Recent Tokens</div>
          <Button asChild variant="ghost" size="sm">
            <Link href="/admin/tokens">View all</Link>
          </Button>
        </header>
        {loading ? (
          <p className="px-5 py-6 text-sm text-[var(--color-ink-muted)]">Loading…</p>
        ) : recentTokens.length === 0 ? (
          <EmptyState
            title="No tokens issued"
            description="Once you issue tokens, they'll show up here."
            action={
              <Button asChild variant="pill" size="pill">
                <Link href="/admin/tokens/create">New Token</Link>
              </Button>
            }
          />
        ) : (
          <ul className="divide-y divide-[var(--color-border)]">
            {recentTokens.map((t) => {
              const s = tokenStatus(t);
              return (
                <li
                  key={t.id}
                  className="flex items-center justify-between px-5 py-3 text-sm"
                >
                  <div className="flex flex-col">
                    <code className="font-mono text-xs text-zinc-700">
                      {shortToken(t.token)}
                    </code>
                    <span className="text-xs text-[var(--color-ink-muted)]">
                      Content #{t.content_id} ·{" "}
                      {new Date(t.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <StatusPill tone={s.tone}>{s.label}</StatusPill>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </>
  );
}
