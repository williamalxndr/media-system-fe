"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/features/admin/layout/PageHeader";
import { DataTable, type Column } from "@/features/admin/components/DataTable";
import { StatusPill, type StatusTone } from "@/features/admin/components/StatusPill";
import { WhatsAppShareDialog } from "@/features/admin/components/WhatsAppShareDialog";
import { api } from "@/shared/lib/apiFetch";

type OrderStatus = "pending" | "fulfilled" | "cancelled";

interface OrderAccessToken {
  id: number;
  token: string;
  content_id: number;
  expires_at: string;
  max_duration: number;
  is_revoked: boolean;
}

interface Order {
  id: number;
  customer_name: string;
  whatsapp_number: string;
  whatsapp_e164: string;
  status: OrderStatus;
  notes: string;
  access_token: OrderAccessToken | null;
  created_at: string;
  updated_at: string;
}

const STATUS_TONE: Record<OrderStatus, StatusTone> = {
  pending: "pending",
  fulfilled: "active",
  cancelled: "revoked",
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: "Pending",
  fulfilled: "Fulfilled",
  cancelled: "Cancelled",
};

const FILTERS: { key: "" | OrderStatus; label: string }[] = [
  { key: "", label: "All" },
  { key: "pending", label: "Pending" },
  { key: "fulfilled", label: "Fulfilled" },
  { key: "cancelled", label: "Cancelled" },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"" | OrderStatus>("");
  const [cancelling, setCancelling] = useState<number | null>(null);
  const [issuing, setIssuing] = useState<number | null>(null);
  const [regenerating, setRegenerating] = useState<number | null>(null);
  const [issuedShareOrderId, setIssuedShareOrderId] = useState<number | null>(
    null
  );

  const loadOrders = (filter: "" | OrderStatus) => {
    setLoading(true);
    const path = filter ? `/orders/admin/?status=${filter}` : "/orders/admin/";
    api
      .get<{ results: Order[] }>(path)
      .then((res) => setOrders(res.results))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadOrders(statusFilter);
  }, [statusFilter]);

  const handleCancel = async (id: number) => {
    if (!window.confirm("Cancel this order?")) return;
    setCancelling(id);
    try {
      await api.patch(`/orders/admin/${id}/cancel/`, {});
      loadOrders(statusFilter);
    } finally {
      setCancelling(null);
    }
  };

  const handleRegenerate = async (id: number) => {
    if (
      !window.confirm(
        "Regenerate token? Link lama akan langsung tidak valid."
      )
    )
      return;
    setRegenerating(id);
    try {
      await api.post<Order>(`/orders/admin/${id}/regenerate-token/`, {});
      setIssuedShareOrderId(id);
      loadOrders(statusFilter);
    } catch (err) {
      const apiErr = err as { detail?: string };
      window.alert(apiErr.detail ?? "Failed to regenerate token.");
    } finally {
      setRegenerating(null);
    }
  };

  const handleIssue = async (id: number) => {
    setIssuing(id);
    try {
      await api.post<Order>(`/orders/admin/${id}/issue-token/`, {});
      setIssuedShareOrderId(id);
      loadOrders(statusFilter);
    } catch (err) {
      const apiErr = err as { detail?: string };
      window.alert(apiErr.detail ?? "Failed to issue token.");
    } finally {
      setIssuing(null);
    }
  };

  const watchUrl = (token: string) =>
    typeof window === "undefined"
      ? `/download?token=${token}`
      : `${window.location.origin}/download?token=${token}`;

  const columns: Column<Order>[] = [
    {
      key: "customer",
      header: "Customer",
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-medium text-[var(--color-ink)]">
            {row.customer_name}
          </span>
          <span className="font-mono text-xs text-[var(--color-ink-muted)]">
            +{row.whatsapp_e164}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusPill tone={STATUS_TONE[row.status]}>
          {STATUS_LABEL[row.status]}
        </StatusPill>
      ),
    },
    {
      key: "created",
      header: "Created",
      render: (row) => (
        <span
          className="text-sm text-[var(--color-ink-muted)]"
          title={new Date(row.created_at).toLocaleString()}
        >
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      align: "right",
      render: (row) => {
        if (row.status === "pending") {
          return (
            <div className="flex items-center justify-end gap-1">
              <Button
                variant="pill"
                size="sm"
                className="h-8 px-3"
                onClick={() => handleIssue(row.id)}
                disabled={issuing === row.id}
              >
                {issuing === row.id ? "Issuing…" : "Issue Token"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700"
                onClick={() => handleCancel(row.id)}
                disabled={cancelling === row.id}
              >
                {cancelling === row.id ? "Cancelling…" : "Cancel"}
              </Button>
            </div>
          );
        }
        if (row.status === "fulfilled" && row.access_token) {
          const shouldAutoOpen = issuedShareOrderId === row.id;
          return (
            <div className="flex items-center justify-end gap-1">
              <WhatsAppShareDialog
                key={shouldAutoOpen ? `auto-${row.id}` : `manual-${row.id}`}
                tokenUrl={watchUrl(row.access_token.token)}
                customerName={row.customer_name}
                phoneNumber={row.whatsapp_e164}
                defaultOpen={shouldAutoOpen}
              />
              <Button
                size="sm"
                variant="ghost"
                className="text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
                onClick={() => handleRegenerate(row.id)}
                disabled={regenerating === row.id}
              >
                {regenerating === row.id ? "Regenerating…" : "Regenerate"}
              </Button>
            </div>
          );
        }
        return (
          <span className="text-xs text-[var(--color-ink-subtle)]">—</span>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Orders"
        description="Customer access requests. Issue a token to fulfill an order."
        actions={
          <div className="flex items-center gap-1 rounded-full border border-[var(--color-border)] bg-white p-0.5 text-xs">
            {FILTERS.map((f) => {
              const active = statusFilter === f.key;
              return (
                <button
                  key={f.key || "all"}
                  type="button"
                  onClick={() => setStatusFilter(f.key)}
                  className={`rounded-full px-3 py-1 font-semibold uppercase tracking-wider transition-colors ${
                    active
                      ? "bg-zinc-950 text-white"
                      : "text-[var(--color-ink-muted)] hover:text-[var(--color-ink)]"
                  }`}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        }
      />
      <DataTable
        columns={columns}
        rows={orders}
        rowKey={(row) => row.id}
        loading={loading}
        empty={{
          title: statusFilter
            ? `No ${statusFilter} orders`
            : "No orders yet",
          description: "Customer orders submitted via the public form will appear here.",
        }}
      />
    </>
  );
}
