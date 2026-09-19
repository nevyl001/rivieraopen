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
    <div className="h-fit self-start">
      <h4 className="font-[family-name:var(--font-fp-display)] text-2xl tracking-wide text-[#111111] md:text-[1.75rem]">
        {section.title}
      </h4>
      {section.subtitle && (
        <p className="mt-1 font-[family-name:var(--font-fp-sans)] text-sm text-[#737373]">
          {section.subtitle}
        </p>
      )}

      <div className="mt-4 grid grid-cols-[1fr_auto] gap-x-4 pb-2 font-[family-name:var(--font-fp-sans)] text-[10px] font-medium uppercase tracking-[0.14em] text-[#8A8A8A]">
        <span>{t("pointSystem.table.concept")}</span>
        <span>{t("pointSystem.table.points")}</span>
      </div>
      <div className="h-px w-full bg-[#ECECEC]" aria-hidden />

      {section.rows.map((row) => (
        <div key={row.concept}>
          <div className="grid grid-cols-[1fr_auto] gap-x-4 py-3 font-[family-name:var(--font-fp-sans)] text-sm">
            <span className="text-[#111111]">{row.concept}</span>
            <span className="font-semibold tabular-nums text-[#111111]">
              {row.points}
            </span>
          </div>
          <div className="h-px w-full bg-[#ECECEC]" aria-hidden />
        </div>
      ))}

      {section.note && (
        <p className="mt-3 font-[family-name:var(--font-fp-sans)] text-sm italic text-[#737373]">
          {section.note}
        </p>
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
    <section className="mt-14 border-t border-[#E8E8E8] pt-10">
      <h3 className="font-[family-name:var(--font-fp-display)] text-3xl tracking-wide text-[#111111] md:text-4xl">
        {t("labels.howRankingsWork")}
      </h3>
      <p className="mt-3 max-w-2xl font-[family-name:var(--font-fp-sans)] text-sm leading-relaxed text-[#737373] md:text-[15px]">
        {t("pointSystem.description")}
      </p>

      <div className="mt-10 grid grid-cols-1 items-start gap-x-12 gap-y-10 lg:grid-cols-2">
        {sections.map((section) => (
          <PointTable key={section.title} section={section} />
        ))}
      </div>

      <div className="mt-12 border-t border-[#ECECEC] pt-8">
        <h4 className="font-[family-name:var(--font-fp-display)] text-2xl tracking-wide text-[#111111]">
          {t("pointSystem.rules.title")}
        </h4>
        <ul className="mt-4 space-y-0">
          {generalRules.map((rule) => (
            <li key={rule}>
              <p className="py-3 font-[family-name:var(--font-fp-sans)] text-sm text-[#111111]">
                {rule}
              </p>
              <div className="h-px w-full bg-[#ECECEC]" aria-hidden />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
