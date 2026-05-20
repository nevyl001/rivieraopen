"use client";

import Link from "next/link";
import Image from "next/image";
import { Card } from "@/components/ui";
import { Player } from "@/lib/types";
import { Instagram, Facebook, Trophy } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface PlayerRankingCardProps {
  player: Player;
}

export function PlayerRankingCard({ player }: PlayerRankingCardProps) {
  const { t } = useTranslation("rankings");
  const { t: tCommon } = useTranslation("common");

  const handleCardClick = (e: React.MouseEvent) => {
    // Only navigate if clicking on the card itself, not on social links
    if ((e.target as HTMLElement).closest("a[data-social-link]")) {
      return;
    }
    window.location.href = `/players/${player.id}`;
  };

  return (
    <Card
      hover
      className="flex items-center gap-3 md:gap-4 cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Rank Badge */}
      <div className="bg-accent text-white w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center shrink-0">
        <div className="text-lg md:text-2xl font-bold">#{player.rank}</div>
      </div>

      {/* Player Photo */}
      <div className="relative w-14 h-14 md:w-20 md:h-20 rounded-full overflow-hidden shrink-0">
        <Image
          src={player.photo}
          alt={`${player.firstName} ${player.lastName}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 56px, 80px"
        />
      </div>

      {/* Player Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-heading text-lg md:text-xl font-semibold text-primary mb-1 truncate">
          {player.firstName} {player.lastName}
        </h3>
        <div className="flex items-center gap-2 md:gap-4 text-xs md:text-sm text-text-secondary flex-wrap">
          <span className="flex items-center gap-1">
            <Trophy size={14} className="text-accent" />
            {player.points.toLocaleString()} {t("labels.pts")}
          </span>
          <span>
            {tCommon("labels.level")} {player.category}
          </span>
        </div>
      </div>

      {/* Quick Contact Icons */}
      <div className="hidden lg:flex items-center gap-2 shrink-0">
        {player.socials.instagram && (
          <a
            href={player.socials.instagram}
            target="_blank"
            rel="noopener noreferrer"
            data-social-link
            className="p-2 hover:bg-accent/10 rounded-full transition-colors"
            aria-label={tCommon("aria.instagram")}
          >
            <Instagram
              size={18}
              className="text-text-secondary hover:text-accent"
            />
          </a>
        )}
        {player.socials.facebook && (
          <a
            href={player.socials.facebook}
            target="_blank"
            rel="noopener noreferrer"
            data-social-link
            className="p-2 hover:bg-accent/10 rounded-full transition-colors"
            aria-label={tCommon("aria.facebook")}
          >
            <Facebook
              size={18}
              className="text-text-secondary hover:text-accent"
            />
          </a>
        )}
      </div>
    </Card>
  );
}
