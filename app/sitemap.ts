import { MetadataRoute } from "next";
import { tournaments } from "@/lib/data/mock/tournaments";
import { players } from "@/lib/data/mock/players";

export default function sitemap(): MetadataRoute.Sitemap {
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

  // Player pages
  const playerPages = players.map((player) => ({
    url: `${baseUrl}/players/${player.id}`,
    lastModified: new Date(),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...tournamentPages, ...playerPages];
}
