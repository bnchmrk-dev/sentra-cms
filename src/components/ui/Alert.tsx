import type { ReactNode } from "react";
import { AlertTriangle, AlertCircle, CheckCircle, Info, X } from "lucide-react";

type AlertVariant = "info" | "success" | "warning" | "error";

interface AlertProps {
  variant?: AlertVariant;
  title?: string;
  children: ReactNode;
  onDismiss?: () => void;
  className?: string;
}

const variantStyles: Record<AlertVariant, string> = {
  info: "bg-accent-subtle border-accent/20 text-accent",
  success: "bg-status-live-bg border-status-live/20 text-status-live",
  warning: "bg-status-warning-bg border-status-warning/20 text-status-warning",
  error: "bg-status-error-bg border-status-error/20 text-status-error",
};

const icons: Record<AlertVariant, typeof Info> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

export function Alert({
  variant = "info",
  title,
  children,
  onDismiss,
  className = "",
}: AlertProps) {
  const Icon = icons[variant];

  return (
    <div
      role="alert"
      className={`
        flex items-start gap-3 px-4 py-3 rounded-lg border
        ${variantStyles[variant]}
        ${className}
      `}
    >
      <Icon className="w-5 h-5 flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0">
        {title && <p className="font-medium">{title}</p>}
        <div className={`text-sm ${title ? "mt-1 opacity-90" : ""}`}>
          {children}
        </div>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}

