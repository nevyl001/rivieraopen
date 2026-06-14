"use client";

import Image from "next/image";
import { countryCodeToFlag } from "@/components/ui/CountryFlag";
import { PlayerProfileDetail } from "@/lib/types";
import { Flame } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { getCategoryTranslationKey } from "@/lib/categoryUtils";
import { PlayerSocialIcons } from "@/components/rankings/PlayerSocialIcons";

interface PlayerProfileProps {
  player: PlayerProfileDetail;
}

function formatLabel(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function PlayerPhotoFrame({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="relative min-h-[300px] h-full w-full overflow-hidden rounded-xl bg-[#1a1a1a] ring-1 ring-[#222] sm:min-h-0">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover object-top"
        sizes="(max-width: 640px) 220px, 224px"
      />
    </div>
  );
}

export function PlayerProfile({ player }: PlayerProfileProps) {
  const { t } = useTranslation("rankings");
  const { formatNumber } = useTranslation();

  const fuerzaLabel = t(getCategoryTranslationKey(player.category));
  const playerName = `${player.firstName} ${player.lastName}`.trim();

  const stats = [
    {
      label: t("labels.currentRank"),
      value: `#${player.rank || "—"}`,
    },
    {
      label: t("labels.totalPoints"),
      value: formatNumber(player.points),
    },
    {
      label: t("profile.wins"),
      value: String(player.stats.victorias),
    },
    {
      label: t("profile.winRate"),
      value: `${player.stats.pctVictorias}%`,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between px-0.5">
        <span className="text-[10px] uppercase tracking-[0.18em] text-[#555]">
          Riviera Open
        </span>
        <span className="text-[10px] uppercase tracking-[0.18em] text-[#555]">
          {t("profile.officialPlayer")}
        </span>
      </div>

      <div className="flex flex-col gap-5 sm:flex-row sm:items-stretch sm:gap-6">
        <div className="mx-auto w-full max-w-[220px] shrink-0 sm:mx-0 sm:w-44 md:w-52">
          <PlayerPhotoFrame
            src={player.photo}
            alt={playerName}
            priority
          />
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <div>
            <h1 className="text-[32px] font-medium leading-tight text-white">
              {playerName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[#444] px-3 py-1 text-xs text-[#aaa]">
                {fuerzaLabel}
              </span>
              <span className="rounded-full border border-[#444] px-3 py-1 text-xs text-[#aaa]">
                {player.gender === "Female"
                  ? t("genders.femenil")
                  : t("genders.varonil")}
              </span>
            </div>
          </div>

          <div className="overflow-hidden rounded-[10px] bg-[#111]">
            <div className="grid grid-cols-2">
              {stats.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`px-4 py-4 ${
                    index % 2 === 0 ? "border-r border-[#222]" : ""
                  } ${index < 2 ? "border-b border-[#222]" : ""}`}
                >
                  <p className="mb-2 text-[10px] uppercase tracking-wide text-[#555]">
                    {stat.label}
                  </p>
                  <p className="text-[26px] font-medium tabular-nums leading-none text-white">
                    {stat.value}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            {player.stats.rachaActual ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-[#1a1a1a] px-3 py-2 text-xs text-[#aaa]">
                <Flame size={13} className="shrink-0 text-[#aaa]" />
                <span>{player.stats.rachaActual}</span>
              </span>
            ) : (
              <span />
            )}
            <PlayerSocialIcons
              socials={player.socials}
              size="sm"
              tone="poster"
              className="gap-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export function PlayerPersonalInfo({ player }: PlayerProfileProps) {
  const { t } = useTranslation("rankings");

  const hasCountry = Boolean(player.paisCodigo?.trim());

  const personalItems = [
    player.age && {
      key: "age",
      label: t("profile.age"),
      content: (
        <p className="font-medium text-white">
          {player.age} {t("profile.years")}
        </p>
      ),
    },
    player.manoDominante && {
      key: "hand",
      label: t("profile.dominantHand"),
      content: (
        <p className="font-medium text-white">
          {formatLabel(player.manoDominante)}
        </p>
      ),
    },
    player.enCancha && {
      key: "position",
      label: t("profile.courtPosition"),
      content: (
        <p className="font-medium text-white">
          {formatLabel(player.enCancha)}
        </p>
      ),
    },
    hasCountry && {
      key: "country",
      label: t("profile.country"),
      content: (
        <span className="text-3xl leading-none" aria-hidden>
          {countryCodeToFlag(player.paisCodigo!)}
        </span>
      ),
    },
  ].filter(Boolean) as Array<{
    key: string;
    label: string;
    content: React.ReactNode;
  }>;

  if (personalItems.length === 0) return null;

  return (
    <div className="border-t border-[#222] pt-6 lg:border-t-0 lg:pt-0">
      <h2 className="mb-4 text-[10px] uppercase tracking-[0.18em] text-[#555]">
        {t("profile.personalInfo")}
      </h2>
      <div className="grid grid-cols-2 gap-x-4 gap-y-5">
        {personalItems.map((item) => (
          <div key={item.key}>
            <p className="mb-1.5 text-[10px] uppercase tracking-wide text-[#555]">
              {item.label}
            </p>
            {item.content}
          </div>
        ))}
      </div>
    </div>
  );
}
