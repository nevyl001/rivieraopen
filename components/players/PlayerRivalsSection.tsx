"use client";

import Image from "next/image";
import Link from "next/link";
import { PlayerRival } from "@/lib/types/playerHistory";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { buildPlayerProfilePath } from "@/lib/playerProfileRoutes";

interface PlayerRivalsSectionProps {
  rivals: PlayerRival[];
  hideTitle?: boolean;
}

function RivalCard({ rival }: { rival: PlayerRival }) {
  const { t } = useTranslation("rankings");

  const h2hAdvantage = rival.wins > rival.losses;
  const h2hDisadvantage = rival.losses > rival.wins;

  // Filled pills + fluorescent accents (thin pastel borders read dull on dark)
  const pillClass = h2hAdvantage
    ? "border border-[#a3e635]/40 bg-[#1a2e0a] text-[#a3e635]"
    : h2hDisadvantage
      ? "border border-[#f87171]/40 bg-[#2e1010] text-[#f87171]"
      : "border border-[#D4A72C]/35 bg-[#2a2410] text-[#D4A72C]";

  return (
    <Link
      href={buildPlayerProfilePath(rival.id)}
      className="flex w-full items-center gap-2.5 rounded-lg border border-[#1f1f1f] bg-[#111] px-2.5 py-2.5 transition-colors hover:border-[#333] hover:bg-[#151515] lg:gap-3 lg:rounded-[10px] lg:px-4 lg:py-3.5"
    >
      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full ring-1 ring-[#2a2a2a] lg:h-11 lg:w-11">
        <Image
          src={rival.foto}
          alt={rival.nombre}
          fill
          unoptimized
          className="object-cover"
          sizes="44px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-white lg:break-words lg:text-base">
          {rival.nombre}
        </p>
        <p className="truncate text-[11px] text-[#666] lg:break-words lg:text-xs">
          #{rival.rank} · {rival.points} pts
          {rival.timesFaced != null && rival.timesFaced > 0
            ? ` · ${t("passport.timesFaced", { count: String(rival.timesFaced) })}`
            : ""}
        </p>
      </div>

      <span
        className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold tabular-nums lg:px-2.5 lg:py-1 lg:text-xs ${pillClass}`}
      >
        {rival.draws > 0
          ? t("profile.rivals.h2hScoreWithDraws", {
              wins: String(rival.wins),
              losses: String(rival.losses),
              draws: String(rival.draws),
            })
          : t("profile.rivals.h2hScore", {
              wins: String(rival.wins),
              losses: String(rival.losses),
            })}
      </span>
    </Link>
  );
}

export function PlayerRivalsSection({
  rivals,
  hideTitle = false,
}: PlayerRivalsSectionProps) {
  const { t } = useTranslation("rankings");

  if (!rivals.length) return null;

  return (
    <div>
      {!hideTitle && (
        <>
          <h2 className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[#555]">
            {t("profile.rivals.tabFaced")}
          </h2>
          <p className="mb-3 text-xs text-[#444] lg:mb-4">
            {t("profile.rivals.subtitle")}
          </p>
        </>
      )}

      <div className="space-y-1.5 lg:space-y-2">
        {rivals.map((rival) => (
          <RivalCard key={rival.id} rival={rival} />
        ))}
      </div>
    </div>
  );
}
