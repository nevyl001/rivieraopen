import { MetadataRoute } from "next";
import { tournaments } from "@/lib/data/mock/tournaments";
import { loadPlayerPassportIdentity } from "@/lib/playerPassportIdentityService";
import { resolveShareProfileUrl } from "@/lib/playerPassportUrls";
import { getRankingPublico } from "@/lib/rankingService";
import { Category, Gender } from "@/lib/types";

const RANKING_CATEGORIES: Category[] = ["Open", "1", "2", "3", "4", "5", "6"];
const RANKING_GENDERS: Gender[] = ["Male", "Female"];

async function listPublicPlayersForSitemap(): Promise<string[]> {
  const playerIds = new Set<string>();

  for (const category of RANKING_CATEGORIES) {
    for (const gender of RANKING_GENDERS) {
      const players = await getRankingPublico(category, gender);
      for (const player of players) {
        playerIds.add(player.id);
      }
    }
  }

  return [...playerIds];
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://rivieraopen.com";

  // Static pages
  const staticPages = [
    "",
    "/tournaments",
    "/rankings",
    "/gallery",
    "/contact",
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Tournament pages
  const tournamentPages = tournaments.map((tournament) => ({
    url: `${baseUrl}/tournaments/${tournament.id}`,
    lastModified: new Date(tournament.date),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const publicPlayerIds = await listPublicPlayersForSitemap();
  const playerPages = await Promise.all(
    publicPlayerIds.map(async (playerId) => {
      const identity = await loadPlayerPassportIdentity(playerId);
      return {
        url: resolveShareProfileUrl(playerId, identity.rivieraId),
        lastModified: new Date(),
        changeFrequency: "monthly" as const,
        priority: 0.6,
      };
    })
  );

  return [...staticPages, ...tournamentPages, ...playerPages];
}
