import RepositoryFactory from "@/lib/data/repositories/repository-factory";
import { UpcomingTournamentsClient } from "./UpcomingTournamentsClient";

export async function UpcomingTournamentsServer() {
  try {
    const tournamentRepository =
      await RepositoryFactory.getTournamentRepository();
    const allTournaments = await tournamentRepository.getAll();

    const upcomingTournaments = allTournaments
      .filter((t) => t.status === "upcoming")
      .slice(0, 4);

    return <UpcomingTournamentsClient tournaments={upcomingTournaments} />;
  } catch (error) {
    console.error("UpcomingTournamentsServer:", error);
    return <UpcomingTournamentsClient tournaments={[]} />;
  }
}
