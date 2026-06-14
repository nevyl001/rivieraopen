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
  tiktok?: string;
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

export interface PlayerStatsSummary {
  totalPartidos: number;
  victorias: number;
  derrotas: number;
  empates: number;
  pctVictorias: number;
  setsFavor: number;
  setsContra: number;
  rachaActual: string | null;
  ultimaActividad: string | null;
  totalRetas: number;
  totalTorneosExpress: number;
  totalLigas: number;
  totalAmericanos: number;
  participacionesSolo: number;
}

export interface PlayerProfileDetail extends Player {
  slug: string | null;
  age: number | null;
  birthDate: string | null;
  club: string | null;
  nivel: string | null;
  manoDominante: string | null;
  enCancha: string | null;
  paisCodigo: string | null;
  whatsapp: string | null;
  stats: PlayerStatsSummary;
}

/**
 * @deprecated Use Category instead
 */
export type Level = Category;
