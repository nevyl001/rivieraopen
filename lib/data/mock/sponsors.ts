import { Sponsor } from "@/lib/types";

export const sponsors: Sponsor[] = [
  {
    id: "belicona",
    name: "Belicona",
    logo: "/img/sponsors/belicona.png",
    website: "https://belicona.mx/",
    tier: "gold",
    description:
      "Bebidas artesanales premium con sabor auténtico mexicano.",
    logoClassName:
      "h-24 w-auto max-w-[220px] object-contain sm:h-28 sm:max-w-[260px] md:h-32 md:max-w-[300px]",
  },
  {
    id: "seltz",
    name: "Seltz",
    logo: "/img/sponsors/seltz.png",
    website: "https://seltz.mx/",
    tier: "gold",
    description: "Vitaminas burbujeantes y bebidas vitaminadas.",
    logoClassName:
      "h-10 w-auto max-w-[140px] object-contain sm:h-12 sm:max-w-[160px] md:h-14 md:max-w-[180px]",
  },
];
