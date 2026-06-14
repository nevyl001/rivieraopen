"use client";

import { useEffect, useState } from "react";
import { Container } from "@/components/ui";
import { LevelTabs } from "@/components/rankings/LevelTabs";
import { GenderTabs } from "@/components/rankings/GenderTabs";
import { PlayerRankingCard } from "@/components/rankings/PlayerRankingCard";
import { RankingPointSystem } from "@/components/rankings/RankingPointSystem";
import { Category, Gender, Player } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { getCategoryTranslationKey } from "@/lib/categoryUtils";

export function RankingsPageClient() {
  const { t } = useTranslation("rankings");
  const [selectedGender, setSelectedGender] = useState<Gender>("Male");
  const [selectedLevel, setSelectedLevel] = useState<Category>("Open");
  const [players, setPlayers] = useState<Player[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
    <div className="pt-32 pb-16 bg-gray-50">
      <Container>
        <div className="text-center mb-10">
          <h1 className="font-heading text-5xl font-bold text-primary mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        {/* Gender first */}
        <div className="mb-6">
          <GenderTabs
            selectedGender={selectedGender}
            onGenderChange={setSelectedGender}
          />
        </div>

        {/* Then category */}
        <div className="mb-10">
          <LevelTabs
            selectedLevel={selectedLevel}
            onLevelChange={setSelectedLevel}
          />
        </div>

        {isLoading ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent mb-4" />
            <p className="text-text-secondary text-lg">Cargando...</p>
          </div>
        ) : (
          <>
            <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h2 className="font-heading text-2xl md:text-3xl font-semibold text-primary">
                  {genderLabel} · {categoryLabel}
                </h2>
                <p className="text-text-secondary mt-1">
                  {t("labels.showing")} {players.length}{" "}
                  {players.length === 1
                    ? t("labels.player")
                    : t("labels.players")}
                </p>
              </div>
              {players.length > 0 && (
                <p className="text-xs uppercase tracking-widest text-text-secondary">
                  {t("labels.rank")} · {t("labels.pts")}
                </p>
              )}
            </div>

            {players.length > 0 ? (
              <div className="space-y-3">
                {players.map((player) => (
                  <PlayerRankingCard key={player.id} player={player} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                <p className="text-text-secondary text-lg">
                  {t("messages.noPlayers")}
                </p>
              </div>
            )}
          </>
        )}

        <RankingPointSystem />
      </Container>
    </div>
  );
}
