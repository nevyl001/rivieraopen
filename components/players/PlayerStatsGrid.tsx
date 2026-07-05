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
      <h2 className="mb-3 text-[10px] uppercase tracking-[0.18em] text-[#555] lg:mb-4">
        {t("profile.matchStats")}
      </h2>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-px lg:overflow-hidden lg:rounded-[10px] lg:bg-[#222] xl:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-[10px] border border-[#222] bg-[#111] px-4 py-3 lg:rounded-none lg:border-0 lg:py-4"
          >
            <p className="mb-1.5 text-[10px] uppercase tracking-wide text-[#555] lg:mb-2">
              {item.label}
            </p>
            <p className="text-2xl font-medium tabular-nums leading-none text-white lg:text-[26px]">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {stats.ultimaActividad && (
        <div className="mt-3 flex flex-col gap-1 border-t border-[#222] pt-3 text-sm sm:flex-row sm:items-center sm:justify-between lg:mt-4 lg:pt-4">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#555]">
            {t("profile.lastActivity")}
          </span>
          <span className="font-medium text-white">{stats.ultimaActividad}</span>
        </div>
      )}
    </div>
  );
}
