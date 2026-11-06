"use client";

import Link from "next/link";
import { ArrowUpRight, Share2 } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface RankingActionsProps {
  profileHref: string | null;
  instagramHref: string | null;
  onShare: () => void;
  tone?: "light" | "dark" | "photo";
  density?: "full" | "row";
  showProfile?: boolean;
  compact?: boolean;
}

export function RankingActions({
  profileHref,
  instagramHref,
  onShare,
  tone = "light",
  density = "full",
  showProfile = true,
  compact = false,
}: RankingActionsProps) {
  const { t } = useTranslation("rankings");
  const control = compact
    ? "h-8 w-8 md:h-11 md:w-11"
    : "h-11 w-11";
  const button =
    tone === "dark"
      ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
      : tone === "photo"
        ? "border-white/30 bg-black/45 text-white hover:bg-black/60"
        : "border-[#E7E7E7] bg-white text-[#101010] hover:bg-[#F7F7F7]";

  return (
    <div className="flex shrink-0 items-center gap-1">
      {instagramHref && (
        <a
          href={instagramHref}
          target="_blank"
          rel="noopener noreferrer"
          data-ranking-action
          aria-label={t("page.instagram")}
          className={`${density === "row" ? "hidden sm:flex" : "flex"} ${control} items-center justify-center rounded-full border transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101010] ${button}`}
        >
          <InstagramIcon size={16} />
        </a>
      )}
      {showProfile && profileHref && (
        <Link
          href={profileHref}
          data-ranking-action
          aria-label={t("page.viewProfile")}
          className={`${density === "row" ? "hidden sm:flex" : "flex"} ${control} items-center justify-center rounded-full border transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101010] ${button}`}
        >
          <ArrowUpRight size={16} aria-hidden />
        </Link>
      )}
      <button
        type="button"
        data-ranking-action
        onClick={onShare}
        aria-label={t("page.shareRanking")}
        className={`flex ${control} items-center justify-center rounded-full border transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101010] ${button}`}
      >
        <Share2 size={16} aria-hidden />
      </button>
    </div>
  );
}
