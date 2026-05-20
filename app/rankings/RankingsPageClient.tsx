"use client";

import { useState } from "react";
import { Container } from "@/components/ui";
import { LevelTabs } from "@/components/rankings/LevelTabs";
import { PlayerRankingCard } from "@/components/rankings/PlayerRankingCard";
import { Category, Player } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface RankingsPageClientProps {
  initialPlayersByCategory: Record<Category, Player[]>;
}

export function RankingsPageClient({
  initialPlayersByCategory,
}: RankingsPageClientProps) {
  const { t } = useTranslation("rankings");
  const [selectedLevel, setSelectedLevel] = useState<Category>("Open");

  const levelPlayers = initialPlayersByCategory[selectedLevel] || [];

  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <Container>
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl font-bold text-black mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        {/* Level Tabs */}
        <div className="mb-8">
          <LevelTabs
            selectedLevel={selectedLevel}
            onLevelChange={setSelectedLevel}
          />
        </div>

        {/* Level Info */}
        <div className="mb-6">
          <h2 className="font-heading text-2xl font-semibold text-black mb-2">
            {selectedLevel === "Open"
              ? t("levels.openLevel")
              : `${t("levels.level")} ${selectedLevel}`}
          </h2>
          <p className="text-gray-600">
            {t("labels.showing")} {levelPlayers.length}{" "}
            {levelPlayers.length === 1
              ? t("labels.player")
              : t("labels.players")}{" "}
            {t("labels.inThisLevel")}
          </p>
        </div>

        {/* Players List */}
        {levelPlayers.length > 0 ? (
          <div className="space-y-4">
            {levelPlayers.map((player) => (
              <PlayerRankingCard key={player.id} player={player} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">{t("messages.noPlayers")}</p>
          </div>
        )}

        {/* Ranking System Info */}
        <div className="mt-12 p-6 bg-gray-100">
          <h3 className="font-heading text-xl font-semibold text-black mb-4">
            {t("labels.howRankingsWork")}
          </h3>
          <div className="space-y-2 text-gray-600">
            <p>{t("pointSystem.description")}</p>
            <p className="font-medium text-black mt-4">
              {t("labels.pointSystem")}:
            </p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>{t("pointSystem.firstPlace")}</li>
              <li>{t("pointSystem.secondPlace")}</li>
              <li>{t("pointSystem.semiFinals")}</li>
              <li>{t("pointSystem.quarterFinals")}</li>
              <li>{t("pointSystem.participation")}</li>
            </ul>
            <p className="mt-4">{t("pointSystem.updateInfo")}</p>
          </div>
        </div>
      </Container>
    </div>
  );
}
