"use client";

import { useState } from "react";
import { Button } from "@/shared/components/ui/button";

interface CopyFieldProps {
  value: string;
  display?: string;
  className?: string;
  buttonLabel?: string;
}

export function CopyField({
  value,
  display,
  className,
  buttonLabel = "Copy",
}: CopyFieldProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1200);
    } catch {
      // Clipboard API can fail in some contexts; fail silently.
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      <code className="flex-1 truncate rounded-md border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-2.5 py-1.5 font-mono text-xs text-zinc-700">
        {display ?? value}
      </code>
      <div className="relative">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="h-8"
        >
          {buttonLabel}
        </Button>
        {copied && (
          <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-full bg-zinc-950 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white">
            Copied
          </span>
        )}
      </div>
    </div>
  );
}
