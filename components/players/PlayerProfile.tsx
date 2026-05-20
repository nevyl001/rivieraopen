"use client";

import Image from "next/image";
import { Card, Badge } from "@/components/ui";
import { Player } from "@/lib/types";
import {
  Mail,
  Phone,
  Instagram,
  Facebook,
  Twitter,
  Trophy,
  Award,
} from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface PlayerProfileProps {
  player: Player;
}

export function PlayerProfile({ player }: PlayerProfileProps) {
  const { t } = useTranslation("rankings");
  const { t: tCommon } = useTranslation("common");
  const { formatNumber } = useTranslation();
  return (
    <div className="space-y-6">
      {/* Player Info Card */}
      <Card>
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          {/* Player Photo */}
          <div className="relative w-32 h-32 rounded-full border-4 border-gray-200 shadow-lg shrink-0 overflow-hidden bg-white">
            <Image
              src={player.photo}
              alt={`${player.firstName} ${player.lastName}`}
              fill
              className="object-cover"
              sizes="128px"
            />
          </div>

          {/* Player Info */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
              <h1 className="font-heading text-4xl font-bold text-gray-900">
                {player.firstName} {player.lastName}
              </h1>
              <Badge variant="default">
                {tCommon("labels.level")} {player.category}
              </Badge>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {t("labels.currentRank")}
                </p>
                <div className="flex items-center gap-2">
                  <Award className="text-accent" size={20} />
                  <span className="text-2xl font-bold text-gray-900">
                    #{player.rank}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-1">
                  {t("labels.totalPoints")}
                </p>
                <div className="flex items-center gap-2">
                  <Trophy className="text-accent" size={20} />
                  <span className="text-2xl font-bold text-gray-900">
                    {formatNumber(player.points)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Social Media */}
      {(player.socials.instagram ||
        player.socials.facebook ||
        player.socials.twitter) && (
        <Card>
          <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-4">
            {t("labels.socialMedia")}
          </h2>
          <div className="flex gap-4">
            {player.socials.instagram && (
              <a
                href={player.socials.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Instagram size={20} className="text-white" />
                <span className="text-white">Instagram</span>
              </a>
            )}
            {player.socials.facebook && (
              <a
                href={player.socials.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Facebook size={20} className="text-white" />
                <span className="text-white">Facebook</span>
              </a>
            )}
            {player.socials.twitter && (
              <a
                href={player.socials.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-900 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Twitter size={20} className="text-white" />
                <span className="text-white">Twitter</span>
              </a>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
