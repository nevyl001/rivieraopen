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
      className="flex items-center gap-3 rounded-[10px] border border-[#1f1f1f] bg-[#111] px-4 py-3.5 transition-colors hover:border-[#333] hover:bg-[#151515]"
    >
      <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-full ring-1 ring-[#2a2a2a]">
        <Image
          src={rival.foto}
          alt={rival.nombre}
          fill
          className="object-cover"
          sizes="44px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate font-medium text-white">{rival.nombre}</p>
        <p className="text-xs text-[#666]">
          #{rival.rank} · {rival.points} pts
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p className="mb-1 text-[9px] uppercase tracking-wide text-[#555]">
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
    <div className="border-t border-[#222] pt-6">
      <h2 className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[#555]">
        {t("profile.rivals.tabFaced")}
      </h2>
      <p className="mb-4 text-xs text-[#444]">
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
