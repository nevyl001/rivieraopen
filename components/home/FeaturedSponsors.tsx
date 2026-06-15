"use client";

import Image from "next/image";
import { Container } from "@/components/ui";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { sponsors } from "@/lib/data/mock/sponsors";

export function FeaturedSponsors() {
  const { t } = useTranslation("home");

  if (sponsors.length === 0) return null;

  return (
    <section className="py-24 md:py-32 bg-surface">
      <Container>
        <AnimatedSection className="text-center mb-16 md:mb-20">
          <AnimatedSection delay={0}>
            <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-text mb-6">
              {t("sections.sponsors")}
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto">
              {t("sections.sponsorsDescription")}
            </p>
          </AnimatedSection>
        </AnimatedSection>

        <div className="flex flex-wrap items-center justify-center gap-10 md:gap-14">
          {sponsors.map((sponsor, index) => (
            <AnimatedSection key={sponsor.id} delay={400 + index * 150}>
              <a
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex h-24 items-center justify-center transition-transform duration-300 hover:scale-105 sm:h-28 md:h-32"
                aria-label={`Visitar sitio web de ${sponsor.name}`}
              >
                <Image
                  src={sponsor.logo}
                  alt={sponsor.name}
                  width={500}
                  height={500}
                  unoptimized
                  className={
                    sponsor.logoClassName ??
                    "h-24 w-auto max-w-[220px] object-contain sm:h-28 sm:max-w-[260px] md:h-32 md:max-w-[300px]"
                  }
                />
              </a>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
}
