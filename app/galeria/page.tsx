import { GaleriaPageClient } from "@/components/gallery/GaleriaPageClient";
import { getEventos } from "@/lib/galeriaService";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Galería - Riviera Open",
  description:
    "Explora la galería de fotos por evento del circuito Riviera Open. Revive los mejores momentos.",
  keywords: ["fotos pádel", "galería torneos", "riviera open", "eventos pádel"],
  openGraph: {
    title: "Galería - Riviera Open",
    description:
      "Explora la galería de fotos por evento del circuito Riviera Open.",
  },
};

export default async function GaleriaPage() {
  const eventos = await getEventos();
  return <GaleriaPageClient eventos={eventos} />;
}
