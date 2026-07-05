import { notFound } from "next/navigation";
import { PlayerPublicPage } from "@/components/players/PlayerPublicPage";
import { getJugadorPublico } from "@/lib/playerService";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PlayerPageProps {
  params: Promise<{
    rivieraId: string;
  }>;
}

export async function generateMetadata({
  params,
}: PlayerPageProps): Promise<Metadata> {
  const { rivieraId } = await params;
  const player = await getJugadorPublico(rivieraId);

  if (!player) {
    return {
      title: "Jugador no encontrado - Riviera Open",
    };
  }

  const fullName = `${player.firstName} ${player.lastName}`.trim();
  const passportTitle = player.passport?.rivieraId
    ? `${fullName} | ${player.passport.rivieraId}`
    : `${fullName} - Riviera Open`;

  const metadata: Metadata = {
    title: passportTitle,
    description: `Carrera deportiva oficial de ${fullName}. Ranking #${player.rank} con ${player.points} puntos Riviera.`,
    keywords: [
      "jugador pádel",
      fullName,
      player.passport?.rivieraId ?? "",
      "riviera open",
      "riviera player passport",
    ],
    openGraph: {
      title: passportTitle,
      description: `Ranking #${player.rank} · ${player.points} pts · Carrera Deportiva Riviera`,
      images: player.photo.startsWith("http") ? [player.photo] : undefined,
    },
  };

  if (player.passport?.canonicalProfileUrl) {
    metadata.alternates = {
      canonical: player.passport.canonicalProfileUrl,
    };
    metadata.openGraph = {
      ...metadata.openGraph,
      url: player.passport.canonicalProfileUrl,
    };
  }

  return metadata;
}

export default async function CanonicalPlayerPage({ params }: PlayerPageProps) {
  const { rivieraId } = await params;
  const player = await getJugadorPublico(rivieraId);

  if (!player) {
    notFound();
  }

  return <PlayerPublicPage player={player} />;
}
