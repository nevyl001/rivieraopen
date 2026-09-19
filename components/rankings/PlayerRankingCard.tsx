"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Player } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { PlayerSocialIcons } from "@/components/rankings/PlayerSocialIcons";
import { buildPlayerProfilePath } from "@/lib/playerProfileRoutes";
import { formatFeaturedRank } from "@/lib/featuredPlayersContrast";
import { getCategoryTranslationKey } from "@/lib/categoryUtils";

interface PlayerRankingCardProps {
  player: Player;
}

export function PlayerRankingCard({ player }: PlayerRankingCardProps) {
  const { t } = useTranslation("rankings");
  const router = useRouter();
  const profileHref = buildPlayerProfilePath(player.id, player.rivieraId);
  const name = [player.firstName, player.lastName].filter(Boolean).join(" ");
  const isTopThree = player.rank <= 3;
  const categoryLabel = t(getCategoryTranslationKey(player.category));

  const handleCardClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest("a[data-social-link]")) {
      return;
    }
    router.push(profileHref);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      router.push(profileHref);
    }
  };

  return (
    <article
      role="link"
      tabIndex={0}
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
      aria-label={`${formatFeaturedRank(player.rank)}. ${name}, ${player.points} ${t("labels.pts")}`}
      className="group flex cursor-pointer items-center gap-3 border-b border-[#ECECEC] px-3 py-4 transition-[background-color,transform] duration-200 ease-out hover:bg-[#FAFAFA] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[#111] motion-reduce:transition-none md:gap-5 md:px-5 md:py-5 md:hover:translate-x-0.5"
    >
      <span
        className={`w-10 shrink-0 font-[family-name:var(--font-fp-display)] leading-none tracking-tight tabular-nums md:w-14 ${
          isTopThree
            ? "text-[1.75rem] text-[#111111] md:text-[2.5rem]"
            : "text-[1.5rem] text-[#3A3A3A] md:text-[2rem]"
        }`}
      >
        {formatFeaturedRank(player.rank)}
      </span>

      <div
        className={`relative shrink-0 overflow-hidden rounded-full bg-[#E8E8E8] ${
          player.rank === 1
            ? "h-14 w-14 md:h-16 md:w-16"
            :           isTopThree
              ? "h-[3.25rem] w-[3.25rem] md:h-14 md:w-14"
              : "h-[3.25rem] w-[3.25rem] md:h-14 md:w-14"
        }`}
      >
        <Image
          src={player.photo}
          alt=""
          fill
          unoptimized
          className="object-cover object-center"
          sizes="(max-width: 768px) 56px, 64px"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start gap-2">
          <h3
            className={`min-w-0 flex-1 break-normal font-[family-name:var(--font-fp-sans)] font-semibold uppercase leading-snug text-[#111111] ${
              isTopThree
                ? "text-[0.95rem] md:text-lg"
                : "text-sm md:text-base"
            }`}
          >
            {name}
          </h3>
          <PlayerSocialIcons
            socials={player.socials}
            size="sm"
            className="mt-0.5 shrink-0 opacity-60 transition-opacity group-hover:opacity-100"
          />
        </div>
        <p className="mt-1 font-[family-name:var(--font-fp-sans)] text-[11px] uppercase tracking-[0.14em] text-[#737373]">
          {categoryLabel}
        </p>
      </div>

      <div className="shrink-0 text-right">
        <p
          className={`font-[family-name:var(--font-fp-display)] leading-none tabular-nums text-[#111111] ${
            isTopThree ? "text-2xl md:text-3xl" : "text-xl md:text-2xl"
          }`}
        >
          {player.points.toLocaleString()}
        </p>
        <p className="mt-1 font-[family-name:var(--font-fp-sans)] text-[10px] uppercase tracking-[0.16em] text-[#8A8A8A]">
          {t("labels.pts")}
        </p>
      </div>
    </article>
  );
}
