export type Category = "Open" | "1" | "2" | "3" | "4" | "5" | "6";
export type Gender = "Male" | "Female";

export interface TournamentResult {
  tournamentId: string;
  placement: 1 | 2;
  date: string;
  club: string;
  photos: string[];
}

export interface PlayerContact {
  email: string;
  phone: string;
}

export interface PlayerSocials {
  instagram?: string;
  facebook?: string;
  twitter?: string;
}

export interface Player {
  id: string;
  firstName: string;
  lastName: string;
  photo: string;
  category: Category;
  gender: Gender;
  points: number;
  rank: number;
  contact: PlayerContact;
  socials: PlayerSocials;
  tournamentResults: TournamentResult[];
}

/**
 * @deprecated Use Category instead
 */
export type Level = Category;
