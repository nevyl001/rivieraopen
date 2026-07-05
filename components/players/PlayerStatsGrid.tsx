"use client";

import { PlayerProfileDetail } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface PlayerStatsGridProps {
  player: PlayerProfileDetail;
  hideTitle?: boolean;
}

export function PlayerStatsGrid({
  player,
  hideTitle = false,
}: PlayerStatsGridProps) {
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
      {!hideTitle && (
        <h2 className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[#555] lg:mb-4">
          {t("profile.matchStats")}
        </h2>
      )}

      <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-2 lg:gap-px lg:overflow-hidden lg:rounded-[10px] lg:bg-[#222] xl:grid-cols-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-[#222] bg-[#111] px-2.5 py-2 lg:rounded-none lg:border-0 lg:px-4 lg:py-4"
          >
            <p className="mb-0.5 text-[9px] uppercase tracking-wide text-[#555] lg:mb-2 lg:text-[10px]">
              {item.label}
            </p>
            <p className="text-lg font-medium tabular-nums leading-none text-white lg:text-[26px]">
              {item.value}
            </p>
          </div>
        ))}
      </div>

      {stats.ultimaActividad && (
        <div className="mt-2 flex flex-col gap-0.5 border-t border-[#222] pt-2 text-sm sm:flex-row sm:items-center sm:justify-between lg:mt-4 lg:pt-4">
          <span className="text-[10px] uppercase tracking-[0.18em] text-[#555]">
            {t("profile.lastActivity")}
          </span>
          <span className="text-xs font-medium text-white lg:text-sm">
            {stats.ultimaActividad}
          </span>
        </div>
      )}
    </div>
  );
}
