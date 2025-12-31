import { forwardRef, type ButtonHTMLAttributes } from "react";

type IconButtonSize = "sm" | "md" | "lg";
type IconButtonVariant = "ghost" | "subtle" | "solid";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: IconButtonSize;
  variant?: IconButtonVariant;
  label: string; // Required for accessibility
}

const sizeStyles: Record<IconButtonSize, string> = {
  sm: "p-1.5",
  md: "p-2",
  lg: "p-2.5",
};

const variantStyles: Record<IconButtonVariant, string> = {
  ghost: "text-text-muted hover:text-text-primary hover:bg-bg-hover",
  subtle:
    "text-text-secondary bg-bg-elevated hover:bg-bg-hover hover:text-text-primary",
  solid: "text-text-primary bg-bg-active hover:bg-border-default",
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  (
    {
      size = "md",
      variant = "ghost",
      label,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        aria-label={label}
        disabled={disabled}
        className={`
          inline-flex items-center justify-center rounded-md
          transition-colors duration-150
          focus:outline-none focus:ring-2 focus:ring-accent/50
          disabled:opacity-50 disabled:cursor-not-allowed
          ${sizeStyles[size]}
          ${variantStyles[variant]}
          ${className}
        `}
        {...props}
      >
        {children}
      </button>
    );
  }
);

IconButton.displayName = "IconButton";

