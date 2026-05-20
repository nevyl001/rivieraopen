import { notFound } from "next/navigation";
import Link from "next/link";
import { Container } from "@/components/ui";
import { PlayerProfile } from "@/components/players/PlayerProfile";
import { TournamentHistory } from "@/components/players/TournamentHistory";
import RepositoryFactory from "@/lib/data/repositories/repository-factory";
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
  const playerRepository = await RepositoryFactory.getPlayerRepository();
  const player = await playerRepository.getById(id);

  if (!player) {
    return {
      title: "Player Not Found - Riviera Open",
    };
  }

  return {
    title: `${player.firstName} ${player.lastName} - Riviera Open`,
    description: `View the profile and tournament history of ${player.firstName} ${player.lastName}, ranked #${player.rank} in Category ${player.category} with ${player.points} points.`,
    keywords: [
      "padel player",
      `${player.firstName} ${player.lastName}`,
      `category ${player.category}`,
      "riviera open",
    ],
    openGraph: {
      title: `${player.firstName} ${player.lastName} - Riviera Open`,
      description: `Ranked #${player.rank} in Category ${player.category} with ${player.points} points.`,
    },
  };
}

export default async function PlayerPage({ params }: PlayerPageProps) {
  const { id } = await params;
  const playerRepository = await RepositoryFactory.getPlayerRepository();
  const player = await playerRepository.getById(id);

  if (!player) {
    notFound();
  }

  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <Container>
        {/* Back Link */}
        <Link
          href="/rankings"
          className="inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Rankings
        </Link>

        {/* Player Profile */}
        <div className="mb-8">
          <PlayerProfile player={player} />
        </div>

        {/* Tournament History */}
        <TournamentHistory player={player} />
      </Container>
    </div>
  );
}
