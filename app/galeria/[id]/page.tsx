import { notFound } from "next/navigation";
import { GaleriaEventPageClient } from "@/components/gallery/GaleriaEventPageClient";
import { getEventoById } from "@/lib/galeriaService";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface GaleriaEventPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({
  params,
}: GaleriaEventPageProps): Promise<Metadata> {
  const { id } = await params;
  const evento = await getEventoById(id);

  if (!evento) {
    return { title: "Evento no encontrado - Riviera Open" };
  }

  return {
    title: `${evento.evento_nombre} - Galería Riviera Open`,
    description: `Fotos del evento ${evento.evento_nombre} en Riviera Open.`,
    openGraph: {
      title: `${evento.evento_nombre} - Galería Riviera Open`,
      images: evento.portada_url ? [evento.portada_url] : undefined,
    },
  };
}

export default async function GaleriaEventPage({ params }: GaleriaEventPageProps) {
  const { id } = await params;
  const evento = await getEventoById(id);

  if (!evento) {
    notFound();
  }

  return <GaleriaEventPageClient evento={evento} />;
}
