import RepositoryFactory from "@/lib/data/repositories/repository-factory";
import { FeaturedPlayersClient } from "./FeaturedPlayersClient";

export async function FeaturedPlayersServer() {
  try {
    const playerRepository = await RepositoryFactory.getPlayerRepository();
    const allPlayers = await playerRepository.getAll();

    const featuredPlayers = [
      ...allPlayers.filter((p) => p.category === "Open" && p.rank <= 3),
      ...allPlayers.filter((p) => p.category === "1" && p.rank <= 2),
      ...allPlayers.filter((p) => p.category === "2" && p.rank <= 2),
    ];

    return <FeaturedPlayersClient players={featuredPlayers} />;
  } catch (error) {
    console.error("FeaturedPlayersServer:", error);
    return <FeaturedPlayersClient players={[]} />;
  }
}
