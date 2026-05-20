"use client";

import Image from "next/image";
import { Calendar, MapPin } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Tournament } from "@/lib/types";

interface Photo {
  url: string;
  tournamentId: string;
  tournamentName: string;
  date: string;
  club: string;
}

interface PhotoGridProps {
  filter: string;
  onPhotoClick: (photo: Photo, index: number) => void;
  tournaments: Tournament[];
}

export function PhotoGrid({
  filter,
  onPhotoClick,
  tournaments,
}: PhotoGridProps) {
  const { t } = useTranslation("gallery");
  const { formatShortDate } = useTranslation();
  // Collect all photos from tournaments
  const allPhotos: Photo[] = tournaments.flatMap((tournament) =>
    tournament.photos.map((photo) => ({
      url: photo,
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      date: tournament.date,
      club: tournament.club,
    })),
  );

  // Filter photos
  const filteredPhotos =
    filter === "all"
      ? allPhotos
      : allPhotos.filter((photo) => photo.tournamentId === filter);

  if (filteredPhotos.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-text-secondary text-lg">{t("messages.noPhotos")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {filteredPhotos.map((photo, index) => (
        <button
          key={`${photo.tournamentId}-${index}`}
          onClick={() => onPhotoClick(photo, index)}
          className="group relative aspect-square rounded-lg overflow-hidden hover:shadow-lg transition-all duration-300"
        >
          {/* Tournament Photo */}
          <Image
            src={photo.url}
            alt={`${photo.tournamentName} - ${photo.club}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />

          {/* Overlay on Hover */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
            <h3 className="text-white font-semibold text-sm mb-2 line-clamp-2">
              {photo.tournamentName}
            </h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-white/80 text-xs">
                <MapPin size={12} />
                <span>{photo.club}</span>
              </div>
              <div className="flex items-center gap-2 text-white/80 text-xs">
                <Calendar size={12} />
                <span>{formatShortDate(photo.date)}</span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
