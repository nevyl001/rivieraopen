"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, X } from "lucide-react";
import { Container } from "@/components/ui";
import { LevelTabs } from "@/components/rankings/LevelTabs";
import { GenderTabs } from "@/components/rankings/GenderTabs";
import { PlayerRankingCard } from "@/components/rankings/PlayerRankingCard";
import { RankingPointSystem } from "@/components/rankings/RankingPointSystem";
import { Category, Gender, Player } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { getCategoryTranslationKey } from "@/lib/categoryUtils";

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

  useEffect(() => {
    setSearchQuery("");
  }, [selectedLevel, selectedGender]);

  const filteredPlayers = useMemo(
    () => players.filter((player) => playerMatchesSearch(player, searchQuery)),
    [players, searchQuery]
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
        if (!cancelled) {
          setPlayers([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
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
    <div className="bg-[#F7F7F7] pb-16 pt-24 md:pt-28">
      <Container className="max-w-[76rem]">
        <header className="mb-6 md:mb-8">
          <h1 className="font-[family-name:var(--font-fp-display)] text-[2.75rem] leading-[0.9] tracking-wide text-[#111111] sm:text-5xl md:text-[3.5rem]">
            <span className="block">RANKING</span>
            <span className="block">RIVIERA OPEN</span>
          </h1>
          <p className="mt-3 font-[family-name:var(--font-fp-sans)] text-sm text-[#737373] md:text-[15px]">
            Ranking oficial del circuito
          </p>
          <p className="mt-1 font-[family-name:var(--font-fp-sans)] text-xs text-[#8A8A8A] md:text-sm">
            Resultados y participación actualizados automáticamente.
          </p>
        </header>

        <div className="mb-5">
          <GenderTabs
            selectedGender={selectedGender}
            onGenderChange={setSelectedGender}
          />
        </div>

        <div className="mb-5 border-b border-[#E8E8E8] pb-1">
          <LevelTabs
            selectedLevel={selectedLevel}
            onLevelChange={setSelectedLevel}
          />
        </div>

        <div className="mb-6">
          <label htmlFor="player-name-search" className="sr-only">
            {t("labels.searchByName")}
          </label>
          <div className="relative">
            <Search
              size={18}
              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#8A8A8A]"
              aria-hidden
            />
            <input
              id="player-name-search"
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t("labels.searchPlaceholder")}
              className="h-12 w-full rounded-xl border border-[#E5E5E5] bg-white pl-11 pr-11 font-[family-name:var(--font-fp-sans)] text-sm text-[#111111] placeholder:text-[#8A8A8A] transition-colors focus:border-[#111111] focus:outline-none"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-[#737373] transition-colors hover:text-[#111111]"
                aria-label={t("labels.clearSearch")}
              >
                <X size={18} />
              </button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="space-y-0 overflow-hidden rounded-xl border border-[#E8E8E8] bg-white">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 border-b border-[#ECECEC] px-4 py-5 last:border-b-0"
              >
                <div className="h-8 w-10 animate-pulse rounded bg-[#EFEFEF]" />
                <div className="h-14 w-14 animate-pulse rounded-full bg-[#EFEFEF]" />
                <div className="h-4 flex-1 animate-pulse rounded bg-[#EFEFEF]" />
                <div className="h-6 w-12 animate-pulse rounded bg-[#EFEFEF]" />
              </div>
            ))}
          </div>
        ) : (
          <>
            <div className="mb-3 flex items-end justify-between gap-3">
              <div>
                <h2 className="font-[family-name:var(--font-fp-sans)] text-sm font-semibold uppercase tracking-[0.12em] text-[#111111]">
                  {categoryLabel} · {genderLabel}
                </h2>
                <p className="mt-1 font-[family-name:var(--font-fp-sans)] text-xs text-[#737373]">
                  {searchQuery.trim()
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
              {filteredPlayers.length > 0 && (
                <p className="hidden font-[family-name:var(--font-fp-sans)] text-[10px] uppercase tracking-[0.16em] text-[#8A8A8A] sm:block">
                  {t("labels.rank")} · {t("labels.pts")}
                </p>
              )}
            </div>

            {filteredPlayers.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-[#E8E8E8] bg-white">
                {filteredPlayers.map((player) => (
                  <PlayerRankingCard key={player.id} player={player} />
                ))}
              </div>
            ) : players.length > 0 ? (
              <div className="rounded-xl border border-[#E8E8E8] bg-white px-6 py-16 text-center">
                <p className="font-[family-name:var(--font-fp-sans)] text-sm text-[#737373]">
                  {t("messages.noSearchResults")}
                </p>
              </div>
            ) : (
              <div className="rounded-xl border border-[#E8E8E8] bg-white px-6 py-16 text-center">
                <p className="font-[family-name:var(--font-fp-sans)] text-sm text-[#737373]">
                  {t("messages.noPlayers")}
                </p>
              </div>
            )}
          </>
        )}

        {/* Checkpoint: reglas originales sin rediseñar aún */}
        <RankingPointSystem />
      </Container>
    </div>
  );
}
