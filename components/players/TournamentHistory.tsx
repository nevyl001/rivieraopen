"use client";

import Link from "next/link";
import { Card } from "@/components/ui";
import { Player } from "@/lib/types";
import { Trophy, Calendar, MapPin, Medal } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface TournamentHistoryProps {
  player: Player;
}

export function TournamentHistory({ player }: TournamentHistoryProps) {
  const { t } = useTranslation("rankings");
  const { t: tCommon } = useTranslation("common");
  const { formatDate } = useTranslation();

  // Sort tournament results by date (most recent first)
  const sortedResults = [...player.tournamentResults].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sortedResults.length === 0) {
    return (
      <Card>
        <h2 className="font-heading text-2xl font-semibold text-gray-900 mb-4">
          {t("labels.tournamentHistory")}
        </h2>
        <p className="text-gray-600">{t("messages.noPlayers")}</p>
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <Trophy size={28} className="text-accent" />
        <h2 className="font-heading text-2xl font-semibold text-gray-900">
          {t("labels.tournamentHistory")}
        </h2>
      </div>

      <div className="space-y-4">
        {sortedResults.map((result, index) => (
          <Link
            key={`${result.tournamentId}-${index}`}
            href={`/tournaments/${result.tournamentId}`}
          >
            <div className="p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="flex items-center justify-between gap-4">
                {/* Tournament Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading text-lg font-semibold text-gray-900 mb-2">
                    {result.placement === 1 ? "🏆 " : "🥈 "}
                    {result.placement === 1 ? "Campeón" : "Finalista"}
                  </h3>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin size={14} className="shrink-0" />
                      <span>{result.club}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar size={14} className="shrink-0" />
                      <span>{formatDate(result.date)}</span>
                    </div>
                  </div>
                </div>

                {/* Placement Indicator */}
                <span
                  className={`text-sm font-bold ${
                    result.placement === 1 ? "text-accent" : "text-gray-600"
                  }`}
                >
                  {result.placement === 1
                    ? t("placementIndicators.first")
                    : t("placementIndicators.second")}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Summary Stats */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <p className="text-3xl font-bold text-accent">
              {sortedResults.filter((r) => r.placement === 1).length}
            </p>
            <p className="text-sm text-gray-600">Campeonatos</p>
          </div>
          <div className="text-center">
            <p className="text-3xl font-bold text-gray-600">
              {sortedResults.filter((r) => r.placement === 2).length}
            </p>
            <p className="text-sm text-gray-600">Subcampeonatos</p>
          </div>
        </div>
      </div>
    </Card>
  );
}
