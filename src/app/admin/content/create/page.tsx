"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { PageHeader } from "@/features/admin/layout/PageHeader";
import { FormCard, Field } from "@/features/admin/components/FormCard";
import { api } from "@/shared/lib/apiFetch";

interface Event {
  id: number;
  name: string;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function CreateContentPage() {
  const router = useRouter();
  const [eventId, setEventId] = useState("");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [cover, setCover] = useState<File | null>(null);
  const [price, setPrice] = useState("");
  const [durationLimit, setDurationLimit] = useState("1800");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ results: Event[] }>("/events/")
      .then((res) => setEvents(res.results))
      .catch(() => {
        // Empty list; user can still see helper text.
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("event_id", eventId);
      formData.append("duration_limit", durationLimit);
      formData.append("file", file);
      if (title.trim()) formData.append("title", title.trim());
      if (cover) formData.append("cover", cover);
      if (price) formData.append("price", price);
      await api.post("/contents/", formData);
      router.push("/admin/content");
    } catch (err) {
      const detail =
        err && typeof err === "object" && "detail" in err
          ? String((err as { detail: unknown }).detail)
          : "Failed to upload content";
      setError(detail);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Upload Content"
        breadcrumb={[
          { label: "Content", href: "/admin/content" },
          { label: "Upload" },
        ]}
      />
      <div className="max-w-xl">
        <FormCard
          eyebrow="File & Event"
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
                {loading ? "Uploading…" : "Upload"}
              </Button>
            </>
          }
        >
          <Field label="Event" htmlFor="event" hint="Content is scoped to one event.">
            <select
              id="event"
              value={eventId}
              onChange={(e) => setEventId(e.target.value)}
              disabled={loading}
              required
              className="h-9 w-full rounded-md border border-[var(--color-input)] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/20"
            >
              <option value="">Select an event…</option>
              {events.map((event) => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Title"
            htmlFor="title"
            hint="Display name for the public catalog, e.g. 'FOTO+VIDEO'. Leave blank to use file path."
          >
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. FOTO+VIDEO 8-12"
              disabled={loading}
            />
          </Field>

          <Field
            label="Price (IDR)"
            htmlFor="price"
            hint="Leave blank if pricing is handled outside the platform."
          >
            <Input
              id="price"
              type="number"
              min={0}
              step={100000}
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="e.g. 4500000"
              disabled={loading}
            />
          </Field>

          <Field
            label="Duration Limit (seconds)"
            htmlFor="duration_limit"
            hint="Per-token max viewing time once started."
          >
            <Input
              id="duration_limit"
              type="number"
              min={1}
              value={durationLimit}
              onChange={(e) => setDurationLimit(e.target.value)}
              disabled={loading}
              required
            />
          </Field>

          <Field label="File" htmlFor="file">
            <label
              htmlFor="file"
              className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] px-4 py-8 text-center transition-colors hover:border-zinc-400 hover:bg-zinc-50"
            >
              {file ? (
                <>
                  <span className="text-sm font-medium text-zinc-950">{file.name}</span>
                  <span className="text-xs text-[var(--color-ink-muted)]">
                    {formatBytes(file.size)} · click to replace
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium text-zinc-950">
                    Click to choose a file
                  </span>
                  <span className="text-xs text-[var(--color-ink-muted)]">
                    Any file type — videos, audio, documents
                  </span>
                </>
              )}
            </label>
            <input
              id="file"
              type="file"
              className="sr-only"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={loading}
              required
            />
          </Field>

          <Field label="Cover Image" htmlFor="cover" hint="Preview image for the public catalog. Optional.">
            <label
              htmlFor="cover"
              className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-[var(--color-border-strong)] bg-[var(--color-surface-muted)] px-4 py-6 text-center transition-colors hover:border-zinc-400 hover:bg-zinc-50"
            >
              {cover ? (
                <>
                  <span className="text-sm font-medium text-zinc-950">{cover.name}</span>
                  <span className="text-xs text-[var(--color-ink-muted)]">
                    {formatBytes(cover.size)} · click to replace
                  </span>
                </>
              ) : (
                <>
                  <span className="text-sm font-medium text-zinc-950">
                    Click to choose a cover image
                  </span>
                  <span className="text-xs text-[var(--color-ink-muted)]">
                    JPG, PNG, WebP — shown on homepage cards
                  </span>
                </>
              )}
            </label>
            <input
              id="cover"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => setCover(e.target.files?.[0] || null)}
              disabled={loading}
            />
          </Field>

          {error && <p className="text-sm text-[var(--color-destructive)]">{error}</p>}
        </FormCard>
      </div>
    </>
  );
}
