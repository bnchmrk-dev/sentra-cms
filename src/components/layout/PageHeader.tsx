import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

interface PageHeaderProps {
  title: string;
  description?: string;
  backLink?: {
    label: string;
    href: string;
  };
  badge?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  description,
  backLink,
  badge,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-6">
      {backLink && (
        <Link
          to={backLink.href}
          className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          {backLink.label}
        </Link>
      )}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-text-primary">{title}</h1>
            {badge}
          </div>
          {description && (
            <p className="text-text-secondary mt-1">{description}</p>
          )}
        </div>
        {actions && <div className="flex items-center gap-3">{actions}</div>}
      </div>
    </div>
  );
}

