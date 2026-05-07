"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { api } from "@/shared/lib/apiFetch";

interface ContentCard {
  id: number;
  title: string;
  event_name: string;
  event_start_time: string;
  cover_url: string | null;
  price: number | null;
  price_display: string | null;
  duration_limit: number;
}

function formatDownloadWindow(seconds: number): string {
  const days = seconds / 86400;
  if (days >= 1) {
    const rounded = Math.round(days);
    return `Akses unduh ${rounded} hari`;
  }
  const hours = seconds / 3600;
  if (hours >= 1) return `Akses unduh ${Math.round(hours)} jam`;
  return `Akses unduh ${Math.round(seconds / 60)} menit`;
}

export default function HomePage() {
  const [contents, setContents] = useState<ContentCard[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<{ results: ContentCard[] }>("/contents/public/")
      .then((res) => setContents(res.results))
      .catch(() => setContents([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="min-h-screen bg-[var(--color-surface-muted)]">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Wordmark */}
        <div className="mb-10 text-center">
          <span className="block text-2xl font-black uppercase tracking-tight text-zinc-950">
            Hahaha Corp
          </span>
        </div>

        {/* Content Grid */}
        {loading ? (
          <p className="text-center text-sm text-[var(--color-ink-muted)]">
            Memuat…
          </p>
        ) : contents.length === 0 ? (
          <div className="text-center py-16">
            <h1 className="h-page">Belum ada paket tersedia</h1>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Silakan hubungi kami via WhatsApp untuk informasi lebih lanjut.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {contents.map((c) => (
              <div
                key={c.id}
                className="overflow-hidden rounded-md border border-[var(--color-border)] bg-white transition-shadow hover:shadow-md"
              >
                {/* Cover image */}
                {c.cover_url ? (
                  <div className="aspect-video overflow-hidden bg-zinc-100">
                    <img
                      src={c.cover_url}
                      alt={c.title || c.event_name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200">
                    <span className="text-3xl font-black uppercase tracking-tight text-zinc-300">
                      {c.event_name?.charAt(0) || "C"}
                    </span>
                  </div>
                )}

                {/* Card body */}
                <div className="p-4">
                  <h3 className="text-base font-bold text-zinc-950 leading-tight">
                    {c.title || c.event_name}
                  </h3>
                  {c.title && (
                    <p className="mt-0.5 text-xs text-[var(--color-ink-muted)]">
                      {c.event_name}
                    </p>
                  )}
                  <div className="mt-2 flex items-baseline justify-between gap-2">
                    <span className="text-sm text-[var(--color-ink-muted)]">
                      {formatDownloadWindow(c.duration_limit)}
                    </span>
                    {c.price_display && (
                      <span className="text-base font-bold text-zinc-950">
                        {c.price_display}
                      </span>
                    )}
                  </div>
                  <Link href={`/order?content=${c.id}`} className="mt-3 block">
                    <Button variant="pill" size="pill" className="w-full">
                      Pesan
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
