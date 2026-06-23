"use client";

import { PlayerProfileDetail } from "@/lib/types";
import { PlayerSeasonChart } from "@/components/players/PlayerSeasonChart";
import { RatingNivel } from "@/components/players/RatingNivel";

interface PlayerSeasonRatingRowProps {
  player: PlayerProfileDetail;
}

export function PlayerSeasonRatingRow({ player }: PlayerSeasonRatingRowProps) {
  return (
    <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-2 lg:gap-6">
      <PlayerSeasonChart
        timeline={player.seasonTimeline ?? { season: 2026, points: [] }}
      />
      <RatingNivel
        rating={player.rating}
        fiabilidad={player.ratingFiabilidad}
        partidosJugados={player.ratingPartidos}
        historial={player.ratingHistorial ?? []}
        className="h-full"
      />
    </div>
  );
}
