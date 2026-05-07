"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { PageHeader } from "@/features/admin/layout/PageHeader";
import { FormCard, Field } from "@/features/admin/components/FormCard";
import { api } from "@/shared/lib/apiFetch";

interface Content {
  id: number;
  file_path: string;
  event_id: number;
}

const DEFAULT_DURATION = 3600;

function defaultExpiry(): string {
  const d = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  d.setSeconds(0, 0);
  // datetime-local needs YYYY-MM-DDTHH:mm
  const pad = (n: number) => `${n}`.padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function CreateTokenPage() {
  const router = useRouter();
  const [contentId, setContentId] = useState("");
  const [expiresAt, setExpiresAt] = useState(defaultExpiry());
  const [maxDuration, setMaxDuration] = useState<number>(DEFAULT_DURATION);
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ results: Content[] }>("/contents/")
      .then((res) => setContents(res.results))
      .catch(() => {
        // Empty list is fine; UI will show "no content available".
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/access/access-tokens/", {
        content_id: Number(contentId),
        expires_at: new Date(expiresAt).toISOString(),
        max_duration: maxDuration,
      });
      router.push("/admin/tokens");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="New Access Token"
        breadcrumb={[
          { label: "Tokens", href: "/admin/tokens" },
          { label: "New" },
        ]}
      />
      <div className="max-w-xl">
        <FormCard
          eyebrow="Token Details"
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
                {loading ? "Creating…" : "Create Token"}
              </Button>
            </>
          }
        >
          <Field label="Content" htmlFor="content" hint="Choose the content this token unlocks.">
            <select
              id="content"
              value={contentId}
              onChange={(e) => setContentId(e.target.value)}
              disabled={loading}
              required
              className="h-9 w-full rounded-md border border-[var(--color-input)] bg-white px-3 text-sm focus:outline-none focus:ring-2 focus:ring-zinc-950/20"
            >
              <option value="">Select content…</option>
              {contents.map((content) => (
                <option key={content.id} value={content.id}>
                  #{content.id} — {content.file_path || "(no path)"}
                </option>
              ))}
            </select>
          </Field>

          <Field
            label="Expires At"
            htmlFor="expires"
            hint="Token becomes invalid at this time."
          >
            <Input
              id="expires"
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              disabled={loading}
              required
            />
          </Field>

          <Field
            label="Max Duration (seconds)"
            htmlFor="max-duration"
            hint="From the viewer's first access. e.g. 3600 = 1 hour."
          >
            <Input
              id="max-duration"
              type="number"
              min={1}
              value={maxDuration}
              onChange={(e) => setMaxDuration(Number(e.target.value))}
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
