"use client";

import { Card } from "@/components/ui";
import { PlayerProfileDetail } from "@/lib/types";
import {
  Swords,
  Target,
  TrendingUp,
  Flame,
  CalendarDays,
} from "lucide-react";
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
      icon: Swords,
    },
    {
      label: t("profile.wins"),
      value: stats.victorias,
      icon: Target,
      accent: true,
    },
    {
      label: t("profile.losses"),
      value: stats.derrotas,
      icon: Target,
    },
    {
      label: t("profile.gamesWon"),
      value: stats.setsFavor,
      icon: TrendingUp,
    },
    {
      label: t("profile.gamesLost"),
      value: stats.setsContra,
      icon: TrendingUp,
    },
    {
      label: t("profile.winRate"),
      value: `${stats.pctVictorias}%`,
      icon: Flame,
      accent: true,
    },
  ];

  return (
    <Card>
      <h2 className="font-heading text-2xl font-semibold text-primary mb-6">
        {t("profile.matchStats")}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {items.map((item) => (
          <div
            key={item.label}
            className="p-5 bg-gray-50 rounded-2xl text-center hover:bg-gray-100 transition-colors"
          >
            <item.icon
              size={22}
              className={`mx-auto mb-2 ${item.accent ? "text-accent" : "text-text-secondary"}`}
            />
            <p
              className={`text-3xl font-bold mb-1 ${item.accent ? "text-accent" : "text-primary"}`}
            >
              {item.value}
            </p>
            <p className="text-sm text-text-secondary">{item.label}</p>
          </div>
        ))}
      </div>
      {stats.ultimaActividad && (
        <div className="mt-6 flex items-center justify-center gap-2 text-text-secondary">
          <CalendarDays size={16} className="text-accent" />
          <span>
            {t("profile.lastActivity")}: {stats.ultimaActividad}
          </span>
        </div>
      )}
    </Card>
  );
}
