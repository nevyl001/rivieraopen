import {
  Tournament,
  TournamentStatus,
  TournamentGenre,
  Category,
  TournamentCategory,
  TournamentCategoryResults,
} from "@/lib/types";
import {
  ITournamentRepository,
  NotFoundError,
} from "../../repositories/interfaces";
import { DatabaseClient } from "../../database/database-client";

/**
 * SQLTournamentRepository - PostgreSQL implementation of ITournamentRepository
 *
 * Features:
 * - Full CRUD operations using PostgreSQL
 * - Row-to-object hydration for complex nested data
 * - Transaction support for multi-table operations
 * - Category management within tournaments
 *
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7, 4.8
 */
export class SQLTournamentRepository implements ITournamentRepository {
  constructor(private dbClient: DatabaseClient) {}

  /**
   * Get all tournaments with their categories
   * Requirements: 4.1 - Retrieve all tournaments
   */
  async getAll(): Promise<Tournament[]> {
    const query = `
      SELECT 
        t.id, t.name, t.date, t.club, t.location, t.genre, t.status,
        t.registration_open, t.description
      FROM tournaments t
      ORDER BY t.date DESC
    `;

    const result = await this.dbClient.query(query);

    const tournaments = await Promise.all(
      result.rows.map((row) => this.hydrateTournament(row)),
    );

    return tournaments;
  }

  /**
   * Get a tournament by ID
   * Requirements: 4.2 - Retrieve tournament by ID
   */
  async getById(id: string): Promise<Tournament | null> {
    const query = `
      SELECT 
        t.id, t.name, t.date, t.club, t.location, t.genre, t.status,
        t.registration_open, t.description
      FROM tournaments t
      WHERE t.id = $1
    `;

    const result = await this.dbClient.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.hydrateTournament(result.rows[0]);
  }

  /**
   * Get tournaments by status
   * Requirements: 4.3 - Filter tournaments by status
   */
  async getByStatus(status: TournamentStatus): Promise<Tournament[]> {
    const query = `
      SELECT 
        t.id, t.name, t.date, t.club, t.location, t.genre, t.status,
        t.registration_open, t.description
      FROM tournaments t
      WHERE t.status = $1
      ORDER BY t.date DESC
    `;

    const result = await this.dbClient.query(query, [status]);

    const tournaments = await Promise.all(
      result.rows.map((row) => this.hydrateTournament(row)),
    );

    return tournaments;
  }

  /**
   * Get tournaments by genre
   * Requirements: 4.3 - Filter tournaments by genre
   */
  async getByGenre(genre: TournamentGenre): Promise<Tournament[]> {
    const query = `
      SELECT 
        t.id, t.name, t.date, t.club, t.location, t.genre, t.status,
        t.registration_open, t.description
      FROM tournaments t
      WHERE t.genre = $1
      ORDER BY t.date DESC
    `;

    const result = await this.dbClient.query(query, [genre]);

    const tournaments = await Promise.all(
      result.rows.map((row) => this.hydrateTournament(row)),
    );

    return tournaments;
  }

  /**
   * Get tournaments that have a specific category
   * Requirements: 4.4 - Filter tournaments by category
   */
  async getByCategory(category: Category): Promise<Tournament[]> {
    const query = `
      SELECT DISTINCT
        t.id, t.name, t.date, t.club, t.location, t.genre, t.status,
        t.registration_open, t.description
      FROM tournaments t
      INNER JOIN tournament_categories tc ON t.id = tc.tournament_id
      WHERE tc.category = $1
      ORDER BY t.date DESC
    `;

    const result = await this.dbClient.query(query, [category]);

    const tournaments = await Promise.all(
      result.rows.map((row) => this.hydrateTournament(row)),
    );

    return tournaments;
  }

