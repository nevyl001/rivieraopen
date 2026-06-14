"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button, Container } from "@/components/ui";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { GaleriaEventCard } from "@/components/gallery/GaleriaEventCard";
import { GaleriaEvento } from "@/lib/types/galeria";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FeaturedGalleryProps {
  eventos: GaleriaEvento[];
}

export function FeaturedGallery({ eventos }: FeaturedGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { t } = useTranslation("gallery");
  const { t: tHome } = useTranslation("home");
  const { t: tCommon } = useTranslation("common");

  const visibleCount = Math.min(3, eventos.length);

  useEffect(() => {
    if (eventos.length <= visibleCount) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % eventos.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [eventos.length, visibleCount]);

  const getVisibleEventos = () => {
    if (eventos.length === 0) return [];

    const visible: GaleriaEvento[] = [];
    for (let i = 0; i < visibleCount; i++) {
      visible.push(eventos[(currentIndex + i) % eventos.length]);
    }
    return visible;
  };

  const goToPrevious = () => {
    if (eventos.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + eventos.length) % eventos.length);
  };

  const goToNext = () => {
    if (eventos.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % eventos.length);
  };

  return (
    <section className="py-20 md:py-28 bg-background">
      <Container>
        <AnimatedSection className="text-center mb-12 md:mb-14">
          <AnimatedSection delay={0}>
            <h2 className="font-heading text-4xl md:text-5xl lg:text-6xl font-bold text-text mb-4">
              {tHome("sections.galleries")}
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto">
              {tHome("sections.galleryDescription")}
            </p>
          </AnimatedSection>
        </AnimatedSection>

        {eventos.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-text-secondary mb-6">{t("messages.noEvents")}</p>
            <Link href="/galeria">
              <Button variant="secondary">{t("navigation.viewAll")}</Button>
            </Link>
          </div>
        ) : (
          <>
            <AnimatedSection delay={400} className="relative mb-10">
              <div className="flex flex-wrap justify-center gap-5 sm:gap-6 lg:gap-8">
                {getVisibleEventos().map((evento, index) => (
                  <div
                    key={`${evento.id}-${currentIndex}-${index}`}
                    className="w-full max-w-[240px] sm:max-w-[260px]"
                  >
                    <GaleriaEventCard
                      evento={evento}
                      variant="dark"
                      priority={index === 0}
                    />
                  </div>
                ))}
              </div>

              {eventos.length > visibleCount && (
                <>
                  <button
                    type="button"
                    onClick={goToPrevious}
                    className="absolute left-0 top-1/2 hidden -translate-x-3 -translate-y-1/2 rounded-full bg-[#111] p-3 text-white shadow-lg ring-1 ring-[#333] transition-colors hover:bg-[#222] md:block"
                    aria-label={tCommon("buttons.previous")}
                  >
                    <ChevronLeft size={22} />
                  </button>
                  <button
                    type="button"
                    onClick={goToNext}
                    className="absolute right-0 top-1/2 hidden translate-x-3 -translate-y-1/2 rounded-full bg-[#111] p-3 text-white shadow-lg ring-1 ring-[#333] transition-colors hover:bg-[#222] md:block"
                    aria-label={tCommon("buttons.next")}
                  >
                    <ChevronRight size={22} />
                  </button>

                  <div className="mt-8 flex justify-center gap-2">
                    {eventos.map((_, index) => (
                      <button
                        key={index}
                        type="button"
                        onClick={() => setCurrentIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentIndex
                            ? "w-8 bg-white"
                            : "w-2 bg-[#444] hover:bg-[#666]"
                        }`}
                        aria-label={`Evento ${index + 1}`}
                      />
                    ))}
                  </div>
                </>
              )}
            </AnimatedSection>

            <AnimatedSection delay={700} className="text-center">
              <Link href="/galeria">
                <Button variant="secondary">{t("navigation.viewAll")}</Button>
              </Link>
            </AnimatedSection>
          </>
        )}
      </Container>
    </section>
  );
}
