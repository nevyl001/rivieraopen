"use client";

import { useTranslation } from "@/lib/hooks/useTranslation";

interface PointRow {
  concept: string;
  points: string;
}

interface PointSection {
  title: string;
  subtitle?: string;
  note?: string;
  rows: PointRow[];
}

function PointTable({ section }: { section: PointSection }) {
  const { t } = useTranslation("rankings");

  return (
    <div className="space-y-3">
      <div>
        <h4 className="font-heading text-lg font-semibold text-primary">
          {section.title}
        </h4>
        {section.subtitle && (
          <p className="text-sm text-text-secondary mt-1">{section.subtitle}</p>
        )}
      </div>
      <div className="rounded-xl border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-[1fr_auto] gap-4 px-4 py-2.5 bg-gray-50 text-xs font-medium uppercase tracking-wide text-text-secondary">
          <span>{t("pointSystem.table.concept")}</span>
          <span>{t("pointSystem.table.points")}</span>
        </div>
        {section.rows.map((row) => (
          <div
            key={row.concept}
            className="grid grid-cols-[1fr_auto] gap-4 px-4 py-3 border-t border-gray-100 text-sm"
          >
            <span className="text-primary">{row.concept}</span>
            <span className="font-semibold text-accent tabular-nums">
              {row.points}
            </span>
          </div>
        ))}
      </div>
      {section.note && (
        <p className="text-sm text-text-secondary italic">{section.note}</p>
      )}
    </div>
  );
}

export function RankingPointSystem() {
  const { t } = useTranslation("rankings");

  const sections: PointSection[] = [
    {
      title: t("pointSystem.challenge.title"),
      rows: [
        { concept: t("pointSystem.challenge.champion"), points: "100" },
        { concept: t("pointSystem.challenge.runnerUp"), points: "75" },
        { concept: t("pointSystem.challenge.thirdPlace"), points: "50" },
        { concept: t("pointSystem.challenge.participate"), points: "25" },
      ],
    },
    {
      title: t("pointSystem.american.title"),
      note: t("pointSystem.american.note"),
      rows: [
        { concept: t("pointSystem.american.participate"), points: "30" },
        { concept: t("pointSystem.american.winDuel"), points: "+5" },
        { concept: t("pointSystem.american.champion"), points: "80" },
        { concept: t("pointSystem.american.runnerUp"), points: "40" },
        { concept: t("pointSystem.american.thirdPlace"), points: "20" },
      ],
    },
    {
      title: t("pointSystem.duel2v2.title"),
      rows: [
        { concept: t("pointSystem.duel2v2.winner"), points: "50" },
        { concept: t("pointSystem.duel2v2.loser"), points: "20" },
      ],
    },
    {
      title: t("pointSystem.tournament.title"),
      subtitle: t("pointSystem.tournament.subtitle"),
      note: t("pointSystem.tournament.note"),
      rows: [
        { concept: t("pointSystem.tournament.participate"), points: "50" },
        { concept: t("pointSystem.tournament.groupStage"), points: "+100" },
        { concept: t("pointSystem.tournament.semiFinal"), points: "+50" },
        { concept: t("pointSystem.tournament.final"), points: "+100" },
        { concept: t("pointSystem.tournament.champion"), points: "+300" },
        { concept: t("pointSystem.tournament.runnerUp"), points: "+150" },
        { concept: t("pointSystem.tournament.semiFinalists"), points: "+50" },
      ],
    },
    {
      title: t("pointSystem.league.title"),
      rows: [
        { concept: t("pointSystem.league.firstRegistration"), points: "100" },
        { concept: t("pointSystem.league.winRound"), points: "+50" },
        { concept: t("pointSystem.league.champion"), points: "500" },
        { concept: t("pointSystem.league.runnerUp"), points: "250" },
        { concept: t("pointSystem.league.thirdPlace"), points: "100" },
      ],
    },
  ];

  const generalRules = [
    t("pointSystem.rules.noDeduction"),
    t("pointSystem.rules.tieBreak"),
    t("pointSystem.rules.autoRegister"),
    t("pointSystem.rules.liveRanking"),
  ];

  return (
    <div className="mt-14 p-8 bg-white rounded-2xl border border-gray-100">
      <h3 className="font-heading text-xl font-semibold text-primary mb-2">
        {t("labels.howRankingsWork")}
      </h3>
      <p className="text-text-secondary mb-8">{t("pointSystem.description")}</p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {sections.map((section) => (
          <PointTable key={section.title} section={section} />
        ))}
      </div>

      <div className="pt-6 border-t border-gray-100">
        <h4 className="font-heading text-lg font-semibold text-primary mb-4">
          {t("pointSystem.rules.title")}
        </h4>
        <ul className="space-y-2">
          {generalRules.map((rule) => (
            <li
              key={rule}
              className="flex items-start gap-2 text-sm text-text-secondary"
            >
              <span className="text-accent mt-1 shrink-0">•</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
