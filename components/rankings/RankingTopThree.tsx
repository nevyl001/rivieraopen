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
      <div
        className={
          classic
            ? "mx-auto grid w-full max-w-5xl grid-cols-2 items-end gap-2 md:flex md:justify-center md:gap-4"
            : "mx-auto flex w-full max-w-5xl flex-wrap items-end justify-center gap-2 md:gap-4"
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
          const frame = classic
            ? lead
              ? "col-span-2 w-full md:w-[min(32%,260px)]"
              : "w-full md:w-[min(28%,220px)]"
            : count === 1
              ? "w-[min(72vw,280px)]"
              : count === 2
                ? "w-[min(44vw,250px)]"
                : lead
                  ? "w-full md:w-[min(32%,260px)]"
                  : "w-[min(46%,220px)]";
          const placement = classic
            ? player.rank === 1
              ? "md:order-2"
              : player.rank === 2
                ? "md:order-1"
                : "md:order-3"
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
                sizes={
                  lead
                    ? "(max-width: 768px) 92vw, 260px"
                    : "(max-width: 768px) 46vw, 220px"
                }
                initialsClassName={lead ? "text-6xl" : "text-5xl"}
                className="aspect-square w-full"
              />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/35 to-transparent px-3 pb-3 pt-10 text-white md:px-3 md:pb-3 md:pt-14">
                <div className="flex items-end justify-between gap-2">
                  <p
                    className={`font-[family-name:var(--font-fp-display)] leading-none tabular-nums md:text-6xl ${
                      lead ? "text-5xl" : "text-4xl"
                    }`}
                  >
                    {formatFeaturedRank(player.rank)}
                  </p>
                  {lead && (
                    <Image
                      src="/img/logo-badge.png"
                      alt=""
                      width={28}
                      height={28}
                      className="mb-1 h-6 w-6 opacity-80 md:h-7 md:w-7"
                    />
                  )}
                </div>
                <h2
                  className={`mt-1 line-clamp-2 break-words font-[family-name:var(--font-fp-sans)] font-semibold leading-tight md:text-lg ${
                    lead ? "text-lg" : "text-sm"
                  }`}
                >
                  {name}
                </h2>
                <p className="mt-0.5 font-[family-name:var(--font-fp-sans)] text-[10px] uppercase tracking-[0.14em] text-white/70">
                  {categoryLabel} · {genderLabel}
                  {tied ? ` · ${t("page.tie")}` : ""}
                </p>
                <div className="mt-2 flex items-end justify-between gap-1">
                  <div>
                    <p
                      className={`font-[family-name:var(--font-fp-display)] leading-none tabular-nums md:text-4xl ${
                        lead ? "text-3xl" : "text-2xl"
                      }`}
                    >
                      {formatNumber(player.points)}
                    </p>
                    <p className="mt-0.5 font-[family-name:var(--font-fp-sans)] text-[10px] uppercase tracking-[0.14em] text-white/70">
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
