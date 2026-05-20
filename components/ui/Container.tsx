import { HTMLAttributes, ReactNode } from "react";

interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "full";
}

export function Container({
  children,
  size = "lg",
  className = "",
  ...props
}: ContainerProps) {
  const sizeStyles = {
    sm: "max-w-3xl",
    md: "max-w-5xl",
    lg: "max-w-7xl",
    full: "max-w-full",
  };

  return (
    <div
      className={`mx-auto px-4 sm:px-6 lg:px-8 ${sizeStyles[size]} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
