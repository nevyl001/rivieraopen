"use client";

import Link from "next/link";
import Image from "next/image";
import { GaleriaEvento } from "@/lib/types/galeria";
import { Calendar, MapPin } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface GaleriaEventCardProps {
  evento: GaleriaEvento;
  variant?: "dark" | "light";
  priority?: boolean;
}

export function GaleriaEventCard({
  evento,
  variant = "light",
  priority = false,
}: GaleriaEventCardProps) {
  const { t } = useTranslation("gallery");
  const { formatDate } = useTranslation();

  const cover = evento.portada_url || evento.fotos[0];
  const isDark = variant === "dark";

  return (
    <Link
      href={`/galeria/${evento.id}`}
      className={`group flex h-full w-full flex-col overflow-hidden rounded-2xl transition-all duration-300 hover:-translate-y-1 ${
        isDark
          ? "border border-[#222] bg-[#111] hover:border-[#444] hover:shadow-xl hover:shadow-black/30"
          : "border border-gray-200 bg-white shadow-sm hover:border-accent/25 hover:shadow-lg hover:shadow-black/5"
      }`}
    >
      <div
        className={`relative aspect-[3/4] overflow-hidden ${
          isDark ? "bg-[#0a0a0a]" : "bg-gray-100"
        }`}
      >
        {cover ? (
          <>
            <Image
              src={cover}
              alt=""
              fill
              aria-hidden
              className={`object-cover scale-110 blur-xl ${
                isDark ? "opacity-40" : "opacity-30"
              }`}
              sizes="260px"
            />
            <Image
              src={cover}
              alt={evento.evento_nombre}
              fill
              priority={priority}
              className="relative z-10 object-cover object-[center_42%] transition-transform duration-500 group-hover:scale-[1.04]"
              sizes="260px"
            />
            {evento.fotos.length > 0 && (
              <span className="absolute bottom-2.5 right-2.5 z-20 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-medium text-white backdrop-blur-sm">
                {evento.fotos.length}{" "}
                {evento.fotos.length === 1 ? "foto" : "fotos"}
              </span>
            )}
          </>
        ) : (
          <div
            className={`absolute inset-0 flex items-center justify-center text-xs ${
              isDark ? "text-[#555]" : "text-text-secondary"
            }`}
          >
            {t("messages.noCover")}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3
          className={`font-heading text-base font-semibold leading-snug line-clamp-2 transition-colors ${
            isDark
              ? "text-white group-hover:text-[#ddd]"
              : "text-primary group-hover:text-accent"
          }`}
        >
          {evento.evento_nombre}
        </h3>
        <div
          className={`mt-auto space-y-1.5 text-xs ${
            isDark ? "text-[#777]" : "text-text-secondary"
          }`}
        >
          {evento.evento_fecha && (
            <div className="flex items-center gap-1.5">
              <Calendar
                size={12}
                className={`shrink-0 ${isDark ? "text-[#555]" : "text-accent"}`}
              />
              <span>{formatDate(evento.evento_fecha)}</span>
            </div>
          )}
          {evento.evento_lugar && (
            <div className="flex items-center gap-1.5">
              <MapPin
                size={12}
                className={`shrink-0 ${isDark ? "text-[#555]" : "text-accent"}`}
              />
              <span className="line-clamp-1">{evento.evento_lugar}</span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
