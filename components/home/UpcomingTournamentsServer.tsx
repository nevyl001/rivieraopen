import RepositoryFactory from "@/lib/data/repositories/repository-factory";
import { UpcomingTournamentsClient } from "./UpcomingTournamentsClient";

export async function UpcomingTournamentsServer() {
  // Fetch tournaments on the server
  const tournamentRepository =
    await RepositoryFactory.getTournamentRepository();
  const allTournaments = await tournamentRepository.getAll();

  // Get upcoming tournaments (limit to 4)
  const upcomingTournaments = allTournaments
    .filter((t) => t.status === "upcoming")
    .slice(0, 4);

  return <UpcomingTournamentsClient tournaments={upcomingTournaments} />;
}
