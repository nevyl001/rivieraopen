import { getJugadoresDestacados } from "@/lib/rankingService";
import { FeaturedPlayersClient } from "./FeaturedPlayersClient";

export async function FeaturedPlayersServer() {
  try {
    const featuredPlayers = await getJugadoresDestacados();
    return <FeaturedPlayersClient players={featuredPlayers} />;
  } catch (error) {
    console.error("FeaturedPlayersServer:", error);
    return <FeaturedPlayersClient players={[]} />;
  }
}
