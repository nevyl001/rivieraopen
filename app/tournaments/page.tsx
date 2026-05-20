import { TournamentsPageClient } from "./TournamentsPageClient";
import RepositoryFactory from "@/lib/data/repositories/repository-factory";
import type { Metadata } from "next";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tournaments - Riviera Open",
  description:
    "Browse all Riviera Open padel tournaments - upcoming, in-progress, and completed events.",
  keywords: [
    "padel tournaments",
    "riviera open",
    "tournament schedule",
    "padel events",
  ],
  openGraph: {
    title: "Tournaments - Riviera Open",
    description:
      "Browse all Riviera Open padel tournaments - upcoming, in-progress, and completed events.",
  },
};

export default async function TournamentsPage() {
  // Fetch tournaments on the server
  const tournamentRepository =
    await RepositoryFactory.getTournamentRepository();
  const tournaments = await tournamentRepository.getAll();

  return <TournamentsPageClient initialTournaments={tournaments} />;
}
