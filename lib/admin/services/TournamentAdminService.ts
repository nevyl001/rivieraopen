/**
 * TournamentAdminService
 * Service for managing tournaments in the admin interface
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6
 */

import RepositoryFactory from "@/lib/data/repositories/repository-factory";
import type { ITournamentRepository } from "@/lib/data/repositories/interfaces";
import type {
  Tournament,
  TournamentStatus,
  TournamentGenre,
  Category,
  TournamentCategoryResults,
} from "@/lib/types";
import { ValidationService } from "@/lib/admin/validation/ValidationService";
import { auditLogService } from "@/lib/admin/services/AuditLogService";
import { sanitizeTournamentData } from "@/lib/admin/security/sanitize";
import type {
  CreateTournamentData,
  UpdateTournamentData,
} from "@/lib/admin/validation/schemas";

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
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

export interface TournamentFilters {
  status?: TournamentStatus;
  genre?: TournamentGenre;
}

export interface BulkOperationResult {
  successCount: number;
  failureCount: number;
  errors: Array<{ id: string; error: string }>;
}

export class TournamentAdminService {
  private async getRepository(): Promise<ITournamentRepository> {
    return RepositoryFactory.getTournamentRepository();
  }

  /**
   * List tournaments with pagination and optional sorting
   * Requirements: 4.1
   */
  async listTournaments(
    params: PaginationParams = { page: 1, pageSize: 20 },
    sortBy: keyof Tournament = "date",
    sortOrder: "asc" | "desc" = "desc",
    filters?: TournamentFilters,
  ): Promise<PaginationResult<Tournament>> {
    const repository = await this.getRepository();
    let tournaments = await repository.getAll();

    // Apply filters
    if (filters?.status) {
      tournaments = tournaments.filter((t) => t.status === filters.status);
    }
    if (filters?.genre) {
      tournaments = tournaments.filter((t) => t.genre === filters.genre);
    }

    // Sort tournaments
    tournaments.sort((a, b) => {
      const aValue = a[sortBy];
      const bValue = b[sortBy];

      if (aValue === undefined || bValue === undefined) {
        return 0;
      }

      let comparison = 0;
      if (aValue < bValue) {
        comparison = -1;
      } else if (aValue > bValue) {
        comparison = 1;
      }

      return sortOrder === "asc" ? comparison : -comparison;
    });

    // Calculate pagination
    const { page, pageSize } = params;
    const totalItems = tournaments.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = tournaments.slice(startIndex, endIndex);

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
   * Get a single tournament by ID with full details
   * Requirements: 4.1
   */
  async getTournament(id: string): Promise<Tournament | null> {
    const repository = await this.getRepository();
    return repository.getById(id);
  }

  /**
   * Create a new tournament
   * Requirements: 4.2
   */
  async createTournament(data: CreateTournamentData): Promise<Tournament> {
    // Sanitize input data
    const sanitizedData = sanitizeTournamentData(data) as CreateTournamentData;

    // Validate tournament data
    const validationService = new ValidationService();
    const validationResult =
      validationService.validateTournament(sanitizedData);
    if (!validationResult.valid) {
      const errors = validationResult.errors
        .map((err) => `${err.field}: ${err.message}`)
        .join(", ");
      throw new Error(`Validation failed: ${errors}`);
    }

    const repository = await this.getRepository();

    // Create tournament with empty categories array
    const tournament = await repository.create({
      name: sanitizedData.name,
      date: sanitizedData.date.toISOString(),
      club: sanitizedData.club,
      location: sanitizedData.location,
      genre: sanitizedData.genre,
      status: sanitizedData.status,
      registrationOpen: sanitizedData.registrationOpen,
      description: sanitizedData.description,
      photos: [],
      categories: [],
    });

    // Audit log
    await auditLogService.log(
      "admin",
      "create",
      "tournament",
      tournament.id,
      `Created tournament: ${tournament.name}`,
    );

    return tournament;
  }

  /**
   * Update an existing tournament
   * Requirements: 4.3
   */
  async updateTournament(
    id: string,
    data: Partial<CreateTournamentData>,
  ): Promise<Tournament> {
    // Sanitize input data
    const sanitizedData = sanitizeTournamentData(
      data,
    ) as Partial<CreateTournamentData>;

    const repository = await this.getRepository();

    // Check if tournament exists
    const existingTournament = await repository.getById(id);
    if (!existingTournament) {
      throw new Error("Tournament not found");
    }

    // Validate update data
    const validationService = new ValidationService();
    const validationResult =
      validationService.validateTournamentUpdate(sanitizedData);
    if (!validationResult.valid) {
      const errors = validationResult.errors
        .map((err) => `${err.field}: ${err.message}`)
        .join(", ");
      throw new Error(`Validation failed: ${errors}`);
    }

    // Prepare update data
    const updateData: Partial<Omit<Tournament, "categories">> = {};
    if (sanitizedData.name !== undefined) updateData.name = sanitizedData.name;
    if (sanitizedData.date !== undefined)
      updateData.date = sanitizedData.date.toISOString();
    if (sanitizedData.club !== undefined) updateData.club = sanitizedData.club;
    if (data.location !== undefined) updateData.location = data.location;
    if (data.genre !== undefined) updateData.genre = data.genre;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.registrationOpen !== undefined)
      updateData.registrationOpen = data.registrationOpen;
    if (data.description !== undefined)
      updateData.description = data.description;

    const updatedTournament = await repository.update(id, updateData);

    // Audit log
    await auditLogService.log(
      "admin",
      "update",
      "tournament",
      id,
      `Updated tournament: ${updatedTournament.name}`,
    );

    return updatedTournament;
  }

