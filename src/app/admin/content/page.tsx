"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/features/admin/layout/PageHeader";
import { DataTable, type Column } from "@/features/admin/components/DataTable";
import { StatusPill } from "@/features/admin/components/StatusPill";
import { api } from "@/shared/lib/apiFetch";

interface Content {
  id: number;
  event_id: number;
  title: string;
  file_path: string;
  has_file: boolean;
  has_cover: boolean;
  cover_url: string | null;
  price: number | null;
  duration_limit: number;
}

function basename(path: string): string {
  if (!path) return "—";
  const parts = path.split("/");
  return parts[parts.length - 1] || path;
}

export default function ContentPage() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ results: Content[] }>("/contents/")
      .then((res) => setContents(res.results))
      .finally(() => setLoading(false));
  }, []);

  function formatPrice(price: number | null): string {
    if (!price) return "—";
    return `Rp ${price.toLocaleString("id-ID")}`;
  }

  const columns: Column<Content>[] = [
    {
      key: "title",
      header: "Title",
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-medium text-zinc-950">
            {row.title || basename(row.file_path)}
          </span>
          {row.title && (
            <span className="font-mono text-xs text-[var(--color-ink-subtle)]">
              {basename(row.file_path)}
            </span>
          )}
        </div>
      ),
    },
    {
      key: "event",
      header: "Event",
      render: (row) => <span className="text-sm">#{row.event_id}</span>,
    },
    {
      key: "price",
      header: "Price",
      render: (row) => (
        <span className="text-sm text-[var(--color-ink-muted)]">
          {formatPrice(row.price)}
        </span>
      ),
    },
    {
      key: "duration",
      header: "Duration Limit",
      render: (row) => (
        <span className="text-sm text-[var(--color-ink-muted)]">{row.duration_limit}s</span>
      ),
    },
    {
      key: "stored",
      header: "Stored",
      render: (row) =>
        row.has_file ? (
          <StatusPill tone="active">Local</StatusPill>
        ) : (
          <StatusPill tone="neutral">S3 key</StatusPill>
        ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Content"
        description="Files served to viewers via signed access tokens."
        actions={
          <Button asChild variant="pill" size="pill">
            <Link href="/admin/content/create">Upload</Link>
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={contents}
        rowKey={(row) => row.id}
        loading={loading}
        empty={{
          title: "No content yet",
          description: "Upload a file and attach it to an event to generate tokens against it.",
          action: (
            <Button asChild variant="pill" size="pill">
              <Link href="/admin/content/create">Upload Content</Link>
            </Button>
          ),
        }}
      />
    </>
  );
}
