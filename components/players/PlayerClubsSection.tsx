"use client";

import { useTranslation } from "@/lib/hooks/useTranslation";
import type { PlayerClubParticipation } from "@/lib/types/playerPassport";

interface PlayerClubsSectionProps {
  clubs: PlayerClubParticipation[];
  hideTitle?: boolean;
}

export function PlayerClubsSection({
  clubs,
  hideTitle = false,
}: PlayerClubsSectionProps) {
  const { t } = useTranslation("rankings");

  const visible = clubs.filter((club) => club.eventCount > 0);
  if (!visible.length) return null;

  return (
    <div>
      {!hideTitle && (
        <>
          <h2 className="mb-1 text-[10px] uppercase tracking-[0.18em] text-[#555]">
            {t("passport.clubsPlayedTitle")}
          </h2>
          <p className="mb-3 text-xs text-[#444] lg:mb-4">
            {t("passport.clubsPlayedSubtitle")}
          </p>
        </>
      )}

      <div className="grid grid-cols-1 gap-1.5 lg:grid-cols-2 lg:gap-2">
        {visible.map((club) => (
          <div
            key={club.clubName}
            className="flex w-full items-start justify-between gap-3 rounded-lg border border-[#1f1f1f] bg-[#111] px-3 py-2.5 lg:rounded-[10px] lg:px-4 lg:py-3"
          >
            <p className="min-w-0 flex-1 break-words text-sm font-medium text-white lg:text-base">
              {club.clubName}
            </p>
            <span className="shrink-0 rounded-full border border-[#2a2a2a] px-2 py-0.5 text-[11px] tabular-nums text-[#aaa] lg:px-2.5 lg:py-1 lg:text-xs">
              {t("passport.clubEventCount", { count: String(club.eventCount) })}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