  /**
   * Delete a tournament
   * Requirements: 4.4, 10.2
   */
  async deleteTournament(id: string): Promise<void> {
    const repository = await this.getRepository();

    // Check if tournament exists
    const existingTournament = await repository.getById(id);
    if (!existingTournament) {
      throw new Error("Tournament not found");
    }

    // Delete tournament (cascade delete will handle categories, winners, photos, results)
    await repository.delete(id);

    // Audit log
    await auditLogService.log(
      "admin",
      "delete",
      "tournament",
      id,
      `Deleted tournament: ${existingTournament.name}`,
    );
  }

  /**
   * Add a category to a tournament
   * Requirements: 6.1, 6.4
   */
  async addCategory(
    tournamentId: string,
    category: Category,
  ): Promise<Tournament> {
    const repository = await this.getRepository();

    // Check if tournament exists
    const tournament = await repository.getById(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Check if category already exists
    const categoryExists = tournament.categories.some(
      (c) => c.category === category,
    );
    if (categoryExists) {
      throw new Error(`Category ${category} already exists in this tournament`);
    }

    // Validate category
    const validationService = new ValidationService();
    const validationResult = validationService.validateCategory(category);
    if (!validationResult.valid) {
      const errors = validationResult.errors
        .map((err) => `${err.field}: ${err.message}`)
        .join(", ");
      throw new Error(`Validation failed: ${errors}`);
    }

    // Add category
    const categoryData = {
      id: `cat-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      tournamentId,
      category,
    };

    return repository.addCategory(tournamentId, categoryData);
  }

  /**
   * Remove a category from a tournament
   * Requirements: 6.3, 10.3
   */
  async removeCategory(
    tournamentId: string,
    category: Category,
  ): Promise<Tournament> {
    const repository = await this.getRepository();

    // Check if tournament exists
    const tournament = await repository.getById(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Check if category exists
    const categoryExists = tournament.categories.some(
      (c) => c.category === category,
    );
    if (!categoryExists) {
      throw new Error(`Category ${category} not found in this tournament`);
    }

    // Remove category (cascade delete will handle results)
    return repository.removeCategory(tournamentId, category);
  }

  /**
   * List all categories for a tournament
   * Requirements: 6.2
   */
  async listCategories(tournamentId: string): Promise<Category[]> {
    const repository = await this.getRepository();

    const tournament = await repository.getById(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    return tournament.categories.map((c) => c.category);
  }

  /**
   * Set a winner for a tournament category
   * Requirements: 7.1, 7.2, 7.6
   */
  async setWinner(
    tournamentId: string,
    category: Category,
    placement: 1 | 2,
    playerId: string,
  ): Promise<Tournament> {
    const repository = await this.getRepository();

    // Check if tournament exists
    const tournament = await repository.getById(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Check if category exists
    const categoryData = tournament.categories.find(
      (c) => c.category === category,
    );
    if (!categoryData) {
      throw new Error(`Category ${category} not found in this tournament`);
    }

    // Get player repository to fetch player details
    const playerRepository = await RepositoryFactory.getPlayerRepository();
    const player = await playerRepository.getById(playerId);
    if (!player) {
      throw new Error("Player not found");
    }

    // Create winner data
    const winnerData: TournamentCategoryResults["first"] = {
      playerId: player.id,
      playerName: `${player.firstName} ${player.lastName}`,
      photo: player.photo,
    };

    // Get current results or create new
    const currentResults = categoryData.results || {
      first: { playerId: "", playerName: "", photo: "" },
      second: { playerId: "", playerName: "", photo: "" },
    };

    // Update the appropriate placement
    const updatedResults: TournamentCategoryResults = {
      ...currentResults,
      [placement === 1 ? "first" : "second"]: winnerData,
    };

    // Update category results
    return repository.updateCategoryResults(
      tournamentId,
      category,
      updatedResults,
    );
  }

  /**
   * Remove a winner from a tournament category
   * Requirements: 7.3
   */
  async removeWinner(
    tournamentId: string,
    category: Category,
    placement: 1 | 2,
  ): Promise<Tournament> {
    const repository = await this.getRepository();

    // Check if tournament exists
    const tournament = await repository.getById(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Check if category exists
    const categoryData = tournament.categories.find(
      (c) => c.category === category,
    );
    if (!categoryData) {
      throw new Error(`Category ${category} not found in this tournament`);
    }

    if (!categoryData.results) {
      throw new Error("No results found for this category");
    }

    // Create empty winner data
    const emptyWinner: TournamentCategoryResults["first"] = {
      playerId: "",
      playerName: "",
      photo: "",
    };

    // Update the appropriate placement
    const updatedResults: TournamentCategoryResults = {
      ...categoryData.results,
      [placement === 1 ? "first" : "second"]: emptyWinner,
    };

    // Update category results
    return repository.updateCategoryResults(
      tournamentId,
      category,
      updatedResults,
    );
  }

  /**
   * Search players for winner auto-fill
   * Requirements: 7.5
   */
  async searchPlayersForWinner(query: string): Promise<
    Array<{
      id: string;
      name: string;
      category: Category;
      photo: string;
    }>
  > {
    const playerRepository = await RepositoryFactory.getPlayerRepository();
    const allPlayers = await playerRepository.getAll();

    if (!query || query.trim() === "") {
      return allPlayers.slice(0, 10).map((p) => ({
        id: p.id,
        name: `${p.firstName} ${p.lastName}`,
        category: p.category,
        photo: p.photo,
      }));
    }

    const searchTerm = query.toLowerCase().trim();
    const filtered = allPlayers.filter((player) => {
      const fullName = `${player.firstName} ${player.lastName}`.toLowerCase();
      return fullName.includes(searchTerm);
    });

    return filtered.slice(0, 10).map((p) => ({
      id: p.id,
      name: `${p.firstName} ${p.lastName}`,
      category: p.category,
      photo: p.photo,
    }));
  }

  /**
   * Add a photo to a tournament
   * Requirements: 8.1, 8.2
   */
  async addPhoto(tournamentId: string, photoUrl: string): Promise<Tournament> {
    const repository = await this.getRepository();

    // Check if tournament exists
    const tournament = await repository.getById(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Add photo to the end of the array
    const updatedPhotos = [...(tournament.photos || []), photoUrl];

    return repository.update(tournamentId, { photos: updatedPhotos });
  }

  /**
   * Remove a photo from a tournament
   * Requirements: 8.4
   */
  async removePhoto(
    tournamentId: string,
    photoUrl: string,
  ): Promise<Tournament> {
    const repository = await this.getRepository();

    // Check if tournament exists
    const tournament = await repository.getById(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Remove photo from array
    const updatedPhotos = (tournament.photos || []).filter(
      (p) => p !== photoUrl,
    );

    return repository.update(tournamentId, { photos: updatedPhotos });
  }

  /**
   * Reorder photos in a tournament
   * Requirements: 8.3
   */
  async reorderPhotos(
    tournamentId: string,
    photoUrls: string[],
  ): Promise<Tournament> {
    const repository = await this.getRepository();

    // Check if tournament exists
    const tournament = await repository.getById(tournamentId);
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Validate that all photos in the new order exist in the current photos
    const currentPhotos = tournament.photos || [];
    const allPhotosExist = photoUrls.every((url) =>
      currentPhotos.includes(url),
    );

    if (!allPhotosExist) {
      throw new Error("Invalid photo URLs in reorder request");
    }

    // Validate that the count matches
    if (photoUrls.length !== currentPhotos.length) {
      throw new Error("Photo count mismatch in reorder request");
    }

    return repository.update(tournamentId, { photos: photoUrls });
  }

  /**
   * Bulk update tournament status
   * Requirements: 18.2, 18.4, 18.5
   */
  async bulkUpdateStatus(
    tournamentIds: string[],
    status: TournamentStatus,
  ): Promise<BulkOperationResult> {
    const repository = await this.getRepository();
    const result: BulkOperationResult = {
      successCount: 0,
      failureCount: 0,
      errors: [],
    };

    for (const id of tournamentIds) {
      try {
        const tournament = await repository.getById(id);
        if (!tournament) {
          result.failureCount++;
          result.errors.push({ id, error: "Tournament not found" });
          continue;
        }

        await repository.update(id, { status });

        // Audit log
        await auditLogService.log(
          "admin",
          "update",
          "tournament",
          id,
          `Bulk updated status to ${status}: ${tournament.name}`,
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
   * Export tournaments to CSV
   * Requirements: 17.1, 17.2, 17.3, 17.4
   */
  async exportTournaments(filters?: {
    statusFilter?: string;
    genreFilter?: string;
  }): Promise<string> {
    const repository = await this.getRepository();
    let tournaments = await repository.getAll();

    // Apply filters if provided
    if (filters?.statusFilter) {
      tournaments = tournaments.filter(
        (t) => t.status === filters.statusFilter,
      );
    }

    if (filters?.genreFilter) {
      tournaments = tournaments.filter((t) => t.genre === filters.genreFilter);
    }

    // Generate CSV
    const headers = [
      "ID",
      "Name",
      "Date",
      "Club",
      "Location",
      "Genre",
      "Status",
      "Registration Open",
      "Description",
      "Categories",
      "Photos Count",
    ];

    const rows = tournaments.map((tournament) => [
      tournament.id,
      tournament.name,
      tournament.date,
      tournament.club,
      tournament.location,
      tournament.genre,
      tournament.status,
      tournament.registrationOpen ? "Yes" : "No",
      tournament.description || "",
      tournament.categories.map((c) => c.category).join("; "),
      (tournament.photos?.length || 0).toString(),
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
export const tournamentAdminService = new TournamentAdminService();
