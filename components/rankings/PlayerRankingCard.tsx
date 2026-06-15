"use client";

import Image from "next/image";
import { Player } from "@/lib/types";
import { Trophy } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { PlayerSocialIcons } from "@/components/rankings/PlayerSocialIcons";

interface PlayerRankingCardProps {
  player: Player;
}

export function PlayerRankingCard({ player }: PlayerRankingCardProps) {
  const { t } = useTranslation("rankings");

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a[data-social-link]")) {
      return;
    }
    window.location.href = `/players/${player.id}`;
  };

  const isTopThree = player.rank <= 3;

  return (
    <article
      onClick={handleCardClick}
      className="group relative flex items-center gap-4 md:gap-5 bg-white rounded-2xl border border-gray-100 px-4 py-4 md:px-6 md:py-5 cursor-pointer transition-all duration-300 hover:border-accent/25 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
    >
      {/* Rank */}
      <div
        className={`shrink-0 w-11 h-11 md:w-14 md:h-14 rounded-full flex items-center justify-center font-bold text-sm md:text-lg transition-colors ${
          isTopThree
            ? "bg-primary text-white"
            : "bg-gray-50 text-primary group-hover:bg-primary group-hover:text-white"
        }`}
      >
        {player.rank}
      </div>

      {/* Photo */}
      <div className="relative w-12 h-12 md:w-16 md:h-16 rounded-full overflow-hidden shrink-0 ring-2 ring-gray-100 group-hover:ring-accent/20 transition-all">
        <Image
          src={player.photo}
          alt={`${player.firstName} ${player.lastName}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 48px, 64px"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <h3 className="font-heading text-base md:text-xl font-semibold text-primary truncate group-hover:text-accent transition-colors min-w-0 flex-1">
            {player.firstName} {player.lastName}
          </h3>
          <PlayerSocialIcons
            socials={player.socials}
            size="sm"
            className="shrink-0"
          />
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 text-xs md:text-sm text-text-secondary md:hidden">
          <Trophy size={12} className="text-accent shrink-0" />
          <span>
            {player.points.toLocaleString()} {t("labels.pts")}
          </span>
        </div>
      </div>

      {/* Points — desktop */}
      <div className="hidden md:flex flex-col items-end shrink-0 min-w-[5rem]">
        <span className="font-heading text-2xl font-bold text-primary leading-none">
          {player.points.toLocaleString()}
        </span>
        <span className="text-xs text-text-secondary mt-1 uppercase tracking-wide">
          {t("labels.pts")}
        </span>
      </div>
    </article>
  );
}
