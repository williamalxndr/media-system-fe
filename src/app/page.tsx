"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import { api } from "@/shared/lib/apiFetch";

const HERO_COVER_URL = "/cover/image.png";

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

interface EventGroup {
  name: string;
  startTime: string;
  cover: string | null;
  contents: ContentCard[];
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

function formatEventDate(iso: string): string {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

function groupByEvent(contents: ContentCard[]): EventGroup[] {
  const map = new Map<string, EventGroup>();
  for (const c of contents) {
    const key = c.event_name || "Lainnya";
    const existing = map.get(key);
    if (existing) {
      existing.contents.push(c);
      if (!existing.cover && c.cover_url) existing.cover = c.cover_url;
    } else {
      map.set(key, {
        name: key,
        startTime: c.event_start_time,
        cover: c.cover_url,
        contents: [c],
      });
    }
  }
  return Array.from(map.values()).sort((a, b) => {
    const ta = a.startTime ? new Date(a.startTime).getTime() : 0;
    const tb = b.startTime ? new Date(b.startTime).getTime() : 0;
    return tb - ta;
  });
}

export default function HomePage() {
  const [contents, setContents] = useState<ContentCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeEvent, setActiveEvent] = useState<string | null>(null);

  useEffect(() => {
    api
      .get<{ results: ContentCard[] }>("/contents/public/")
      .then((res) => setContents(res.results))
      .catch(() => setContents([]))
      .finally(() => setLoading(false));
  }, []);

  const events = useMemo(() => groupByEvent(contents), [contents]);
  const selected = useMemo(
    () => events.find((e) => e.name === activeEvent) ?? null,
    [events, activeEvent],
  );

  return (
    <main className="min-h-screen bg-[var(--color-surface-muted)]">
      <header className="sticky top-0 z-30 border-b border-[var(--color-border)] bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <button
            type="button"
            onClick={() => setActiveEvent(null)}
            className="text-base font-black uppercase tracking-tight text-zinc-950"
          >
            Hahaha Corp
          </button>
          <nav className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-[var(--color-ink-muted)]">
            <button
              type="button"
              onClick={() => setActiveEvent(null)}
              className="rounded-md px-3 py-1.5 transition-colors hover:bg-zinc-100 hover:text-zinc-950"
            >
              Event
            </button>
            <span className="rounded-md px-3 py-1.5 transition-colors hover:bg-zinc-100 hover:text-zinc-950">
              Kontak
            </span>
          </nav>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 py-8">
        {!selected && !loading && events.length > 0 && <Hero />}

        {loading ? (
          <p className="text-center text-sm text-[var(--color-ink-muted)]">
            Memuat…
          </p>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <h1 className="h-page">Belum ada paket tersedia</h1>
            <p className="mt-2 text-sm text-[var(--color-ink-muted)]">
              Silakan hubungi kami via WhatsApp untuk informasi lebih lanjut.
            </p>
          </div>
        ) : selected ? (
          <EventDetail
            event={selected}
            onBack={() => setActiveEvent(null)}
          />
        ) : (
          <>
            <EventGrid
              events={events}
              onSelect={(name) => setActiveEvent(name)}
            />
            <HowItWorks />
          </>
        )}

        <SiteFooter />
      </div>
    </main>
  );
}

function Hero() {
  return (
    <section className="relative mb-12 overflow-hidden rounded-lg border border-[var(--color-border)] bg-zinc-950 px-6 py-20 text-white sm:px-12 sm:py-28">
      <img
        src={HERO_COVER_URL}
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-zinc-950/85 via-zinc-950/55 to-zinc-950/20"
      />
      <div className="relative max-w-2xl">
        <h1 className="text-3xl font-black leading-[1.05] tracking-tight sm:text-5xl">
          Komedi terbaik,
          <br />
          tonton kapan saja.
        </h1>
        <p className="mt-4 max-w-md text-sm text-white/70 sm:text-base">
          Pilih event, pesan, dan akses kontennya sesuka kamu dalam masa unduh
          yang berlaku.
        </p>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    { n: "01", t: "Pilih event", d: "Telusuri event yang sedang tayang." },
    { n: "02", t: "Pesan konten", d: "Pilih paket dan selesaikan pembayaran." },
    { n: "03", t: "Akses & tonton", d: "Dapatkan link, akses sesuai masa unduh." },
  ];
  return (
    <section className="mt-16">
      <div className="mb-8 flex items-baseline justify-between">
        <h2 className="h-section">Cara pesan</h2>
      </div>

      <ol className="flex flex-col gap-6 sm:flex-row sm:items-start sm:gap-0">
        {steps.map((s, i) => (
          <li
            key={s.n}
            className="relative flex flex-1 gap-4 sm:flex-col sm:gap-3"
          >
            <div className="flex flex-col items-center sm:flex-row sm:w-full">
              <span className="relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-zinc-950 text-[11px] font-mono font-semibold text-white">
                {s.n}
              </span>

              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className="ml-2 hidden h-px flex-1 bg-zinc-300 sm:block"
                />
              )}

              {i < steps.length - 1 && (
                <span
                  aria-hidden
                  className="absolute left-[18px] top-9 flex w-px flex-col items-center sm:hidden"
                  style={{ height: "calc(100% + 1.5rem - 2.25rem)" }}
                >
                  <span className="h-full w-px bg-zinc-300" />
                </span>
              )}
            </div>

            <div className="flex-1 pb-2 sm:pb-0 sm:pr-6">
              <h3 className="text-base font-bold text-zinc-950">{s.t}</h3>
              <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
                {s.d}
              </p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-20 border-t border-[var(--color-border)] pt-6 pb-2">
      <div className="flex flex-col items-start justify-between gap-3 text-xs text-[var(--color-ink-muted)] sm:flex-row sm:items-center">
        <span>© {new Date().getFullYear()} Hahaha Corp</span>
        <div className="flex items-center gap-4">
          <span className="hover:text-zinc-950">WhatsApp</span>
          <span aria-hidden>·</span>
          <span>Bantuan & dukungan</span>
        </div>
      </div>
    </footer>
  );
}

function EventGrid({
  events,
  onSelect,
}: {
  events: EventGroup[];
  onSelect: (name: string) => void;
}) {
  return (
    <div>
      <div className="mb-5 flex items-baseline justify-between">
        <h2 className="h-section">Event</h2>
        <span className="text-xs text-[var(--color-ink-muted)]">
          {events.length} event tersedia
        </span>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {events.map((e) => (
          <button
            key={e.name}
            type="button"
            onClick={() => onSelect(e.name)}
            className="group relative overflow-hidden rounded-md border border-[var(--color-border)] bg-white text-left transition-all hover:-translate-y-0.5 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-zinc-950"
          >
            {e.cover ? (
              <div className="aspect-video overflow-hidden bg-zinc-100">
                <img
                  src={e.cover}
                  alt={e.name}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            ) : (
              <div className="flex aspect-video items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 transition-transform duration-300 group-hover:scale-105">
                <span className="text-3xl font-black uppercase tracking-tight text-zinc-300">
                  {e.name.charAt(0)}
                </span>
              </div>
            )}
            <div className="p-4">
              <h3 className="text-base font-bold leading-tight text-zinc-950">
                {e.name}
              </h3>
              <p className="mt-1 text-xs text-[var(--color-ink-muted)]">
                {formatEventDate(e.startTime)}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span className="inline-flex items-center gap-1 rounded-full bg-zinc-100 px-2.5 py-1 text-xs font-semibold text-zinc-800">
                  {e.contents.length} konten
                </span>
                <span className="text-xs font-semibold text-zinc-950 transition-transform group-hover:translate-x-0.5">
                  Lihat →
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

function EventDetail({
  event,
  onBack,
}: {
  event: EventGroup;
  onBack: () => void;
}) {
  return (
    <div>
      <button
        type="button"
        onClick={onBack}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-zinc-700 hover:text-zinc-950"
      >
        ← Kembali ke event
      </button>

      <div className="mb-6 rounded-md border border-[var(--color-border)] bg-white p-5">
        <p className="h-section">Event</p>
        <h1 className="mt-1 h-page">{event.name}</h1>
        {event.startTime && (
          <p className="mt-1 text-sm text-[var(--color-ink-muted)]">
            {formatEventDate(event.startTime)}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {event.contents.map((c) => (
          <div
            key={c.id}
            className="overflow-hidden rounded-md border border-[var(--color-border)] bg-white transition-shadow hover:shadow-md"
          >
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
            <div className="p-4">
              <h3 className="text-base font-bold leading-tight text-zinc-950">
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
    </div>
  );
}
