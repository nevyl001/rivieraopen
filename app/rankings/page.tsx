import type { Metadata } from "next";
import { RankingsPageClient } from "./RankingsPageClient";
import RepositoryFactory from "@/lib/data/repositories/repository-factory";
import { Category, Player } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Rankings - Riviera Open",
  description:
    "Consulta los rankings oficiales de jugadores del circuito Riviera Open organizados por niveles de habilidad.",
  keywords: [
    "rankings pádel",
    "clasificación jugadores",
    "niveles",
    "puntos",
    "riviera open",
  ],
  openGraph: {
    title: "Rankings - Riviera Open",
    description:
      "Consulta los rankings oficiales de jugadores del circuito Riviera Open organizados por niveles de habilidad.",
  },
};

export default async function RankingsPage() {
  const categories: Category[] = ["Open", "1", "2", "3", "4", "5", "6"];
  const playersByCategory: Record<Category, Player[]> = {
    Open: [],
    "1": [],
    "2": [],
    "3": [],
    "4": [],
    "5": [],
    "6": [],
  };

  try {
    const playerRepository = await RepositoryFactory.getPlayerRepository();

    for (const category of categories) {
      playersByCategory[category] = await playerRepository.getByCategory(
        category
      );
    }
  } catch (error) {
    console.error("RankingsPage:", error);
  }

  return <RankingsPageClient initialPlayersByCategory={playersByCategory} />;
}
