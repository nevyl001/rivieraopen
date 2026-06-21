import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui";
import { PlayerProfile, PlayerPersonalInfo } from "@/components/players/PlayerProfile";
import { PlayerStatsGrid } from "@/components/players/PlayerStatsGrid";
import { PlayerHistorySection } from "@/components/players/PlayerHistorySection";
import { PlayerRivalsSection } from "@/components/players/PlayerRivalsSection";
import { PlayerSeasonChart } from "@/components/players/PlayerSeasonChart";
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
    description: `Jugador oficial de Riviera Open. Ranking #${player.rank} con ${player.points} puntos.`,
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

  const hasPersonalInfo = Boolean(
    player.age ||
      player.manoDominante ||
      player.enCancha ||
      player.paisCodigo?.trim(),
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-32 pb-16">
      <Container size="md">
        <Link
          href="/rankings"
          className="mb-8 inline-flex items-center gap-2 rounded-lg border border-[#333] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:border-[#555] hover:bg-[#111]"
        >
          <ArrowLeft size={18} className="text-white" />
          Volver a Rankings
        </Link>

        <div className="space-y-6">
          <PlayerProfile player={player} />

          <PlayerSeasonChart timeline={player.seasonTimeline ?? { season: 2026, points: [] }} />

          <div
            className={`grid grid-cols-1 gap-6 border-t border-[#222] pt-6 ${
              hasPersonalInfo ? "lg:grid-cols-2 lg:items-start" : ""
            }`}
          >
            {hasPersonalInfo && <PlayerPersonalInfo player={player} />}
            <div className={hasPersonalInfo ? "" : "lg:col-span-2"}>
              <PlayerStatsGrid player={player} />
            </div>
          </div>

          <PlayerHistorySection events={player.historyEvents ?? []} />

          <PlayerRivalsSection rivals={player.rivals ?? []} />
        </div>
      </Container>
    </div>
  );
}
