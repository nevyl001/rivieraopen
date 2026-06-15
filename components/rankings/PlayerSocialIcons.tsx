"use client";

import { Facebook } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { TikTokIcon } from "@/components/ui/TikTokIcon";
import { PlayerSocials } from "@/lib/types";

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

export function playerHasSocials(socials: PlayerSocials): boolean {
  return Boolean(
    socials.instagram?.trim() ||
      socials.facebook?.trim() ||
      socials.tiktok?.trim(),
  );
}

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
      href: socials.instagram,
      label: "Instagram",
      icon: (
        <InstagramIcon size={dimensions.icon} className="text-white" />
      ),
    },
    {
      key: "facebook" as const,
      href: socials.facebook,
      label: "Facebook",
      icon: (
        <Facebook size={dimensions.icon} className="text-current" />
      ),
    },
    {
      key: "tiktok" as const,
      href: socials.tiktok,
      label: "TikTok",
      icon: <TikTokIcon size={dimensions.icon} className="text-current" />,
    },
  ].filter((network) => Boolean(network.href?.trim()));

  const brandStyles: Record<
    (typeof networks)[number]["key"],
    { poster: string; default: string }
  > = {
    instagram: {
      poster:
        "border-0 bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] text-white shadow-[0_2px_12px_rgba(225,48,108,0.35)] hover:opacity-90 hover:shadow-[0_4px_16px_rgba(225,48,108,0.45)]",
      default:
        "border-0 bg-gradient-to-br from-[#833AB4] via-[#E1306C] to-[#F77737] text-white shadow-sm hover:opacity-90",
    },
    facebook: {
      poster: "text-[#1877F2] hover:text-[#4a9aff]",
      default:
        "border border-[#1877F2]/20 bg-[#1877F2]/10 text-[#1877F2] hover:border-[#1877F2] hover:bg-[#1877F2] hover:text-white",
    },
    tiktok: {
      poster: "text-[#25F4EE] hover:text-[#FE2C55]",
      default:
        "border border-[#111]/10 bg-gray-50 text-[#111] hover:border-[#111] hover:bg-[#111] hover:text-[#25F4EE]",
    },
  };

  if (networks.length === 0) {
    return null;
  }

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
              ? brandStyles[network.key].poster
              : brandStyles[network.key].default
          }`}
        >
          {network.icon}
        </a>
      ))}
    </div>
  );
}
