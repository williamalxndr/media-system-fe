import * as React from "react";
import Link from "next/link";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: BreadcrumbItem[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumb, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col gap-3 border-b border-[var(--color-border)] pb-5">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="flex items-center gap-1 text-xs text-[var(--color-ink-muted)]">
          {breadcrumb.map((item, idx) => {
            const isLast = idx === breadcrumb.length - 1;
            return (
              <span key={`${item.label}-${idx}`} className="flex items-center gap-1">
                {item.href && !isLast ? (
                  <Link href={item.href} className="hover:text-zinc-950">
                    {item.label}
                  </Link>
                ) : (
                  <span className={isLast ? "text-zinc-950" : ""}>{item.label}</span>
                )}
                {!isLast && <span className="text-[var(--color-ink-subtle)]">/</span>}
              </span>
            );
          })}
        </nav>
      )}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="h-page">{title}</h1>
          {description && (
            <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
