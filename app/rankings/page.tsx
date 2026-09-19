import type { Metadata } from "next";
import { Bebas_Neue, Manrope } from "next/font/google";
import { RankingsPageClient } from "./RankingsPageClient";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-fp-display",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-fp-sans",
  display: "swap",
});

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
  return (
    <div className={`${bebasNeue.variable} ${manrope.variable}`}>
      <RankingsPageClient />
    </div>
  );
}
