/**
 * Property-based tests for PlayerAdminService
 * Tests cascade delete, search, and filter properties
 * Requirements: 2.4, 2.5, 10.1, 12.1, 12.3
 *
 * Feature: admin-interface, Property 4: Cascade Delete Consistency
 * Feature: admin-interface, Property 9: Search Result Consistency
 * Feature: admin-interface, Property 10: Filter Combination Correctness
 */

import * as fc from "fast-check";

// Mock the repository factory before any imports
jest.mock("../../../data/repositories/repository-factory", () => ({
  __esModule: true,
  default: {
    getPlayerRepository: jest.fn(),
  },
}));

import { PlayerAdminService } from "../PlayerAdminService";
import { MockPlayerRepository } from "../../../data/implementations/mock/mock-player-repository";
import RepositoryFactory from "../../../data/repositories/repository-factory";
import type { Player, Category } from "../../../types";

describe("PlayerAdminService - Property-Based Tests", () => {
  let service: PlayerAdminService;
  let mockRepository: MockPlayerRepository;

  beforeEach(() => {
    mockRepository = new MockPlayerRepository();
    (RepositoryFactory.getPlayerRepository as jest.Mock).mockResolvedValue(
      mockRepository,
    );
    service = new PlayerAdminService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // Generators
  const categoryArb = fc.constantFrom(
    "Open" as Category,
    "1" as Category,
    "2" as Category,
    "3" as Category,
    "4" as Category,
    "5" as Category,
    "6" as Category,
  );

  const genderArb = fc.constantFrom("Male", "Female");

  const playerDataArb = fc.record({
    firstName: fc
      .string({ minLength: 1, maxLength: 50 })
      .filter((s) => s.trim().length > 0),
    lastName: fc
      .string({ minLength: 1, maxLength: 50 })
      .filter((s) => s.trim().length > 0),
    photo: fc.webUrl(),
    category: categoryArb,
    gender: genderArb,
    points: fc.nat({ max: 5000 }),
    contact: fc.record({
      email: fc.emailAddress(),
      phone: fc
        .string({ minLength: 10, maxLength: 15 })
        .map((s) => `+${s.replace(/\D/g, "")}`),
    }),
    socials: fc.record({
      instagram: fc.option(fc.webUrl(), { nil: "" }),
      facebook: fc.option(fc.webUrl(), { nil: "" }),
      twitter: fc.option(fc.webUrl(), { nil: "" }),
    }),
  });

  /**
   * Property 4: Cascade Delete Consistency
   * For any player, deleting them should remove them from the repository
   * and recalculate rankings for their category
   * Validates: Requirements 2.4, 10.1
   */
  describe("Property 4: Cascade Delete Consistency", () => {
    it("should remove player and recalculate rankings after delete", async () => {
      await fc.assert(
        fc.asyncProperty(playerDataArb, async (playerData) => {
          // Create a player
          const player = await mockRepository.create({
            ...playerData,
            tournamentResults: [],
          });

          // Get initial count of players in the category
          const initialPlayers = await mockRepository.getByCategory(
            player.category,
          );
          const initialCount = initialPlayers.length;

          // Delete the player
          await service.deletePlayer(player.id);

          // Verify player is deleted
          const deletedPlayer = await mockRepository.getById(player.id);
          expect(deletedPlayer).toBeNull();

          // Verify category player count decreased
          const remainingPlayers = await mockRepository.getByCategory(
            player.category,
          );
          expect(remainingPlayers.length).toBe(initialCount - 1);

          // Verify rankings are recalculated (no gaps in ranks)
          const ranks = remainingPlayers
            .map((p) => p.rank)
            .sort((a, b) => a - b);
          for (let i = 0; i < ranks.length; i++) {
            expect(ranks[i]).toBe(i + 1);
          }
        }),
        { numRuns: 100 },
      );
    });

    it("should handle deleting multiple players from same category", async () => {
      await fc.assert(
        fc.asyncProperty(
          categoryArb,
          fc.array(playerDataArb, { minLength: 2, maxLength: 5 }),
          async (category, playersData) => {
            // Create multiple players in the same category
            const players: Player[] = [];
            for (const data of playersData) {
              const player = await mockRepository.create({
                ...data,
                category,
                tournamentResults: [],
              });
              players.push(player);
            }

            // Delete all but one player
            for (let i = 0; i < players.length - 1; i++) {
              await service.deletePlayer(players[i].id);
            }

            // Verify only one player remains
            const remaining = await mockRepository.getByCategory(category);
            expect(remaining.length).toBeGreaterThanOrEqual(1);

            // Verify the remaining player has rank 1 (or appropriate rank)
            const categoryPlayers = remaining.filter(
              (p) => p.category === category,
            );
            if (categoryPlayers.length === 1) {
              expect(categoryPlayers[0].rank).toBe(1);
            }
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 9: Search Result Consistency
   * For any search query, all returned players should have names containing the query
   * Validates: Requirements 2.5, 12.1
   */
  describe("Property 9: Search Result Consistency", () => {
    it("should return only players whose names contain the search query", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(playerDataArb, { minLength: 3, maxLength: 10 }),
          fc
            .string({ minLength: 1, maxLength: 10 })
            .filter((s) => s.trim().length > 0),
          async (playersData, searchQuery) => {
            // Create players
            const players: Player[] = [];
            for (const data of playersData) {
              const player = await mockRepository.create({
                ...data,
                tournamentResults: [],
              });
              players.push(player);
            }

            // Search for players
            const results = await service.searchPlayers(searchQuery);

            // Verify all results contain the search query (case-insensitive)
            const lowerQuery = searchQuery.toLowerCase().trim();
            results.forEach((player) => {
              const fullName =
                `${player.firstName} ${player.lastName}`.toLowerCase();
              expect(fullName).toContain(lowerQuery);
            });
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should be case-insensitive", async () => {
      await fc.assert(
        fc.asyncProperty(
          playerDataArb,
          fc.constantFrom("upper", "lower", "mixed"),
          async (playerData, caseType) => {
            // Create a player
            const player = await mockRepository.create({
              ...playerData,
              tournamentResults: [],
            });

            // Search with different cases
            let searchQuery = player.firstName.substring(0, 3);
            if (caseType === "upper") {
              searchQuery = searchQuery.toUpperCase();
            } else if (caseType === "lower") {
              searchQuery = searchQuery.toLowerCase();
            }

            const results = await service.searchPlayers(searchQuery);

            // Should find the player regardless of case
            const found = results.some((p) => p.id === player.id);
            expect(found).toBe(true);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should return all players for empty query", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(playerDataArb, { minLength: 1, maxLength: 5 }),
          async (playersData) => {
            // Create players
            const createdPlayers: Player[] = [];
            for (const data of playersData) {
              const player = await mockRepository.create({
                ...data,
                tournamentResults: [],
              });
              createdPlayers.push(player);
            }

            // Search with empty query
            const results = await service.searchPlayers("");

            // Should return at least the created players
            expect(results.length).toBeGreaterThanOrEqual(
              createdPlayers.length,
            );
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 10: Filter Combination Correctness
   * For any combination of filters, all returned players should match ALL filter criteria
   * Validates: Requirements 2.5, 4.5, 12.3
   */
  describe("Property 10: Filter Combination Correctness", () => {
    it("should return only players matching category filter", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(playerDataArb, { minLength: 5, maxLength: 10 }),
          categoryArb,
          async (playersData, filterCategory) => {
            // Create players with various categories
            for (const data of playersData) {
              await mockRepository.create({
                ...data,
                tournamentResults: [],
              });
            }

            // Filter by category
            const results = await service.filterPlayers({
              category: filterCategory,
            });

            // Verify all results match the category
            results.forEach((player) => {
              expect(player.category).toBe(filterCategory);
            });
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should return only players matching gender filter", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(playerDataArb, { minLength: 5, maxLength: 10 }),
          genderArb,
          async (playersData, filterGender) => {
            // Create players with various genders
            for (const data of playersData) {
              await mockRepository.create({
                ...data,
                tournamentResults: [],
              });
            }

            // Filter by gender
            const results = await service.filterPlayers({
              gender: filterGender,
            });

            // Verify all results match the gender
            results.forEach((player) => {
              expect(player.gender).toBe(filterGender);
            });
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should return only players matching both category and gender filters", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(playerDataArb, { minLength: 10, maxLength: 20 }),
          categoryArb,
          genderArb,
          async (playersData, filterCategory, filterGender) => {
            // Create players with various categories and genders
            for (const data of playersData) {
              await mockRepository.create({
                ...data,
                tournamentResults: [],
              });
            }

            // Filter by both category and gender
            const results = await service.filterPlayers({
              category: filterCategory,
              gender: filterGender,
            });

            // Verify all results match both filters
            results.forEach((player) => {
              expect(player.category).toBe(filterCategory);
              expect(player.gender).toBe(filterGender);
            });
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should return all players when no filters are applied", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(playerDataArb, { minLength: 1, maxLength: 5 }),
          async (playersData) => {
            // Create players
            const createdPlayers: Player[] = [];
            for (const data of playersData) {
              const player = await mockRepository.create({
                ...data,
                tournamentResults: [],
              });
              createdPlayers.push(player);
            }

            // Filter with no criteria
            const results = await service.filterPlayers({});

            // Should return at least the created players
            expect(results.length).toBeGreaterThanOrEqual(
              createdPlayers.length,
            );
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should handle filters that match no players", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(playerDataArb, { minLength: 3, maxLength: 5 }),
          categoryArb,
          genderArb,
          async (playersData, filterCategory, filterGender) => {
            // Create players with specific category/gender combinations
            for (const data of playersData) {
              await mockRepository.create({
                ...data,
                category:
                  filterCategory === "Open" ? ("1" as Category) : "Open",
                gender: filterGender === "Male" ? "Female" : "Male",
                tournamentResults: [],
              });
            }

            // Filter with criteria that won't match
            const results = await service.filterPlayers({
              category: filterCategory,
              gender: filterGender,
            });

            // Should return empty array or only pre-existing matching players
            results.forEach((player) => {
              expect(player.category).toBe(filterCategory);
              expect(player.gender).toBe(filterGender);
            });
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
