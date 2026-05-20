"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container, Badge } from "@/components/ui";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { ChevronLeft, ChevronRight, Trophy } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Player } from "@/lib/types";

interface FeaturedPlayersClientProps {
  players: Player[];
}

export function FeaturedPlayersClient({
  players: featuredPlayers,
}: FeaturedPlayersClientProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation("home");
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
            {getVisiblePlayers().map((player, index) => (
              <Link
                key={player.id}
                href={`/players/${player.id}`}
                className="group"
              >
                <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-accent/20 hover:border-accent/30">
                  {/* Player Image */}
                  <div className="relative h-80 overflow-hidden">
                    <Image
                      src={player.photo}
                      alt={`${player.firstName} ${player.lastName}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 33vw"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    {/* Rank Badge */}
                    <div className="absolute top-4 right-4">
                      <div className="bg-accent text-text-white w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg">
                        #{player.rank}
                      </div>
                    </div>
                  </div>

                  {/* Player Info */}
                  <div className="p-6">
                    <Badge variant="default" className="mb-3">
                      {tCommon("labels.level")} {player.category}
                    </Badge>
                    <h3 className="font-heading text-3xl font-semibold text-primary mb-2 group-hover:text-accent transition-colors">
                      {player.firstName} {player.lastName}
                    </h3>
                    <div className="flex items-center justify-between text-gray-600">
                      <span className="text-sm">
                        {tCommon("labels.points")}
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
