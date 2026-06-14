"use client";

import Link from "next/link";
import Image from "next/image";
import { Button, Container } from "@/components/ui";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { FeaturedGalleryPhoto } from "@/lib/galeriaService";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface FeaturedGalleryProps {
  photos: FeaturedGalleryPhoto[];
}

export function FeaturedGallery({ photos }: FeaturedGalleryProps) {
  const { t } = useTranslation("gallery");
  const { t: tHome } = useTranslation("home");

  return (
    <section className="py-24 md:py-32 bg-background">
      <Container>
        <AnimatedSection className="text-center mb-16 md:mb-20">
          <AnimatedSection delay={0}>
            <h2 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-text mb-6">
              {t("labels.photoGallery")}
            </h2>
          </AnimatedSection>
          <AnimatedSection delay={200}>
            <p className="text-xl md:text-2xl text-text-secondary max-w-3xl mx-auto">
              {tHome("sections.galleryDescription")}
            </p>
          </AnimatedSection>
        </AnimatedSection>

        {photos.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-text-secondary text-lg mb-6">
              {t("messages.noEvents")}
            </p>
            <Link href="/galeria">
              <Button variant="secondary">{t("navigation.viewAll")}</Button>
            </Link>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:gap-6 mb-12">
              {photos.map((photo, index) => (
                <AnimatedSection key={photo.id} delay={400 + index * 100}>
                  <Link
                    href={`/galeria/${photo.eventoId}`}
                    className="group flex flex-col overflow-hidden rounded-2xl border border-[#222] bg-[#111] transition-all duration-300 hover:border-[#444] hover:bg-[#151515] sm:flex-row"
                  >
                    <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden bg-[#0a0a0a] sm:w-48 md:w-56">
                      <Image
                        src={photo.url}
                        alt={photo.eventoNombre}
                        fill
                        className="object-contain object-center p-2 transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 100vw, 224px"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col justify-center gap-2 p-5">
                      <p className="text-[10px] uppercase tracking-[0.18em] text-[#555]">
                        {t("metadata.tournament")}
                      </p>
                      <h3 className="font-heading text-xl font-semibold text-white transition-colors group-hover:text-[#ddd] line-clamp-2">
                        {photo.eventoNombre}
                      </h3>
                      {photo.eventoLugar && (
                        <p className="text-sm text-[#777]">{photo.eventoLugar}</p>
                      )}
                    </div>
                  </Link>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection delay={800} className="text-center">
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
