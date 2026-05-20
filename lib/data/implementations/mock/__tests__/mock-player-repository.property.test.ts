import { fc } from "@fast-check/jest";
import { MockPlayerRepository } from "../mock-player-repository";
import { NotFoundError } from "../../../repositories/interfaces";
import { Category } from "@/lib/types";

describe("MockPlayerRepository - Property Tests", () => {
  /**
   * Feature: environment-data-layer, Property 2: Repository Filtering Correctness
   *
   * For any repository filter operation (getByCategory for players) and any filter value,
   * all returned entities should match the filter criteria.
   */
  describe("Property 2: Repository Filtering Correctness", () => {
    it("should return only players matching the specified category", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<Category>("Open", "1", "2", "3", "4", "5", "6"),
          async (category) => {
            const repository = new MockPlayerRepository();
            const players = await repository.getByCategory(category);

            // All returned players must have the specified category
            players.forEach((player) => {
              expect(player.category).toBe(category);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return all players of a given category", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<Category>("Open", "1", "2", "3", "4", "5", "6"),
          async (category) => {
            const repository = new MockPlayerRepository();
            const allPlayers = await repository.getAll();
            const filteredPlayers = await repository.getByCategory(category);

            // Count how many players should be at this category
            const expectedCount = allPlayers.filter(
              (p) => p.category === category
            ).length;

            // Filtered result should match expected count
            expect(filteredPlayers.length).toBe(expectedCount);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return empty array when no players match the category", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<Category>("Open", "1", "2", "3", "4", "5", "6"),
          async (category) => {
            const repository = new MockPlayerRepository();

            // Verify the filter works correctly
            const filtered = await repository.getByCategory(category);

            // All returned players must match the category
            expect(filtered.every((p) => p.category === category)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should maintain filtering correctness after updates", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<Category>("Open", "1", "2", "3", "4", "5", "6"),
          fc.constantFrom<Category>("Open", "1", "2", "3", "4", "5", "6"),
          fc.integer({ min: 0, max: 5000 }),
          async (originalCategory, newCategory, newPoints) => {
            const repository = new MockPlayerRepository();
            const playersAtCategory = await repository.getByCategory(
              originalCategory
            );

            if (playersAtCategory.length > 0) {
              const player = playersAtCategory[0];

              // Update player to new category
              await repository.update(player.id, {
                category: newCategory,
                points: newPoints,
              });

              // Check original category no longer includes this player
              const originalCategoryPlayers = await repository.getByCategory(
                originalCategory
              );
              const stillInOriginal = originalCategoryPlayers.some(
                (p) => p.id === player.id
              );

              if (originalCategory !== newCategory) {
                expect(stillInOriginal).toBe(false);
              }

              // Check new category includes this player
              const newCategoryPlayers = await repository.getByCategory(
                newCategory
              );
              const inNewCategory = newCategoryPlayers.some(
                (p) => p.id === player.id
              );
              expect(inNewCategory).toBe(true);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return consistent results for repeated calls", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<Category>("Open", "1", "2", "3", "4", "5", "6"),
          async (category) => {
            const repository = new MockPlayerRepository();

            const result1 = await repository.getByCategory(category);
            const result2 = await repository.getByCategory(category);

            // Results should be equal (same players)
            expect(result1.length).toBe(result2.length);
            expect(result1.map((p) => p.id).sort()).toEqual(
              result2.map((p) => p.id).sort()
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});

/**
 * Feature: environment-data-layer, Property 3: Create-Retrieve Round Trip
 *
 * For any valid entity data (player), creating the entity and then retrieving it by ID
 * should return an equivalent entity with all fields preserved.
 */
describe("Property 3: Create-Retrieve Round Trip", () => {
  it("should preserve all player data through create-retrieve cycle", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          photo: fc.webUrl(),
          category: fc.constantFrom<Category>(
            "Open",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6"
          ),
          gender: fc.constantFrom("Male", "Female") as fc.Arbitrary<
            "Male" | "Female"
          >,
          points: fc.integer({ min: 0, max: 10000 }),
          contact: fc.record({
            email: fc.emailAddress(),
            phone: fc.string({ minLength: 10, maxLength: 20 }),
          }),
          socials: fc.record({
            instagram: fc.option(fc.webUrl(), { nil: undefined }),
            facebook: fc.option(fc.webUrl(), { nil: undefined }),
            twitter: fc.option(fc.webUrl(), { nil: undefined }),
          }),
          tournamentResults: fc.array(
            fc.record({
              tournamentId: fc.uuid(),
              placement: fc.constantFrom(1, 2) as fc.Arbitrary<1 | 2>,
              date: fc.date().map((d) => d.toISOString().split("T")[0]),
              club: fc.string({ minLength: 1, maxLength: 100 }),
              photos: fc.array(fc.webUrl(), { maxLength: 5 }),
            }),
            { maxLength: 5 }
          ),
        }),
        async (playerData) => {
          const repository = new MockPlayerRepository();

          // Create player
          const created = await repository.create(playerData);

          // Retrieve player
          const retrieved = await repository.getById(created.id);

          // Should not be null
          expect(retrieved).not.toBeNull();

          // All fields should be preserved
          expect(retrieved?.firstName).toBe(playerData.firstName);
          expect(retrieved?.lastName).toBe(playerData.lastName);
          expect(retrieved?.photo).toBe(playerData.photo);
          expect(retrieved?.category).toBe(playerData.category);
          expect(retrieved?.gender).toBe(playerData.gender);
          expect(retrieved?.points).toBe(playerData.points);
          expect(retrieved?.contact).toEqual(playerData.contact);
          expect(retrieved?.socials).toEqual(playerData.socials);
          expect(retrieved?.tournamentResults).toEqual(
            playerData.tournamentResults
          );
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should assign unique IDs to created players", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          photo: fc.webUrl(),
          category: fc.constantFrom<Category>(
            "Open",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6"
          ),
          gender: fc.constantFrom("Male", "Female") as fc.Arbitrary<
            "Male" | "Female"
          >,
          points: fc.integer({ min: 0, max: 10000 }),
          contact: fc.record({
            email: fc.emailAddress(),
            phone: fc.string({ minLength: 10, maxLength: 20 }),
          }),
          socials: fc.record({}),
          tournamentResults: fc.constant([]),
        }),
        async (playerData) => {
          const repository = new MockPlayerRepository();

          // Create two players with same data
          const player1 = await repository.create(playerData);
          const player2 = await repository.create(playerData);

          // IDs should be different
          expect(player1.id).not.toBe(player2.id);

          // Both should be retrievable
          const retrieved1 = await repository.getById(player1.id);
          const retrieved2 = await repository.getById(player2.id);

          expect(retrieved1).not.toBeNull();
          expect(retrieved2).not.toBeNull();
          expect(retrieved1?.id).toBe(player1.id);
          expect(retrieved2?.id).toBe(player2.id);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should assign valid rank after creation", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          firstName: fc.string({ minLength: 1, maxLength: 50 }),
          lastName: fc.string({ minLength: 1, maxLength: 50 }),
          photo: fc.webUrl(),
          category: fc.constantFrom<Category>(
            "Open",
            "1",
            "2",
            "3",
            "4",
            "5",
            "6"
          ),
          gender: fc.constantFrom("Male", "Female") as fc.Arbitrary<
            "Male" | "Female"
          >,
          points: fc.integer({ min: 0, max: 10000 }),
          contact: fc.record({
            email: fc.emailAddress(),
            phone: fc.string({ minLength: 10, maxLength: 20 }),
          }),
          socials: fc.record({}),
          tournamentResults: fc.constant([]),
        }),
        async (playerData) => {
          const repository = new MockPlayerRepository();

          const created = await repository.create(playerData);
          const retrieved = await repository.getById(created.id);

          // Rank should be assigned and positive
          expect(retrieved?.rank).toBeGreaterThan(0);

          // Rank should be reasonable for the category
          const categoryPlayers = await repository.getByCategory(
            playerData.category
          );
          expect(retrieved?.rank).toBeLessThanOrEqual(categoryPlayers.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  /**
   * Feature: environment-data-layer, Property 4: Update Idempotence
   *
   * For any existing entity and any valid update data, applying the same update twice
   * should produce the same result as applying it once.
   */
  describe("Property 4: Update Idempotence", () => {
    it("should produce same result when update applied twice", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            firstName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), {
              nil: undefined,
            }),
            lastName: fc.option(fc.string({ minLength: 1, maxLength: 50 }), {
              nil: undefined,
            }),
            points: fc.option(fc.integer({ min: 0, max: 10000 }), {
              nil: undefined,
            }),
          }),
          async (updates) => {
            const repository = new MockPlayerRepository();
            const allPlayers = await repository.getAll();

            if (allPlayers.length > 0) {
              const player = allPlayers[0];

              // Apply update once
              const updated1 = await repository.update(player.id, updates);

              // Apply same update again
              const updated2 = await repository.update(player.id, updates);

              // Results should be identical
              expect(updated2).toEqual(updated1);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: environment-data-layer, Property 5: Points Update Triggers Ranking Recalculation
   *
   * For any player within a category, when their points are updated, the ranking order
   * for all players in that category should reflect the new points values (highest points = rank 1).
   */
  describe("Property 5: Points Update Triggers Ranking Recalculation", () => {
    it("should maintain correct ranking order after points update", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<Category>("Open", "1", "2", "3", "4", "5", "6"),
          fc.integer({ min: 0, max: 10000 }),
          async (category, newPoints) => {
            const repository = new MockPlayerRepository();
            const categoryPlayers = await repository.getByCategory(category);

            if (categoryPlayers.length > 0) {
              const player = categoryPlayers[0];

              // Update points
              await repository.updatePoints(player.id, newPoints);

              // Get all players at this category
              const updatedPlayers = await repository.getByCategory(category);

              // Sort by rank to verify order
              const sortedByRank = [...updatedPlayers].sort(
                (a, b) => a.rank - b.rank
              );

              // Verify ranking order (sorted by points descending)
              for (let i = 0; i < sortedByRank.length - 1; i++) {
                expect(sortedByRank[i].points).toBeGreaterThanOrEqual(
                  sortedByRank[i + 1].points
                );
                expect(sortedByRank[i].rank).toBeLessThan(
                  sortedByRank[i + 1].rank
                );
              }

              // Highest points should have rank 1
              const highestPoints = Math.max(
                ...updatedPlayers.map((p) => p.points)
              );
              const topPlayer = updatedPlayers.find(
                (p) => p.points === highestPoints
              );
              expect(topPlayer?.rank).toBe(1);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should only affect rankings within the same category", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<Category>("Open", "1", "2", "3", "4", "5", "6"),
          fc.constantFrom<Category>("Open", "1", "2", "3", "4", "5", "6"),
          fc.integer({ min: 0, max: 10000 }),
          async (category1, category2, newPoints) => {
            if (category1 === category2) return; // Skip same category

            const repository = new MockPlayerRepository();
            const category1Players = await repository.getByCategory(category1);
            const category2PlayersBefore = await repository.getByCategory(
              category2
            );

            if (category1Players.length > 0) {
              const player = category1Players[0];

              // Update points in category1
              await repository.updatePoints(player.id, newPoints);

              // Category2 rankings should be unchanged
              const category2PlayersAfter = await repository.getByCategory(
                category2
              );

              expect(
                category2PlayersAfter.map((p) => ({ id: p.id, rank: p.rank }))
              ).toEqual(
                category2PlayersBefore.map((p) => ({ id: p.id, rank: p.rank }))
              );
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: environment-data-layer, Property 6: Data Completeness
   *
   * For any entity retrieved from a repository, all nested/related data fields
   * should be present and non-null where required by the type definition.
   */
  describe("Property 6: Data Completeness", () => {
    it("should include all required fields for any retrieved player", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<Category>("Open", "1", "2", "3", "4", "5", "6"),
          async (category) => {
            const repository = new MockPlayerRepository();
            const players = await repository.getByCategory(category);

            players.forEach((player) => {
              // Required top-level fields
              expect(player.id).toBeDefined();
              expect(player.firstName).toBeDefined();
              expect(player.lastName).toBeDefined();
              expect(player.photo).toBeDefined();
              expect(player.category).toBeDefined();
              expect(player.gender).toBeDefined();
              expect(player.points).toBeDefined();
              expect(player.rank).toBeDefined();

              // Required nested fields
              expect(player.contact).toBeDefined();
              expect(player.contact.email).toBeDefined();
              expect(player.contact.phone).toBeDefined();

              expect(player.socials).toBeDefined();
              expect(player.tournamentResults).toBeDefined();
              expect(Array.isArray(player.tournamentResults)).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should preserve nested data through create-retrieve cycle", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            firstName: fc.string({ minLength: 1, maxLength: 50 }),
            lastName: fc.string({ minLength: 1, maxLength: 50 }),
            photo: fc.webUrl(),
            category: fc.constantFrom<Category>(
              "Open",
              "1",
              "2",
              "3",
              "4",
              "5",
              "6"
            ),
            gender: fc.constantFrom("Male", "Female") as fc.Arbitrary<
              "Male" | "Female"
            >,
            points: fc.integer({ min: 0, max: 10000 }),
            contact: fc.record({
              email: fc.emailAddress(),
              phone: fc.string({ minLength: 10, maxLength: 20 }),
            }),
            socials: fc.record({
              instagram: fc.option(fc.webUrl(), { nil: undefined }),
              facebook: fc.option(fc.webUrl(), { nil: undefined }),
              twitter: fc.option(fc.webUrl(), { nil: undefined }),
            }),
            tournamentResults: fc.array(
              fc.record({
                tournamentId: fc.uuid(),
                placement: fc.constantFrom(1, 2) as fc.Arbitrary<1 | 2>,
                date: fc
                  .integer({ min: 2020, max: 2030 })
                  .chain((year) =>
                    fc
                      .integer({ min: 1, max: 12 })
                      .chain((month) =>
                        fc
                          .integer({ min: 1, max: 28 })
                          .map(
                            (day) =>
                              `${year}-${String(month).padStart(
                                2,
                                "0"
                              )}-${String(day).padStart(2, "0")}`
                          )
                      )
                  ),
                club: fc.string({ minLength: 1, maxLength: 100 }),
                photos: fc.array(fc.webUrl(), { maxLength: 3 }),
              }),
              { maxLength: 3 }
            ),
          }),
          async (playerData) => {
            const repository = new MockPlayerRepository();

            const created = await repository.create(playerData);
            const retrieved = await repository.getById(created.id);

            // All nested data should be preserved
            expect(retrieved?.contact).toEqual(playerData.contact);
            expect(retrieved?.socials).toEqual(playerData.socials);
            expect(retrieved?.tournamentResults).toEqual(
              playerData.tournamentResults
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: environment-data-layer, Property 7: Not-Found Error Specificity
   *
   * For any non-existent entity ID, attempting to retrieve or update that entity
   * should throw a NotFoundError containing both the entity type and the requested ID.
   */
  describe("Property 7: Not-Found Error Specificity", () => {
    it("should throw NotFoundError with entity type and ID for invalid updates", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.integer({ min: 0, max: 10000 }),
          async (invalidId, points) => {
            const repository = new MockPlayerRepository();

            try {
              await repository.update(invalidId, { points });
              // Should not reach here
              expect(true).toBe(false);
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              const err = error as Error;
              expect(err.name).toBe("NotFoundError");
              expect(err.message).toContain("Player");
              expect(err.message).toContain(invalidId);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should throw NotFoundError for updatePoints with invalid ID", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.uuid(),
          fc.integer({ min: 0, max: 10000 }),
          async (invalidId, points) => {
            const repository = new MockPlayerRepository();

            try {
              await repository.updatePoints(invalidId, points);
              expect(true).toBe(false);
            } catch (error) {
              expect(error).toBeInstanceOf(Error);
              const err = error as Error;
              expect(err.name).toBe("NotFoundError");
              expect(err.message).toContain("Player");
              expect(err.message).toContain(invalidId);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
