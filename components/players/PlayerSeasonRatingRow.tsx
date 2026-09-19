"use client";

import { PlayerProfileDetail } from "@/lib/types";
import { PlayerSeasonChart } from "@/components/players/PlayerSeasonChart";
import { RatingNivel } from "@/components/players/RatingNivel";

interface PlayerSeasonRatingRowProps {
  player: PlayerProfileDetail;
}

export function PlayerSeasonRatingRow({ player }: PlayerSeasonRatingRowProps) {
  return (
    <div className="rounded-[10px] border border-white/[0.07] bg-[#131313] shadow-[0_1px_0_rgba(255,255,255,0.04)] lg:grid lg:grid-cols-2 lg:divide-x lg:divide-white/[0.06]">
      <PlayerSeasonChart
        timeline={player.seasonTimeline ?? { season: 2026, points: [] }}
        className="rounded-none border-0"
      />
      <RatingNivel
        rating={player.rating}
        fiabilidad={player.ratingFiabilidad}
        partidosJugados={player.ratingPartidos}
        historial={player.ratingHistorial ?? []}
        className="h-full rounded-none border-0 lg:border-l lg:border-white/[0.06]"
      />
    </div>
  );
}
