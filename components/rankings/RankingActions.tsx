"use client";

import Link from "next/link";
import { ArrowUpRight, Share2 } from "lucide-react";
import { InstagramIcon } from "@/components/ui/InstagramIcon";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface RankingActionsProps {
  profileHref: string | null;
  instagramHref: string | null;
  onShare: () => void;
  tone?: "light" | "dark";
  density?: "full" | "row";
}

export function RankingActions({
  profileHref,
  instagramHref,
  onShare,
  tone = "light",
  density = "full",
}: RankingActionsProps) {
  const { t } = useTranslation("rankings");
  const button =
    tone === "dark"
      ? "border-white/25 bg-white/10 text-white hover:bg-white/20"
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
          className={`${density === "row" ? "hidden sm:flex" : "flex"} h-11 w-11 items-center justify-center rounded-full border transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101010] ${button}`}
        >
          <InstagramIcon size={16} />
        </a>
      )}
      {profileHref && (
        <Link
          href={profileHref}
          data-ranking-action
          aria-label={t("page.viewProfile")}
          className={`${density === "row" ? "hidden sm:flex" : "flex"} h-11 w-11 items-center justify-center rounded-full border transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101010] ${button}`}
        >
          <ArrowUpRight size={16} aria-hidden />
        </Link>
      )}
      <button
        type="button"
        data-ranking-action
        onClick={onShare}
        aria-label={t("page.shareRanking")}
        className={`flex h-11 w-11 items-center justify-center rounded-full border transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101010] ${button}`}
      >
        <Share2 size={16} aria-hidden />
      </button>
    </div>
  );
}
