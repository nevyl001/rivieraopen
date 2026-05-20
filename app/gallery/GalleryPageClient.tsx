"use client";

import { useState } from "react";
import { Container } from "@/components/ui";
import { PhotoGrid } from "@/components/gallery/PhotoGrid";
import { PhotoModal } from "@/components/gallery/PhotoModal";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Tournament } from "@/lib/types";

interface Photo {
  url: string;
  tournamentId: string;
  tournamentName: string;
  date: string;
  club: string;
}

interface GalleryPageClientProps {
  tournaments: Tournament[];
}

export function GalleryPageClient({ tournaments }: GalleryPageClientProps) {
  const { t } = useTranslation("gallery");
  const [filter, setFilter] = useState("all");
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Collect all photos
  const allPhotos: Photo[] = tournaments.flatMap((tournament) =>
    tournament.photos.map((photo) => ({
      url: photo,
      tournamentId: tournament.id,
      tournamentName: tournament.name,
      date: tournament.date,
      club: tournament.club,
    })),
  );

  // Get filtered photos for navigation
  const filteredPhotos =
    filter === "all"
      ? allPhotos
      : allPhotos.filter((photo) => photo.tournamentId === filter);

  const handlePhotoClick = (photo: Photo, index: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
  };

  const handleClose = () => {
    setSelectedPhoto(null);
  };

  const handlePrevious = () => {
    const newIndex =
      (selectedIndex - 1 + filteredPhotos.length) % filteredPhotos.length;
    setSelectedIndex(newIndex);
    setSelectedPhoto(filteredPhotos[newIndex]);
  };

  const handleNext = () => {
    const newIndex = (selectedIndex + 1) % filteredPhotos.length;
    setSelectedIndex(newIndex);
    setSelectedPhoto(filteredPhotos[newIndex]);
  };

  // Get tournaments with photos for filter
  const tournamentsWithPhotos = tournaments.filter((t) => t.photos.length > 0);

  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <Container>
        {/* Page Header */}
        <div className="text-center mb-12">
          <h1 className="font-heading text-5xl font-bold text-black mb-4">
            {t("labels.photoGallery")}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Explora la galería de fotos de los torneos y eventos del circuito
            Riviera Open. Revive los mejores momentos.
          </p>
        </div>

        {/* Filter */}
        <div className="mb-8">
          <label className="block text-sm font-medium text-black mb-2">
            {t("labels.filterPhotos")}
          </label>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-3 pr-12 bg-white border border-gray-300 rounded-full font-medium text-black focus:outline-none focus:ring-2 focus:ring-accent"
          >
            <option value="all">{t("filters.all")}</option>
            {tournamentsWithPhotos.map((tournament) => (
              <option key={tournament.id} value={tournament.id}>
                {tournament.name}
              </option>
            ))}
          </select>
        </div>

        {/* Photo Count */}
        <div className="mb-6">
          <p className="text-gray-600">
            Mostrando {filteredPhotos.length} foto
            {filteredPhotos.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Photo Grid */}
        <PhotoGrid
          filter={filter}
          onPhotoClick={handlePhotoClick}
          tournaments={tournaments}
        />

        {/* Photo Modal */}
        {selectedPhoto && (
          <PhotoModal
            photo={selectedPhoto}
            isOpen={!!selectedPhoto}
            onClose={handleClose}
            onPrevious={handlePrevious}
            onNext={handleNext}
            currentIndex={selectedIndex}
            totalPhotos={filteredPhotos.length}
          />
        )}
      </Container>
    </div>
  );
}
