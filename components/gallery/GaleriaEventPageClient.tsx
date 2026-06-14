"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui";
import { GaleriaLightbox } from "@/components/gallery/GaleriaLightbox";
import { GaleriaEvento } from "@/lib/types/galeria";
import { ArrowLeft, Calendar, MapPin } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface GaleriaEventPageClientProps {
  evento: GaleriaEvento;
}

export function GaleriaEventPageClient({ evento }: GaleriaEventPageClientProps) {
  const { t } = useTranslation("gallery");
  const { formatDate } = useTranslation();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const photos =
    evento.fotos.length > 0
      ? evento.fotos
      : evento.portada_url
        ? [evento.portada_url]
        : [];

  const handlePrevious = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex - 1 + photos.length) % photos.length);
  };

  const handleNext = () => {
    if (lightboxIndex === null) return;
    setLightboxIndex((lightboxIndex + 1) % photos.length);
  };

  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <Container>
        <Link
          href="/galeria"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-8 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          {t("navigation.backToGallery")}
        </Link>

        <div className="mb-10">
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-primary mb-3">
            {evento.evento_nombre}
          </h1>
          <div className="flex flex-wrap gap-4 text-text-secondary">
            {evento.evento_fecha && (
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-accent" />
                <span>{formatDate(evento.evento_fecha)}</span>
              </div>
            )}
            {evento.evento_lugar && (
              <div className="flex items-center gap-2">
                <MapPin size={16} className="text-accent" />
                <span>{evento.evento_lugar}</span>
              </div>
            )}
          </div>
        </div>

        {photos.length === 0 ? (
          <p className="text-center text-text-secondary py-16">
            {t("messages.noPhotos")}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {photos.map((photo, index) => (
              <button
                key={`${photo}-${index}`}
                type="button"
                onClick={() => setLightboxIndex(index)}
                className="relative aspect-square rounded-2xl overflow-hidden bg-gray-100 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-accent"
              >
                <Image
                  src={photo}
                  alt={`${evento.evento_nombre} ${index + 1}`}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
              </button>
            ))}
          </div>
        )}

        <GaleriaLightbox
          photos={photos}
          currentIndex={lightboxIndex ?? 0}
          isOpen={lightboxIndex !== null}
          eventName={evento.evento_nombre}
          onClose={() => setLightboxIndex(null)}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </Container>
    </div>
  );
}
