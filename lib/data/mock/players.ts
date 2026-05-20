import { Player } from "@/lib/types";

export const players: Player[] = [
  // Open Category
  {
    id: "1",
    firstName: "Marco",
    lastName: "Delgado",
    photo: "/img/players/players-1.png",
    category: "Open",
    gender: "Male",
    points: 2850,
    rank: 1,
    contact: {
      email: "marco.delgado@email.com",
      phone: "+1 (555) 123-4567",
    },
    socials: {
      instagram: "https://instagram.com/marcodelgado",
      facebook: "https://facebook.com/marcodelgado",
    },
    tournamentResults: [
      {
        tournamentId: "1",
        placement: 1,
        date: "2024-10-15",
        club: "Reserve Padel",
        photos: ["/images/tournaments/oct-2024-1.jpg"],
      },
      {
        tournamentId: "2",
        placement: 1,
        date: "2024-09-20",
        club: "Elite Padel Club",
        photos: ["/images/tournaments/sep-2024-1.jpg"],
      },
    ],
  },
  {
    id: "2",
    firstName: "Sofia",
    lastName: "Martinez",
    photo: "/img/players/players-2.png",
    category: "Open",
    gender: "Female",
    points: 2720,
    rank: 2,
    contact: {
      email: "sofia.martinez@email.com",
      phone: "+1 (555) 234-5678",
    },
    socials: {
      instagram: "https://instagram.com/sofiamartinez",
      twitter: "https://twitter.com/sofiamartinez",
    },
    tournamentResults: [
      {
        tournamentId: "1",
        placement: 2,
        date: "2024-10-15",
        club: "Reserve Padel",
        photos: ["/images/tournaments/oct-2024-2.jpg"],
      },
    ],
  },
  {
    id: "3",
    firstName: "Lucas",
    lastName: "Romano",
    photo: "/img/players/players-3.png",
    category: "Open",
    gender: "Male",
    points: 2650,
    rank: 3,
    contact: {
      email: "lucas.romano@email.com",
      phone: "+1 (555) 345-6789",
    },
    socials: {
      instagram: "https://instagram.com/lucasromano",
    },
    tournamentResults: [
      {
        tournamentId: "2",
        placement: 2,
        date: "2024-09-20",
        club: "Elite Padel Club",
        photos: ["/images/tournaments/sep-2024-2.jpg"],
      },
    ],
  },

  // Category 1
  {
    id: "4",
    firstName: "Julián",
    lastName: "Acosta",
    photo: "/img/players/players-4.png",
    category: "1",
    gender: "Male",
    points: 1850,
    rank: 1,
    contact: {
      email: "julian.acosta@email.com",
      phone: "+1 (555) 456-7890",
    },
    socials: {
      instagram: "https://instagram.com/julianacosta",
      facebook: "https://facebook.com/julianacosta",
    },
    tournamentResults: [],
  },
  {
    id: "5",
    firstName: "Diego",
    lastName: "Fernandez",
    photo: "/img/players/players-5.png",
    category: "1",
    gender: "Male",
    points: 1720,
    rank: 2,
    contact: {
      email: "diego.fernandez@email.com",
      phone: "+1 (555) 567-8901",
    },
    socials: {
      instagram: "https://instagram.com/diegofernandez",
    },
    tournamentResults: [],
  },

  // Category 2
  {
    id: "6",
    firstName: "Valentina",
    lastName: "Silva",
    photo: "/img/players/players-6.png",
    category: "2",
    gender: "Female",
    points: 1450,
    rank: 1,
    contact: {
      email: "valentina.silva@email.com",
      phone: "+1 (555) 678-9012",
    },
    socials: {
      instagram: "https://instagram.com/valentinasilva",
      twitter: "https://twitter.com/valentinasilva",
    },
    tournamentResults: [],
  },
  {
    id: "7",
    firstName: "Mateo",
    lastName: "Ruiz",
    photo: "/img/players/players-7.png",
    category: "2",
    gender: "Male",
    points: 1380,
    rank: 2,
    contact: {
      email: "mateo.ruiz@email.com",
      phone: "+1 (555) 789-0123",
    },
    socials: {
      instagram: "https://instagram.com/mateoruiz",
    },
    tournamentResults: [],
  },

  // Category 3
  {
    id: "8",
    firstName: "Camila",
    lastName: "Torres",
    photo: "/img/players/players-8.png",
    category: "3",
    gender: "Female",
    points: 1150,
    rank: 1,
    contact: {
      email: "camila.torres@email.com",
      phone: "+1 (555) 890-1234",
    },
    socials: {
      instagram: "https://instagram.com/camilatorres",
      facebook: "https://facebook.com/camilatorres",
    },
    tournamentResults: [],
  },
  {
    id: "9",
    firstName: "Santiago",
    lastName: "Morales",
    photo: "/img/players/players-9.png",
    category: "3",
    gender: "Male",
    points: 1080,
    rank: 2,
    contact: {
      email: "santiago.morales@email.com",
      phone: "+1 (555) 901-2345",
    },
    socials: {
      instagram: "https://instagram.com/santiagomorales",
    },
    tournamentResults: [],
  },

  // Category 4
  {
    id: "10",
    firstName: "Emma",
    lastName: "Navarro",
    photo: "/img/players/players-10.png",
    category: "4",
    gender: "Female",
    points: 850,
    rank: 1,
    contact: {
      email: "emma.navarro@email.com",
      phone: "+1 (555) 012-3456",
    },
    socials: {
      instagram: "https://instagram.com/emmanavarro",
    },
    tournamentResults: [],
  },
  {
    id: "11",
    firstName: "Nicolas",
    lastName: "Vargas",
    photo: "/img/players/players-1.png",
    category: "4",
    gender: "Male",
    points: 780,
    rank: 2,
    contact: {
      email: "nicolas.vargas@email.com",
      phone: "+1 (555) 123-4568",
    },
    socials: {
      instagram: "https://instagram.com/nicolasvargas",
      twitter: "https://twitter.com/nicolasvargas",
    },
    tournamentResults: [],
  },

  // Category 5
  {
    id: "12",
    firstName: "Olivia",
    lastName: "Mendez",
    photo: "/img/players/players-2.png",
    category: "5",
    gender: "Female",
    points: 550,
    rank: 1,
    contact: {
      email: "olivia.mendez@email.com",
      phone: "+1 (555) 234-5679",
    },
    socials: {
      instagram: "https://instagram.com/oliviamendez",
    },
    tournamentResults: [],
  },
  {
    id: "13",
    firstName: "Gabriel",
    lastName: "Ortiz",
    photo: "/img/players/players-3.png",
    category: "5",
    gender: "Male",
    points: 480,
    rank: 2,
    contact: {
      email: "gabriel.ortiz@email.com",
      phone: "+1 (555) 345-6780",
    },
    socials: {
      instagram: "https://instagram.com/gabrielortiz",
      facebook: "https://facebook.com/gabrielortiz",
    },
    tournamentResults: [],
  },

  // Category 6
  {
    id: "14",
    firstName: "Mia",
    lastName: "Castro",
    photo: "/img/players/players-4.png",
    category: "6",
    gender: "Female",
    points: 320,
    rank: 1,
    contact: {
      email: "mia.castro@email.com",
      phone: "+1 (555) 456-7891",
    },
    socials: {
      instagram: "https://instagram.com/miacastro",
    },
    tournamentResults: [],
  },
  {
    id: "15",
    firstName: "Liam",
    lastName: "Reyes",
    photo: "/img/players/players-5.png",
    category: "6",
    gender: "Male",
    points: 280,
    rank: 2,
    contact: {
      email: "liam.reyes@email.com",
      phone: "+1 (555) 567-8902",
    },
    socials: {
      instagram: "https://instagram.com/liamreyes",
      twitter: "https://twitter.com/liamreyes",
    },
    tournamentResults: [],
  },
];
