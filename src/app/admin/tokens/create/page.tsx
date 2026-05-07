"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { api } from "@/shared/lib/apiFetch";

interface Content {
  id: number;
  name: string;
}

export default function CreateTokenPage() {
  const router = useRouter();
  const [contentId, setContentId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get<{ results: Content[] }>("/api/contents/").then((res) => setContents(res.results));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await api.post("/api/tokens/", { content: contentId, expires_at: expiresAt });
      router.push("/admin/tokens");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create token");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md">
      <h1 className="text-3xl font-bold mb-6">Create Token</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <select
                id="content"
                value={contentId}
                onChange={(e) => setContentId(e.target.value)}
                disabled={loading}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="">Select content</option>
                {contents.map((content) => (
                  <option key={content.id} value={content.id}>
                    {content.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="expires">Expires At</Label>
              <Input
                id="expires"
                type="datetime-local"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
                disabled={loading}
                required
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
