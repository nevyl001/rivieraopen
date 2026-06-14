"use client";

import { Card } from "@/components/ui";
import { PlayerProfileDetail } from "@/lib/types";
import {
  Trophy,
  Users,
  Zap,
  Flag,
  History,
} from "lucide-react";
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
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <History size={28} className="text-accent" />
        <h2 className="font-heading text-2xl font-semibold text-primary">
          {t("profile.activityHistory")}
        </h2>
      </div>

      {hasActivity ? (
        <div className="space-y-3">
          {activities
            .filter((item) => item.value > 0)
            .map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-xl"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-accent" />
                  </div>
                  <span className="font-medium text-primary">{item.label}</span>
                </div>
                <span className="text-2xl font-bold text-accent shrink-0">
                  {item.value}
                </span>
              </div>
            ))}
        </div>
      ) : (
        <p className="text-text-secondary text-center py-8">
          {t("profile.noActivityYet")}
        </p>
      )}

      {player.tournamentResults.length > 0 && (
        <div className="mt-8 pt-8 border-t border-gray-100">
          <h3 className="font-heading text-xl font-semibold text-primary mb-4">
            {t("labels.tournamentHistory")}
          </h3>
          <div className="space-y-3">
            {player.tournamentResults.map((result, index) => (
              <div
                key={`${result.tournamentId}-${index}`}
                className="p-4 bg-gray-50 rounded-xl"
              >
                <p className="font-medium text-primary">
                  {result.placement === 1
                    ? t("placementIndicators.first")
                    : t("placementIndicators.second")}
                </p>
                <p className="text-sm text-text-secondary mt-1">
                  {result.club} · {result.date}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
