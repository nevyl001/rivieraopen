"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslation } from "@/lib/hooks/useTranslation";

const navLinks = [
  { href: "/", key: "home" },
  { href: "/tournaments", key: "tournaments" },
  { href: "/rankings", key: "rankings" },
  { href: "/gallery", key: "gallery" },
  { href: "/contact", key: "contact" },
];

interface NavigationProps {
  mobile?: boolean;
  onLinkClick?: () => void;
  theme?: "light" | "dark";
}

export function Navigation({
  mobile = false,
  onLinkClick,
  theme = "dark",
}: NavigationProps) {
  const pathname = usePathname();
  const { t } = useTranslation("common");

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    if (href === "/gallery") {
      return pathname.startsWith("/gallery") || pathname.startsWith("/galeria");
    }
    return pathname.startsWith(href);
  };

  const desktopStyles =
    theme === "light"
      ? "relative py-2 font-bold text-primary transition-all duration-300 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-primary after:w-0 after:transition-all after:duration-300"
      : "relative py-2 font-bold text-white transition-all duration-300 hover:after:w-full after:content-[''] after:absolute after:bottom-0 after:left-0 after:h-0.5 after:bg-white after:w-0 after:transition-all after:duration-300";

  const baseStyles = mobile
    ? "block py-4 px-4 text-2xl font-bold text-white hover:text-accent transition-colors text-center"
    : desktopStyles;

  const activeStyles = mobile
    ? "text-accent font-bold"
    : "after:w-full after:bg-accent font-bold";

  return (
    <nav className={mobile ? "flex flex-col" : "flex items-center gap-8"}>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className={`${baseStyles} ${isActive(link.href) ? activeStyles : ""}`}
          onClick={onLinkClick}
        >
          {t(`navigation.${link.key}`)}
        </Link>
      ))}
    </nav>
  );
}
