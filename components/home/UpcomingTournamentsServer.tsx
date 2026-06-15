import RepositoryFactory from "@/lib/data/repositories/repository-factory";
import { UpcomingTournamentsClient } from "./UpcomingTournamentsClient";

export async function UpcomingTournamentsServer() {
  try {
    const tournamentRepository =
      await RepositoryFactory.getTournamentRepository();
    const allTournaments = await tournamentRepository.getAll();

    const featuredTournaments = [...allTournaments]
      .sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      )
      .slice(0, 4);

    return <UpcomingTournamentsClient tournaments={featuredTournaments} />;
  } catch (error) {
    console.error("UpcomingTournamentsServer:", error);
    return <UpcomingTournamentsClient tournaments={[]} />;
  }
}
