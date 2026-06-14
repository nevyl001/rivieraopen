"use client";

import { PlayerProfileDetail } from "@/lib/types";
import { Trophy, Users, Zap, Flag } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface PlayerActivitySummaryProps {
  player: PlayerProfileDetail;
}

export function PlayerActivitySummary({ player }: PlayerActivitySummaryProps) {
  const { t } = useTranslation("rankings");
  const { stats } = player;

  const activities = [
    {
      label: t("profile.expressTournaments"),
      value: stats.totalTorneosExpress,
      icon: Trophy,
    },
    {
      label: t("profile.leagues"),
      value: stats.totalLigas,
      icon: Flag,
    },
    {
      label: t("profile.challenges"),
      value: stats.totalRetas,
      icon: Zap,
    },
    {
      label: t("profile.americans"),
      value: stats.totalAmericanos,
      icon: Users,
    },
  ];

  const hasActivity = activities.some((item) => item.value > 0);

  return (
    <div className="border-t border-[#222] pt-6">
      <h2 className="mb-4 text-[10px] uppercase tracking-[0.18em] text-[#555]">
        {t("profile.activityHistory")}
      </h2>

      {hasActivity ? (
        <div className="space-y-2">
          {activities
            .filter((item) => item.value > 0)
            .map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4 rounded-[10px] bg-[#111] px-4 py-3.5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <item.icon size={16} className="shrink-0 text-[#555]" />
                  <span className="text-sm text-[#aaa]">{item.label}</span>
                </div>
                <span className="shrink-0 text-lg font-medium tabular-nums text-white">
                  {item.value}
                </span>
              </div>
            ))}
        </div>
      ) : (
        <p className="py-8 text-center text-sm text-[#555]">
          {t("profile.noActivityYet")}
        </p>
      )}

      {player.tournamentResults.length > 0 && (
        <div className="mt-6 border-t border-[#222] pt-6">
          <h3 className="mb-4 text-[10px] uppercase tracking-[0.18em] text-[#555]">
            {t("labels.tournamentHistory")}
          </h3>
          <div className="space-y-2">
            {player.tournamentResults.map((result, index) => (
              <div
                key={`${result.tournamentId}-${index}`}
                className="rounded-[10px] bg-[#111] px-4 py-3.5"
              >
                <p className="font-medium text-white">
                  {result.placement === 1
                    ? t("placementIndicators.first")
                    : t("placementIndicators.second")}
                </p>
                <p className="mt-1 text-sm text-[#555]">
                  {result.club} · {result.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
