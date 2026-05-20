import {
  Player,
  Category,
  PlayerContact,
  PlayerSocials,
  TournamentResult,
} from "@/lib/types";
import {
  IPlayerRepository,
  NotFoundError,
} from "../../repositories/interfaces";
import { DatabaseClient } from "../../database/database-client";

/**
 * SQLPlayerRepository - PostgreSQL implementation of IPlayerRepository
 *
 * Features:
 * - Full CRUD operations using PostgreSQL
 * - Row-to-object hydration for complex nested data
 * - Transaction support for multi-table operations
 * - Automatic ranking recalculation
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8
 */
export class SQLPlayerRepository implements IPlayerRepository {
  constructor(private dbClient: DatabaseClient) {}

  /**
   * Get all players with their nested data
   * Requirements: 3.1 - Retrieve all players
   */
  async getAll(): Promise<Player[]> {
    const query = `
      SELECT 
        p.id, p.first_name, p.last_name, p.photo, p.category, p.gender, p.points, p.rank,
        pc.email, pc.phone,
        ps.instagram, ps.facebook, ps.twitter
      FROM players p
      LEFT JOIN player_contacts pc ON p.id = pc.player_id
      LEFT JOIN player_socials ps ON p.id = ps.player_id
      ORDER BY p.category, p.rank
    `;

    const result = await this.dbClient.query(query);

    // Hydrate each player with their tournament results
    const players = await Promise.all(
      result.rows.map((row) => this.hydratePlayer(row)),
    );

    return players;
  }