  /**
   * Create a new tournament
   * Requirements: 4.5 - Create new tournament
   */
  async create(tournamentData: Omit<Tournament, "id">): Promise<Tournament> {
    const client = await this.dbClient.getClient();

    try {
      await client.query("BEGIN");

      // Insert tournament
      const tournamentQuery = `
        INSERT INTO tournaments (name, date, club, location, genre, status, registration_open, description)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING id
      `;

      const tournamentResult = await client.query(tournamentQuery, [
        tournamentData.name,
        tournamentData.date,
        tournamentData.club,
        tournamentData.location,
        tournamentData.genre,
        tournamentData.status,
        tournamentData.registrationOpen,
        tournamentData.description || null,
      ]);

      const tournamentId = tournamentResult.rows[0].id;

      // Insert photos
      if (tournamentData.photos && tournamentData.photos.length > 0) {
        for (let i = 0; i < tournamentData.photos.length; i++) {
          const photoQuery = `
            INSERT INTO tournament_photos (tournament_id, photo_url, display_order)
            VALUES ($1, $2, $3)
          `;

          await client.query(photoQuery, [
            tournamentId,
            tournamentData.photos[i],
            i,
          ]);
        }
      }

      // Insert categories
      if (tournamentData.categories && tournamentData.categories.length > 0) {
        for (const categoryData of tournamentData.categories) {
          const categoryQuery = `
            INSERT INTO tournament_categories (tournament_id, category)
            VALUES ($1, $2)
            RETURNING id
          `;

          const categoryResult = await client.query(categoryQuery, [
            tournamentId,
            categoryData.category,
          ]);

          const categoryId = categoryResult.rows[0].id;

          // Insert winners if results exist
          if (categoryData.results) {
            const winnersQuery = `
              INSERT INTO tournament_category_winners (category_id, placement, player_id, player_name, photo)
              VALUES ($1, $2, $3, $4, $5)
            `;

            await client.query(winnersQuery, [
              categoryId,
              1,
              categoryData.results.first.playerId,
              categoryData.results.first.playerName,
              categoryData.results.first.photo,
            ]);

            await client.query(winnersQuery, [
              categoryId,
              2,
              categoryData.results.second.playerId,
              categoryData.results.second.playerName,
              categoryData.results.second.photo,
            ]);
          }
        }
      }

      await client.query("COMMIT");

      // Fetch and return the created tournament
      const createdTournament = await this.getById(tournamentId);
      if (!createdTournament) {
        throw new Error("Failed to retrieve created tournament");
      }

      return createdTournament;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update a tournament (excluding categories)
   * Requirements: 4.6 - Update tournament data
   */
  async update(
    id: string,
    updates: Partial<Omit<Tournament, "categories">>,
  ): Promise<Tournament> {
    const client = await this.dbClient.getClient();

    try {
      await client.query("BEGIN");

      // Check if tournament exists
      const existsQuery = "SELECT id FROM tournaments WHERE id = $1";
      const existsResult = await client.query(existsQuery, [id]);

      if (existsResult.rows.length === 0) {
        throw new NotFoundError("Tournament", id);
      }

      // Build dynamic update query
      const updateFields: string[] = [];
      const updateValues: unknown[] = [];
      let paramIndex = 1;

      if (updates.name !== undefined) {
        updateFields.push(`name = $${paramIndex++}`);
        updateValues.push(updates.name);
      }
      if (updates.date !== undefined) {
        updateFields.push(`date = $${paramIndex++}`);
        updateValues.push(updates.date);
      }
      if (updates.club !== undefined) {
        updateFields.push(`club = $${paramIndex++}`);
        updateValues.push(updates.club);
      }
      if (updates.location !== undefined) {
        updateFields.push(`location = $${paramIndex++}`);
        updateValues.push(updates.location);
      }
      if (updates.genre !== undefined) {
        updateFields.push(`genre = $${paramIndex++}`);
        updateValues.push(updates.genre);
      }
      if (updates.status !== undefined) {
        updateFields.push(`status = $${paramIndex++}`);
        updateValues.push(updates.status);
      }
      if (updates.registrationOpen !== undefined) {
        updateFields.push(`registration_open = $${paramIndex++}`);
        updateValues.push(updates.registrationOpen);
      }
      if (updates.description !== undefined) {
        updateFields.push(`description = $${paramIndex++}`);
        updateValues.push(updates.description);
      }

      // Update tournament if there are changes
      if (updateFields.length > 0) {
        updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
        updateValues.push(id);

        const updateQuery = `
          UPDATE tournaments
          SET ${updateFields.join(", ")}
          WHERE id = $${paramIndex}
        `;

        await client.query(updateQuery, updateValues);
      }

      // Update photos if provided
      if (updates.photos !== undefined) {
        // Delete existing photos
        await client.query(
          "DELETE FROM tournament_photos WHERE tournament_id = $1",
          [id],
        );

        // Insert new photos
        for (let i = 0; i < updates.photos.length; i++) {
          const photoQuery = `
            INSERT INTO tournament_photos (tournament_id, photo_url, display_order)
            VALUES ($1, $2, $3)
          `;

          await client.query(photoQuery, [id, updates.photos[i], i]);
        }
      }

      await client.query("COMMIT");

      // Fetch and return the updated tournament
      const updatedTournament = await this.getById(id);
      if (!updatedTournament) {
        throw new NotFoundError("Tournament", id);
      }

      return updatedTournament;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Delete a tournament with cascade delete
   * Requirements: 4.4, 10.2 - Delete tournament with cascade
   */
  async delete(id: string): Promise<void> {
    const client = await this.dbClient.getClient();

    try {
      await client.query("BEGIN");

      // Check if tournament exists
      const existsQuery = "SELECT id FROM tournaments WHERE id = $1";
      const existsResult = await client.query(existsQuery, [id]);

      if (existsResult.rows.length === 0) {
        throw new NotFoundError("Tournament", id);
      }

      // Delete tournament (cascade will handle categories, photos, and results)
      const deleteQuery = "DELETE FROM tournaments WHERE id = $1";
      await client.query(deleteQuery, [id]);

      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Add a category to a tournament
   * Requirements: 4.7 - Add category to tournament
   */
  async addCategory(
    tournamentId: string,
    categoryData: Tournament["categories"][0],
  ): Promise<Tournament> {
    const client = await this.dbClient.getClient();

    try {
      await client.query("BEGIN");

      // Check if tournament exists
      const tournament = await this.getById(tournamentId);
      if (!tournament) {
        throw new NotFoundError("Tournament", tournamentId);
      }

      // Insert category
      const categoryQuery = `
        INSERT INTO tournament_categories (tournament_id, category)
        VALUES ($1, $2)
        RETURNING id
      `;

      const categoryResult = await client.query(categoryQuery, [
        tournamentId,
        categoryData.category,
      ]);

      const categoryId = categoryResult.rows[0].id;

      // Insert winners if results exist
      if (categoryData.results) {
        const winnersQuery = `
          INSERT INTO tournament_category_winners (category_id, placement, player_id, player_name, photo)
          VALUES ($1, $2, $3, $4, $5)
        `;

        await client.query(winnersQuery, [
          categoryId,
          1,
          categoryData.results.first.playerId,
          categoryData.results.first.playerName,
          categoryData.results.first.photo,
        ]);

        await client.query(winnersQuery, [
          categoryId,
          2,
          categoryData.results.second.playerId,
          categoryData.results.second.playerName,
          categoryData.results.second.photo,
        ]);
      }

      await client.query("COMMIT");

      // Fetch and return the updated tournament
      const updatedTournament = await this.getById(tournamentId);
      if (!updatedTournament) {
        throw new NotFoundError("Tournament", tournamentId);
      }

      return updatedTournament;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Remove a category from a tournament
   * Requirements: 4.7 - Remove category from tournament
   */
  async removeCategory(
    tournamentId: string,
    category: Category,
  ): Promise<Tournament> {
    const client = await this.dbClient.getClient();

    try {
      await client.query("BEGIN");

      // Check if tournament exists
      const tournament = await this.getById(tournamentId);
      if (!tournament) {
        throw new NotFoundError("Tournament", tournamentId);
      }

      // Delete category (cascade will delete winners)
      const deleteQuery = `
        DELETE FROM tournament_categories
        WHERE tournament_id = $1 AND category = $2
      `;

      await client.query(deleteQuery, [tournamentId, category]);

      await client.query("COMMIT");

      // Fetch and return the updated tournament
      const updatedTournament = await this.getById(tournamentId);
      if (!updatedTournament) {
        throw new NotFoundError("Tournament", tournamentId);
      }

      return updatedTournament;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update category results
   * Requirements: 4.8 - Update tournament results
   */
  async updateCategoryResults(
    tournamentId: string,
    category: Category,
    results: TournamentCategoryResults,
  ): Promise<Tournament> {
    const client = await this.dbClient.getClient();

    try {
      await client.query("BEGIN");

      // Check if tournament exists
      const tournament = await this.getById(tournamentId);
      if (!tournament) {
        throw new NotFoundError("Tournament", tournamentId);
      }

      // Get category ID
      const categoryQuery = `
        SELECT id FROM tournament_categories
        WHERE tournament_id = $1 AND category = $2
      `;

      const categoryResult = await client.query(categoryQuery, [
        tournamentId,
        category,
      ]);

      if (categoryResult.rows.length === 0) {
        throw new Error(
          `Category ${category} not found in tournament ${tournamentId}`,
        );
      }

      const categoryId = categoryResult.rows[0].id;

      // Delete existing winners
      await client.query(
        "DELETE FROM tournament_category_winners WHERE category_id = $1",
        [categoryId],
      );

      // Insert new winners
      const winnersQuery = `
        INSERT INTO tournament_category_winners (category_id, placement, player_id, player_name, photo)
        VALUES ($1, $2, $3, $4, $5)
      `;

      await client.query(winnersQuery, [
        categoryId,
        1,
        results.first.playerId,
        results.first.playerName,
        results.first.photo,
      ]);

      await client.query(winnersQuery, [
        categoryId,
        2,
        results.second.playerId,
        results.second.playerName,
        results.second.photo,
      ]);

      await client.query("COMMIT");

      // Fetch and return the updated tournament
      const updatedTournament = await this.getById(tournamentId);
      if (!updatedTournament) {
        throw new NotFoundError("Tournament", tournamentId);
      }

      return updatedTournament;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Hydrate a tournament row with nested data
   * Requirements: 4.8 - Data completeness
   */
  private async hydrateTournament(row: any): Promise<Tournament> {
    // Fetch photos
    const photosQuery = `
      SELECT photo_url
      FROM tournament_photos
      WHERE tournament_id = $1
      ORDER BY display_order
    `;

    const photosResult = await this.dbClient.query(photosQuery, [row.id]);
    const photos = photosResult.rows.map((r) => r.photo_url);

    // Fetch categories with winners
    const categoriesQuery = `
      SELECT 
        tc.id, tc.category,
        w1.player_id as first_player_id, w1.player_name as first_player_name, w1.photo as first_photo,
        w2.player_id as second_player_id, w2.player_name as second_player_name, w2.photo as second_photo
      FROM tournament_categories tc
      LEFT JOIN tournament_category_winners w1 ON tc.id = w1.category_id AND w1.placement = 1
      LEFT JOIN tournament_category_winners w2 ON tc.id = w2.category_id AND w2.placement = 2
      WHERE tc.tournament_id = $1
      ORDER BY tc.category
    `;

    const categoriesResult = await this.dbClient.query(categoriesQuery, [
      row.id,
    ]);

    const categories: TournamentCategory[] = categoriesResult.rows.map((c) => {
      const category: TournamentCategory = {
        id: c.id,
        tournamentId: row.id,
        category: c.category,
      };

      // Add results if winners exist
      if (c.first_player_id && c.second_player_id) {
        category.results = {
          first: {
            playerId: c.first_player_id,
            playerName: c.first_player_name,
            photo: c.first_photo,
          },
          second: {
            playerId: c.second_player_id,
            playerName: c.second_player_name,
            photo: c.second_photo,
          },
        };
      }

      return category;
    });

    return {
      id: row.id,
      name: row.name,
      date: row.date,
      club: row.club,
      location: row.location,
      genre: row.genre,
      status: row.status,
      registrationOpen: row.registration_open,
      description: row.description || undefined,
      photos,
      categories,
    };
  }
}
