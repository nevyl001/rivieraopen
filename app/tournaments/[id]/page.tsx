import { notFound } from "next/navigation";
import RepositoryFactory from "@/lib/data/repositories/repository-factory";
import { TournamentDetailClient } from "./TournamentDetailClient";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

interface TournamentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: TournamentPageProps): Promise<Metadata> {
  const { id } = await params;
  const tournamentRepository =
    await RepositoryFactory.getTournamentRepository();
  const tournament = await tournamentRepository.getById(id);

  if (!tournament) {
    return {
      title: "Tournament Not Found - Riviera Open",
    };
  }

  return {
    title: `${tournament.name} - Riviera Open`,
    description: tournament.description || `Details for ${tournament.name}`,
    keywords: [
      "padel tournament",
      tournament.name,
      tournament.location,
      "riviera open",
    ],
    openGraph: {
      title: `${tournament.name} - Riviera Open`,
      description: tournament.description || `Details for ${tournament.name}`,
    },
  };
}

export default async function TournamentPage({ params }: TournamentPageProps) {
  const { id } = await params;

  // Fetch tournament and players on the server
  const tournamentRepository =
    await RepositoryFactory.getTournamentRepository();
  const playerRepository = await RepositoryFactory.getPlayerRepository();

  const tournament = await tournamentRepository.getById(id);

  if (!tournament) {
    notFound();
  }

  // Get all players to find participants
  const allPlayers = await playerRepository.getAll();
  const participants = allPlayers.filter((player) =>
    player.tournamentResults.some((result) => result.tournamentId === id),
  );

  return (
    <TournamentDetailClient
      tournament={tournament}
      participants={participants}
    />
  );
}
