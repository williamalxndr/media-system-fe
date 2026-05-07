"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { PageHeader } from "@/features/admin/layout/PageHeader";
import { FormCard, Field } from "@/features/admin/components/FormCard";
import { api } from "@/shared/lib/apiFetch";

function defaultStart(): string {
  const d = new Date();
  d.setSeconds(0, 0);
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function defaultEnd(): string {
  const d = new Date(Date.now() + 24 * 60 * 60 * 1000);
  d.setSeconds(0, 0);
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [startTime, setStartTime] = useState(defaultStart());
  const [endTime, setEndTime] = useState(defaultEnd());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [endError, setEndError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setEndError(null);

    if (new Date(endTime) <= new Date(startTime)) {
      setEndError("End time must be after start time.");
      return;
    }

    setLoading(true);
    try {
      await api.post("/events/", {
        name,
        start_time: new Date(startTime).toISOString(),
        end_time: new Date(endTime).toISOString(),
      });
      router.push("/admin/events");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create event");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="New Event"
        breadcrumb={[
          { label: "Events", href: "/admin/events" },
          { label: "New" },
        ]}
      />
      <div className="max-w-xl">
        <FormCard
          eyebrow="Event Window"
          onSubmit={handleSubmit}
          footer={
            <>
              <Button
                type="button"
                variant="ghost"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" variant="pill" size="pill" disabled={loading}>
                {loading ? "Creating…" : "Create Event"}
              </Button>
            </>
          }
        >
          <Field label="Name" htmlFor="name">
            <Input
              id="name"
              placeholder="e.g. Live Show — Jakarta"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={loading}
              required
            />
          </Field>

          <Field
            label="Start Time"
            htmlFor="start"
            hint="Tokens for this event are inactive before this time."
          >
            <Input
              id="start"
              type="datetime-local"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              disabled={loading}
              required
            />
          </Field>

          <Field
            label="End Time"
            htmlFor="end"
            hint="Tokens for this event become inactive after this time."
            error={endError}
          >
            <Input
              id="end"
              type="datetime-local"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              disabled={loading}
              required
            />
          </Field>

          {error && <p className="text-sm text-[var(--color-destructive)]">{error}</p>}
        </FormCard>
      </div>
    </>
  );
}
