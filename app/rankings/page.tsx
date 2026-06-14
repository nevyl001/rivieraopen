import type { Metadata } from "next";
import { RankingsPageClient } from "./RankingsPageClient";

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

export default function RankingsPage() {
  return <RankingsPageClient />;
}
