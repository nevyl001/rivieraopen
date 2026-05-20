/**
 * PlayerAdminService
 * Service layer for admin player management operations
 * Handles pagination, sorting, and business logic
 */

import RepositoryFactory from "@/lib/data/repositories/repository-factory";
import { IPlayerRepository } from "@/lib/data/repositories/interfaces";
import { Player, Category } from "@/lib/types";
import { ValidationService } from "@/lib/admin/validation/ValidationService";
import { auditLogService } from "@/lib/admin/services/AuditLogService";
import { sanitizePlayerData } from "@/lib/admin/security/sanitize";
import type { CreatePlayerData } from "@/lib/admin/validation/schemas";

export interface PaginationParams {
  page: number; // 1-indexed
  pageSize: number;
}

export interface SortParams {
  field: keyof Player;
  direction: "asc" | "desc";
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface BulkOperationResult {
  successCount: number;
  failureCount: number;
  errors: Array<{ id: string; error: string }>;
}

export class PlayerAdminService {
  private repository: IPlayerRepository | null = null;
  private validationService: ValidationService;

  constructor() {
    this.validationService = new ValidationService();
  }

  /**
   * Get or initialize the player repository
   */
  private async getRepository(): Promise<IPlayerRepository> {
    if (!this.repository) {
      this.repository = await RepositoryFactory.getPlayerRepository();
    }
    return this.repository;
  }

