import type { ReactNode } from "react";

type BadgeVariant = "default" | "live" | "review" | "draft" | "warning" | "error";

interface BadgeProps {
  variant?: BadgeVariant;
  children: ReactNode;
  dot?: boolean;
  className?: string;
}

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-bg-elevated text-text-secondary",
  live: "bg-status-live-bg text-status-live",
  review: "bg-status-review-bg text-status-review",
  draft: "bg-status-draft-bg text-status-draft",
  warning: "bg-status-warning-bg text-status-warning",
  error: "bg-status-error-bg text-status-error",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-text-muted",
  live: "bg-status-live",
  review: "bg-status-review",
  draft: "bg-status-draft",
  warning: "bg-status-warning",
  error: "bg-status-error",
};

export function Badge({
  variant = "default",
  children,
  dot = false,
  className = "",
}: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2 py-0.5 
        rounded-full text-xs font-medium
        ${variantStyles[variant]}
        ${className}
      `}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
      )}
      {children}
    </span>
  );
}

