"use client";

import Link from "next/link";
import Image from "next/image";
import { RankingActions } from "@/components/rankings/RankingActions";
import { RankingPortrait } from "@/components/rankings/RankingPortrait";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { formatFeaturedRank } from "@/lib/featuredPlayersContrast";
import { getCategoryTranslationKey } from "@/lib/categoryUtils";
import { buildPlayerProfilePath } from "@/lib/playerProfileRoutes";
import {
  instagramHref,
  isClassicPodium,
  officialPortraitSrc,
  playerDisplayName,
  ranksSharingPosition,
} from "@/lib/rankingPresentation";
import type { Player } from "@/lib/types";

interface RankingTopThreeProps {
  players: Player[];
  roster: Player[];
  genderLabel: string;
  onShare: (player: Player) => void;
}

export function RankingTopThree({
  players,
  roster,
  genderLabel,
  onShare,
}: RankingTopThreeProps) {
  const { t, formatNumber } = useTranslation("rankings");
  if (!players.length) return null;

  const classic = isClassicPodium(players);
  const ordered = players;

  return (
    <section
      aria-label={t("page.top")}
      className={`ranking-rise mb-8 md:mb-10 ${
        players.length === 1 ? "mx-auto max-w-md" : ""
      } ${players.length === 2 ? "mx-auto max-w-3xl" : ""}`}
    >
      <div
        className={
          classic
            ? "grid grid-cols-2 items-end gap-3 md:grid-cols-[0.92fr_1.16fr_0.92fr] md:gap-5"
            : "grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {ordered.map((player) => {
          const lead = player.rank === 1;
          const name = playerDisplayName(player);
          const profileHref = player.id
            ? buildPlayerProfilePath(player.id, player.rivieraId)
            : null;
          const categoryLabel = t(getCategoryTranslationKey(player.category));
          const tied = ranksSharingPosition(roster, player.rank);
          const placement =
            classic && player.rank === 1
              ? "col-span-2 md:col-span-1 md:col-start-2 md:row-start-1"
              : classic && player.rank === 2
                ? "md:col-start-1 md:row-start-1"
                : classic && player.rank === 3
                  ? "md:col-start-3 md:row-start-1"
                  : lead && players.length > 2
                    ? "sm:col-span-2 lg:col-span-1"
                    : "";

          return (
            <article
              key={player.id}
              className={`relative overflow-hidden rounded-2xl border ${placement} ${
                lead
                  ? "border-[#101010] bg-[#101010] text-white"
                  : "border-[#E7E7E7] bg-white text-[#101010]"
              }`}
            >
              {profileHref && (
                <Link
                  href={profileHref}
                  aria-label={`${formatFeaturedRank(player.rank)}. ${name}`}
                  className="absolute inset-0 z-10"
                />
              )}
              <RankingPortrait
                src={officialPortraitSrc(player.photo)}
                name={name}
                priority={lead}
                sizes="(max-width: 768px) 90vw, 360px"
                initialsClassName={lead ? "text-6xl" : "text-5xl"}
                className="aspect-[3/4] w-full"
              />
              <div className="pointer-events-none relative px-4 pb-4 pt-3 md:px-5 md:pb-5">
                <div className="flex items-end justify-between gap-3">
                  <p className="font-[family-name:var(--font-fp-display)] text-6xl leading-none tabular-nums md:text-7xl">
                    {formatFeaturedRank(player.rank)}
                  </p>
                  {lead && (
                    <Image
                      src="/img/logo-badge.png"
                      alt=""
                      width={36}
                      height={36}
                      className="mb-1 h-8 w-8 opacity-80"
                    />
                  )}
                </div>
                <h2 className="mt-2 line-clamp-2 break-words font-[family-name:var(--font-fp-sans)] text-lg font-semibold leading-tight md:text-xl">
                  {name}
                </h2>
                <p
                  className={`mt-1 font-[family-name:var(--font-fp-sans)] text-[10px] uppercase tracking-[0.16em] ${
                    lead ? "text-[#A3A3A3]" : "text-[#737373]"
                  }`}
                >
                  {categoryLabel} · {genderLabel}
                  {tied ? ` · ${t("page.tie")}` : ""}
                </p>
                <div className="mt-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="font-[family-name:var(--font-fp-display)] text-4xl leading-none tabular-nums md:text-5xl">
                      {formatNumber(player.points)}
                    </p>
                    <p
                      className={`mt-1 font-[family-name:var(--font-fp-sans)] text-[10px] uppercase tracking-[0.16em] ${
                        lead ? "text-[#A3A3A3]" : "text-[#737373]"
                      }`}
                    >
                      {t("labels.pts")}
                    </p>
                  </div>
                  <div className="pointer-events-auto relative z-20">
                  <RankingActions
                    profileHref={profileHref}
                    instagramHref={instagramHref(player.socials.instagram)}
                    onShare={() => onShare(player)}
                    tone={lead ? "dark" : "light"}
                  />
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
