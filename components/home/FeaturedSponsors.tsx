"use client";

import Image from "next/image";
import { Container } from "@/components/ui";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { sponsors } from "@/lib/data/mock/sponsors";

export function FeaturedSponsors() {
  const { t } = useTranslation("home");
  const sponsor = sponsors[0];

  if (!sponsor) return null;

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

        <div className="flex justify-center">
          <AnimatedSection delay={400}>
            <a
              href={sponsor.website}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center transition-transform duration-300 hover:scale-105"
              aria-label={`Visitar sitio web de ${sponsor.name}`}
            >
              <Image
                src={sponsor.logo}
                alt={sponsor.name}
                width={500}
                height={500}
                className="h-28 w-auto max-w-[280px] object-contain sm:h-32 sm:max-w-[320px] md:h-40 md:max-w-[360px]"
              />
            </a>
          </AnimatedSection>
        </div>
      </Container>
    </section>
  );
}
