"use client";

import { Award } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import type { PlayerAchievement } from "@/lib/types/playerPassport";

interface PlayerAchievementsSectionProps {
  achievements: PlayerAchievement[];
  hideTitle?: boolean;
}

export function PlayerAchievementsSection({
  achievements,
  hideTitle = false,
}: PlayerAchievementsSectionProps) {
  const { t, formatShortDate } = useTranslation("rankings");

  if (!achievements.length) return null;

  return (
    <div>
      {!hideTitle && (
        <h2 className="mb-2 text-[10px] uppercase tracking-[0.18em] text-[#555] lg:mb-4">
          {t("passport.achievementsTitle")}
        </h2>
      )}

      <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-2 lg:gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className="flex items-start gap-2.5 rounded-lg border border-[#1f1f1f] bg-[#111] px-3 py-2.5 lg:gap-3 lg:rounded-[10px] lg:px-4 lg:py-3"
          >
            <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#0a0a0a] text-[#D4A72C] lg:h-9 lg:w-9">
              <Award size={16} className="lg:h-[18px] lg:w-[18px]" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="break-words text-sm font-medium text-white lg:text-base">
                {t(achievement.labelKey)}
              </p>
              {achievement.context && (
                <p className="mt-0.5 break-words text-[11px] text-[#777] lg:mt-1 lg:text-xs">
                  {achievement.context}
                </p>
              )}
              {achievement.date && (
                <p className="mt-0.5 text-[11px] text-[#555] lg:mt-1 lg:text-xs">
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
