"use client";

import { useState } from "react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import type { PlayerCareerSummary } from "@/lib/types/playerPassport";

interface PlayerCareerSummarySectionProps {
  summary: PlayerCareerSummary;
  hideTitle?: boolean;
}

function StatCell({
  label,
  value,
  emphasis = false,
}: {
  label: string;
  value: string | number;
  emphasis?: boolean;
}) {
  return (
    <div className="rounded-lg border border-[#2A2F38] bg-[#14171C] px-2.5 py-2.5 lg:rounded-[10px] lg:px-4 lg:py-3.5">
      <p className="mb-1 text-[10px] uppercase tracking-[0.12em] text-[#A1AAB8] lg:text-[11px]">
        {label}
      </p>
      <p
        className={`font-semibold tabular-nums leading-none text-[#F5F7FA] ${
          emphasis ? "text-2xl lg:text-[1.85rem]" : "text-xl lg:text-2xl"
        }`}
      >
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
        <h2 className="mb-2 hidden text-[10px] uppercase tracking-[0.18em] text-[#A1AAB8] lg:mb-4 lg:block">
          {t("passport.careerTitle")}
        </h2>
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
            <StatCell label={stat.label} value={stat.value} emphasis />
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
