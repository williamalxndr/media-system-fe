import * as React from "react";

export type StatusTone =
  | "active"
  | "revoked"
  | "expired"
  | "pending"
  | "live"
  | "upcoming"
  | "ended"
  | "neutral";

const TONE_CLASS: Record<StatusTone, string> = {
  active: "bg-zinc-950 text-white",
  live: "bg-zinc-950 text-white",
  revoked: "bg-zinc-200 text-[var(--color-ink-muted)]",
  ended: "bg-zinc-200 text-[var(--color-ink-muted)]",
  expired: "bg-rose-100 text-rose-700",
  pending: "bg-zinc-100 text-[var(--color-ink-muted)]",
  upcoming: "bg-amber-100 text-amber-800",
  neutral: "bg-zinc-100 text-[var(--color-ink-muted)]",
};

interface StatusPillProps {
  tone: StatusTone;
  children: React.ReactNode;
}

export function StatusPill({ tone, children }: StatusPillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wider ${TONE_CLASS[tone]}`}
    >
      {children}
    </span>
  );
}
