import {
  IPlayerRepository,
  NotFoundError,
} from "../../repositories/interfaces";
import { Player, Category } from "@/lib/types";
import { players as mockPlayers } from "../../mock/players";

export class MockPlayerRepository implements IPlayerRepository {
  private players: Player[];

  constructor() {
    // Deep clone to avoid mutations affecting the original mock data
    this.players = JSON.parse(JSON.stringify(mockPlayers));
  }

  async getAll(): Promise<Player[]> {
    return [...this.players];
  }

  async getById(id: string): Promise<Player | null> {
    const player = this.players.find((p) => p.id === id);
    return player ? { ...player } : null;
  }

  async getByCategory(category: Category): Promise<Player[]> {
    return this.players
      .filter((p) => p.category === category)
      .map((p) => ({ ...p }));
  }

  async create(playerData: Omit<Player, "id" | "rank">): Promise<Player> {
    const newPlayer: Player = {
      ...playerData,
      id: `mock-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      rank: 0, // Will be set by recalculateRankings
    };

    this.players.push(newPlayer);
    await this.recalculateRankings(newPlayer.category);

    // Return the player with updated rank
    const created = this.players.find((p) => p.id === newPlayer.id);
    return { ...created! };
  }

  async update(id: string, updates: Partial<Player>): Promise<Player> {
    const index = this.players.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundError("Player", id);
    }

    // Merge updates
    this.players[index] = { ...this.players[index], ...updates };

    // Recalculate rankings if points or category changed
    if (updates.points !== undefined || updates.category !== undefined) {
      await this.recalculateRankings(this.players[index].category);
    }

    return { ...this.players[index] };
  }

  async updatePoints(id: string, points: number): Promise<Player> {
    return this.update(id, { points });
  }

  async delete(id: string): Promise<void> {
    const index = this.players.findIndex((p) => p.id === id);
    if (index === -1) {
      throw new NotFoundError("Player", id);
    }

    const player = this.players[index];
    const category = player.category;

    // Remove player
    this.players.splice(index, 1);

    // Recalculate rankings for the category
    await this.recalculateRankings(category);
  }

  async recalculateRankings(category: Category): Promise<void> {
    // Get all players at this category
    const categoryPlayers = this.players.filter((p) => p.category === category);

    // Sort by points descending
    categoryPlayers.sort((a, b) => b.points - a.points);

    // Update ranks
    categoryPlayers.forEach((player, index) => {
      const playerIndex = this.players.findIndex((p) => p.id === player.id);
      this.players[playerIndex].rank = index + 1;
    });
  }
}
