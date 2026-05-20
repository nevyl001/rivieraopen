import {
  Player,
  Tournament,
  Category,
  TournamentStatus,
  TournamentGenre,
} from "@/lib/types";

// ============================================================================
// Error Classes
// ============================================================================

export class DataLayerError extends Error {
  constructor(
    message: string,
    public context?: Record<string, any>,
  ) {
    super(message);
    this.name = "DataLayerError";
  }
}

export class NotFoundError extends DataLayerError {
  constructor(entityType: string, id: string) {
    super(`${entityType} with id ${id} not found`, { entityType, id });
    this.name = "NotFoundError";
  }
}

export class ValidationError extends DataLayerError {
  constructor(
    message: string,
    public fields: Record<string, string>,
  ) {
    super(message, { fields });
    this.name = "ValidationError";
  }
}

export class QueryError extends DataLayerError {
  constructor(operation: string, entityType: string, cause?: Error) {
    super(`Failed to ${operation} ${entityType}`, {
      operation,
      entityType,
      cause,
    });
    this.name = "QueryError";
  }
}

export class DatabaseConnectionError extends DataLayerError {
  constructor(
    message: string,
    public cause?: Error,
  ) {
    super(message, { cause });
    this.name = "DatabaseConnectionError";
  }
}

// ============================================================================
// Repository Interfaces
// ============================================================================

export interface IPlayerRepository {
  // Read operations
  getAll(): Promise<Player[]>;
  getById(id: string): Promise<Player | null>;
  getByCategory(category: Category): Promise<Player[]>;

  // Write operations
  create(player: Omit<Player, "id" | "rank">): Promise<Player>;
  update(id: string, player: Partial<Player>): Promise<Player>;
  updatePoints(id: string, points: number): Promise<Player>;
  delete(id: string): Promise<void>;

  // Ranking operations
  recalculateRankings(category: Category): Promise<void>;
}

export interface ITournamentRepository {
  // Read operations
  getAll(): Promise<Tournament[]>;
  getById(id: string): Promise<Tournament | null>;
  getByStatus(status: TournamentStatus): Promise<Tournament[]>;
  getByGenre(genre: TournamentGenre): Promise<Tournament[]>;
  getByCategory(category: Category): Promise<Tournament[]>; // Returns tournaments that have this category

  // Write operations
  create(tournament: Omit<Tournament, "id">): Promise<Tournament>;
  update(
    id: string,
    tournament: Partial<Omit<Tournament, "categories">>,
  ): Promise<Tournament>;
  delete(id: string): Promise<void>;

  // Category operations
  addCategory(
    tournamentId: string,
    categoryData: Tournament["categories"][0],
  ): Promise<Tournament>;
  removeCategory(tournamentId: string, category: Category): Promise<Tournament>;
  updateCategoryResults(
    tournamentId: string,
    category: Category,
    results: Tournament["categories"][0]["results"],
  ): Promise<Tournament>;
}
