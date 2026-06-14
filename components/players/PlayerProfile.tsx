"use client";

import Image from "next/image";
import { Card, Badge } from "@/components/ui";
import { PlayerProfileDetail } from "@/lib/types";
import { Trophy, Award, MapPin, User, Calendar } from "lucide-react";
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

  const detailItems = [
    {
      label: t("profile.age"),
      value: player.age ? `${player.age} ${t("profile.years")}` : null,
      icon: Calendar,
    },
    {
      label: t("profile.level"),
      value: formatLabel(player.nivel),
      icon: Trophy,
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
    {
      label: t("profile.country"),
      value: player.paisCodigo,
      icon: MapPin,
    },
  ].filter((item) => item.value);

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <div className="relative w-36 h-36 lg:w-44 lg:h-44 rounded-full border-4 border-accent/20 shadow-xl shrink-0 overflow-hidden bg-white mx-auto lg:mx-0">
            <Image
              src={player.photo}
              alt={`${player.firstName} ${player.lastName}`}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 144px, 176px"
              priority
            />
          </div>

          <div className="flex-1 w-full text-center lg:text-left">
            <div className="flex flex-col lg:flex-row lg:items-center gap-3 mb-4">
              <h1 className="font-heading text-4xl lg:text-5xl font-bold text-primary">
                {player.firstName} {player.lastName}
              </h1>
              <div className="flex flex-wrap justify-center lg:justify-start gap-2">
                <Badge variant="default">
                  {t(getCategoryTranslationKey(player.category))}
                </Badge>
                <Badge variant="default">
                  {player.gender === "Female"
                    ? t("genders.femenil")
                    : t("genders.varonil")}
                </Badge>
              </div>
            </div>

            <div className="flex justify-center lg:justify-start mb-6">
              <PlayerSocialIcons socials={player.socials} size="md" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-sm text-text-secondary mb-1">
                  {t("labels.currentRank")}
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Award className="text-accent" size={20} />
                  <span className="text-2xl font-bold text-primary">
                    #{player.rank || "—"}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-sm text-text-secondary mb-1">
                  {t("labels.totalPoints")}
                </p>
                <div className="flex items-center justify-center lg:justify-start gap-2">
                  <Trophy className="text-accent" size={20} />
                  <span className="text-2xl font-bold text-primary">
                    {formatNumber(player.points)}
                  </span>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-sm text-text-secondary mb-1">
                  {t("profile.wins")}
                </p>
                <span className="text-2xl font-bold text-primary">
                  {player.stats.victorias}
                </span>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4">
                <p className="text-sm text-text-secondary mb-1">
                  {t("profile.winRate")}
                </p>
                <span className="text-2xl font-bold text-primary">
                  {player.stats.pctVictorias}%
                </span>
              </div>
            </div>

            {player.stats.rachaActual && (
              <p className="text-text-secondary">
                <span className="font-medium text-primary">
                  {t("profile.currentStreak")}:
                </span>{" "}
                {player.stats.rachaActual}
              </p>
            )}
          </div>
        </div>
      </Card>

      {detailItems.length > 0 && (
        <Card>
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
          </div>
        </Card>
      )}
    </div>
  );
}
