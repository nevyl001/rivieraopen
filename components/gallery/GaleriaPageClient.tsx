"use client";

import { Container } from "@/components/ui";
import { GaleriaEventCard } from "@/components/gallery/GaleriaEventCard";
import { GaleriaEvento } from "@/lib/types/galeria";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface GaleriaPageClientProps {
  eventos: GaleriaEvento[];
}

export function GaleriaPageClient({ eventos }: GaleriaPageClientProps) {
  const { t } = useTranslation("gallery");

  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <Container>
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl font-bold text-primary mb-4">
            {t("labels.photoGallery")}
          </h1>
          <p className="text-lg text-text-secondary max-w-2xl mx-auto">
            {t("labels.galleryDescription")}
          </p>
        </div>

        {eventos.length === 0 ? (
          <p className="text-center text-text-secondary py-16">
            {t("messages.noEvents")}
          </p>
        ) : (
          <div className="flex flex-wrap justify-center gap-5 sm:gap-6 lg:gap-8">
            {eventos.map((evento, index) => (
              <div
                key={evento.id}
                className="w-full max-w-[240px] sm:max-w-[260px]"
              >
                <GaleriaEventCard
                  evento={evento}
                  variant="light"
                  priority={index < 3}
                />
              </div>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
