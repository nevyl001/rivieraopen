"use client";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export function Logo({ className = "", width = 160, height = 40 }: LogoProps) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 595.09 106.6"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <text
        x="0"
        y="85"
        fontSize="100"
        fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
        fontWeight="500"
        fill="currentColor"
        letterSpacing="-0.02em"
      >
        Riviera Open
      </text>
    </svg>
  );
}
