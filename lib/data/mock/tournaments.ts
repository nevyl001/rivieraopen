import { Tournament } from "@/lib/types";

export const tournaments: Tournament[] = [
  {
    id: "rush-series-hack-padel-2026",
    name: "Riviera Open Rush Series",
    date: "2026-05-23",
    club: "Hack Padel",
    location: "Ciudad de México",
    genre: "Open",
    status: "completed",
    registrationOpen: false,
    photos: [],
    description:
      "Primer torneo oficial del circuito Riviera Open. Edición Rush Series en Hack Padel, categoría 5ta Fuerza.",
    categories: [
      {
        id: "rush-5ta",
        tournamentId: "rush-series-hack-padel-2026",
        category: "5",
      },
    ],
  },
  {
    id: "rush-series-padelito-warehouse-2026",
    name: "Riviera Open Rush Series",
    date: "2026-06-13",
    club: "Padelito Warehouse",
    location: "Ciudad de México",
    genre: "Open",
    status: "completed",
    registrationOpen: false,
    photos: [],
    description:
      "Segunda fecha del circuito Riviera Open Rush Series en Padelito Warehouse, categoría 5ta Fuerza.",
    categories: [
      {
        id: "junio-5ta",
        tournamentId: "rush-series-padelito-warehouse-2026",
        category: "5",
      },
    ],
  },
];
