import * as React from "react";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  hint?: string;
}

export function StatCard({ label, value, hint }: StatCardProps) {
  return (
    <div className="rounded-md border border-[var(--color-border)] bg-white p-5">
      <div className="h-section">{label}</div>
      <div className="mt-3 text-3xl font-black tracking-tight text-zinc-950">
        {value}
      </div>
      {hint && (
        <div className="mt-2 text-xs text-[var(--color-ink-muted)]">{hint}</div>
      )}
    </div>
  );
}
