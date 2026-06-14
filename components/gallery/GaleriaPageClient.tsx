"use client";

import Link from "next/link";
import Image from "next/image";
import { Container } from "@/components/ui";
import { GaleriaEvento } from "@/lib/types/galeria";
import { Calendar, MapPin } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface GaleriaPageClientProps {
  eventos: GaleriaEvento[];
}

export function GaleriaPageClient({ eventos }: GaleriaPageClientProps) {
  const { t } = useTranslation("gallery");
  const { formatDate } = useTranslation();

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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 justify-items-center">
            {eventos.map((evento) => (
              <Link
                key={evento.id}
                href={`/galeria/${evento.id}`}
                className="group flex w-full max-w-sm flex-col overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-black/5 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-neutral-900">
                  {evento.portada_url ? (
                    <>
                      <Image
                        src={evento.portada_url}
                        alt=""
                        fill
                        aria-hidden
                        className="object-cover scale-110 blur-2xl opacity-70 saturate-125"
                        sizes="384px"
                      />
                      <Image
                        src={evento.portada_url}
                        alt={evento.evento_nombre}
                        fill
                        className="relative z-10 object-contain object-center transition-transform duration-500 group-hover:scale-[1.03]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 384px"
                      />
                      <div className="absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                      {evento.fotos.length > 0 && (
                        <span className="absolute bottom-3 right-3 z-30 rounded-full bg-black/55 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                          {evento.fotos.length}{" "}
                          {evento.fotos.length === 1 ? "foto" : "fotos"}
                        </span>
                      )}
                    </>
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/70 text-sm">
                      {t("messages.noCover")}
                    </div>
                  )}
                </div>

                <div className="flex flex-1 flex-col gap-3 p-5">
                  <h2 className="font-heading text-xl font-semibold leading-tight text-primary transition-colors group-hover:text-accent line-clamp-2">
                    {evento.evento_nombre}
                  </h2>

                  <div className="mt-auto space-y-2 border-t border-gray-100 pt-4 text-sm text-text-secondary">
                    {evento.evento_fecha && (
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                          <Calendar size={14} className="text-primary" />
                        </span>
                        <span>{formatDate(evento.evento_fecha)}</span>
                      </div>
                    )}
                    {evento.evento_lugar && (
                      <div className="flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100">
                          <MapPin size={14} className="text-primary" />
                        </span>
                        <span>{evento.evento_lugar}</span>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </Container>
    </div>
  );
}
