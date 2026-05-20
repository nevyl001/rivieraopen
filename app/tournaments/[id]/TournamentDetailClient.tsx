"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Container, Badge, Card } from "@/components/ui";
import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  ArrowLeft,
  Medal,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useTranslation } from "@/lib/hooks/useTranslation";
import { Tournament, Player } from "@/lib/types";

interface TournamentDetailClientProps {
  tournament: Tournament;
  participants: Player[];
}

export function TournamentDetailClient({
  tournament,
  participants,
}: TournamentDetailClientProps) {
  const { t } = useTranslation("tournaments");
  const { t: tCommon } = useTranslation("common");
  const { formatDate } = useTranslation();
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState<number | null>(
    null,
  );

  // Handle keyboard navigation for modal
  React.useEffect(() => {
    if (selectedPhotoIndex === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedPhotoIndex(null);
      if (e.key === "ArrowLeft") handlePreviousPhoto();
      if (e.key === "ArrowRight") handleNextPhoto();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedPhotoIndex]);

  // Prevent body scroll when modal is open
  React.useEffect(() => {
    if (selectedPhotoIndex !== null) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [selectedPhotoIndex]);

  const handlePreviousPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) =>
      prev === 0 ? tournament.photos.length - 1 : prev! - 1,
    );
  };

  const handleNextPhoto = () => {
    if (selectedPhotoIndex === null) return;
    setSelectedPhotoIndex((prev) =>
      prev === tournament.photos.length - 1 ? 0 : prev! + 1,
    );
  };

  const getStatusVariant = (
    status: "upcoming" | "in-progress" | "completed",
  ) => {
    switch (status) {
      case "upcoming":
        return "success";
      case "in-progress":
        return "warning";
      case "completed":
        return "default";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: "upcoming" | "in-progress" | "completed") => {
    switch (status) {
      case "upcoming":
        return t("status.upcoming");
      case "in-progress":
        return t("status.inProgress");
      case "completed":
        return t("status.completed");
      default:
        return status;
    }
  };

  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <Container>
        {/* Back Link */}
        <Link
          href="/tournaments"
          className="inline-flex items-center gap-2 text-accent hover:text-accent-hover mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Volver a Torneos
        </Link>

        {/* Tournament Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-4">
            <div>
              <h1 className="font-heading text-4xl md:text-5xl font-bold text-black mb-2">
                {tournament.name}
              </h1>
              <Badge variant={getStatusVariant(tournament.status)}>
                {getStatusLabel(tournament.status)}
              </Badge>
            </div>
          </div>

          {/* Tournament Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card>
              <div className="flex items-center gap-3">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <Calendar size={24} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Fecha</p>
                  <p className="font-semibold text-black">
                    {formatDate(tournament.date)}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <MapPin size={24} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Ubicación</p>
                  <p className="font-semibold text-black">{tournament.club}</p>
                  <p className="text-sm text-text-secondary">
                    {tournament.location}
                  </p>
                </div>
              </div>
            </Card>

            <Card>
              <div className="flex items-center gap-3">
                <div className="bg-accent/10 p-3 rounded-lg">
                  <Users size={24} className="text-accent" />
                </div>
                <div>
                  <p className="text-sm text-text-secondary">Categorías</p>
                  <p className="font-semibold text-black">
                    {tournament.categories.map((c) => c.category).join(", ")}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {tournament.genre === "Open" ? "Abierto" : "Femenino"}
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Description */}
        {tournament.description && (
          <Card className="mb-8">
            <h2 className="font-heading text-2xl font-semibold text-black mb-4">
              Acerca de este Torneo
            </h2>
            <p className="text-text-secondary leading-relaxed">
              {tournament.description}
            </p>
          </Card>
        )}

        {/* Results Section */}
        {tournament.status === "completed" &&
          tournament.categories.some((c) => c.results) && (
            <Card className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <Trophy size={28} className="text-accent" />
                <h2 className="font-heading text-2xl font-semibold text-black">
                  Resultados del Torneo
                </h2>
              </div>

              {tournament.categories.map(
                (category) =>
                  category.results && (
                    <div key={category.category} className="mb-6 last:mb-0">
                      <h3 className="font-heading text-xl font-semibold text-black mb-4">
                        Categoría {category.category}
                      </h3>
                      <div className="space-y-4">
                        {/* First Place */}
                        <Link
                          href={`/players/${category.results.first.playerId}`}
                        >
                          <div className="flex items-center gap-4 p-4 bg-accent/5 rounded-lg hover:bg-accent/10 transition-colors">
                            <div className="bg-accent text-primary w-16 h-16 rounded-full flex items-center justify-center shrink-0">
                              <Medal size={32} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-text-secondary mb-1">
                                1er Lugar
                              </p>
                              <p className="font-heading text-xl font-semibold text-black">
                                {category.results.first.playerName}
                              </p>
                            </div>
                            <Trophy size={24} className="text-accent" />
                          </div>
                        </Link>

                        {/* Second Place */}
                        <Link
                          href={`/players/${category.results.second.playerId}`}
                        >
                          <div className="flex items-center gap-4 p-4 bg-surface rounded-lg hover:bg-accent/5 transition-colors">
                            <div className="bg-text-secondary text-white w-16 h-16 rounded-full flex items-center justify-center shrink-0">
                              <Medal size={32} />
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-text-secondary mb-1">
                                2do Lugar
                              </p>
                              <p className="font-heading text-xl font-semibold text-black">
                                {category.results.second.playerName}
                              </p>
                            </div>
                          </div>
                        </Link>
                      </div>
                    </div>
                  ),
              )}
            </Card>
          )}

        {/* Registration Info for Upcoming */}
        {tournament.status === "upcoming" && (
          <Card className="mb-8">
            <h2 className="font-heading text-2xl font-semibold text-black mb-4">
              Registro
            </h2>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-text-secondary mb-2">Estado del Registro</p>
                <Badge
                  variant={tournament.registrationOpen ? "success" : "default"}
                >
                  {tournament.registrationOpen
                    ? tCommon("status.registrationOpen")
                    : tCommon("status.registrationClosed")}
                </Badge>
              </div>
              {tournament.registrationOpen && (
                <p className="text-sm text-text-secondary">
                  Contáctanos para registrarte en este torneo
                </p>
              )}
            </div>
          </Card>
        )}

        {/* Participants */}
        {participants.length > 0 && (
          <Card className="mb-8">
            <h2 className="font-heading text-2xl font-semibold text-black mb-6">
              Participantes
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {participants.map((player) => (
                <Link
                  key={player.id}
                  href={`/players/${player.id}`}
                  className="flex items-center gap-3 p-3 bg-surface rounded-lg hover:bg-accent/10 transition-colors"
                >
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-accent font-bold">
                    {player.firstName[0]}
                    {player.lastName[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-black">
                      {player.firstName} {player.lastName}
                    </p>
                    <p className="text-sm text-text-secondary">
                      Categoría {player.category}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </Card>
        )}

        {/* Photo Gallery */}
        {tournament.status === "completed" && tournament.photos.length > 0 && (
          <Card>
            <h2 className="font-heading text-2xl font-semibold text-black mb-6">
              Galería de Fotos
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {tournament.photos.map((photo, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedPhotoIndex(index)}
                  className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 group cursor-pointer"
                >
                  <Image
                    src={photo}
                    alt={`${tournament.name} - Foto ${index + 1}`}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 50vw, 33vw"
                  />
                </button>
              ))}
            </div>
          </Card>
        )}

        {/* Photo Modal */}
        {selectedPhotoIndex !== null && tournament && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90">
            {/* Close Button */}
            <button
              onClick={() => setSelectedPhotoIndex(null)}
              className="absolute top-4 right-4 p-2 text-white hover:bg-white/10 rounded-full transition-colors z-10"
              aria-label="Cerrar"
            >
              <X size={32} />
            </button>

            {/* Previous Button */}
            <button
              onClick={handlePreviousPhoto}
              className="absolute left-4 p-3 text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Anterior"
            >
              <ChevronLeft size={32} />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNextPhoto}
              className="absolute right-4 p-3 text-white hover:bg-white/10 rounded-full transition-colors"
              aria-label="Siguiente"
            >
              <ChevronRight size={32} />
            </button>

            {/* Photo Container */}
            <div className="max-w-6xl max-h-[90vh] w-full mx-4 flex flex-col">
              {/* Photo */}
              <div className="flex-1 flex items-center justify-center mb-4">
                <div className="relative w-full max-w-4xl aspect-video rounded-lg overflow-hidden">
                  <img
                    src={tournament.photos[selectedPhotoIndex]}
                    alt={`${tournament.name} - Foto ${selectedPhotoIndex + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>

              {/* Caption */}
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-start justify-between gap-4 mb-2">
                  <h3 className="text-white font-heading text-xl font-semibold">
                    {tournament.name}
                  </h3>
                  <span className="text-white/60 text-sm shrink-0">
                    {selectedPhotoIndex + 1} / {tournament.photos.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-4 text-white/80 text-sm">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{tournament.club}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar size={14} />
                    <span>{formatDate(tournament.date)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Backdrop Click to Close */}
            <div
              className="absolute inset-0 -z-10"
              onClick={() => setSelectedPhotoIndex(null)}
              aria-label="Cerrar"
            />
          </div>
        )}
      </Container>
    </div>
  );
}
