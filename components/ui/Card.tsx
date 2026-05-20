import { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  hover?: boolean;
}

export function Card({
  children,
  hover = false,
  className = "",
  ...props
}: CardProps) {
  const baseStyles =
    "bg-white shadow-md p-8 transition-all duration-200 rounded-3xl";
  const hoverStyles = hover
    ? "hover:shadow-xl hover:shadow-accent/20 cursor-pointer"
    : "";

  return (
    <div className={`${baseStyles} ${hoverStyles} ${className}`} {...props}>
      {children}
    </div>
  );
}
