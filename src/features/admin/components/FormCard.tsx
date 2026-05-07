import * as React from "react";

interface FormCardProps {
  eyebrow?: string;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function FormCard({
  eyebrow,
  title,
  description,
  children,
  footer,
  onSubmit,
}: FormCardProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="overflow-hidden rounded-md border border-[var(--color-border)] bg-white"
    >
      {(eyebrow || title || description) && (
        <div className="border-b border-[var(--color-border)] px-6 py-5">
          {eyebrow && <div className="h-section">{eyebrow}</div>}
          {title && (
            <h2 className="mt-1 text-base font-semibold text-zinc-950">{title}</h2>
          )}
          {description && (
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{description}</p>
          )}
        </div>
      )}
      <div className="space-y-5 px-6 py-6">{children}</div>
      {footer && (
        <div className="flex items-center justify-end gap-2 border-t border-[var(--color-border)] bg-[var(--color-surface-muted)] px-6 py-4">
          {footer}
        </div>
      )}
    </form>
  );
}

interface FieldProps {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string | null;
  children: React.ReactNode;
}

export function Field({ label, htmlFor, hint, error, children }: FieldProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-zinc-950">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-xs text-[var(--color-destructive)]">{error}</p>
      ) : hint ? (
        <p className="text-xs text-[var(--color-ink-muted)]">{hint}</p>
      ) : null}
    </div>
  );
}