  /**
   * Get a player by ID
   * Requirements: 3.2 - Retrieve player by ID
   */
  async getById(id: string): Promise<Player | null> {
    const query = `
      SELECT 
        p.id, p.first_name, p.last_name, p.photo, p.category, p.gender, p.points, p.rank,
        pc.email, pc.phone,
        ps.instagram, ps.facebook, ps.twitter
      FROM players p
      LEFT JOIN player_contacts pc ON p.id = pc.player_id
      LEFT JOIN player_socials ps ON p.id = ps.player_id
      WHERE p.id = $1
    `;

    const result = await this.dbClient.query(query, [id]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.hydratePlayer(result.rows[0]);
  }

  /**
   * Get players by category
   * Requirements: 3.3 - Filter players by category
   */
  async getByCategory(category: Category): Promise<Player[]> {
    const query = `
      SELECT 
        p.id, p.first_name, p.last_name, p.photo, p.category, p.gender, p.points, p.rank,
        pc.email, pc.phone,
        ps.instagram, ps.facebook, ps.twitter
      FROM players p
      LEFT JOIN player_contacts pc ON p.id = pc.player_id
      LEFT JOIN player_socials ps ON p.id = ps.player_id
      WHERE p.category = $1
      ORDER BY p.rank
    `;

    const result = await this.dbClient.query(query, [category]);

    const players = await Promise.all(
      result.rows.map((row) => this.hydratePlayer(row)),
    );

    return players;
  }

  /**
   * Create a new player
   * Requirements: 3.4 - Create new player
   */
  async create(playerData: Omit<Player, "id" | "rank">): Promise<Player> {
    const client = await this.dbClient.getClient();

    try {
      await client.query("BEGIN");

      // Insert player
      const playerQuery = `
        INSERT INTO players (first_name, last_name, photo, category, gender, points, rank)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        RETURNING id
      `;

      // Calculate initial rank (will be recalculated after insert)
      const tempRank = 999999;

      const playerResult = await client.query(playerQuery, [
        playerData.firstName,
        playerData.lastName,
        playerData.photo,
        playerData.category,
        playerData.gender,
        playerData.points,
        tempRank,
      ]);

      const playerId = playerResult.rows[0].id;

      // Insert contact
      const contactQuery = `
        INSERT INTO player_contacts (player_id, email, phone)
        VALUES ($1, $2, $3)
      `;

      await client.query(contactQuery, [
        playerId,
        playerData.contact.email,
        playerData.contact.phone,
      ]);

      // Insert socials
      const socialsQuery = `
        INSERT INTO player_socials (player_id, instagram, facebook, twitter)
        VALUES ($1, $2, $3, $4)
      `;

      await client.query(socialsQuery, [
        playerId,
        playerData.socials.instagram || null,
        playerData.socials.facebook || null,
        playerData.socials.twitter || null,
      ]);

      // Insert tournament results if any
      if (
        playerData.tournamentResults &&
        playerData.tournamentResults.length > 0
      ) {
        for (const result of playerData.tournamentResults) {
          const resultQuery = `
            INSERT INTO tournament_results (player_id, category_id, placement, date, club, photos)
            VALUES ($1, $2, $3, $4, $5, $6)
          `;

          await client.query(resultQuery, [
            playerId,
            result.tournamentId, // Using tournamentId as category_id for now
            result.placement,
            result.date,
            result.club,
            result.photos,
          ]);
        }
      }

      await client.query("COMMIT");

      // Recalculate rankings for this category
      await this.recalculateRankings(playerData.category);

      // Fetch and return the created player
      const createdPlayer = await this.getById(playerId);
      if (!createdPlayer) {
        throw new Error("Failed to retrieve created player");
      }

      return createdPlayer;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update a player
   * Requirements: 3.5 - Update player data
   */
  async update(id: string, updates: Partial<Player>): Promise<Player> {
    const client = await this.dbClient.getClient();

    try {
      await client.query("BEGIN");

      // Check if player exists
      const existsQuery = "SELECT id FROM players WHERE id = $1";
      const existsResult = await client.query(existsQuery, [id]);

      if (existsResult.rows.length === 0) {
        throw new NotFoundError("Player", id);
      }

      // Build dynamic update query for players table
      const playerUpdates: string[] = [];
      const playerValues: unknown[] = [];
      let paramIndex = 1;

      if (updates.firstName !== undefined) {
        playerUpdates.push(`first_name = $${paramIndex++}`);
        playerValues.push(updates.firstName);
      }
      if (updates.lastName !== undefined) {
        playerUpdates.push(`last_name = $${paramIndex++}`);
        playerValues.push(updates.lastName);
      }
      if (updates.photo !== undefined) {
        playerUpdates.push(`photo = $${paramIndex++}`);
        playerValues.push(updates.photo);
      }
      if (updates.category !== undefined) {
        playerUpdates.push(`category = $${paramIndex++}`);
        playerValues.push(updates.category);
      }
      if (updates.gender !== undefined) {
        playerUpdates.push(`gender = $${paramIndex++}`);
        playerValues.push(updates.gender);
      }
      if (updates.points !== undefined) {
        playerUpdates.push(`points = $${paramIndex++}`);
        playerValues.push(updates.points);
      }

      // Update players table if there are changes
      if (playerUpdates.length > 0) {
        playerUpdates.push(`updated_at = CURRENT_TIMESTAMP`);
        playerValues.push(id);

        const playerQuery = `
          UPDATE players
          SET ${playerUpdates.join(", ")}
          WHERE id = $${paramIndex}
        `;

        await client.query(playerQuery, playerValues);
      }

      // Update contact if provided
      if (updates.contact) {
        const contactQuery = `
          UPDATE player_contacts
          SET email = $1, phone = $2
          WHERE player_id = $3
        `;

        await client.query(contactQuery, [
          updates.contact.email,
          updates.contact.phone,
          id,
        ]);
      }

      // Update socials if provided
      if (updates.socials) {
        const socialsQuery = `
          UPDATE player_socials
          SET instagram = $1, facebook = $2, twitter = $3
          WHERE player_id = $4
        `;

        await client.query(socialsQuery, [
          updates.socials.instagram || null,
          updates.socials.facebook || null,
          updates.socials.twitter || null,
          id,
        ]);
      }

      await client.query("COMMIT");

      // If category or points changed, recalculate rankings
      if (updates.category !== undefined || updates.points !== undefined) {
        // Get the player's current category
        const player = await this.getById(id);
        if (player) {
          await this.recalculateRankings(player.category);
        }
      }

      // Fetch and return the updated player
      const updatedPlayer = await this.getById(id);
      if (!updatedPlayer) {
        throw new NotFoundError("Player", id);
      }

      return updatedPlayer;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Update player points and recalculate rankings
   * Requirements: 3.6 - Update points and trigger ranking recalculation
   */
  async updatePoints(id: string, points: number): Promise<Player> {
    // Check if player exists first
    const player = await this.getById(id);
    if (!player) {
      throw new NotFoundError("Player", id);
    }

    // Update points
    const query = `
      UPDATE players
      SET points = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;

    await this.dbClient.query(query, [points, id]);

    // Recalculate rankings for this category
    await this.recalculateRankings(player.category);

    // Fetch and return the updated player
    const updatedPlayer = await this.getById(id);
    if (!updatedPlayer) {
      throw new NotFoundError("Player", id);
    }

    return updatedPlayer;
  }

  /**
   * Delete a player and cascade delete related data
   * Requirements: 2.4, 10.1 - Delete player with cascade
   */
  async delete(id: string): Promise<void> {
    const client = await this.dbClient.getClient();

    try {
      await client.query("BEGIN");

      // Check if player exists and get their category
      const playerQuery = "SELECT category FROM players WHERE id = $1";
      const playerResult = await client.query(playerQuery, [id]);

      if (playerResult.rows.length === 0) {
        throw new NotFoundError("Player", id);
      }

      const category = playerResult.rows[0].category;

      // Delete tournament results (cascade)
      await client.query(
        "DELETE FROM tournament_results WHERE player_id = $1",
        [id],
      );

      // Delete player socials (cascade)
      await client.query("DELETE FROM player_socials WHERE player_id = $1", [
        id,
      ]);

      // Delete player contacts (cascade)
      await client.query("DELETE FROM player_contacts WHERE player_id = $1", [
        id,
      ]);

      // Delete player
      await client.query("DELETE FROM players WHERE id = $1", [id]);

      await client.query("COMMIT");

      // Recalculate rankings for the category
      await this.recalculateRankings(category);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Recalculate rankings for all players in a category
   * Requirements: 3.6 - Ranking recalculation
   */
  async recalculateRankings(category: Category): Promise<void> {
    const query = `
      WITH ranked_players AS (
        SELECT 
          id,
          ROW_NUMBER() OVER (ORDER BY points DESC, last_name ASC, first_name ASC) as new_rank
        FROM players
        WHERE category = $1
      )
      UPDATE players p
      SET rank = rp.new_rank, updated_at = CURRENT_TIMESTAMP
      FROM ranked_players rp
      WHERE p.id = rp.id
    `;

    await this.dbClient.query(query, [category]);
  }

  /**
   * Hydrate a player row with nested data
   * Requirements: 3.7 - Data completeness
   */
  private async hydratePlayer(row: any): Promise<Player> {
    // Fetch tournament results for this player
    const resultsQuery = `
      SELECT 
        tr.category_id as tournament_id,
        tr.placement,
        tr.date,
        tr.club,
        tr.photos
      FROM tournament_results tr
      WHERE tr.player_id = $1
      ORDER BY tr.date DESC
    `;

    const resultsResult = await this.dbClient.query(resultsQuery, [row.id]);

    const tournamentResults: TournamentResult[] = resultsResult.rows.map(
      (r) => ({
        tournamentId: r.tournament_id,
        placement: r.placement,
        date: r.date,
        club: r.club,
        photos: r.photos || [],
      }),
    );

    const contact: PlayerContact = {
      email: row.email || "",
      phone: row.phone || "",
    };

    const socials: PlayerSocials = {
      instagram: row.instagram || undefined,
      facebook: row.facebook || undefined,
      twitter: row.twitter || undefined,
    };

    return {
      id: row.id,
      firstName: row.first_name,
      lastName: row.last_name,
      photo: row.photo,
      category: row.category,
      gender: row.gender,
      points: row.points,
      rank: row.rank,
      contact,
      socials,
      tournamentResults,
    };
  }
}
