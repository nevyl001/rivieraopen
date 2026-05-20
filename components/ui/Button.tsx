import { ButtonHTMLAttributes, ReactNode } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary";
  children: ReactNode;
}

export function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonProps) {
  const baseStyles =
    "px-8 py-4 text-lg font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden rounded-full";

  const variantStyles = {
    primary: "bg-accent hover:bg-accent-hover text-text-white",
    secondary:
      "text-white border-2 border-white hover:bg-white hover:text-primary transition-colors",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      <span className="relative z-10">{children}</span>
    </button>
  );
}
