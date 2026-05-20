import Image from "next/image";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  /** wordmark = texto en barra; badge = logo circular en hero */
  variant?: "wordmark" | "badge";
}

export function Logo({
  className = "",
  width = 160,
  height = 40,
  priority = false,
  variant = "wordmark",
}: LogoProps) {
  if (variant === "badge") {
    return (
      <Image
        src="/img/logo.png"
        alt="Riviera Open"
        width={width}
        height={height}
        className={className}
        priority={priority}
      />
    );
  }

  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 595.09 106.6"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Riviera Open"
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
