"use client";

import { Container } from "@/components/ui";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { sponsors } from "@/lib/data/mock/sponsors";

export function FeaturedSponsors() {
  const { t } = useTranslation("home");

  // Get first 6 sponsors for featured section
  const featuredSponsors = sponsors.slice(0, 6);

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

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 mb-12">
          {featuredSponsors.map((sponsor, index) => (
            <AnimatedSection key={sponsor.id} delay={400 + index * 100}>
              <a
                href={sponsor.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center p-6 hover:bg-white/5 transition-all duration-300 group cursor-pointer"
                aria-label={`Visit ${sponsor.name} website`}
              >
                <img
                  src={`/img/sponsors/sponsors-${index + 1}.png`}
                  alt={sponsor.name}
                  className="max-w-full max-h-16 object-contain group-hover:scale-110 transition-transform duration-300"
                />
              </a>
            </AnimatedSection>
          ))}
        </div>
      </Container>
    </section>
  );
}
