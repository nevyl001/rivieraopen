"use client";

import { useTranslation } from "@/lib/hooks/useTranslation";
import type { PlayerClubParticipation } from "@/lib/types/playerPassport";

interface PlayerClubsSectionProps {
  clubs: PlayerClubParticipation[];
}

export function PlayerClubsSection({ clubs }: PlayerClubsSectionProps) {
  const { t } = useTranslation("rankings");

  const visible = clubs.filter((club) => club.eventCount > 0);
  if (!visible.length) return null;

  return (
    <div className="border-t border-[#222] pt-4 lg:pt-6">
      <h2 className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[#555]">
        {t("passport.clubsPlayedTitle")}
      </h2>
      <p className="mb-3 text-xs text-[#444] lg:mb-4">
        {t("passport.clubsPlayedSubtitle")}
      </p>

      <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
        {visible.map((club) => (
          <div
            key={club.clubName}
            className="flex w-full items-start justify-between gap-3 rounded-[10px] border border-[#1f1f1f] bg-[#111] px-3 py-3 lg:px-4"
          >
            <p className="min-w-0 flex-1 break-words font-medium text-white">
              {club.clubName}
            </p>
            <span className="shrink-0 rounded-full border border-[#2a2a2a] px-2.5 py-1 text-xs tabular-nums text-[#aaa]">
              {t("passport.clubEventCount", { count: String(club.eventCount) })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
