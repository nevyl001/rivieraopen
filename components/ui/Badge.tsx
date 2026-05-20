import { HTMLAttributes, ReactNode } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "success" | "warning" | "error";
  children: ReactNode;
}

export function Badge({
  variant = "default",
  children,
  className = "",
  ...props
}: BadgeProps) {
  const baseStyles =
    "inline-flex items-center px-3 py-1 text-sm font-medium rounded-full";

  const variantStyles = {
    default: "bg-surface text-text-secondary",
    success: "bg-success/10 text-success",
    warning: "bg-warning/10 text-warning",
    error: "bg-error/10 text-error",
  };

  return (
    <span
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
