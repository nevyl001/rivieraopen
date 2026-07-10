"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container, Badge } from "@/components/ui";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { getCategoryTranslationKey } from "@/lib/categoryUtils";
import { buildPlayerProfilePath } from "@/lib/playerProfileRoutes";
import { Player } from "@/lib/types";

interface FeaturedPlayersClientProps {
  players: Player[];
}

export function FeaturedPlayersClient({
  players: featuredPlayers,
}: FeaturedPlayersClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation("home");
  const { t: tRankings } = useTranslation("rankings");
  const { t: tCommon } = useTranslation("common");

  // Auto-rotate carousel (only if we have players)
  useEffect(() => {
    if (featuredPlayers.length === 0) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredPlayers.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [featuredPlayers.length]);

  const goToPrevious = () => {
    if (featuredPlayers.length === 0) return;
    setCurrentIndex(
      (prev) => (prev - 1 + featuredPlayers.length) % featuredPlayers.length,
    );
  };

  const goToNext = () => {
    if (featuredPlayers.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % featuredPlayers.length);
  };

  const getVisiblePlayers = () => {
    if (featuredPlayers.length === 0) return [];

    const visible = [];
    const visibleCount = Math.min(3, featuredPlayers.length);
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentIndex + i) % featuredPlayers.length;
      visible.push(featuredPlayers[index]);
    }
    return visible;
  };

  // If no players, show empty state
  if (featuredPlayers.length === 0) {
    return (
      <section className="py-24 md:py-32 bg-gray-50">
        <Container>
          <AnimatedSection className="text-center mb-16 md:mb-20">
            <AnimatedSection delay={0}>
              <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6">
                {t("sections.featuredPlayers")}
              </h2>
            </AnimatedSection>
            <AnimatedSection delay={200}>
              <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
                {t("sections.featuredPlayersDescription")}
              </p>
            </AnimatedSection>
          </AnimatedSection>

          <div className="text-center py-16">
            <p className="text-gray-600 text-lg">
              No featured players available yet. Check back soon!
            </p>
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-24 md:py-32 bg-gray-50">
      <Container>
        <AnimatedSection className="text-center mb-16 md:mb-20">
          <AnimatedSection delay={0}>
            <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-6">
              {t("sections.featuredPlayers")}
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">
              {t("sections.featuredPlayersDescription")}
            </p>
          </AnimatedSection>
        </AnimatedSection>

        <AnimatedSection delay={400} className="relative">
          {/* Carousel */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {getVisiblePlayers().map((player) => (
              <Link
                key={player.id}
                href={buildPlayerProfilePath(player.id, player.rivieraId)}
                className="group"
              >
                <div className="flex items-stretch overflow-hidden rounded-3xl border border-gray-200 bg-white transition-all duration-300 hover:border-accent/30 hover:shadow-xl hover:shadow-accent/20">
                  <div className="relative w-36 min-h-[220px] shrink-0 self-stretch overflow-hidden bg-gray-900 sm:w-40 md:w-44">
                    <Image
                      src={player.photo}
                      alt={`${player.firstName} ${player.lastName}`}
                      fill
                      className="object-cover object-top"
                      sizes="176px"
                    />
                    <div className="absolute bottom-3 left-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-white shadow-md">
                        #{player.rank}
                      </div>
                    </div>
                  </div>

                  <div className="flex min-w-0 flex-1 flex-col justify-center p-5 md:p-6">
                    <Badge variant="default" className="mb-3 w-fit">
                      {tRankings(getCategoryTranslationKey(player.category))}
                    </Badge>
                    <h3 className="font-heading text-2xl font-semibold text-primary transition-colors group-hover:text-accent md:text-3xl">
                      {player.firstName} {player.lastName}
                    </h3>
                    <div className="mt-4 flex items-center justify-between gap-4 border-t border-gray-100 pt-4 text-gray-600">
                      <span className="text-sm">
                        {tRankings("labels.totalPoints")}
                      </span>
                      <span className="text-2xl font-bold text-accent">
                        {player.points.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Navigation Buttons */}
          <button
            onClick={goToPrevious}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 bg-gray-100 shadow-lg p-3 rounded-full hover:bg-accent hover:text-white transition-colors hidden md:block text-black"
            aria-label={tCommon("buttons.previous")}
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 bg-gray-100 shadow-lg p-3 rounded-full hover:bg-accent hover:text-white transition-colors hidden md:block text-black"
            aria-label={tCommon("buttons.next")}
          >
            <ChevronRight size={24} />
          </button>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {featuredPlayers.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`h-2 rounded-full transition-all ${
                  index === currentIndex
                    ? "bg-accent w-8"
                    : "bg-gray-300 hover:bg-accent/50 w-2"
                }`}
                aria-label={`Go to player ${index + 1}`}
              />
            ))}
          </div>
        </AnimatedSection>
      </Container>
    </section>
  );
}
