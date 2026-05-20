import { Category } from "./player";

export type TournamentStatus = "upcoming" | "in-progress" | "completed";
export type TournamentGenre = "Open" | "Women";

export interface TournamentWinner {
  playerId: string;
  playerName: string;
  photo: string;
}

export interface TournamentCategoryResults {
  first: TournamentWinner;
  second: TournamentWinner;
}

/**
 * Tournament Category - represents a specific skill category within a tournament
 * Example: "Open" category, "Category 1", etc.
 */
export interface TournamentCategory {
  id: string;
  tournamentId: string;
  category: Category;
  results?: TournamentCategoryResults;
}

/**
 * Tournament - represents a tournament event that can have multiple categories
 * Example: "February Tournament at MyPadel" with Open, Category 1, and Category 2
 * Genre determines who can participate: Open (all) or Women (females only)
 */
export interface Tournament {
  id: string;
  name: string;
  date: string;
  club: string;
  location: string;
  genre: TournamentGenre;
  status: TournamentStatus;
  registrationOpen: boolean;
  photos: string[];
  description?: string;
  categories: TournamentCategory[];
}

/**
 * Legacy type for backward compatibility
 * @deprecated Use Tournament with categories instead
 */
export interface TournamentResults {
  first: TournamentWinner;
  second: TournamentWinner;
}

/**
 * @deprecated Use TournamentCategory instead
 */
export type TournamentLevel = TournamentCategory;

/**
 * @deprecated Use TournamentCategoryResults instead
 */
export type TournamentLevelResults = TournamentCategoryResults;
