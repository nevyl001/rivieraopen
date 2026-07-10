import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { PlayerPublicPage } from "@/components/players/PlayerPublicPage";
import {
  fetchPublicJugadorIdForRivieraId,
  getPublicRivieraIdForJugador,
} from "@/lib/playerPassportIdentityService";
import { buildCanonicalPlayerProfileUrl } from "@/lib/playerPassportUrls";
import { getJugadorPublico } from "@/lib/playerService";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PlayerPageProps {
  params: Promise<{
    id: string;
  }>;
}

const resolveLegacyPlayerRedirect = cache(
  async (jugadorId: string): Promise<string | null> => {
    const rivieraId = await getPublicRivieraIdForJugador(jugadorId);
    if (!rivieraId) return null;

    const resolvedId = await fetchPublicJugadorIdForRivieraId(rivieraId);
    if (resolvedId !== jugadorId) return null;

    return rivieraId;
  }
);

async function loadPlayerMetadata(profileParam: string): Promise<Metadata> {
  const player = await getJugadorPublico(profileParam);

  if (!player) {
    return {
      title: "Jugador no encontrado - Riviera Open",
    };
  }

  const fullName = `${player.firstName} ${player.lastName}`.trim();
  const passportTitle = player.passport?.rivieraId
    ? `${fullName} | Riviera Player Passport`
    : `${fullName} - Riviera Open`;

  const metadata: Metadata = {
    title: passportTitle,
    description: `Carrera deportiva oficial de ${fullName}. Ranking #${player.rank} con ${player.points} puntos Riviera.`,
    keywords: [
      "jugador pádel",
      fullName,
      `categoría ${player.category}`,
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

export async function generateMetadata({
  params,
}: PlayerPageProps): Promise<Metadata> {
  const { id } = await params;
  const redirectRivieraId = await resolveLegacyPlayerRedirect(id);

  if (redirectRivieraId) {
    const canonicalUrl = buildCanonicalPlayerProfileUrl(redirectRivieraId);
    return {
      title: "Riviera Open",
      ...(canonicalUrl
        ? {
            alternates: {
              canonical: canonicalUrl,
            },
          }
        : {}),
    };
  }

  return loadPlayerMetadata(id);
}

export default async function LegacyPlayerPage({ params }: PlayerPageProps) {
  const { id } = await params;
  const redirectRivieraId = await resolveLegacyPlayerRedirect(id);

  if (redirectRivieraId) {
    redirect(`/player/${redirectRivieraId}`);
  }

  const player = await getJugadorPublico(id);

  if (!player) {
    notFound();
  }

  return <PlayerPublicPage player={player} />;
}
