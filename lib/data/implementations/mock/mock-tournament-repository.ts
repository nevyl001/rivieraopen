import {
  ITournamentRepository,
  NotFoundError,
} from "../../repositories/interfaces";
import {
  Tournament,
  TournamentStatus,
  Category,
  TournamentGenre,
} from "@/lib/types";
import { tournaments as mockTournaments } from "../../mock/tournaments";

export class MockTournamentRepository implements ITournamentRepository {
  private tournaments: Tournament[];

  constructor() {
    // Deep clone to avoid mutations affecting the original mock data
    this.tournaments = JSON.parse(JSON.stringify(mockTournaments));
  }

  async getAll(): Promise<Tournament[]> {
    return [...this.tournaments];
  }

  async getById(id: string): Promise<Tournament | null> {
    const tournament = this.tournaments.find((t) => t.id === id);
    return tournament ? { ...tournament } : null;
  }

  async getByStatus(status: TournamentStatus): Promise<Tournament[]> {
    return this.tournaments
      .filter((t) => t.status === status)
      .map((t) => ({ ...t }));
  }

  async getByCategory(category: Category): Promise<Tournament[]> {
    return this.tournaments
      .filter((t) => t.categories.some((c) => c.category === category))
      .map((t) => ({ ...t }));
  }

  async getByGenre(genre: TournamentGenre): Promise<Tournament[]> {
    return this.tournaments
      .filter((t) => t.genre === genre)
      .map((t) => ({ ...t }));
  }

  async create(tournamentData: Omit<Tournament, "id">): Promise<Tournament> {
    const newTournament: Tournament = {
      ...tournamentData,
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    };

    this.tournaments.push(newTournament);

    return { ...newTournament };
  }

  async update(id: string, updates: Partial<Tournament>): Promise<Tournament> {
    const index = this.tournaments.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundError("Tournament", id);
    }

    // Merge updates
    this.tournaments[index] = { ...this.tournaments[index], ...updates };

    return { ...this.tournaments[index] };
  }

  async delete(id: string): Promise<void> {
    const index = this.tournaments.findIndex((t) => t.id === id);
    if (index === -1) {
      throw new NotFoundError("Tournament", id);
    }

    // Remove tournament (cascade delete is automatic since categories are embedded)
    this.tournaments.splice(index, 1);
  }

  async addCategory(
    id: string,
    category: Tournament["categories"][0],
  ): Promise<Tournament> {
    const tournament = await this.getById(id);
    if (!tournament) {
      throw new NotFoundError("Tournament", id);
    }

    const categories = [...tournament.categories, category];
    return this.update(id, { categories });
  }

  async removeCategory(id: string, category: Category): Promise<Tournament> {
    const tournament = await this.getById(id);
    if (!tournament) {
      throw new NotFoundError("Tournament", id);
    }

    const categories = tournament.categories.filter(
      (c) => c.category !== category,
    );
    return this.update(id, { categories });
  }

  async updateCategoryResults(
    id: string,
    category: Category,
    results: Tournament["categories"][0]["results"],
  ): Promise<Tournament> {
    const tournament = await this.getById(id);
    if (!tournament) {
      throw new NotFoundError("Tournament", id);
    }

    const categories = tournament.categories.map((c) =>
      c.category === category ? { ...c, results } : c,
    );
    return this.update(id, { categories });
  }
}
