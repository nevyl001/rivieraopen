import RepositoryFactory from "@/lib/data/repositories/repository-factory";
import { FeaturedPlayersClient } from "./FeaturedPlayersClient";

export async function FeaturedPlayersServer() {
  // Fetch players on the server
  const playerRepository = await RepositoryFactory.getPlayerRepository();
  const allPlayers = await playerRepository.getAll();

  // Get top 3 players from each category (Open, 1, 2)
  const featuredPlayers = [
    ...allPlayers.filter((p) => p.category === "Open" && p.rank <= 3),
    ...allPlayers.filter((p) => p.category === "1" && p.rank <= 2),
    ...allPlayers.filter((p) => p.category === "2" && p.rank <= 2),
  ];

  return <FeaturedPlayersClient players={featuredPlayers} />;
}
