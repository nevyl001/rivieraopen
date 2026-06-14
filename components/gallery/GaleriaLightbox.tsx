"use client";

import { useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";

interface GaleriaLightboxProps {
  photos: string[];
  currentIndex: number;
  isOpen: boolean;
  eventName: string;
  onClose: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

export function GaleriaLightbox({
  photos,
  currentIndex,
  isOpen,
  eventName,
  onClose,
  onPrevious,
  onNext,
}: GaleriaLightboxProps) {
  const { t } = useTranslation("gallery");

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

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-10"
        aria-label={t("navigation.close")}
      >
        <X size={32} />
      </button>

      {photos.length > 1 && (
        <>
          <button
            onClick={onPrevious}
            className="absolute left-4 p-3 text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label={t("navigation.previous")}
          >
            <ChevronLeft size={32} />
          </button>
          <button
            onClick={onNext}
            className="absolute right-4 p-3 text-white hover:bg-white/10 rounded-full transition-colors"
            aria-label={t("navigation.next")}
          >
            <ChevronRight size={32} />
          </button>
        </>
      )}

      <div className="max-w-6xl max-h-[90vh] w-full mx-4 flex flex-col">
        <div className="flex-1 flex items-center justify-center mb-4 min-h-0">
          <div className="relative w-full h-[70vh] max-h-[80vh]">
            <Image
              src={currentPhoto}
              alt={`${eventName} - ${currentIndex + 1}`}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
          <div className="flex items-center justify-between gap-4">
            <h3 className="text-white font-heading text-xl font-semibold">
              {eventName}
            </h3>
            <span className="text-white/60 text-sm shrink-0">
              {currentIndex + 1} / {photos.length}
            </span>
          </div>
        </div>
      </div>

      <div
        className="absolute inset-0 -z-10"
        onClick={onClose}
        aria-hidden
      />
    </div>
  );
}
