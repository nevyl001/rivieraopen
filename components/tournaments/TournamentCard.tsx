"use client";

import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import { Tournament } from "@/lib/types";
import { Calendar, MapPin, Trophy } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface TournamentCardProps {
  tournament: Tournament;
}

export function TournamentCard({ tournament }: TournamentCardProps) {
  const { t } = useTranslation("tournaments");
  const { formatShortDate } = useTranslation();

  const formatDate = (dateString: string) => {
    return formatShortDate(dateString);
  };

  const getStatusVariant = (status: Tournament["status"]) => {
    switch (status) {
      case "upcoming":
        return "success";
      case "in-progress":
        return "warning";
      case "completed":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: Tournament["status"]) => {
    switch (status) {
      case "upcoming":
        return t("status.upcoming");
      case "in-progress":
        return t("status.inProgress");
      case "completed":
        return t("status.completed");
      default:
        return status;
    }
  };

  return (
    <Link href={`/tournaments/${tournament.id}`}>
      <Card hover className="h-full flex flex-col">
        {/* Date Badge and Status */}
        <div className="flex items-start justify-between mb-4">
          <div className="bg-accent text-white px-4 py-2 rounded-lg text-center min-w-[80px]">
            <div className="text-2xl font-bold">
              {new Date(tournament.date).getDate()}
            </div>
            <div className="text-xs uppercase">
              {new Date(tournament.date).toLocaleDateString("es", {
                month: "short",
              })}
            </div>
          </div>
          <Badge variant={getStatusVariant(tournament.status)}>
            {getStatusLabel(tournament.status)}
          </Badge>
        </div>

        {/* Tournament Name */}
        <h3 className="font-heading text-xl font-semibold text-primary mb-3 line-clamp-2">
          {tournament.name}
        </h3>

        {/* Tournament Details */}
        <div className="space-y-2 mb-4 flex-1">
          <div className="flex items-start gap-2 text-sm text-text-secondary">
            <MapPin size={16} className="mt-0.5 shrink-0" />
            <span>
              {tournament.club}, {tournament.location}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Calendar size={16} className="shrink-0" />
            <span>{formatDate(tournament.date)}</span>
          </div>
        </div>

        {/* Results for Completed Tournaments */}
        {tournament.status === "completed" &&
          tournament.categories.some((c) => c.results) && (
            <div className="pt-4 border-t border-border">
              <div className="flex items-center gap-2 mb-3">
                <Trophy size={16} className="text-accent" />
                <span className="text-sm font-semibold text-primary">
                  {t("labels.results")}
                </span>
              </div>
              {tournament.categories.map(
                (category) =>
                  category.results && (
                    <div
                      key={category.category}
                      className="space-y-2 text-sm mb-3 last:mb-0"
                    >
                      <div className="font-medium text-primary text-xs mb-1">
                        Categoría {category.category}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary">
                          {t("labels.firstPlace")}:
                        </span>
                        <span className="font-medium text-primary">
                          {category.results.first.playerName}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-text-secondary">
                          {t("labels.secondPlace")}:
                        </span>
                        <span className="font-medium text-primary">
                          {category.results.second.playerName}
                        </span>
                      </div>
                    </div>
                  )
              )}
            </div>
          )}

        {/* Registration Status for Upcoming */}
        {tournament.status === "upcoming" && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">
                {t("labels.registrationStatus")}:
              </span>
              <span
                className={`font-medium ${
                  tournament.registrationOpen
                    ? "text-success"
                    : "text-text-secondary"
                }`}
              >
                {tournament.registrationOpen
                  ? t("status.registrationOpen")
                  : t("status.registrationClosed")}
              </span>
            </div>
          </div>
        )}
      </Card>
    </Link>
  );
}
