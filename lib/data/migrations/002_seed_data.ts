/**
 * Data Seeding Script
 * Migration: 002_seed_data.ts
 * Description: Seeds the database with initial mock data from existing mock files
 *
 * Usage:
 *   ts-node lib/data/migrations/002_seed_data.ts
 *
 * Environment Variables Required:
 *   DATABASE_URL - PostgreSQL connection string
 */

// @ts-ignore - pg is only needed when running this script directly
import { Pool, PoolClient } from "pg";
import { players } from "../mock/players";
import { tournaments } from "../mock/tournaments";
import { randomUUID } from "crypto";

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// ID mappings: mock ID -> UUID
const playerIdMap = new Map<string, string>();
const tournamentIdMap = new Map<string, string>();
const categoryIdMap = new Map<string, string>();

/**
 * Generate or retrieve UUID for a mock ID
 */
function getOrCreateUUID(mockId: string, map: Map<string, string>): string {
  if (!map.has(mockId)) {
    map.set(mockId, randomUUID());
  }
  return map.get(mockId)!;
}

/**
 * Seed players data
 */
async function seedPlayers(client: PoolClient) {
  console.log("Seeding players...");

  for (const player of players) {
    // Generate UUID for this player
    const playerId = getOrCreateUUID(player.id, playerIdMap);

    // Insert player
    await client.query(
      `INSERT INTO players (id, first_name, last_name, photo, category, gender, points, rank)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (id) DO UPDATE SET
         first_name = EXCLUDED.first_name,
         last_name = EXCLUDED.last_name,
         photo = EXCLUDED.photo,
         category = EXCLUDED.category,
         gender = EXCLUDED.gender,
         points = EXCLUDED.points,
         rank = EXCLUDED.rank`,
      [
        playerId,
        player.firstName,
        player.lastName,
        player.photo,
        player.category,
        player.gender,
        player.points,
        player.rank,
      ]
    );

    // Insert player contact
    await client.query(
      `INSERT INTO player_contacts (player_id, email, phone)
       VALUES ($1, $2, $3)
       ON CONFLICT (player_id) DO UPDATE SET
         email = EXCLUDED.email,
         phone = EXCLUDED.phone`,
      [playerId, player.contact.email, player.contact.phone]
    );

    // Insert player socials
    await client.query(
      `INSERT INTO player_socials (player_id, instagram, facebook, twitter)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (player_id) DO UPDATE SET
         instagram = EXCLUDED.instagram,
         facebook = EXCLUDED.facebook,
         twitter = EXCLUDED.twitter`,
      [
        playerId,
        player.socials.instagram || null,
        player.socials.facebook || null,
        player.socials.twitter || null,
      ]
    );

    // Insert tournament results for this player
    for (const result of player.tournamentResults) {
      // Get or create UUID for the tournament
      const tournamentId = getOrCreateUUID(
        result.tournamentId,
        tournamentIdMap
      );

      // Note: tournament_results table uses category_id, not tournament_id
      // We need to find the category for this tournament
      // For now, we'll skip this as it requires knowing which category the player competed in
      // This will be handled when we seed tournaments with their categories
    }

    console.log(
      `  ✓ Seeded player: ${player.firstName} ${player.lastName} (${player.category}, ${player.gender})`
    );
  }

  console.log(`✓ Seeded ${players.length} players\n`);
}

/**
 * Seed tournaments data
 */
