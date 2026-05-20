import { fc } from "@fast-check/jest";
import { MockTournamentRepository } from "../mock-tournament-repository";
import { Category, TournamentStatus, TournamentGenre } from "@/lib/types";

describe("MockTournamentRepository - Property Tests", () => {
  /**
   * Feature: environment-data-layer, Property 2: Repository Filtering Correctness (for tournaments)
   */
  describe("Property 2: Repository Filtering Correctness", () => {
    it("should return only tournaments matching the specified status", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<TournamentStatus>(
            "upcoming",
            "in-progress",
            "completed"
          ),
          async (status) => {
            const repository = new MockTournamentRepository();
            const tournaments = await repository.getByStatus(status);

            tournaments.forEach((tournament) => {
              expect(tournament.status).toBe(status);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return only tournaments matching the specified category", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<Category>("Open", "1", "2", "3", "4", "5", "6"),
          async (category) => {
            const repository = new MockTournamentRepository();
            const tournaments = await repository.getByCategory(category);

            tournaments.forEach((tournament) => {
              expect(
                tournament.categories.some((c) => c.category === category)
              ).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should return only tournaments matching the specified genre", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<TournamentGenre>("Open", "Women"),
          async (genre) => {
            const repository = new MockTournamentRepository();
            const tournaments = await repository.getByGenre(genre);

            tournaments.forEach((tournament) => {
              expect(tournament.genre).toBe(genre);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: environment-data-layer, Property 3: Create-Retrieve Round Trip (for tournaments)
   */
  describe("Property 3: Create-Retrieve Round Trip", () => {
    it("should preserve all tournament data through create-retrieve cycle", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.string({ minLength: 1, maxLength: 200 }),
            date: fc.date().map((d) => d.toISOString().split("T")[0]),
            club: fc.string({ minLength: 1, maxLength: 200 }),
            location: fc.string({ minLength: 1, maxLength: 200 }),
            genre: fc.constantFrom<TournamentGenre>("Open", "Women"),
            categories: fc.array(
              fc.record({
                category: fc.constantFrom<Category>(
                  "Open",
                  "1",
                  "2",
                  "3",
                  "4",
                  "5",
                  "6"
                ),
                maxTeams: fc.integer({ min: 4, max: 32 }),
                registeredTeams: fc.integer({ min: 0, max: 32 }),
              }),
              { minLength: 1, maxLength: 3 }
            ),
            status: fc.constantFrom<TournamentStatus>(
              "upcoming",
              "in-progress",
              "completed"
            ),
            registrationOpen: fc.boolean(),
            photos: fc.array(fc.webUrl(), { minLength: 1, maxLength: 10 }),
            description: fc.option(fc.string({ maxLength: 500 }), {
              nil: undefined,
            }),
          }),
          async (tournamentData) => {
            const repository = new MockTournamentRepository();

            const created = await repository.create(tournamentData);
            const retrieved = await repository.getById(created.id);

            expect(retrieved).not.toBeNull();
            expect(retrieved?.name).toBe(tournamentData.name);
            expect(retrieved?.date).toBe(tournamentData.date);
            expect(retrieved?.club).toBe(tournamentData.club);
            expect(retrieved?.location).toBe(tournamentData.location);
            expect(retrieved?.genre).toBe(tournamentData.genre);
            expect(retrieved?.categories).toEqual(tournamentData.categories);
            expect(retrieved?.status).toBe(tournamentData.status);
            expect(retrieved?.registrationOpen).toBe(
              tournamentData.registrationOpen
            );
            expect(retrieved?.photos).toEqual(tournamentData.photos);
            expect(retrieved?.description).toBe(tournamentData.description);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: environment-data-layer, Property 4: Update Idempotence (for tournaments)
   */
  describe("Property 4: Update Idempotence", () => {
    it("should produce same result when update applied twice", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc.option(fc.string({ minLength: 1, maxLength: 200 }), {
              nil: undefined,
            }),
            registrationOpen: fc.option(fc.boolean(), { nil: undefined }),
          }),
          async (updates) => {
            const repository = new MockTournamentRepository();
            const allTournaments = await repository.getAll();

            if (allTournaments.length > 0) {
              const tournament = allTournaments[0];

              const updated1 = await repository.update(tournament.id, updates);
              const updated2 = await repository.update(tournament.id, updates);

              expect(updated2).toEqual(updated1);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: environment-data-layer, Property 6: Data Completeness (for tournaments)
   */
  describe("Property 6: Data Completeness", () => {
    it("should include all required fields for any retrieved tournament", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom<TournamentStatus>(
            "upcoming",
            "in-progress",
            "completed"
          ),
          async (status) => {
            const repository = new MockTournamentRepository();
            const tournaments = await repository.getByStatus(status);

            tournaments.forEach((tournament) => {
              expect(tournament.id).toBeDefined();
              expect(tournament.name).toBeDefined();
              expect(tournament.date).toBeDefined();
              expect(tournament.club).toBeDefined();
              expect(tournament.location).toBeDefined();
              expect(tournament.genre).toBeDefined();
              expect(tournament.categories).toBeDefined();
              expect(Array.isArray(tournament.categories)).toBe(true);
              expect(tournament.categories.length).toBeGreaterThan(0);
              expect(tournament.status).toBeDefined();
              expect(tournament.registrationOpen).toBeDefined();
              expect(tournament.photos).toBeDefined();
              expect(Array.isArray(tournament.photos)).toBe(true);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
