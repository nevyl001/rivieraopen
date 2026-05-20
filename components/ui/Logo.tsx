import Image from "next/image";

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
}

export function Logo({
  className = "",
  width = 48,
  height = 48,
  priority = false,
}: LogoProps) {
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
