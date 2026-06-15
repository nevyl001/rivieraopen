"use client";

import { useState } from "react";
import { Container } from "@/components/ui";
import { TournamentCard } from "@/components/tournaments/TournamentCard";
import { Tournament } from "@/lib/types";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface TournamentsPageClientProps {
  initialTournaments: Tournament[];
}

export function TournamentsPageClient({
  initialTournaments,
}: TournamentsPageClientProps) {
  const { t } = useTranslation("tournaments");
  const [statusFilter, setStatusFilter] = useState<
    "all" | Tournament["status"]
  >("all");

  // Filter tournaments
  const filteredTournaments = initialTournaments.filter(
    (t) => statusFilter === "all" || t.status === statusFilter,
  );

  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <Container>
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl font-bold text-black mb-4">
            {t("title")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("description")}
          </p>
        </div>

        {/* Filters */}
        <div className="mb-8 space-y-4">
          {/* Status Filter */}
          <div>
            <label className="block text-sm font-medium text-black mb-2">
              {t("filters.filterByStatus")}
            </label>

            {/* Mobile Dropdown */}
            <select
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "all" | Tournament["status"])
              }
              className="md:hidden w-full px-4 py-3 pr-12 bg-white border border-gray-300 rounded-full font-medium text-black focus:outline-none focus:ring-2 focus:ring-accent"
            >
              <option value="all">{t("filters.all")}</option>
              <option value="upcoming">{t("status.upcoming")}</option>
              <option value="in-progress">{t("status.inProgress")}</option>
              <option value="completed">{t("status.completed")}</option>
            </select>

            {/* Desktop Buttons */}
            <div className="hidden md:flex flex-wrap gap-2">
              <button
                onClick={() => setStatusFilter("all")}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  statusFilter === "all"
                    ? "bg-accent text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-accent/20"
                }`}
              >
                {t("filters.all")}
              </button>
              <button
                onClick={() => setStatusFilter("upcoming")}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  statusFilter === "upcoming"
                    ? "bg-accent text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-accent/20"
                }`}
              >
                {t("status.upcoming")}
              </button>
              <button
                onClick={() => setStatusFilter("in-progress")}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  statusFilter === "in-progress"
                    ? "bg-accent text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-accent/20"
                }`}
              >
                {t("status.inProgress")}
              </button>
              <button
                onClick={() => setStatusFilter("completed")}
                className={`px-4 py-2 rounded-full font-medium transition-colors ${
                  statusFilter === "completed"
                    ? "bg-accent text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-accent/20"
                }`}
              >
                {t("status.completed")}
              </button>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            {t("labels.showing")} {filteredTournaments.length}{" "}
            {filteredTournaments.length === 1
              ? t("labels.tournament")
              : t("labels.tournaments")}
          </p>
        </div>

        {/* Tournament Grid */}
        {filteredTournaments.length > 0 ? (
          <div className="flex flex-wrap justify-center items-stretch gap-6">
            {filteredTournaments.map((tournament) => (
              <div key={tournament.id} className="w-full sm:w-80">
                <TournamentCard tournament={tournament} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">
              {t("messages.noTournaments")}
            </p>
          </div>
        )}
      </Container>
    </div>
  );
}
