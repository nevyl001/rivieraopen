import { Bebas_Neue, Manrope } from "next/font/google";
import { getJugadoresDestacados } from "@/lib/rankingService";
import { FeaturedPlayersClient } from "./FeaturedPlayersClient";

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

export async function FeaturedPlayersServer() {
  try {
    const featuredPlayers = await getJugadoresDestacados();
    return (
      <div className={`${bebasNeue.variable} ${manrope.variable}`}>
        <FeaturedPlayersClient players={featuredPlayers} />
      </div>
    );
  } catch (error) {
    console.error("FeaturedPlayersServer:", error);
    return (
      <div className={`${bebasNeue.variable} ${manrope.variable}`}>
        <FeaturedPlayersClient players={[]} />
      </div>
    );
  }
}
