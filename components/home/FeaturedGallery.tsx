"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, Container } from "@/components/ui";
import { AnimatedSection } from "@/components/ui/AnimatedSection";
import { PhotoModal } from "@/components/gallery/PhotoModal";
import { useTranslation } from "@/lib/hooks/useTranslation";

export function FeaturedGallery() {
  const { t } = useTranslation("gallery");
  const { t: tCommon } = useTranslation("common");
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  // Featured gallery images - showing first 8 from the collection
  const featuredImages = [
    {
      id: 1,
      url: "/img/gallery/gallery-1.jpg",
      tournamentName: "Tournament action shot",
      tournamentId: "featured-1",
      date: "2024-12-01",
      club: "Riviera Open",
    },
    {
      id: 2,
      url: "/img/gallery/gallery-2.jpg",
      tournamentName: "Players celebrating victory",
      tournamentId: "featured-2",
      date: "2024-12-01",
      club: "Riviera Open",
    },
    {
      id: 3,
      url: "/img/gallery/gallery-3.jpg",
      tournamentName: "Padel court aerial view",
      tournamentId: "featured-3",
      date: "2024-12-01",
      club: "Riviera Open",
    },
    {
      id: 4,
      url: "/img/gallery/gallery-4.jpg",
      tournamentName: "Championship trophy presentation",
      tournamentId: "featured-4",
      date: "2024-12-01",
      club: "Riviera Open",
    },
    {
      id: 5,
      url: "/img/gallery/gallery-5.jpg",
      tournamentName: "Intense match moment",
      tournamentId: "featured-5",
      date: "2024-12-01",
      club: "Riviera Open",
    },
    {
      id: 6,
      url: "/img/gallery/gallery-6.jpg",
      tournamentName: "Professional padel players",
      tournamentId: "featured-6",
      date: "2024-12-01",
      club: "Riviera Open",
    },
    {
      id: 7,
      url: "/img/gallery/gallery-7.jpg",
      tournamentName: "Tournament venue overview",
      tournamentId: "featured-7",
      date: "2024-12-01",
      club: "Riviera Open",
    },
    {
      id: 8,
      url: "/img/gallery/gallery-8.jpg",
      tournamentName: "Victory celebration",
      tournamentId: "featured-8",
      date: "2024-12-01",
      club: "Riviera Open",
    },
  ];

  const handlePhotoClick = (photo: any, index: number) => {
    setSelectedPhoto(photo);
    setSelectedIndex(index);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedPhoto(null);
  };

  const handlePrevious = () => {
    const newIndex =
      selectedIndex > 0 ? selectedIndex - 1 : featuredImages.length - 1;
    setSelectedIndex(newIndex);
    setSelectedPhoto(featuredImages[newIndex]);
  };

  const handleNext = () => {
    const newIndex =
      selectedIndex < featuredImages.length - 1 ? selectedIndex + 1 : 0;
    setSelectedIndex(newIndex);
    setSelectedPhoto(featuredImages[newIndex]);
  };

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
              Revive la emoción y los momentos memorables de nuestros torneos.
            </p>
          </AnimatedSection>
        </AnimatedSection>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 mb-12">
          {featuredImages.map((image, index) => (
            <AnimatedSection
              key={image.id}
              delay={400 + index * 100}
              className="aspect-video"
            >
              <button
                onClick={() => handlePhotoClick(image, index)}
                className="relative w-full h-full overflow-hidden group cursor-pointer"
              >
                <Image
                  src={image.url}
                  alt={image.tournamentName}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </button>
            </AnimatedSection>
          ))}
        </div>

        <AnimatedSection delay={1200} className="text-center">
          <Link href="/gallery">
            <Button variant="secondary">{t("navigation.viewAll")}</Button>
          </Link>
        </AnimatedSection>
      </Container>

      {/* Photo Modal */}
      {selectedPhoto && (
        <PhotoModal
          photo={selectedPhoto}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onPrevious={handlePrevious}
          onNext={handleNext}
          currentIndex={selectedIndex}
          totalPhotos={featuredImages.length}
        />
      )}
    </section>
  );
}
