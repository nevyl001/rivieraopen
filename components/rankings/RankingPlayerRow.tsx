"use client";

import Link from "next/link";
import { RankingActions } from "@/components/rankings/RankingActions";
import { RankingPortrait } from "@/components/rankings/RankingPortrait";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { formatFeaturedRank } from "@/lib/featuredPlayersContrast";
import { getCategoryTranslationKey } from "@/lib/categoryUtils";
import { buildPlayerProfilePath } from "@/lib/playerProfileRoutes";
import {
  instagramHref,
  officialPortraitSrc,
  playerDisplayName,
} from "@/lib/rankingPresentation";
import type { Player } from "@/lib/types";

interface RankingPlayerRowProps {
  player: Player;
  tied: boolean;
  onShare: (player: Player) => void;
}

export function RankingPlayerRow({
  player,
  tied,
  onShare,
}: RankingPlayerRowProps) {
  const { t, formatNumber } = useTranslation("rankings");
  const name = playerDisplayName(player);
  const profileHref = player.id
    ? buildPlayerProfilePath(player.id, player.rivieraId)
    : null;
  const instagram = instagramHref(player.socials.instagram);
  const categoryLabel = t(getCategoryTranslationKey(player.category));

  return (
    <article className="relative rounded-xl border border-[#E7E7E7] bg-white px-3 py-3 transition duration-200 hover:-translate-y-px hover:shadow-[0_8px_24px_rgba(16,16,16,0.04)] focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-[#101010] motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:px-5 md:py-4">
      {profileHref && (
        <Link
          href={profileHref}
          aria-label={`${formatFeaturedRank(player.rank)}. ${name}, ${formatNumber(player.points)} ${t("labels.pts")}`}
          className="absolute inset-0 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#101010]"
        />
      )}
      <div className="pointer-events-none relative flex items-center gap-3 md:gap-5">
        <span className="w-10 shrink-0 font-[family-name:var(--font-fp-display)] text-[2rem] leading-none tabular-nums text-[#101010] md:w-14 md:text-[2.75rem]">
          {formatFeaturedRank(player.rank)}
        </span>
        <RankingPortrait
          src={officialPortraitSrc(player.photo)}
          name={name}
          sizes="(max-width: 768px) 56px, 72px"
          initialsClassName="text-xl md:text-2xl"
          className="h-[75px] w-14 shrink-0 rounded-[10px] md:h-24 md:w-[72px]"
        />
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 break-words font-[family-name:var(--font-fp-sans)] text-sm font-semibold leading-snug text-[#101010] md:text-base">
            {name}
          </h3>
          <p className="mt-1 font-[family-name:var(--font-fp-sans)] text-[10px] uppercase tracking-[0.16em] text-[#737373] md:text-[11px]">
            {categoryLabel}
            {tied ? ` · ${t("page.tie")}` : ""}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-[family-name:var(--font-fp-display)] text-[1.75rem] leading-none tabular-nums text-[#101010] md:text-[2.25rem]">
            {formatNumber(player.points)}
          </p>
          <p className="mt-1 font-[family-name:var(--font-fp-sans)] text-[10px] uppercase tracking-[0.16em] text-[#737373]">
            {t("labels.pts")}
          </p>
        </div>
        <div className="pointer-events-auto relative z-20">
          <RankingActions
            profileHref={profileHref}
            instagramHref={instagram}
            onShare={() => onShare(player)}
            density="row"
          />
        </div>
      </div>
    </article>
  );
}
