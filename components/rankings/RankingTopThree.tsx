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

  const count = players.length;

  return (
    <section aria-label={t("page.top")} className="ranking-rise mb-8 md:mb-10">
      <div className="mx-auto flex w-full max-w-5xl flex-wrap items-end justify-center gap-2 md:gap-4">
        {ordered.map((player) => {
          const lead = player.rank === 1;
          const name = playerDisplayName(player);
          const profileHref = player.id
            ? buildPlayerProfilePath(player.id, player.rivieraId)
            : null;
          const categoryLabel = t(getCategoryTranslationKey(player.category));
          const tied = ranksSharingPosition(roster, player.rank);
          const frame =
            count === 1
              ? "w-[min(72vw,280px)]"
              : count === 2
                ? "w-[min(44vw,250px)]"
                : lead
                  ? "w-[min(32%,260px)]"
                  : "w-[min(28%,220px)]";
          const placement = classic
            ? player.rank === 1
              ? "order-2"
              : player.rank === 2
                ? "order-1"
                : "order-3"
            : "";

          return (
            <article
              key={player.id}
              className={`relative overflow-hidden rounded-2xl border ${frame} ${placement} ${
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
                fit="contain"
                sizes="(max-width: 768px) 34vw, 260px"
                initialsClassName={lead ? "text-6xl" : "text-5xl"}
                className="aspect-square w-full"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-1.5 pb-1.5 pt-5 text-white sm:px-3 sm:pb-3 sm:pt-14">
                <div className="flex items-end justify-between gap-1">
                  <p className="font-[family-name:var(--font-fp-display)] text-xl leading-none tabular-nums sm:text-5xl md:text-6xl">
                    {formatFeaturedRank(player.rank)}
                  </p>
                  {lead && (
                    <Image
                      src="/img/logo-badge.png"
                      alt=""
                      width={28}
                      height={28}
                      className="mb-0.5 h-3.5 w-3.5 opacity-80 sm:mb-1 sm:h-7 sm:w-7"
                    />
                  )}
                </div>
                <h2 className="mt-0.5 line-clamp-2 break-words font-[family-name:var(--font-fp-sans)] text-[11px] font-semibold leading-tight sm:mt-1 sm:text-base md:text-lg">
                  {name}
                </h2>
                <p className="mt-0.5 hidden font-[family-name:var(--font-fp-sans)] text-[10px] uppercase tracking-[0.14em] text-white/70 sm:block">
                  {categoryLabel} · {genderLabel}
                  {tied ? ` · ${t("page.tie")}` : ""}
                </p>
                <div className="mt-1 flex items-end justify-between gap-1 sm:mt-2">
                  <div>
                    <p className="font-[family-name:var(--font-fp-display)] text-lg leading-none tabular-nums sm:text-3xl md:text-4xl">
                      {formatNumber(player.points)}
                    </p>
                    <p className="mt-0.5 font-[family-name:var(--font-fp-sans)] text-[8px] uppercase tracking-[0.14em] text-white/70 sm:text-[10px]">
                      {t("labels.pts")}
                    </p>
                  </div>
                  <div className="pointer-events-auto relative z-20">
                    <RankingActions
                      profileHref={profileHref}
                      instagramHref={instagramHref(player.socials.instagram)}
                      onShare={() => onShare(player)}
                      tone="photo"
                      showProfile={false}
                      compact
                      density="row"
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
