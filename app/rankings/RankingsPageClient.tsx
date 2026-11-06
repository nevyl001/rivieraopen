"use client";

import { useEffect, useMemo, useState } from "react";
import { Container } from "@/components/ui";
import { RankingFilters } from "@/components/rankings/RankingFilters";
import { RankingHeader } from "@/components/rankings/RankingHeader";
import { RankingPlayerRow } from "@/components/rankings/RankingPlayerRow";
import { RankingPointSystem } from "@/components/rankings/RankingPointSystem";
import { RankingShareDialog } from "@/components/rankings/RankingShareDialog";
import { RankingTopThree } from "@/components/rankings/RankingTopThree";
import { Category, Gender, Player } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { getCategoryTranslationKey } from "@/lib/categoryUtils";
import {
  ranksSharingPosition,
  splitOfficialPodium,
} from "@/lib/rankingPresentation";

function normalizeSearch(text: string): string {
  return text
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .trim();
}

function playerMatchesSearch(player: Player, query: string): boolean {
  const normalizedQuery = normalizeSearch(query);
  if (!normalizedQuery) return true;
  const fullName = normalizeSearch(`${player.firstName} ${player.lastName}`);
  return fullName.includes(normalizedQuery);
}

export function RankingsPageClient() {
  const { t } = useTranslation("rankings");
  const [selectedGender, setSelectedGender] = useState<Gender>("Male");
  const [selectedLevel, setSelectedLevel] = useState<Category>("Open");
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sharePlayer, setSharePlayer] = useState<Player | null>(null);

  useEffect(() => {
    setSearchQuery("");
  }, [selectedLevel, selectedGender]);

  const filteredPlayers = useMemo(
    () => players.filter((player) => playerMatchesSearch(player, searchQuery)),
    [players, searchQuery]
  );

  const searching = searchQuery.trim().length > 0;
  const podium = useMemo(
    () => (searching ? { featured: [], rest: filteredPlayers } : splitOfficialPodium(filteredPlayers)),
    [filteredPlayers, searching]
  );

  useEffect(() => {
    let cancelled = false;

    async function loadRankings() {
      setIsLoading(true);
      try {
        const params = new URLSearchParams({
          categoria: selectedLevel,
          genero: selectedGender,
        });
        const res = await fetch(`/api/rankings?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const data = await res.json();
        if (cancelled) return;
        setPlayers(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("RankingsPageClient:", err);
        if (!cancelled) setPlayers([]);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    loadRankings();
    return () => {
      cancelled = true;
    };
  }, [selectedLevel, selectedGender]);

  const categoryLabel = t(getCategoryTranslationKey(selectedLevel));
  const genderLabel =
    selectedGender === "Male" ? t("genders.varonil") : t("genders.femenil");

  return (
    <div className="overflow-x-clip bg-[#F7F7F7] pb-16 pt-24 md:pt-28">
      <Container className="max-w-[76rem]">
        <RankingHeader />
        <RankingFilters
          selectedGender={selectedGender}
          selectedLevel={selectedLevel}
          searchQuery={searchQuery}
          onGenderChange={(gender) => {
            setIsLoading(true);
            setSelectedGender(gender);
          }}
          onLevelChange={(level) => {
            setIsLoading(true);
            setSelectedLevel(level);
          }}
          onSearchChange={setSearchQuery}
        />

        {isLoading ? (
          <RankingSkeleton />
        ) : (
          <>
            <div className="mb-4 flex items-end justify-between gap-3">
              <div>
                <h2 className="font-[family-name:var(--font-fp-sans)] text-sm font-semibold uppercase tracking-[0.14em] text-[#101010]">
                  {categoryLabel} · {genderLabel}
                </h2>
                <p className="mt-1 font-[family-name:var(--font-fp-sans)] text-xs text-[#737373]">
                  {searching
                    ? t("labels.showingFiltered", {
                        count: filteredPlayers.length,
                        total: players.length,
                      })
                    : `${t("labels.showing")} ${players.length} ${
                        players.length === 1
                          ? t("labels.player")
                          : t("labels.players")
                      }`}
                </p>
              </div>
            </div>

            {filteredPlayers.length > 0 ? (
              <>
                <RankingTopThree
                  players={podium.featured}
                  roster={players}
                  genderLabel={genderLabel}
                  onShare={setSharePlayer}
                />
                {podium.rest.length > 0 && (
                  <div className="flex flex-col gap-2.5">
                    {podium.rest.map((player) => (
                      <RankingPlayerRow
                        key={player.id}
                        player={player}
                        tied={ranksSharingPosition(players, player.rank)}
                        onShare={setSharePlayer}
                      />
                    ))}
                  </div>
                )}
              </>
            ) : players.length > 0 ? (
              <EmptyState message={t("messages.noSearchResults")} />
            ) : (
              <EmptyState message={t("messages.noPlayers")} />
            )}
          </>
        )}

        <RankingPointSystem />
      </Container>
      <RankingShareDialog
        player={sharePlayer}
        genderLabel={genderLabel}
        onClose={() => setSharePlayer(null)}
      />
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-[#E7E7E7] bg-white px-6 py-16 text-center">
      <p className="font-[family-name:var(--font-fp-sans)] text-sm text-[#737373]">
        {message}
      </p>
    </div>
  );
}

function RankingSkeleton() {
  return (
    <div aria-hidden>
      <div className="mx-auto mb-8 grid w-full max-w-5xl grid-cols-[1fr_1.15fr_1fr] items-end gap-2 md:gap-4">
        <div className="h-[clamp(148px,26vh,270px)] animate-pulse rounded-2xl bg-[#EFEFEF]" />
        <div className="h-[clamp(168px,30vh,320px)] animate-pulse rounded-2xl bg-[#E7E7E7]" />
        <div className="h-[clamp(148px,26vh,270px)] animate-pulse rounded-2xl bg-[#EFEFEF]" />
      </div>
      <div className="flex flex-col gap-2.5">
        {[0, 1, 2].map((item) => (
          <div
            key={item}
            className="flex h-[104px] items-center gap-4 rounded-xl border border-[#E7E7E7] bg-white px-4 md:h-[120px]"
          >
            <div className="h-8 w-10 animate-pulse rounded bg-[#F1F1F1]" />
            <div className="h-[75px] w-14 animate-pulse rounded-[10px] bg-[#F1F1F1]" />
            <div className="h-4 flex-1 animate-pulse rounded bg-[#F1F1F1]" />
            <div className="h-6 w-12 animate-pulse rounded bg-[#F1F1F1]" />
          </div>
        ))}
      </div>
    </div>
  );
}