  /**
   * List players with pagination and optional sorting
   */
  async listPlayers(
    paginationParams: PaginationParams,
    sortParams?: SortParams,
  ): Promise<PaginatedResult<Player>> {
    const repository = await this.getRepository();
    const allPlayers = await repository.getAll();

    // Apply sorting if specified
    let sortedPlayers = [...allPlayers];
    if (sortParams) {
      sortedPlayers = this.sortPlayers(sortedPlayers, sortParams);
    }

    // Calculate pagination
    const { page, pageSize } = paginationParams;
    const totalItems = sortedPlayers.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;

    // Get paginated data
    const paginatedData = sortedPlayers.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get a single player by ID
   */
  async getPlayer(id: string): Promise<Player | null> {
    const repository = await this.getRepository();
    return repository.getById(id);
  }

  /**
   * Get players by category
   */
  async getPlayersByCategory(category: Category): Promise<Player[]> {
    const repository = await this.getRepository();
    return repository.getByCategory(category);
  }

  /**
   * Create a new player
   */
  async createPlayer(data: CreatePlayerData): Promise<Player> {
    // Sanitize input data
    const sanitizedData = sanitizePlayerData(data) as CreatePlayerData;

    // Validate player data
    const validationResult =
      this.validationService.validatePlayer(sanitizedData);
    if (!validationResult.valid) {
      throw new Error(
        `Validation failed: ${validationResult.errors
          .map((err) => `${err.field}: ${err.message}`)
          .join(", ")}`,
      );
    }

    const repository = await this.getRepository();

    // Create player (repository will assign ID and calculate rank)
    const player = await repository.create({
      firstName: sanitizedData.firstName,
      lastName: sanitizedData.lastName,
      photo: sanitizedData.photo,
      category: sanitizedData.category,
      gender: sanitizedData.gender,
      points: sanitizedData.points,
      contact: sanitizedData.contact,
      socials: sanitizedData.socials || {
        instagram: "",
        facebook: "",
        twitter: "",
      },
      tournamentResults: [],
    });

    // Recalculate rankings for the category
    await repository.recalculateRankings(sanitizedData.category);

    // Audit log
    await auditLogService.log(
      "admin",
      "create",
      "player",
      player.id,
      `Created player: ${player.firstName} ${player.lastName}`,
    );

    return player;
  }

  /**
   * Update an existing player
   */
  async updatePlayer(
    id: string,
    data: Partial<CreatePlayerData>,
  ): Promise<Player> {
    // Sanitize input data
    const sanitizedData = sanitizePlayerData(data) as Partial<CreatePlayerData>;

    // Validate update data if provided
    if (Object.keys(sanitizedData).length > 0) {
      const validationResult =
        this.validationService.validatePlayerUpdate(sanitizedData);
      if (!validationResult.valid) {
        throw new Error(
          `Validation failed: ${validationResult.errors
            .map((err) => `${err.field}: ${err.message}`)
            .join(", ")}`,
        );
      }
    }

    const repository = await this.getRepository();

    // Get existing player to check if category is changing
    const existingPlayer = await repository.getById(id);
    if (!existingPlayer) {
      throw new Error(`Player with id ${id} not found`);
    }

    // Update player
    const updatedPlayer = await repository.update(id, data);

    // Recalculate rankings if category or points changed
    if (data.category && data.category !== existingPlayer.category) {
      // Recalculate both old and new categories
      await repository.recalculateRankings(existingPlayer.category);
      await repository.recalculateRankings(data.category);
    } else if (data.points !== undefined) {
      // Recalculate current category
      await repository.recalculateRankings(updatedPlayer.category);
    }

    // Audit log
    await auditLogService.log(
      "admin",
      "update",
      "player",
      id,
      `Updated player: ${updatedPlayer.firstName} ${updatedPlayer.lastName}`,
    );

    return updatedPlayer;
  }

  /**
   * Delete a player (with cascade delete of related data)
   */
  async deletePlayer(id: string): Promise<void> {
    const repository = await this.getRepository();

    // Check if player exists
    const player = await repository.getById(id);
    if (!player) {
      throw new Error(`Player with id ${id} not found`);
    }

    // Delete player (cascade delete handled by repository)
    await repository.delete(id);

    // Audit log
    await auditLogService.log(
      "admin",
      "delete",
      "player",
      id,
      `Deleted player: ${player.firstName} ${player.lastName}`,
    );
  }

  /**
   * Search players by name
   */
  async searchPlayers(query: string): Promise<Player[]> {
    const repository = await this.getRepository();
    const allPlayers = await repository.getAll();

    if (!query || query.trim() === "") {
      return allPlayers;
    }

    const searchTerm = query.toLowerCase().trim();

    return allPlayers.filter((player) => {
      const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
      return fullName.includes(searchTerm);
    });
  }

  /**
   * Filter players by category and/or gender
   */
  async filterPlayers(filters: {
    category?: Category;
    gender?: "Male" | "Female";
  }): Promise<Player[]> {
    const repository = await this.getRepository();
    let players = await repository.getAll();

    if (filters.category) {
      players = players.filter((p) => p.category === filters.category);
    }

    if (filters.gender) {
      players = players.filter((p) => p.gender === filters.gender);
    }

    return players;
  }

  /**
   * Sort players by specified field and direction
   */
  private sortPlayers(players: Player[], sortParams: SortParams): Player[] {
    const { field, direction } = sortParams;

    return players.sort((a, b) => {
      const aValue = a[field];
      const bValue = b[field];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;

      // Compare values
      let comparison = 0;
      if (typeof aValue === "string" && typeof bValue === "string") {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === "number" && typeof bValue === "number") {
        comparison = aValue - bValue;
      } else {
        // Fallback: convert to string and compare
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return direction === "asc" ? comparison : -comparison;
    });
  }

  /**
   * Bulk delete players
   * Requirements: 18.1, 18.3, 18.4
   */
  async bulkDelete(playerIds: string[]): Promise<BulkOperationResult> {
    const repository = await this.getRepository();
    const result: BulkOperationResult = {
      successCount: 0,
      failureCount: 0,
      errors: [],
    };

    for (const id of playerIds) {
      try {
        const player = await repository.getById(id);
        if (!player) {
          result.failureCount++;
          result.errors.push({ id, error: "Player not found" });
          continue;
        }

        await repository.delete(id);

        // Audit log
        await auditLogService.log(
          "admin",
          "delete",
          "player",
          id,
          `Bulk deleted player: ${player.firstName} ${player.lastName}`,
        );

        result.successCount++;
      } catch (error) {
        result.failureCount++;
        result.errors.push({
          id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    return result;
  }

  /**
   * Bulk update player category
   * Requirements: 18.2, 18.3, 18.4
   */
  async bulkUpdateCategory(
    playerIds: string[],
    category: Category,
  ): Promise<BulkOperationResult> {
    const repository = await this.getRepository();
    const result: BulkOperationResult = {
      successCount: 0,
      failureCount: 0,
      errors: [],
    };

    // Validate category
    const validationResult = this.validationService.validateCategory(category);
    if (!validationResult.valid) {
      throw new Error(
        `Invalid category: ${validationResult.errors.map((e) => e.message).join(", ")}`,
      );
    }

    for (const id of playerIds) {
      try {
        const player = await repository.getById(id);
        if (!player) {
          result.failureCount++;
          result.errors.push({ id, error: "Player not found" });
          continue;
        }

        await repository.update(id, { category });

        // Audit log
        await auditLogService.log(
          "admin",
          "update",
          "player",
          id,
          `Bulk updated category to ${category}: ${player.firstName} ${player.lastName}`,
        );

        result.successCount++;
      } catch (error) {
        result.failureCount++;
        result.errors.push({
          id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Recalculate rankings for the category
    if (result.successCount > 0) {
      await repository.recalculateRankings(category);
    }

    return result;
  }

  /**
   * Export players to CSV
   * Requirements: 17.1, 17.2, 17.3, 17.4
   */
  async exportPlayers(filters?: {
    searchQuery?: string;
    categoryFilter?: string;
    genderFilter?: string;
  }): Promise<string> {
    const repository = await this.getRepository();
    let players = await repository.getAll();

    // Apply filters if provided
    if (filters?.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      players = players.filter((player) => {
        const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
        return fullName.includes(query);
      });
    }

    if (filters?.categoryFilter) {
      players = players.filter((p) => p.category === filters.categoryFilter);
    }

    if (filters?.genderFilter) {
      players = players.filter((p) => p.gender === filters.genderFilter);
    }

    // Generate CSV
    const headers = [
      "ID",
      "First Name",
      "Last Name",
      "Category",
      "Gender",
      "Points",
      "Rank",
      "Photo",
      "Email",
      "Phone",
      "Instagram",
      "Facebook",
      "Twitter",
    ];

    const rows = players.map((player) => [
      player.id,
      player.firstName,
      player.lastName,
      player.category,
      player.gender,
      player.points.toString(),
      player.rank.toString(),
      player.photo,
      player.contact?.email || "",
      player.contact?.phone || "",
      player.socials?.instagram || "",
      player.socials?.facebook || "",
      player.socials?.twitter || "",
    ]);

    // Escape CSV values
    const escapeCsvValue = (value: string) => {
      if (value.includes(",") || value.includes('"') || value.includes("\n")) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    };

    const csvContent = [
      headers.map(escapeCsvValue).join(","),
      ...rows.map((row) => row.map(escapeCsvValue).join(",")),
    ].join("\n");

    return csvContent;
  }
}

// Export singleton instance
export const playerAdminService = new PlayerAdminService();
