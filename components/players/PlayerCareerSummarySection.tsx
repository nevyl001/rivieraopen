"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import type { PlayerCareerSummary } from "@/lib/types/playerPassport";

interface PlayerCareerSummarySectionProps {
  summary: PlayerCareerSummary;
  hideTitle?: boolean;
}

function StatCell({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-[#1f1f1f] bg-[#111] px-2.5 py-2 lg:rounded-[10px] lg:px-4 lg:py-3">
      <p className="mb-0.5 text-[9px] uppercase tracking-wide text-[#555] lg:mb-1 lg:text-[10px]">
        {label}
      </p>
      <p className="text-base font-medium tabular-nums text-white lg:text-xl">
        {value}
      </p>
    </div>
  );
}

export function PlayerCareerSummarySection({
  summary,
  hideTitle = false,
}: PlayerCareerSummarySectionProps) {
  const { t } = useTranslation("rankings");
  const [expanded, setExpanded] = useState(false);

  const primaryStats = [
    { label: t("passport.totalClubs"), value: summary.totalClubs },
    { label: t("passport.totalEvents"), value: summary.totalEvents },
    { label: t("passport.totalTournaments"), value: summary.totalTorneos },
    { label: t("passport.totalDuels"), value: summary.totalDuelos },
  ];

  const secondaryStats = [
    { label: t("passport.totalRetas"), value: summary.totalRetas },
    { label: t("passport.totalLeagues"), value: summary.totalLigas },
    { label: t("passport.totalAmericans"), value: summary.totalAmericanos },
  ];

  return (
    <div>
      {!hideTitle && (
        <h2 className="mb-2 hidden text-[10px] uppercase tracking-[0.18em] text-[#555] lg:mb-4 lg:block">
          {t("passport.careerTitle")}
        </h2>
      )}

      {summary.registrationClubName && (
        <p className="mb-2 break-words text-[11px] text-[#777] lg:mb-4 lg:text-sm">
          {t("passport.registrationClub")}:{" "}
          <span className="text-[#ccc] lg:text-white">
            {summary.registrationClubName}
          </span>
        </p>
      )}

      <div className="grid grid-cols-2 gap-1.5 lg:grid-cols-3 lg:gap-3 xl:grid-cols-4">
        {primaryStats.map((stat) => (
          <StatCell key={stat.label} label={stat.label} value={stat.value} />
        ))}

        {secondaryStats.map((stat) => (
          <div
            key={stat.label}
            className={`${expanded ? "block" : "hidden lg:block"}`}
          >
            <StatCell label={stat.label} value={stat.value} />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="mt-2 text-xs text-[#666] transition-colors hover:text-[#999] lg:hidden"
      >
        {expanded ? t("passport.showLess") : t("passport.showMoreCareer")}
      </button>
    </div>
  );
}
