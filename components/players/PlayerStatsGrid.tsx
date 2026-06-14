"use client";

import { PlayerProfileDetail } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface PlayerStatsGridProps {
  player: PlayerProfileDetail;
}

export function PlayerStatsGrid({ player }: PlayerStatsGridProps) {
  const { t } = useTranslation("rankings");
  const { stats } = player;

  const items = [
    {
      label: t("profile.matchesPlayed"),
      value: stats.totalPartidos,
    },
    {
      label: t("profile.gamesWon"),
      value: stats.setsFavor,
    },
    {
      label: t("profile.gamesLost"),
      value: stats.setsContra,
    },
    {
      label: t("profile.wins"),
      value: stats.victorias,
    },
    {
      label: t("profile.losses"),
      value: stats.derrotas,
    },
    {
      label: t("profile.winRate"),
      value: `${stats.pctVictorias}%`,
    },
  ];

  return (
    <div>
      <h2 className="mb-4 text-[10px] uppercase tracking-[0.18em] text-[#555]">
        {t("profile.matchStats")}
      </h2>

      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[10px] bg-[#222] md:grid-cols-3">
        {items.map((item) => (
          <div key={item.label} className="bg-[#111] px-4 py-4">
            <p className="mb-2 text-[10px] uppercase tracking-wide text-[#555]">
              {item.label}
            </p>
            <p className="text-[26px] font-medium tabular-nums leading-none text-white">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {stats.ultimaActividad && (
        <div className="mt-4 flex items-center justify-between border-t border-[#222] pt-4 text-sm">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#555]">
            {t("profile.lastActivity")}
          </span>
          <span className="font-medium text-white">{stats.ultimaActividad}</span>
        </div>
      )}
    </div>
  );
}
