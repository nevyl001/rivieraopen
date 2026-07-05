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
import type { PlayerProfileDetail } from "@/lib/types";
import { ArrowLeft } from "lucide-react";

interface PlayerPublicPageProps {
  player: PlayerProfileDetail;
}

export function PlayerPublicPage({ player }: PlayerPublicPageProps) {
  const hasPersonalInfo = Boolean(
    player.age ||
      player.manoDominante ||
      player.enCancha ||
      player.paisCodigo?.trim()
  );

  const historyEvents = player.passportHistoryEvents ?? player.historyEvents ?? [];

  return (
    <div className="min-h-screen overflow-x-hidden bg-[#0a0a0a] pt-24 pb-10 lg:pt-32 lg:pb-16">
      <Container size="md" className="max-w-full overflow-x-hidden px-3 sm:px-4">
        <Link
          href="/rankings"
          className="mb-4 flex w-full max-w-full items-center justify-center gap-2 rounded-lg border border-[#333] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-[#555] hover:bg-[#111] lg:mb-8 lg:inline-flex lg:w-auto lg:justify-start"
        >
          <ArrowLeft size={18} className="shrink-0 text-white" />
          <span className="whitespace-nowrap">Volver a Rankings</span>
        </Link>

        <div className="space-y-4 lg:space-y-6">
          <PlayerProfile player={player} />

          {player.careerSummary && (
            <PlayerCareerSummarySection summary={player.careerSummary} />
          )}

          <PlayerSeasonRatingRow player={player} />

          <div
            className={`grid grid-cols-1 gap-4 border-t border-[#222] pt-4 lg:gap-6 lg:pt-6 ${
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

          {player.achievements && player.achievements.length > 0 && (
            <PlayerAchievementsSection achievements={player.achievements} />
          )}

          <PlayerHistorySection events={historyEvents} />

          <PlayerRivalsSection rivals={player.rivals ?? []} />

          {player.partners && player.partners.length > 0 && (
            <PlayerPartnersSection partners={player.partners} />
          )}
        </div>
      </Container>
    </div>
  );
}
