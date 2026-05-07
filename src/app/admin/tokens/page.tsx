"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/features/admin/layout/PageHeader";
import { DataTable, type Column } from "@/features/admin/components/DataTable";
import { StatusPill, type StatusTone } from "@/features/admin/components/StatusPill";
import { CopyField } from "@/features/admin/components/CopyField";
import { WhatsAppShareDialog } from "@/features/admin/components/WhatsAppShareDialog";
import { api } from "@/shared/lib/apiFetch";

interface TokenOrder {
  id: number;
  customer_name: string;
  whatsapp_e164: string;
}

interface Token {
  id: number;
  token: string;
  content_id: number;
  expires_at: string;
  max_duration: number;
  started_at: string | null;
  is_revoked: boolean;
  order: TokenOrder | null;
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

export default function TokensPage() {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [revoking, setRevoking] = useState<number | null>(null);

  useEffect(() => {
    loadTokens();
  }, []);

  const loadTokens = () => {
    setLoading(true);
    api
      .get<{ results: Token[] }>("/access/access-tokens/")
      .then((res) => setTokens(res.results))
      .finally(() => setLoading(false));
  };

  const handleRevoke = async (id: number) => {
    setRevoking(id);
    try {
      await api.patch(`/access/access-tokens/${id}/revoke/`, {});
      loadTokens();
    } finally {
      setRevoking(null);
    }
  };

  const watchUrl = (token: string) =>
    typeof window === "undefined"
      ? `/download?token=${token}`
      : `${window.location.origin}/download?token=${token}`;

  const columns: Column<Token>[] = [
    {
      key: "token",
      header: "Token",
      render: (row) => (
        <div className="flex items-center gap-2">
          <code className="font-mono text-xs text-zinc-700">{shortToken(row.token)}</code>
        </div>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (row) =>
        row.order ? (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-[var(--color-ink)]">
              {row.order.customer_name}
            </span>
            <span className="font-mono text-xs text-[var(--color-ink-muted)]">
              +{row.order.whatsapp_e164}
            </span>
          </div>
        ) : (
          <span className="text-xs text-[var(--color-ink-subtle)]">Ad-hoc</span>
        ),
    },
    {
      key: "content",
      header: "Content",
      render: (row) => <span className="text-sm">#{row.content_id}</span>,
    },
    {
      key: "expires",
      header: "Expires",
      render: (row) => (
        <span
          className="text-sm text-[var(--color-ink-muted)]"
          title={new Date(row.expires_at).toLocaleString()}
        >
          {new Date(row.expires_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "max_duration",
      header: "Max",
      render: (row) => (
        <span className="text-sm text-[var(--color-ink-muted)]">{row.max_duration}s</span>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const s = tokenStatus(row);
        return <StatusPill tone={s.tone}>{s.label}</StatusPill>;
      },
    },
    {
      key: "share",
      header: "Watch URL",
      render: (row) => (
        <CopyField
          value={watchUrl(row.token)}
          display={`/download?token=${shortToken(row.token)}`}
          buttonLabel="Copy"
        />
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) =>
        row.is_revoked ? null : (
          <div className="flex items-center justify-end gap-1">
            <WhatsAppShareDialog
              tokenUrl={watchUrl(row.token)}
              customerName={row.order?.customer_name}
              phoneNumber={row.order?.whatsapp_e164}
            />
            <Button
              size="sm"
              variant="ghost"
              className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
              onClick={() => handleRevoke(row.id)}
              disabled={revoking === row.id}
            >
              {revoking === row.id ? "Revoking…" : "Revoke"}
            </Button>
          </div>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Access Tokens"
        description="One-time signed links viewers use to watch or download content."
        actions={
          <Button asChild variant="pill" size="pill">
            <Link href="/admin/tokens/create">New Token</Link>
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={tokens}
        rowKey={(row) => row.id}
        loading={loading}
        empty={{
          title: "No tokens yet",
          description: "Issue a token to share a piece of content with a viewer.",
          action: (
            <Button asChild variant="pill" size="pill">
              <Link href="/admin/tokens/create">New Token</Link>
            </Button>
          ),
        }}
      />
    </>
  );
}
