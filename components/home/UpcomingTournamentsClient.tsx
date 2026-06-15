"use client";

import Link from "next/link";
import { Card, Badge, Button, Container } from "@/components/ui";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { Calendar, MapPin, Users } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { translateLevel } from "@/lib/utils/levelTranslation";
import { parseDateInput } from "@/lib/i18n/formatters";
import { Tournament } from "@/lib/types";

interface UpcomingTournamentsClientProps {
  tournaments: Tournament[];
}

export function UpcomingTournamentsClient({
  tournaments,
}: UpcomingTournamentsClientProps) {
  const { t } = useTranslation("home");
  const { t: tCommon } = useTranslation("common");
  const { formatShortDate } = useTranslation();

  const formatDate = (dateString: string) => {
    return formatShortDate(dateString);
  };

  const getStatusBadge = (
    tournament: Tournament,
  ): { variant: "default" | "success" | "warning" | "error"; label: string } => {
    if (tournament.status === "completed") {
      return {
        variant: "error",
        label: tCommon("status.completed"),
      };
    }
    if (tournament.status === "in-progress") {
      return {
        variant: "warning",
        label: tCommon("status.inProgress"),
      };
    }
    return {
      variant: tournament.registrationOpen ? "success" : "warning",
      label: tournament.registrationOpen
        ? tCommon("status.registrationOpen")
        : tCommon("status.registrationClosed"),
    };
  };

  // If no tournaments, show empty state
  if (tournaments.length === 0) {
    return (
      <section id="upcoming-tournaments" className="py-24 md:py-32 bg-surface">
        <Container>
          <AnimatedSection className="text-center mb-16 md:mb-20">
            <AnimatedSection delay={0}>
              <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-text mb-6">
                {t("sections.upcomingTournaments")}
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto">
                {t("sections.upcomingTournamentsDescription")}
              </p>
            </AnimatedSection>
          </AnimatedSection>

          <div className="text-center py-16">
            <p className="text-text-secondary text-lg">
              Aún no hay torneos publicados. ¡Vuelve pronto!
            </p>
          </div>

          {/* View All Link */}
          <AnimatedSection delay={1000} className="text-center">
            <Link href="/tournaments">
              <Button variant="secondary">{tCommon("buttons.viewAll")}</Button>
            </Link>
          </AnimatedSection>
        </Container>
      </section>
    );
  }

  return (
    <section id="upcoming-tournaments" className="py-24 md:py-32 bg-surface">
      <Container>
        <AnimatedSection className="text-center mb-16 md:mb-20">
          <AnimatedSection delay={0}>
            <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-text mb-6">
              {t("sections.upcomingTournaments")}
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto">
              {t("sections.upcomingTournamentsDescription")}
            </p>
          </AnimatedSection>
        </AnimatedSection>

        <div className="flex flex-wrap justify-center items-stretch gap-6 mb-8">
          {tournaments.map((tournament, index) => {
            const statusBadge = getStatusBadge(tournament);

            return (
            <AnimatedSection
              key={tournament.id}
              delay={400 + index * 150}
              className="flex h-full w-full sm:w-80"
            >
              <Card hover className="flex flex-col h-full w-full">
                {/* Date Badge */}
                <div className="flex items-center gap-2 mb-4 min-h-[52px]">
                  <div className="bg-primary text-white px-4 py-2 text-center min-w-[80px] shrink-0">
                    <div className="text-2xl font-bold">
                      {parseDateInput(tournament.date).getDate()}
                    </div>
                    <div className="text-xs uppercase">
                      {parseDateInput(tournament.date).toLocaleDateString("es", {
                        month: "short",
                      })}
                    </div>
                  </div>
                  <div className="flex-1">
                    <Badge variant={statusBadge.variant}>
                      {statusBadge.label}
                    </Badge>
                  </div>
                </div>

                {/* Tournament Info */}
                <h3 className="font-heading text-2xl font-semibold text-primary mb-3 line-clamp-2 min-h-[4rem] leading-tight">
                  {tournament.name}
                </h3>

                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-start gap-2 text-sm text-text-secondary min-h-[2.75rem]">
                    <MapPin size={16} className="mt-0.5 shrink-0" />
                    <span className="line-clamp-2 leading-snug">
                      {tournament.club}, {tournament.location}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary min-h-[1.25rem]">
                    <Users size={16} className="shrink-0" />
                    <span>
                      {tCommon("labels.level")}{" "}
                      {tournament.categories
                        .map((c) => translateLevel(c.category))
                        .join(", ")}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-text-secondary min-h-[1.25rem]">
                    <Calendar size={16} className="shrink-0" />
                    <span>{formatDate(tournament.date)}</span>
                  </div>
                </div>

                {/* View Details Link */}
                <Link
                  href={`/tournaments/${tournament.id}`}
                  className="mt-auto text-accent hover:text-accent-hover font-medium text-sm transition-colors"
                >
                  {tCommon("buttons.viewDetails")} →
                </Link>
              </Card>
            </AnimatedSection>
            );
          })}
        </div>

        {/* View All Link */}
        <AnimatedSection delay={1000} className="text-center">
          <Link href="/tournaments">
            <Button variant="secondary">{tCommon("buttons.viewAll")}</Button>
          </Link>
        </AnimatedSection>
      </Container>
    </section>
  );
}
