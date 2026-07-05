"use client";

import { countryCodeToFlag } from "@/components/ui/CountryFlag";
import { PlayerProfileDetail } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { getCategoryTranslationKey } from "@/lib/categoryUtils";
import { PlayerSocialIcons, playerHasSocials } from "@/components/rankings/PlayerSocialIcons";
import { ShareProfileButton } from "@/components/players/ShareProfileButton";

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
    <div className="size-[280px] shrink-0 overflow-hidden rounded-2xl bg-[#111] ring-1 ring-[#2a2a2a] sm:size-[300px] lg:size-[320px]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        decoding="async"
        className="block h-full w-full object-cover object-[50%_22%]"
      />
    </div>
  );
}

function StatusBadge({
  status,
  label,
}: {
  status: "LOCAL" | "OFICIAL_RIVIERA";
  label: string;
}) {
  const isOfficial = status === "OFICIAL_RIVIERA";
  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-xs font-medium tracking-wide ${
        isOfficial
          ? "border border-[#1D9E75]/30 bg-[#0d2e20] text-[#1D9E75]"
          : "border border-[#444] bg-[#151515] text-[#aaa]"
      }`}
    >
      {label}
    </span>
  );
}

function HeaderStatGrid({
  stats,
}: {
  stats: Array<{ label: string; value: string }>;
}) {
  return (
    <>
      <div className="grid grid-cols-1 gap-2 lg:hidden">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-[10px] border border-[#222] bg-[#111] px-4 py-3"
          >
            <p className="mb-1.5 text-[10px] uppercase tracking-wide text-[#555]">
              {stat.label}
            </p>
            <p className="text-2xl font-medium tabular-nums leading-none text-white">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-[10px] bg-[#111] lg:block">
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
    </>
  );
}

export function PlayerProfile({ player }: PlayerProfileProps) {
  const { t } = useTranslation("rankings");
  const { formatNumber, formatShortDate } = useTranslation();

  const fuerzaLabel = t(getCategoryTranslationKey(player.category));
  const playerName = `${player.firstName} ${player.lastName}`.trim();
  const passport = player.passport;
  const statusLabel =
    passport?.status === "OFICIAL_RIVIERA"
      ? t("passport.statusOfficial")
      : t("passport.statusLocal");

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

  const registrationBlock =
    passport?.rivieraId ||
    passport?.registrationClubName ||
    passport?.debutDate ||
    passport?.debutSeason ? (
      <div className="grid grid-cols-1 gap-3 rounded-[10px] border border-[#1f1f1f] bg-[#111] px-4 py-3 text-left lg:grid-cols-2 lg:gap-2">
        {passport.rivieraId && (
          <div className="lg:col-span-2">
            <p className="text-[10px] uppercase tracking-wide text-[#555]">
              {t("passport.rivieraId")}
            </p>
            <p className="mt-1 break-all font-mono text-base tracking-[0.16em] text-[#1D9E75] sm:text-lg">
              {passport.rivieraId}
            </p>
          </div>
        )}
        {passport.registrationClubName && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#555]">
              {t("passport.registrationClub")}
            </p>
            <p className="mt-1 break-words text-sm text-white">
              {passport.registrationClubName}
            </p>
          </div>
        )}
        {passport.debutDate && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#555]">
              {t("passport.debutRiviera")}
            </p>
            <p className="mt-1 text-sm text-white">
              {formatShortDate(passport.debutDate)}
            </p>
          </div>
        )}
        {passport.debutSeason && (
          <div>
            <p className="text-[10px] uppercase tracking-wide text-[#555]">
              {t("passport.debutSeason")}
            </p>
            <p className="mt-1 text-sm text-white">{passport.debutSeason}</p>
          </div>
        )}
      </div>
    ) : null;

  return (
    <div className="space-y-3 lg:space-y-4">
      <div className="hidden items-center justify-between px-0.5 lg:flex">
        <span className="text-[10px] uppercase tracking-[0.18em] text-[#555]">
          Riviera Player Passport
        </span>
        {passport?.status && (
          <StatusBadge status={passport.status} label={statusLabel} />
        )}
      </div>

      <div className="flex flex-col items-center text-center lg:flex-row lg:items-center lg:gap-8 lg:text-left">
        <div className="flex shrink-0 flex-col items-center">
          <p className="mb-3 text-[10px] uppercase tracking-[0.16em] text-[#555] lg:hidden">
            Riviera Player Passport
          </p>

          <PlayerPhotoFrame src={player.photo} alt={playerName} priority />
        </div>

        <div className="flex w-full min-w-0 flex-1 flex-col gap-3 lg:gap-4">
          <div className="w-full">
            <h1 className="break-words text-[26px] font-medium leading-snug text-white sm:text-[30px] lg:text-[32px] lg:leading-tight">
              {playerName}
            </h1>
            <div className="mt-3 flex flex-wrap items-center justify-center gap-2 lg:justify-start">
              <span className="rounded-full border border-[#444] px-3 py-1 text-xs text-[#aaa]">
                {fuerzaLabel}
              </span>
              <span className="rounded-full border border-[#444] px-3 py-1 text-xs text-[#aaa]">
                {player.gender === "Female"
                  ? t("genders.femenil")
                  : t("genders.varonil")}
              </span>
            </div>
            {passport?.status && (
              <div className="mt-3 flex justify-center lg:hidden">
                <StatusBadge status={passport.status} label={statusLabel} />
              </div>
            )}
          </div>

          {registrationBlock}

          <HeaderStatGrid stats={stats} />

          <ShareProfileButton
            playerId={player.id}
            playerName={playerName}
            rank={player.rank}
            shareUrl={player.shareProfileUrl}
            canonicalUrl={passport?.canonicalProfileUrl}
          />

          {playerHasSocials(player.socials) && (
            <div className="flex items-center justify-center gap-4 lg:justify-start">
              <PlayerSocialIcons
                socials={player.socials}
                size="sm"
                tone="poster"
                className="gap-2"
              />
            </div>
          )}
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
    <div className="border-t border-[#222] pt-4 lg:border-t-0 lg:pt-0">
      <h2 className="mb-3 text-[10px] uppercase tracking-[0.18em] text-[#555] lg:mb-4">
        {t("profile.personalInfo")}
      </h2>
      <div className="grid grid-cols-1 gap-y-4 lg:grid-cols-2 lg:gap-x-4 lg:gap-y-5">
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
