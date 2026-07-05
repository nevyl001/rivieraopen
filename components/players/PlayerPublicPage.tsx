"use client";

import Link from "next/link";
import { Container } from "@/components/ui";
import { PlayerProfile, PlayerPersonalInfo } from "@/components/players/PlayerProfile";
import { PlayerStatsGrid } from "@/components/players/PlayerStatsGrid";
import { PlayerHistorySection } from "@/components/players/PlayerHistorySection";
import { PlayerRivalsSection } from "@/components/players/PlayerRivalsSection";
import { PlayerSeasonRatingRow } from "@/components/players/PlayerSeasonRatingRow";
import { PlayerCareerSummarySection } from "@/components/players/PlayerCareerSummarySection";
import { PlayerClubsSection } from "@/components/players/PlayerClubsSection";
import { PlayerPartnersSection } from "@/components/players/PlayerPartnersSection";
import { PlayerAchievementsSection } from "@/components/players/PlayerAchievementsSection";
import { PassportAccordion } from "@/components/players/PassportAccordion";
import { PassportMobileActionBar } from "@/components/players/PassportMobileActionBar";
import type { PlayerProfileDetail } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { ArrowLeft } from "lucide-react";

interface PlayerPublicPageProps {
  player: PlayerProfileDetail;
}

export function PlayerPublicPage({ player }: PlayerPublicPageProps) {
  const { t } = useTranslation("rankings");

  const hasPersonalInfo = Boolean(
    player.age ||
      player.manoDominante ||
      player.enCancha ||
      player.paisCodigo?.trim()
  );

  const historyEvents = player.passportHistoryEvents ?? player.historyEvents ?? [];
  const achievements = player.achievements ?? [];
  const achievementsDefaultOpen = achievements.length <= 3;
  const facedRivals = (player.rivals ?? []).filter((rival) => rival.hasFaced);

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] pt-20 pb-24 lg:pt-32 lg:pb-16">
      <Container size="md" className="max-w-full overflow-x-hidden px-3 sm:px-4">
        <Link
          href="/rankings"
          className="mb-3 flex w-full max-w-full items-center justify-center gap-2 rounded-lg border border-[#333] px-3 py-2 text-sm font-medium text-white transition-colors hover:border-[#555] hover:bg-[#111] lg:mb-8 lg:inline-flex lg:w-auto lg:justify-start lg:px-4 lg:py-2.5"
        >
          <ArrowLeft size={18} className="shrink-0 text-white" />
          <span className="whitespace-nowrap">Volver a Rankings</span>
        </Link>

        <div className="space-y-3 lg:space-y-6">
          <PlayerProfile player={player} />

          {/* Mobile: compact accordions */}
          <div className="space-y-3 lg:hidden">
            {player.careerSummary && (
              <PassportAccordion title={t("passport.careerTitle")} defaultOpen>
                <PlayerCareerSummarySection
                  summary={player.careerSummary}
                  hideTitle
                />
              </PassportAccordion>
            )}

            <PlayerSeasonRatingRow player={player} />

            {hasPersonalInfo && (
              <PassportAccordion
                title={t("profile.personalInfo")}
                defaultOpen={false}
              >
                <PlayerPersonalInfo player={player} hideTitle />
              </PassportAccordion>
            )}

            <PassportAccordion
              title={t("profile.matchStats")}
              defaultOpen={false}
            >
              <PlayerStatsGrid player={player} hideTitle />
            </PassportAccordion>

            {player.careerSummary && (
              <PassportAccordion
                title={t("passport.clubsPlayedTitle")}
                subtitle={t("passport.clubsPlayedSubtitle")}
                defaultOpen={false}
              >
                <PlayerClubsSection
                  clubs={player.careerSummary.participatedClubs}
                  hideTitle
                />
              </PassportAccordion>
            )}

            {achievements.length > 0 && (
              <PassportAccordion
                title={t("passport.achievementsTitle")}
                defaultOpen={achievementsDefaultOpen}
              >
                <PlayerAchievementsSection
                  achievements={achievements}
                  hideTitle
                />
              </PassportAccordion>
            )}

            <PlayerHistorySection events={historyEvents} />

            {facedRivals.length > 0 && (
              <PassportAccordion
                title={t("profile.rivals.tabFaced")}
                subtitle={t("profile.rivals.subtitle")}
                defaultOpen={false}
              >
                <PlayerRivalsSection rivals={facedRivals} hideTitle />
              </PassportAccordion>
            )}

            {player.partners && player.partners.length > 0 && (
              <PassportAccordion
                title={t("passport.partnersTitle")}
                subtitle={t("passport.partnersSubtitle")}
                defaultOpen={false}
              >
                <PlayerPartnersSection partners={player.partners} hideTitle />
              </PassportAccordion>
            )}
          </div>

          {/* Desktop: layout original */}
          <div className="hidden space-y-6 lg:block">
            {player.careerSummary && (
              <PlayerCareerSummarySection summary={player.careerSummary} />
            )}

            <PlayerSeasonRatingRow player={player} />

            <div
              className={`grid grid-cols-1 gap-6 border-t border-[#222] pt-6 ${
                hasPersonalInfo ? "lg:grid-cols-2 lg:items-start" : ""
              }`}
            >
              {hasPersonalInfo && <PlayerPersonalInfo player={player} />}
              <div className={hasPersonalInfo ? "" : "lg:col-span-2"}>
                <PlayerStatsGrid player={player} />
              </div>
            </div>

            {player.careerSummary && (
              <PlayerClubsSection clubs={player.careerSummary.participatedClubs} />
            )}

            {achievements.length > 0 && (
              <PlayerAchievementsSection achievements={achievements} />
            )}

            <PlayerHistorySection events={historyEvents} />

            <PlayerRivalsSection rivals={player.rivals ?? []} />

            {player.partners && player.partners.length > 0 && (
              <PlayerPartnersSection partners={player.partners} />
            )}
          </div>
        </div>
      </Container>

      <PassportMobileActionBar player={player} />
    </div>
  );
}
