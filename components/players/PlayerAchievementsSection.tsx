"use client";

import { Award } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import type { PlayerAchievement } from "@/lib/types/playerPassport";

interface PlayerAchievementsSectionProps {
  achievements: PlayerAchievement[];
}

export function PlayerAchievementsSection({
  achievements,
}: PlayerAchievementsSectionProps) {
  const { t, formatShortDate } = useTranslation("rankings");

  if (!achievements.length) return null;

  return (
    <div className="border-t border-[#222] pt-4 lg:pt-6">
      <h2 className="mb-3 text-[10px] uppercase tracking-[0.18em] text-[#555] lg:mb-4">
        {t("passport.achievementsTitle")}
      </h2>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2 lg:gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="flex items-start gap-3 rounded-[10px] border border-[#1f1f1f] bg-[#111] px-3 py-3 lg:px-4"
          >
            <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0a0a0a] text-[#D4A72C]">
              <Award size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="break-words font-medium text-white">
                {t(achievement.labelKey)}
              </p>
              {achievement.context && (
                <p className="mt-1 break-words text-xs text-[#777]">
                  {achievement.context}
                </p>
              )}
              {achievement.date && (
                <p className="mt-1 text-xs text-[#555]">
                  {formatShortDate(achievement.date)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
