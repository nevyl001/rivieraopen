"use client";

import { Instagram, Facebook } from "lucide-react";
import { TikTokIcon } from "@/components/ui/TikTokIcon";
import { PlayerSocials } from "@/lib/types";

const DEFAULT_URLS = {
  instagram: "https://www.instagram.com/",
  facebook: "https://www.facebook.com/",
  tiktok: "https://www.tiktok.com/",
} as const;

interface PlayerSocialIconsProps {
  socials: PlayerSocials;
  size?: "sm" | "md" | "lg";
  tone?: "default" | "poster";
  className?: string;
}

const sizeMap = {
  sm: { button: "w-8 h-8", icon: 16 },
  md: { button: "w-9 h-9", icon: 18 },
  lg: { button: "w-11 h-11", icon: 20 },
} as const;

export function PlayerSocialIcons({
  socials,
  size = "md",
  tone = "default",
  className = "",
}: PlayerSocialIconsProps) {
  const dimensions = sizeMap[size];

  const networks = [
    {
      key: "instagram" as const,
      href: socials.instagram || DEFAULT_URLS.instagram,
      hasPersonal: Boolean(socials.instagram),
      label: "Instagram",
      icon: (
        <Instagram size={dimensions.icon} className="text-current" />
      ),
    },
    {
      key: "facebook" as const,
      href: socials.facebook || DEFAULT_URLS.facebook,
      hasPersonal: Boolean(socials.facebook),
      label: "Facebook",
      icon: (
        <Facebook size={dimensions.icon} className="text-current" />
      ),
    },
    {
      key: "tiktok" as const,
      href: socials.tiktok || DEFAULT_URLS.tiktok,
      hasPersonal: Boolean(socials.tiktok),
      label: "TikTok",
      icon: <TikTokIcon size={dimensions.icon} className="text-current" />,
    },
  ];

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      {networks.map((network) => (
        <a
          key={network.key}
          href={network.href}
          target="_blank"
          rel="noopener noreferrer"
          data-social-link
          aria-label={network.label}
          className={`${dimensions.button} inline-flex items-center justify-center rounded-full transition-all duration-200 ${
            tone === "poster"
              ? "text-[#555] hover:text-[#aaa]"
              : network.hasPersonal
                ? size === "lg"
                  ? "border border-primary/15 bg-gray-50 text-primary hover:border-primary hover:bg-primary hover:text-white"
                  : "border border-gray-200 text-text-secondary hover:border-accent hover:text-accent hover:bg-accent/5"
                : size === "lg"
                  ? "border border-gray-100 bg-white text-gray-300 hover:border-gray-200 hover:text-text-secondary"
                  : "border border-gray-100 text-gray-300 hover:border-gray-200 hover:text-text-secondary"
          }`}
        >
          {network.icon}
        </a>
      ))}
    </div>
  );
}
