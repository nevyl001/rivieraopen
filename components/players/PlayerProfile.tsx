"use client";

import Image from "next/image";
import { Card, Badge } from "@/components/ui";
import { CountryFlag } from "@/components/ui/CountryFlag";
import { PlayerProfileDetail } from "@/lib/types";
import {
  Trophy,
  Award,
  MapPin,
  User,
  Calendar,
  Target,
  Flame,
} from "lucide-react";
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

export function PlayerProfile({ player }: PlayerProfileProps) {
  const { t } = useTranslation("rankings");
  const { t: tCommon } = useTranslation("common");
  const { formatNumber } = useTranslation();

  const fuerzaLabel = t(getCategoryTranslationKey(player.category));

  const stats = [
    {
      label: t("labels.currentRank"),
      value: `#${player.rank || "—"}`,
      icon: Award,
    },
    {
      label: t("labels.totalPoints"),
      value: formatNumber(player.points),
      icon: Trophy,
    },
    {
      label: t("profile.wins"),
      value: String(player.stats.victorias),
      icon: null,
    },
    {
      label: t("profile.winRate"),
      value: `${player.stats.pctVictorias}%`,
      icon: null,
    },
  ];

  const detailItems = [
    {
      label: t("profile.age"),
      value: player.age ? `${player.age} ${t("profile.years")}` : null,
      icon: Calendar,
    },
    {
      label: t("profile.force"),
      value: fuerzaLabel,
      icon: Target,
    },
    {
      label: t("profile.dominantHand"),
      value: formatLabel(player.manoDominante),
      icon: User,
    },
    {
      label: t("profile.courtPosition"),
      value: formatLabel(player.enCancha),
      icon: User,
    },
    {
      label: tCommon("labels.club"),
      value: player.club,
      icon: MapPin,
    },
  ].filter((item) => item.value);

  const hasCountry = Boolean(player.paisCodigo?.trim());

  return (
    <div className="space-y-6">
      {/* Hero card */}
      <Card
        className="overflow-hidden p-0 shadow-lg border border-gray-100"
        hover={false}
      >
        {/* Brand bar */}
        <div className="border-b border-gray-100 bg-gray-50 px-5 py-2.5 text-center">
          <p className="font-heading text-xs font-semibold tracking-[0.2em] uppercase text-primary">
            Riviera Open
            <span className="text-accent font-normal mx-2">·</span>
            <span className="text-accent normal-case tracking-normal font-medium">
              {t("profile.officialPlayer")}
            </span>
          </p>
        </div>

        <div className="flex flex-col lg:flex-row">
          {/* Photo — compact, centered */}
          <div className="flex items-center justify-center bg-gray-50 px-5 py-5 sm:px-6 sm:py-6 lg:w-56 xl:w-60 shrink-0">
            <div className="relative w-full max-w-[220px] sm:max-w-[240px] aspect-[4/5] rounded-2xl overflow-hidden shadow-md">
              <Image
                src={player.photo}
                alt={`${player.firstName} ${player.lastName}`}
                fill
                className="object-cover object-center"
                sizes="240px"
                priority
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-primary/50 via-transparent to-transparent pointer-events-none"
                aria-hidden
              />
            </div>
          </div>

          {/* Divider */}
          <div className="hidden lg:block w-px bg-gray-100 shrink-0" />
          <div className="lg:hidden h-px bg-gray-100 shrink-0" />

          {/* Content */}
          <div className="flex flex-col flex-1 justify-center px-5 py-6 sm:px-7 sm:py-7 lg:px-8">
            {/* Header */}
            <div className="mb-5">
              <h1 className="font-heading text-2xl sm:text-3xl font-bold text-primary leading-tight mb-3">
                {player.firstName} {player.lastName}
              </h1>

              <div className="flex flex-wrap items-center gap-2 mb-4">
                <Badge variant="default" className="text-xs px-3 py-1">
                  {fuerzaLabel}
                </Badge>
                <Badge variant="default" className="text-xs px-3 py-1">
                  {player.gender === "Female"
                    ? t("genders.femenil")
                    : t("genders.varonil")}
                </Badge>
              </div>

              <PlayerSocialIcons
                socials={player.socials}
                size="md"
                className="gap-2"
              />
            </div>

            {/* Stats */}
            <div className="rounded-xl border border-gray-100 overflow-hidden mb-4">
              <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center lg:items-start px-3 py-4 sm:px-4 bg-white"
                  >
                    <p className="text-[10px] sm:text-[11px] uppercase tracking-wide text-text-secondary mb-1.5 text-center lg:text-left w-full">
                      {stat.label}
                    </p>
                    <div className="flex items-center gap-1.5">
                      {stat.icon && (
                        <stat.icon
                          size={15}
                          className="text-accent shrink-0 hidden sm:block"
                        />
                      )}
                      <span className="font-heading text-xl sm:text-2xl font-bold text-primary tabular-nums leading-none">
                        {stat.value}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Streak pill */}
            {player.stats.rachaActual && (
              <div className="flex justify-start">
                <span className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-gray-50 border border-gray-100 text-xs sm:text-sm text-primary">
                  <Flame size={13} className="text-accent shrink-0" />
                  <span className="text-text-secondary">
                    {t("profile.currentStreak")}:
                  </span>
                  <span className="font-medium">{player.stats.rachaActual}</span>
                </span>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* Personal info — unchanged structure */}
      {(detailItems.length > 0 || hasCountry) && (
        <Card className="border border-gray-100 shadow-[0_12px_40px_rgba(0,0,0,0.06)]">
          <h2 className="font-heading text-2xl font-semibold text-primary mb-4">
            {t("profile.personalInfo")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {detailItems.map((item) => (
              <div
                key={item.label}
                className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl"
              >
                <item.icon size={18} className="text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-text-secondary">{item.label}</p>
                  <p className="font-medium text-primary">{item.value}</p>
                </div>
              </div>
            ))}
            {hasCountry && player.paisCodigo && (
              <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                <MapPin size={18} className="text-accent mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm text-text-secondary mb-1">
                    {t("profile.country")}
                  </p>
                  <CountryFlag code={player.paisCodigo} size="lg" />
                </div>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
