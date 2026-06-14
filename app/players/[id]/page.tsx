import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui";
import { PlayerProfile } from "@/components/players/PlayerProfile";
import { PlayerStatsGrid } from "@/components/players/PlayerStatsGrid";
import { PlayerActivitySummary } from "@/components/players/PlayerActivitySummary";
import { getJugadorPublico } from "@/lib/playerService";
import { ArrowLeft } from "lucide-react";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PlayerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: PlayerPageProps): Promise<Metadata> {
  const { id } = await params;
  const player = await getJugadorPublico(id);

  if (!player) {
    return {
      title: "Jugador no encontrado - Riviera Open",
    };
  }

  const fullName = `${player.firstName} ${player.lastName}`.trim();

  return {
    title: `${fullName} - Riviera Open`,
    description: `Perfil y estadísticas de ${fullName}. Ranking #${player.rank} en Categoría ${player.category} con ${player.points} puntos.`,
    keywords: [
      "jugador pádel",
      fullName,
      `categoría ${player.category}`,
      "riviera open",
    ],
    openGraph: {
      title: `${fullName} - Riviera Open`,
      description: `Ranking #${player.rank} en Categoría ${player.category} con ${player.points} puntos.`,
      images: player.photo.startsWith("http") ? [player.photo] : undefined,
    },
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = await params;
  const player = await getJugadorPublico(id);

  if (!player) {
    notFound();
  }

  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <Container>
        <Link
          href="/rankings"
          className="inline-flex items-center gap-2 text-text-secondary hover:text-primary mb-8 transition-colors font-medium"
        >
          <ArrowLeft size={20} />
          Volver a Rankings
        </Link>

        <div className="space-y-6">
          <PlayerProfile player={player} />
          <PlayerStatsGrid player={player} />
          <PlayerActivitySummary player={player} />
        </div>
      </Container>
    </div>
  );
}