async function seedTournaments(client: PoolClient) {
  console.log("Seeding tournaments...");

  for (const tournament of tournaments) {
    // Generate UUID for this tournament
    const tournamentId = getOrCreateUUID(tournament.id, tournamentIdMap);

    // Insert tournament
    await client.query(
      `INSERT INTO tournaments (id, name, date, club, location, genre, status, registration_open, description)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (id) DO UPDATE SET
         name = EXCLUDED.name,
         date = EXCLUDED.date,
         club = EXCLUDED.club,
         location = EXCLUDED.location,
         genre = EXCLUDED.genre,
         status = EXCLUDED.status,
         registration_open = EXCLUDED.registration_open,
         description = EXCLUDED.description`,
      [
        tournamentId,
        tournament.name,
        tournament.date,
        tournament.club,
        tournament.location,
        tournament.genre,
        tournament.status,
        tournament.registrationOpen,
        tournament.description || null,
      ]
    );

    // Insert tournament photos
    for (let i = 0; i < tournament.photos.length; i++) {
      await client.query(
        `INSERT INTO tournament_photos (tournament_id, photo_url, display_order)
         VALUES ($1, $2, $3)
         ON CONFLICT DO NOTHING`,
        [tournamentId, tournament.photos[i], i]
      );
    }

    // Insert tournament categories
    for (const categoryData of tournament.categories) {
      // Generate UUID for this category
      const categoryId = getOrCreateUUID(categoryData.id, categoryIdMap);

      await client.query(
        `INSERT INTO tournament_categories (id, tournament_id, category)
         VALUES ($1, $2, $3)
         ON CONFLICT (id) DO UPDATE SET
           category = EXCLUDED.category`,
        [categoryId, tournamentId, categoryData.category]
      );

      // Insert category winners (if completed)
      if (categoryData.results) {
        // Get UUIDs for player IDs
        const firstPlayerId = getOrCreateUUID(
          categoryData.results.first.playerId,
          playerIdMap
        );
        const secondPlayerId = getOrCreateUUID(
          categoryData.results.second.playerId,
          playerIdMap
        );

        // First place
        await client.query(
          `INSERT INTO tournament_category_winners (category_id, placement, player_id, player_name, photo)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (category_id, placement) DO UPDATE SET
             player_id = EXCLUDED.player_id,
             player_name = EXCLUDED.player_name,
             photo = EXCLUDED.photo`,
          [
            categoryId,
            1,
            firstPlayerId,
            categoryData.results.first.playerName,
            categoryData.results.first.photo,
          ]
        );

        // Second place
        await client.query(
          `INSERT INTO tournament_category_winners (category_id, placement, player_id, player_name, photo)
           VALUES ($1, $2, $3, $4, $5)
           ON CONFLICT (category_id, placement) DO UPDATE SET
             player_id = EXCLUDED.player_id,
             player_name = EXCLUDED.player_name,
             photo = EXCLUDED.photo`,
          [
            categoryId,
            2,
            secondPlayerId,
            categoryData.results.second.playerName,
            categoryData.results.second.photo,
          ]
        );
      }
    }

    console.log(
      `  ✓ Seeded tournament: ${tournament.name} (${tournament.genre}, ${tournament.categories.length} categories)`
    );
  }

  console.log(`✓ Seeded ${tournaments.length} tournaments\n`);
}

/**
 * Main seeding function
 */
async function seed() {
  const client = await pool.connect();

  try {
    console.log("Starting database seeding...\n");
    console.log("Database:", process.env.DATABASE_URL?.split("@")[1] || "N/A");
    console.log("=".repeat(60) + "\n");

    // Start transaction
    await client.query("BEGIN");

    // Seed data
    await seedPlayers(client);
    await seedTournaments(client);

    // Commit transaction
    await client.query("COMMIT");

    console.log("=".repeat(60));
    console.log("✓ Database seeding completed successfully!");
    console.log("=".repeat(60));
    console.log("\n📝 ID Mappings (Mock ID → UUID):");
    console.log(`  Players: ${playerIdMap.size} mappings`);
    console.log(`  Tournaments: ${tournamentIdMap.size} mappings`);
    console.log(`  Categories: ${categoryIdMap.size} mappings`);
    console.log("\n💡 Note: UUIDs are generated for database compatibility");
    console.log("   Mock data still uses simple IDs (1, 2, 3, etc.)");
  } catch (error) {
    // Rollback on error
    await client.query("ROLLBACK");
    console.error("\n✗ Error seeding database:");
    console.error(error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

// Run seeding if executed directly
if (require.main === module) {
  // Validate environment
  if (!process.env.DATABASE_URL) {
    console.error("✗ Error: DATABASE_URL environment variable is required");
    console.error(
      "  Example: DATABASE_URL=postgresql://user:password@localhost:5432/riviera_db"
    );
    process.exit(1);
  }

  seed().catch((error) => {
    console.error("✗ Unexpected error:", error);
    process.exit(1);
  });
}

export { seed };
