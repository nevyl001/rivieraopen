import RepositoryFactory from "@/lib/data/repositories/repository-factory";
import { parseDateInput } from "@/lib/i18n/formatters";
import { UpcomingTournamentsClient } from "./UpcomingTournamentsClient";

export async function UpcomingTournamentsServer() {
  try {
    const tournamentRepository =
      await RepositoryFactory.getTournamentRepository();
    const allTournaments = await tournamentRepository.getAll();

    const featuredTournaments = [...allTournaments]
      .sort(
        (a, b) =>
          parseDateInput(a.date).getTime() - parseDateInput(b.date).getTime(),
      )
      .slice(0, 4);

    return <UpcomingTournamentsClient tournaments={featuredTournaments} />;
  } catch (error) {
    console.error("UpcomingTournamentsServer:", error);
    return <UpcomingTournamentsClient tournaments={[]} />;
  }
}
