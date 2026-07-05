"use client";

import { useTranslation } from "@/lib/hooks/useTranslation";
import type { PlayerCareerSummary } from "@/lib/types/playerPassport";

interface PlayerCareerSummarySectionProps {
  summary: PlayerCareerSummary;
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[10px] border border-[#1f1f1f] bg-[#111] px-3 py-2.5 lg:px-4 lg:py-3">
      <p className="mb-1 text-[10px] uppercase tracking-wide text-[#555]">
        {label}
      </p>
      <p className="text-lg font-medium tabular-nums text-white lg:text-xl">
        {value}
      </p>
    </div>
  );
}

export function PlayerCareerSummarySection({
  summary,
}: PlayerCareerSummarySectionProps) {
  const { t } = useTranslation("rankings");

  return (
    <div className="border-t border-[#222] pt-4 lg:pt-6">
      <h2 className="mb-3 text-[10px] uppercase tracking-[0.18em] text-[#555] lg:mb-4">
        {t("passport.careerTitle")}
      </h2>

      {summary.registrationClubName && (
        <p className="mb-3 break-words text-sm text-[#aaa] lg:mb-4">
          {t("passport.registrationClub")}:{" "}
          <span className="text-white">{summary.registrationClubName}</span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-3 xl:grid-cols-4">
        <StatCell label={t("passport.totalClubs")} value={summary.totalClubs} />
        <StatCell label={t("passport.totalEvents")} value={summary.totalEvents} />
        <StatCell label={t("passport.totalTournaments")} value={summary.totalTorneos} />
        <StatCell label={t("passport.totalRetas")} value={summary.totalRetas} />
        <StatCell label={t("passport.totalLeagues")} value={summary.totalLigas} />
        <StatCell
          label={t("passport.totalAmericans")}
          value={summary.totalAmericanos}
        />
        <StatCell label={t("passport.totalDuels")} value={summary.totalDuelos} />
      </div>
    </div>
  );
}
