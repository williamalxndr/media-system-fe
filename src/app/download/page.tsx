"use client";

import { useEffect, useState } from "react";
import { Button } from "@/shared/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { api } from "@/shared/lib/apiFetch";

interface AccessData {
  signed_url: string;
  signed_url_expires_at: string;
  access_expires_at: string;
  remaining_seconds: number;
  content_type: string | null;
  content: { id: number; event_id: number };
}

function appendQuery(url: string, key: string, value: string): string {
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
}

function DownloadContent() {
  const [data, setData] = useState<AccessData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setError("No access token provided");
      setLoading(false);
      return;
    }

    api
      .get<AccessData>(`/access/?token=${token}`)
      .then(setData)
      .catch(() => setError("Invalid or expired token"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-100 flex items-center justify-center p-4">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-slate-300/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-slate-400/20 blur-3xl" />
          <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-white/40 blur-3xl" />
        </div>
        <Card className="relative w-full max-w-md border-slate-300/70 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardContent className="pt-6">Loading...</CardContent>
        </Card>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-100 flex items-center justify-center p-4">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-slate-300/30 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-slate-400/20 blur-3xl" />
          <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-white/40 blur-3xl" />
        </div>
        <Card className="relative w-full max-w-md border-slate-300/70 bg-white/80 backdrop-blur-sm shadow-xl">
          <CardHeader className="text-center">
            <CardTitle>Access Denied</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-destructive">{error || "Unable to access this content"}</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const expiresAt = new Date(data.access_expires_at);
  const isExpired = expiresAt < new Date();
  const isVideo = data.content_type?.startsWith("video/") ?? false;
  const inlineUrl = appendQuery(data.signed_url, "inline", "1");

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-100 flex items-center justify-center p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-slate-300/30 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-slate-400/20 blur-3xl" />
        <div className="absolute right-0 top-1/4 h-80 w-80 rounded-full bg-white/40 blur-3xl" />
      </div>
      <Card
        className={`relative w-full ${isVideo ? "max-w-3xl" : "max-w-md"} border-slate-300/70 bg-white/80 backdrop-blur-sm shadow-xl`}
      >
        <CardHeader className="pb-4 text-center">
          <CardTitle className="text-xl tracking-tight text-slate-900">
            {isVideo ? "Secure Video" : "Secure Download"}
          </CardTitle>
          <CardDescription className="text-slate-600">
            Content #{data.content.id} · Event #{data.content.event_id}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isVideo && !isExpired && (
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-black">
              <video
                key={inlineUrl}
                src={inlineUrl}
                controls
                playsInline
                className="aspect-video w-full"
              />
            </div>
          )}
          <div className="rounded-lg border border-slate-200 bg-white/70 p-3 text-sm text-slate-700">
            <p>
              <strong>Remaining:</strong> {Math.max(0, data.remaining_seconds)}s
            </p>
            <p>
              <strong>Expires:</strong> {expiresAt.toLocaleString()}
            </p>
            {isExpired && <p className="text-destructive mt-2">This link has expired</p>}
          </div>
          <Button
            className="h-11 w-full rounded-md bg-slate-900 text-white hover:bg-slate-800"
            disabled={isExpired}
            onClick={() => {
              window.location.href = data.signed_url;
            }}
          >
            {isExpired ? "Link Expired" : "Download"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}

export default function DownloadPage() {
  return <DownloadContent />;
}
