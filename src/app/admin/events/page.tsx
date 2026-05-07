"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { PageHeader } from "@/features/admin/layout/PageHeader";
import { DataTable, type Column } from "@/features/admin/components/DataTable";
import { StatusPill, type StatusTone } from "@/features/admin/components/StatusPill";
import { api } from "@/shared/lib/apiFetch";

interface Event {
  id: number;
  name: string;
  start_time: string;
  end_time: string;
}

function eventStatus(event: Event): { tone: StatusTone; label: string } {
  const now = Date.now();
  const start = new Date(event.start_time).getTime();
  const end = new Date(event.end_time).getTime();
  if (now < start) return { tone: "upcoming", label: "Upcoming" };
  if (now > end) return { tone: "ended", label: "Ended" };
  return { tone: "live", label: "Live" };
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ results: Event[] }>("/events/")
      .then((res) => setEvents(res.results))
      .finally(() => setLoading(false));
  }, []);

  const columns: Column<Event>[] = [
    {
      key: "name",
      header: "Name",
      render: (row) => <span className="font-medium text-zinc-950">{row.name}</span>,
    },
    {
      key: "window",
      header: "Window",
      render: (row) => (
        <div className="text-sm text-[var(--color-ink-muted)]">
          {new Date(row.start_time).toLocaleString()}
          <span className="px-1 text-[var(--color-ink-subtle)]">→</span>
          {new Date(row.end_time).toLocaleString()}
        </div>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => {
        const s = eventStatus(row);
        return <StatusPill tone={s.tone}>{s.label}</StatusPill>;
      },
    },
  ];

  return (
    <>
      <PageHeader
        title="Events"
        description="Time windows that gate content visibility."
        actions={
          <Button asChild variant="pill" size="pill">
            <Link href="/admin/events/create">New Event</Link>
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={events}
        rowKey={(row) => row.id}
        loading={loading}
        empty={{
          title: "No events yet",
          description: "Create an event to define when its content can be accessed.",
          action: (
            <Button asChild variant="pill" size="pill">
              <Link href="/admin/events/create">New Event</Link>
            </Button>
          ),
        }}
      />
    </>
  );
}
