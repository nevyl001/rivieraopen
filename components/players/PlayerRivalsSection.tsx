"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { PlayerRival } from "@/lib/types/playerHistory";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface PlayerRivalsSectionProps {
  rivals: PlayerRival[];
}

function RivalCard({ rival }: { rival: PlayerRival }) {
  const { t } = useTranslation("rankings");

  const h2hAdvantage = rival.wins > rival.losses;
  const h2hDisadvantage = rival.losses > rival.wins;
  const h2hNeutral =
    rival.wins === rival.losses && (rival.draws > 0 || rival.wins === 0);

  return (
    <Link
      href={`/players/${rival.id}`}
      className="flex w-full flex-col gap-3 rounded-[10px] border border-[#1f1f1f] bg-[#111] px-3 py-3 transition-colors hover:border-[#333] hover:bg-[#151515] sm:flex-row sm:items-center lg:px-4 lg:py-3.5"
    >
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-[#2a2a2a]">
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
          <p className="break-words font-medium text-white">{rival.nombre}</p>
          <p className="break-words text-xs text-[#666]">
            #{rival.rank} · {rival.points} pts
            {rival.timesFaced != null && rival.timesFaced > 0
              ? ` · ${t("passport.timesFaced", { count: String(rival.timesFaced) })}`
              : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 sm:shrink-0 sm:flex-col sm:items-end sm:justify-center">
        <p className="text-[9px] uppercase tracking-wide text-[#555] sm:mb-1">
          {t("profile.rivals.h2hLabel")}
        </p>
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium tabular-nums ${
            h2hAdvantage
              ? "bg-[#0d2e20] text-[#1D9E75]"
              : h2hDisadvantage
                ? "bg-[#2e1010] text-[#E85D5D]"
                : h2hNeutral
                  ? "bg-[#2a2410] text-[#D4A72C]"
                  : "bg-[#1a1a1a] text-[#aaa]"
          }`}
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
      </div>
    </Link>
  );
}

export function PlayerRivalsSection({ rivals }: PlayerRivalsSectionProps) {
  const { t } = useTranslation("rankings");

  const faced = useMemo(
    () => rivals.filter((rival) => rival.hasFaced),
    [rivals]
  );

  if (!faced.length) return null;

  return (
    <div className="border-t border-[#222] pt-4 lg:pt-6">
      <h2 className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[#555]">
        {t("profile.rivals.tabFaced")}
      </h2>
      <p className="mb-3 text-xs text-[#444] lg:mb-4">
        {t("profile.rivals.subtitle")}
      </p>

      <div className="space-y-2">
        {faced.map((rival) => (
          <RivalCard key={rival.id} rival={rival} />
        ))}
      </div>
    </div>
  );
}
