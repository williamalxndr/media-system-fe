import * as React from "react";

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <div className="h-section">No data</div>
      <h3 className="text-base font-semibold text-zinc-950">{title}</h3>
      {description && (
        <p className="max-w-sm text-sm text-[var(--color-ink-muted)]">{description}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
