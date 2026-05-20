"use client";

import { useEffect } from "react";
import { X, ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface Photo {
  url: string;
  tournamentId: string;
  tournamentName: string;
  date: string;
  club: string;
}

interface PhotoModalProps {
  photo: Photo;
  isOpen: boolean;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
  currentIndex: number;
  totalPhotos: number;
}

export function PhotoModal({
  photo,
  isOpen,
  onClose,
  onPrevious,
  onNext,
  currentIndex,
  totalPhotos,
}: PhotoModalProps) {
  const { t } = useTranslation("gallery");
  const { formatDate } = useTranslation();
  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrevious();
      if (e.key === "ArrowRight") onNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose, onPrevious, onNext]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-10"
        aria-label={t("navigation.close")}
      >
        <X size={32} />
      </button>

      {/* Previous Button */}
      <button
        onClick={onPrevious}
        className="absolute left-4 p-3 text-white hover:bg-white/10 rounded-full transition-colors"
        aria-label={t("navigation.previous")}
      >
        <ChevronLeft size={32} />
      </button>

      {/* Next Button */}
      <button
        onClick={onNext}
        className="absolute right-4 p-3 text-white hover:bg-white/10 rounded-full transition-colors"
        aria-label={t("navigation.next")}
      >
        <ChevronRight size={32} />
      </button>

      {/* Photo Container */}
      <div className="max-w-6xl max-h-[90vh] w-full mx-4 flex flex-col">
        {/* Photo */}
        <div className="flex-1 flex items-center justify-center mb-4">
          <div className="relative w-full max-w-4xl aspect-video rounded-lg overflow-hidden">
            <img
              src={photo.url}
              alt={photo.tournamentName}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Caption */}
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-start justify-between gap-4 mb-2">
            <h3 className="text-white font-heading text-xl font-semibold">
              {photo.tournamentName}
            </h3>
            <span className="text-white/60 text-sm shrink-0">
              {currentIndex + 1} / {totalPhotos}
            </span>
          </div>
          <div className="flex flex-wrap gap-4 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <MapPin size={14} />
              <span>{photo.club}</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar size={14} />
              <span>{formatDate(photo.date)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Backdrop Click to Close */}
      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-label={t("navigation.close")}
      />
    </div>
  );
}
