import { MockTournamentRepository } from "../mock-tournament-repository";
import { NotFoundError } from "../../../repositories/interfaces";
import { Category, TournamentStatus, TournamentGenre } from "@/lib/types";

describe("MockTournamentRepository", () => {
  let repository: MockTournamentRepository;

  beforeEach(() => {
    repository = new MockTournamentRepository();
  });

  describe("getAll", () => {
    it("should return all tournaments", async () => {
      const tournaments = await repository.getAll();

      expect(tournaments).toBeDefined();
      expect(tournaments.length).toBeGreaterThan(0);
    });

    it("should return a copy of tournaments array", async () => {
      const tournaments1 = await repository.getAll();
      const tournaments2 = await repository.getAll();

      expect(tournaments1).not.toBe(tournaments2);
      expect(tournaments1).toEqual(tournaments2);
    });

    it("should include all tournament properties", async () => {
      const tournaments = await repository.getAll();
      const tournament = tournaments[0];

      expect(tournament).toHaveProperty("id");
      expect(tournament).toHaveProperty("name");
      expect(tournament).toHaveProperty("date");
      expect(tournament).toHaveProperty("club");
      expect(tournament).toHaveProperty("location");
      expect(tournament).toHaveProperty("genre");
      expect(tournament).toHaveProperty("categories");
      expect(tournament).toHaveProperty("status");
      expect(tournament).toHaveProperty("registrationOpen");
      expect(tournament).toHaveProperty("photos");
    });
  });

  describe("getById", () => {
    it("should return tournament with valid ID", async () => {
      const allTournaments = await repository.getAll();
      const firstTournament = allTournaments[0];

      const tournament = await repository.getById(firstTournament.id);

      expect(tournament).toBeDefined();
      expect(tournament?.id).toBe(firstTournament.id);
    });

    it("should return null for invalid ID", async () => {
      const tournament = await repository.getById("non-existent-id");

      expect(tournament).toBeNull();
    });

    it("should return a copy of the tournament", async () => {
      const allTournaments = await repository.getAll();
      const firstTournament = allTournaments[0];

      const tournament1 = await repository.getById(firstTournament.id);
      const tournament2 = await repository.getById(firstTournament.id);

      expect(tournament1).not.toBe(tournament2);
      expect(tournament1).toEqual(tournament2);
    });

    it("should include results when present", async () => {
      const allTournaments = await repository.getAll();
      const completedTournament = allTournaments.find(
        (t) => t.status === "completed" && t.categories.some((c) => c.results)
      );

      if (completedTournament) {
        const tournament = await repository.getById(completedTournament.id);

        expect(tournament?.categories).toBeDefined();
        const categoryWithResults = tournament?.categories.find(
          (c) => c.results
        );
        expect(categoryWithResults?.results).toBeDefined();
        expect(categoryWithResults?.results?.first).toBeDefined();
        expect(categoryWithResults?.results?.second).toBeDefined();
      }
    });
  });

  describe("getByStatus", () => {
    it("should return tournaments filtered by status", async () => {
      const status: TournamentStatus = "upcoming";
      const tournaments = await repository.getByStatus(status);

      expect(tournaments.length).toBeGreaterThan(0);
      tournaments.forEach((tournament) => {
        expect(tournament.status).toBe(status);
      });
    });

    it("should work for all status types", async () => {
      const statuses: TournamentStatus[] = [
        "upcoming",
        "in-progress",
        "completed",
      ];

      for (const status of statuses) {
        const tournaments = await repository.getByStatus(status);
        expect(Array.isArray(tournaments)).toBe(true);
        tournaments.forEach((tournament) => {
          expect(tournament.status).toBe(status);
        });
      }
    });

    it("should return copies of tournaments", async () => {
      const status: TournamentStatus = "upcoming";
      const tournaments1 = await repository.getByStatus(status);
      const tournaments2 = await repository.getByStatus(status);

      expect(tournaments1).not.toBe(tournaments2);
      expect(tournaments1).toEqual(tournaments2);
    });
  });

  describe("getByCategory", () => {
    it("should return tournaments filtered by category", async () => {
      const category: Category = "Open";
      const tournaments = await repository.getByCategory(category);

      expect(tournaments.length).toBeGreaterThan(0);
      tournaments.forEach((tournament) => {
        expect(tournament.categories.some((c) => c.category === category)).toBe(
          true
        );
      });
    });

    it("should work for all category types", async () => {
      const categories: Category[] = ["Open", "1", "2", "3", "4", "5", "6"];

      for (const category of categories) {
        const tournaments = await repository.getByCategory(category);
        expect(Array.isArray(tournaments)).toBe(true);
        tournaments.forEach((tournament) => {
          expect(
            tournament.categories.some((c) => c.category === category)
          ).toBe(true);
        });
      }
    });

    it("should return copies of tournaments", async () => {
      const category: Category = "Open";
      const tournaments1 = await repository.getByCategory(category);
      const tournaments2 = await repository.getByCategory(category);

      expect(tournaments1).not.toBe(tournaments2);
      expect(tournaments1).toEqual(tournaments2);
    });
  });

  describe("getByGenre", () => {
    it("should return tournaments filtered by genre", async () => {
      const genre: TournamentGenre = "Open";
      const tournaments = await repository.getByGenre(genre);

      expect(tournaments.length).toBeGreaterThan(0);
      tournaments.forEach((tournament) => {
        expect(tournament.genre).toBe(genre);
      });
    });

    it("should work for all genre types", async () => {
      const genres: TournamentGenre[] = ["Open", "Women"];

      for (const genre of genres) {
        const tournaments = await repository.getByGenre(genre);
        expect(Array.isArray(tournaments)).toBe(true);
        tournaments.forEach((tournament) => {
          expect(tournament.genre).toBe(genre);
        });
      }
    });

    it("should return copies of tournaments", async () => {
      const genre: TournamentGenre = "Open";
      const tournaments1 = await repository.getByGenre(genre);
      const tournaments2 = await repository.getByGenre(genre);

      expect(tournaments1).not.toBe(tournaments2);
      expect(tournaments1).toEqual(tournaments2);
    });
  });

  describe("create", () => {
    it("should create a new tournament", async () => {
      const newTournamentData = {
        name: "Test Tournament",
        date: "2025-06-15",
        club: "Test Club",
        location: "Test Location",
        genre: "Open" as TournamentGenre,
        categories: [
          {
            category: "Open" as Category,
            maxTeams: 16,
            registeredTeams: 0,
          },
        ],
        status: "upcoming" as TournamentStatus,
        registrationOpen: true,
        photos: ["/test.jpg"],
      };

      const created = await repository.create(newTournamentData);

      expect(created).toBeDefined();
      expect(created.id).toBeTruthy();
      expect(created.name).toBe(newTournamentData.name);
      expect(created.date).toBe(newTournamentData.date);
      expect(created.genre).toBe(newTournamentData.genre);
      expect(created.categories).toEqual(newTournamentData.categories);
      expect(created.status).toBe(newTournamentData.status);
    });

    it("should assign a unique ID", async () => {
      const tournamentData = {
        name: "Test Tournament",
        date: "2025-06-15",
        club: "Test Club",
        location: "Test Location",
        genre: "Open" as TournamentGenre,
        categories: [
          {
            category: "Open" as Category,
            maxTeams: 16,
            registeredTeams: 0,
          },
        ],
        status: "upcoming" as TournamentStatus,
        registrationOpen: true,
        photos: ["/test.jpg"],
      };

      const tournament1 = await repository.create(tournamentData);
      const tournament2 = await repository.create(tournamentData);

      expect(tournament1.id).not.toBe(tournament2.id);
    });

    it("should be retrievable after creation", async () => {
      const tournamentData = {
        name: "Test Tournament",
        date: "2025-06-15",
        club: "Test Club",
        location: "Test Location",
        genre: "Open" as TournamentGenre,
        categories: [
          {
            category: "Open" as Category,
            maxTeams: 16,
            registeredTeams: 0,
          },
        ],
        status: "upcoming" as TournamentStatus,
        registrationOpen: true,
        photos: ["/test.jpg"],
      };

      const created = await repository.create(tournamentData);
      const retrieved = await repository.getById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });

    it("should handle optional fields", async () => {
      const tournamentData = {
        name: "Test Tournament",
        date: "2025-06-15",
        club: "Test Club",
        location: "Test Location",
        genre: "Women" as TournamentGenre,
        categories: [
          {
            category: "1" as Category,
            maxTeams: 8,
            registeredTeams: 0,
          },
        ],
        status: "upcoming" as TournamentStatus,
        registrationOpen: true,
        photos: ["/test.jpg"],
        description: "Test description",
      };

      const created = await repository.create(tournamentData);

      expect(created.description).toBe(tournamentData.description);
    });
  });

  describe("update", () => {
    it("should update tournament properties", async () => {
      const allTournaments = await repository.getAll();
      const tournament = allTournaments[0];

      const updates = {
        name: "Updated Name",
        registrationOpen: false,
      };

      const updated = await repository.update(tournament.id, updates);

      expect(updated.name).toBe(updates.name);
      expect(updated.registrationOpen).toBe(updates.registrationOpen);
      expect(updated.id).toBe(tournament.id);
    });

    it("should throw NotFoundError for invalid ID", async () => {
      await expect(
        repository.update("non-existent-id", { name: "Test" })
      ).rejects.toThrow(NotFoundError);
    });

    it("should preserve unchanged properties", async () => {
      const allTournaments = await repository.getAll();
      const tournament = allTournaments[0];
      const originalDate = tournament.date;

      const updated = await repository.update(tournament.id, {
        name: "Updated",
      });

      expect(updated.date).toBe(originalDate);
    });

    it("should update status", async () => {
      const allTournaments = await repository.getAll();
      const tournament = allTournaments.find((t) => t.status === "upcoming");

      if (tournament) {
        const updated = await repository.update(tournament.id, {
          status: "in-progress",
        });

        expect(updated.status).toBe("in-progress");
      }
    });
  });

  describe("updateCategoryResults", () => {
    it("should update category results", async () => {
      const allTournaments = await repository.getAll();
      const tournament = allTournaments[0];
      const category = tournament.categories[0].category;

      const results = {
        first: {
          playerId: "1",
          playerName: "Winner",
          photo: "/winner.jpg",
        },
        second: {
          playerId: "2",
          playerName: "Runner-up",
          photo: "/runner.jpg",
        },
      };

      const updated = await repository.updateCategoryResults(
        tournament.id,
        category,
        results
      );

      const updatedCategory = updated.categories.find(
        (c) => c.category === category
      );
      expect(updatedCategory?.results).toEqual(results);
    });

    it("should throw NotFoundError for invalid ID", async () => {
      const results = {
        first: {
          playerId: "1",
          playerName: "Winner",
          photo: "/winner.jpg",
        },
        second: {
          playerId: "2",
          playerName: "Runner-up",
          photo: "/runner.jpg",
        },
      };

      await expect(
        repository.updateCategoryResults("non-existent-id", "Open", results)
      ).rejects.toThrow(NotFoundError);
    });

    it("should allow clearing results", async () => {
      const allTournaments = await repository.getAll();
      const tournament = allTournaments.find((t) =>
        t.categories.some((c) => c.results)
      );

      if (tournament) {
        const category = tournament.categories.find((c) => c.results)!.category;
        const updated = await repository.updateCategoryResults(
          tournament.id,
          category,
          undefined
        );

        const updatedCategory = updated.categories.find(
          (c) => c.category === category
        );
        expect(updatedCategory?.results).toBeUndefined();
      }
    });
  });

  describe("addCategory", () => {
    it("should add a category to tournament", async () => {
      const allTournaments = await repository.getAll();
      const tournament = allTournaments[0];

      const newCategory = {
        category: "2" as Category,
        maxTeams: 8,
        registeredTeams: 0,
      };

      const updated = await repository.addCategory(tournament.id, newCategory);

      expect(updated.categories).toContainEqual(newCategory);
    });

    it("should throw NotFoundError for invalid ID", async () => {
      const newCategory = {
        category: "2" as Category,
        maxTeams: 8,
        registeredTeams: 0,
      };

      await expect(
        repository.addCategory("non-existent-id", newCategory)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("removeCategory", () => {
    it("should remove a category from tournament", async () => {
      const allTournaments = await repository.getAll();
      const tournament = allTournaments.find((t) => t.categories.length > 1);

      if (tournament) {
        const categoryToRemove = tournament.categories[0].category;
        const updated = await repository.removeCategory(
          tournament.id,
          categoryToRemove
        );

        expect(
          updated.categories.some((c) => c.category === categoryToRemove)
        ).toBe(false);
      }
    });

    it("should throw NotFoundError for invalid ID", async () => {
      await expect(
        repository.removeCategory("non-existent-id", "Open")
      ).rejects.toThrow(NotFoundError);
    });
  });
});
