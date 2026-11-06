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
            ? "mx-auto grid w-full max-w-5xl grid-cols-[1fr_1.15fr_1fr] items-end gap-2 md:gap-4"
            : "mx-auto grid w-full max-w-5xl grid-cols-2 gap-2 lg:grid-cols-3 lg:gap-4"
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
              ? "col-start-2 row-start-1"
              : classic && player.rank === 2
                ? "col-start-1 row-start-1"
                : classic && player.rank === 3
                  ? "col-start-3 row-start-1"
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
                className={`w-full ${
                  lead
                    ? "h-[clamp(168px,30vh,320px)]"
                    : "h-[clamp(148px,26vh,270px)]"
                }`}
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-2 pb-2 pt-10 text-white sm:px-3 sm:pb-3 sm:pt-14">
                <div className="flex items-end justify-between gap-2">
                  <p className="font-[family-name:var(--font-fp-display)] text-4xl leading-none tabular-nums sm:text-5xl md:text-6xl">
                    {formatFeaturedRank(player.rank)}
                  </p>
                  {lead && (
                    <Image
                      src="/img/logo-badge.png"
                      alt=""
                      width={28}
                      height={28}
                      className="mb-1 h-5 w-5 opacity-80 sm:h-7 sm:w-7"
                    />
                  )}
                </div>
                <h2 className="mt-1 line-clamp-2 break-words font-[family-name:var(--font-fp-sans)] text-sm font-semibold leading-tight sm:text-base md:text-lg">
                  {name}
                </h2>
                <p className="mt-0.5 font-[family-name:var(--font-fp-sans)] text-[9px] uppercase tracking-[0.14em] text-white/70 sm:text-[10px]">
                  {categoryLabel} · {genderLabel}
                  {tied ? ` · ${t("page.tie")}` : ""}
                </p>
                <div className="mt-2 flex items-end justify-between gap-1">
                  <div>
                    <p className="font-[family-name:var(--font-fp-display)] text-2xl leading-none tabular-nums sm:text-3xl md:text-4xl">
                      {formatNumber(player.points)}
                    </p>
                    <p className="mt-0.5 font-[family-name:var(--font-fp-sans)] text-[9px] uppercase tracking-[0.14em] text-white/70 sm:text-[10px]">
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
