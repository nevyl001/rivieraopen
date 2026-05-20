import { Tournament, TournamentCategory } from "@/lib/types";

export const tournaments: Tournament[] = [
  // Upcoming Tournaments
  {
    id: "5",
    name: "Riviera Open Winter Championship",
    date: "2024-12-15",
    club: "Reserve Padel",
    location: "Miami, FL",
    genre: "Open",
    status: "upcoming",
    registrationOpen: true,
    photos: [
      "/img/tournaments/tournaments-1.png",
      "/img/tournaments/tournaments-2.png",
    ],
    description:
      "Join us for the premier winter championship featuring the top players in the circuit.",
    categories: [
      {
        id: "5-open",
        tournamentId: "5",
        category: "Open",
      },
      {
        id: "5-cat1",
        tournamentId: "5",
        category: "1",
      },
    ],
  },
  {
    id: "6",
    name: "Holiday Classic Tournament",
    date: "2024-12-22",
    club: "Elite Padel Club",
    location: "Fort Lauderdale, FL",
    genre: "Open",
    status: "upcoming",
    registrationOpen: true,
    photos: ["/img/tournaments/tournaments-3.png"],
    description:
      "Celebrate the holidays with competitive padel action at Elite Padel Club.",
    categories: [
      {
        id: "6-cat1",
        tournamentId: "6",
        category: "1",
      },
      {
        id: "6-cat2",
        tournamentId: "6",
        category: "2",
      },
    ],
  },
  {
    id: "7",
    name: "New Year Open",
    date: "2025-01-05",
    club: "Coastal Padel Center",
    location: "West Palm Beach, FL",
    genre: "Women",
    status: "upcoming",
    registrationOpen: true,
    photos: [
      "/img/tournaments/tournaments-4.png",
      "/img/tournaments/tournaments-5.png",
    ],
    description: "Start the new year with an exciting women's tournament.",
    categories: [
      {
        id: "7-cat2",
        tournamentId: "7",
        category: "2",
      },
      {
        id: "7-cat3",
        tournamentId: "7",
        category: "3",
      },
    ],
  },
  {
    id: "8",
    name: "January Invitational",
    date: "2025-01-20",
    club: "Sunset Padel Courts",
    location: "Boca Raton, FL",
    genre: "Open",
    status: "upcoming",
    registrationOpen: false,
    photos: ["/img/tournaments/tournaments-6.png"],
    description:
      "Invitation-only tournament for the top-ranked Open category players.",
    categories: [
      {
        id: "8-open",
        tournamentId: "8",
        category: "Open",
      },
    ],
  },

  // In Progress
  {
    id: "4",
    name: "November Challenge",
    date: "2024-11-16",
    club: "Coastal Padel Center",
    location: "West Palm Beach, FL",
    genre: "Open",
    status: "in-progress",
    registrationOpen: false,
    photos: [
      "/img/tournaments/tournaments-7.png",
      "/img/tournaments/tournaments-8.png",
      "/img/tournaments/tournaments-9.png",
    ],
    description: "Currently underway at Coastal Padel Center.",
    categories: [
      {
        id: "4-cat3",
        tournamentId: "4",
        category: "3",
      },
      {
        id: "4-cat4",
        tournamentId: "4",
        category: "4",
      },
    ],
  },

  // Completed Tournaments
  {
    id: "1",
    name: "October Championship",
    date: "2024-10-15",
    club: "Reserve Padel",
    location: "Miami, FL",
    genre: "Open",
    status: "completed",
    registrationOpen: false,
    photos: [
      "/img/tournaments/tournaments-10.png",
      "/img/tournaments/tournaments-11.png",
      "/img/tournaments/tournaments-12.png",
      "/img/tournaments/tournaments-13.png",
      "/img/tournaments/tournaments-14.png",
      "/img/tournaments/tournaments-15.png",
    ],
    description:
      "An exciting championship that showcased the best talent in the Open category.",
    categories: [
      {
        id: "1-open",
        tournamentId: "1",
        category: "Open",
        results: {
          first: {
            playerId: "1",
            playerName: "Marco Delgado",
            photo: "/images/players/marco-delgado.jpg",
          },
          second: {
            playerId: "2",
            playerName: "Sofia Martinez",
            photo: "/images/players/sofia-martinez.jpg",
          },
        },
      },
    ],
  },
  {
    id: "2",
    name: "September Classic",
    date: "2024-09-20",
    club: "Elite Padel Club",
    location: "Fort Lauderdale, FL",
    genre: "Open",
    status: "completed",
    registrationOpen: false,
    photos: [
      "/img/tournaments/tournaments-16.png",
      "/img/tournaments/tournaments-17.png",
      "/img/tournaments/tournaments-18.png",
      "/img/tournaments/tournaments-19.png",
      "/img/tournaments/tournaments-20.png",
    ],
    description:
      "A thrilling tournament with intense matches throughout the day.",
    categories: [
      {
        id: "2-open",
        tournamentId: "2",
        category: "Open",
        results: {
          first: {
            playerId: "1",
            playerName: "Marco Delgado",
            photo: "/images/players/marco-delgado.jpg",
          },
          second: {
            playerId: "3",
            playerName: "Lucas Romano",
            photo: "/images/players/lucas-romano.jpg",
          },
        },
      },
    ],
  },
  {
    id: "3",
    name: "August Summer Open",
    date: "2024-08-10",
    club: "Sunset Padel Courts",
    location: "Boca Raton, FL",
    genre: "Women",
    status: "completed",
    registrationOpen: false,
    photos: [
      "/img/tournaments/tournaments-21.png",
      "/img/tournaments/tournaments-22.png",
      "/img/tournaments/tournaments-23.png",
      "/img/tournaments/tournaments-24.png",
    ],
    description:
      "Summer heat brought out the best in our Category 1 competitors.",
    categories: [
      {
        id: "3-cat1",
        tournamentId: "3",
        category: "1",
        results: {
          first: {
            playerId: "4",
            playerName: "Isabella Costa",
            photo: "/images/players/isabella-costa.jpg",
          },
          second: {
            playerId: "5",
            playerName: "Diego Fernandez",
            photo: "/images/players/diego-fernandez.jpg",
          },
        },
      },
    ],
  },
  {
    id: "9",
    name: "July Masters Cup",
    date: "2024-07-14",
    club: "Reserve Padel",
    location: "Miami, FL",
    genre: "Open",
    status: "completed",
    registrationOpen: false,
    photos: [
      "/img/tournaments/tournaments-25.png",
      "/img/tournaments/tournaments-26.png",
      "/img/tournaments/tournaments-27.png",
    ],
    description:
      "A competitive Category 2 tournament with exceptional play throughout.",
    categories: [
      {
        id: "9-cat2",
        tournamentId: "9",
        category: "2",
        results: {
          first: {
            playerId: "2",
            playerName: "Sofia Martinez",
            photo: "/images/players/sofia-martinez.jpg",
          },
          second: {
            playerId: "4",
            playerName: "Isabella Costa",
            photo: "/images/players/isabella-costa.jpg",
          },
        },
      },
    ],
  },
  {
    id: "10",
    name: "June Spring Championship",
    date: "2024-06-22",
    club: "Elite Padel Club",
    location: "Fort Lauderdale, FL",
    genre: "Open",
    status: "completed",
    registrationOpen: false,
    photos: [
      "/img/tournaments/tournaments-28.png",
      "/img/tournaments/tournaments-29.png",
      "/img/tournaments/tournaments-30.png",
      "/img/tournaments/tournaments-31.png",
    ],
    description:
      "Spring championship showcasing the depth of talent in Category 3.",
    categories: [
      {
        id: "10-cat3",
        tournamentId: "10",
        category: "3",
        results: {
          first: {
            playerId: "5",
            playerName: "Diego Fernandez",
            photo: "/images/players/diego-fernandez.jpg",
          },
          second: {
            playerId: "3",
            playerName: "Lucas Romano",
            photo: "/images/players/lucas-romano.jpg",
          },
        },
      },
    ],
  },
];
