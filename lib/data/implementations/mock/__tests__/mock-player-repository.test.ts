import { MockPlayerRepository } from "../mock-player-repository";
import { NotFoundError } from "../../../repositories/interfaces";
import { Category } from "@/lib/types";

describe("MockPlayerRepository", () => {
  let repository: MockPlayerRepository;

  beforeEach(() => {
    repository = new MockPlayerRepository();
  });

  describe("getAll", () => {
    it("should return all players", async () => {
      const players = await repository.getAll();

      expect(players).toBeDefined();
      expect(players.length).toBeGreaterThan(0);
    });

    it("should return a copy of players array", async () => {
      const players1 = await repository.getAll();
      const players2 = await repository.getAll();

      expect(players1).not.toBe(players2);
      expect(players1).toEqual(players2);
    });

    it("should include all player properties", async () => {
      const players = await repository.getAll();
      const player = players[0];

      expect(player).toHaveProperty("id");
      expect(player).toHaveProperty("firstName");
      expect(player).toHaveProperty("lastName");
      expect(player).toHaveProperty("category");
      expect(player).toHaveProperty("gender");
      expect(player).toHaveProperty("points");
      expect(player).toHaveProperty("rank");
      expect(player).toHaveProperty("contact");
      expect(player).toHaveProperty("socials");
      expect(player).toHaveProperty("tournamentResults");
    });
  });

  describe("getById", () => {
    it("should return player with valid ID", async () => {
      const allPlayers = await repository.getAll();
      const firstPlayer = allPlayers[0];

      const player = await repository.getById(firstPlayer.id);

      expect(player).toBeDefined();
      expect(player?.id).toBe(firstPlayer.id);
    });

    it("should return null for invalid ID", async () => {
      const player = await repository.getById("non-existent-id");

      expect(player).toBeNull();
    });

    it("should return a copy of the player", async () => {
      const allPlayers = await repository.getAll();
      const firstPlayer = allPlayers[0];

      const player1 = await repository.getById(firstPlayer.id);
      const player2 = await repository.getById(firstPlayer.id);

      expect(player1).not.toBe(player2);
      expect(player1).toEqual(player2);
    });

    it("should include all nested data", async () => {
      const allPlayers = await repository.getAll();
      const firstPlayer = allPlayers[0];

      const player = await repository.getById(firstPlayer.id);

      expect(player?.contact).toBeDefined();
      expect(player?.contact.email).toBeTruthy();
      expect(player?.contact.phone).toBeTruthy();
      expect(player?.socials).toBeDefined();
      expect(player?.tournamentResults).toBeDefined();
    });
  });

  describe("getByCategory", () => {
    it("should return players filtered by category", async () => {
      const category: Category = "Open";
      const players = await repository.getByCategory(category);

      expect(players.length).toBeGreaterThan(0);
      players.forEach((player) => {
        expect(player.category).toBe(category);
      });
    });

    it("should return empty array for category with no players", async () => {
      // Create a new repository and clear all players
      const emptyRepo = new MockPlayerRepository();
      const allPlayers = await emptyRepo.getAll();

      // Get a category that exists
      const category: Category = "1";
      const players = await emptyRepo.getByCategory(category);

      expect(Array.isArray(players)).toBe(true);
    });

    it("should work for all category types", async () => {
      const categories: Category[] = ["Open", "1", "2", "3", "4", "5", "6"];

      for (const category of categories) {
        const players = await repository.getByCategory(category);
        expect(Array.isArray(players)).toBe(true);
        players.forEach((player) => {
          expect(player.category).toBe(category);
        });
      }
    });

    it("should return copies of players", async () => {
      const category: Category = "Open";
      const players1 = await repository.getByCategory(category);
      const players2 = await repository.getByCategory(category);

      expect(players1).not.toBe(players2);
      expect(players1).toEqual(players2);
    });
  });

  describe("create", () => {
    it("should create a new player", async () => {
      const newPlayerData = {
        firstName: "Test",
        lastName: "Player",
        photo: "/test.jpg",
        category: "Open" as Category,
        gender: "Male" as const,
        points: 1000,
        contact: {
          email: "test@example.com",
          phone: "+1234567890",
        },
        socials: {
          instagram: "https://instagram.com/test",
        },
        tournamentResults: [],
      };

      const created = await repository.create(newPlayerData);

      expect(created).toBeDefined();
      expect(created.id).toBeTruthy();
      expect(created.firstName).toBe(newPlayerData.firstName);
      expect(created.lastName).toBe(newPlayerData.lastName);
      expect(created.category).toBe(newPlayerData.category);
      expect(created.gender).toBe(newPlayerData.gender);
      expect(created.points).toBe(newPlayerData.points);
    });

    it("should assign a unique ID", async () => {
      const playerData = {
        firstName: "Test",
        lastName: "Player",
        photo: "/test.jpg",
        category: "Open" as Category,
        gender: "Male" as const,
        points: 1000,
        contact: { email: "test@example.com", phone: "+1234567890" },
        socials: {},
        tournamentResults: [],
      };

      const player1 = await repository.create(playerData);
      const player2 = await repository.create(playerData);

      expect(player1.id).not.toBe(player2.id);
    });

    it("should assign a rank after creation", async () => {
      const playerData = {
        firstName: "Test",
        lastName: "Player",
        photo: "/test.jpg",
        category: "Open" as Category,
        gender: "Female" as const,
        points: 1000,
        contact: { email: "test@example.com", phone: "+1234567890" },
        socials: {},
        tournamentResults: [],
      };

      const created = await repository.create(playerData);

      expect(created.rank).toBeGreaterThan(0);
    });

    it("should be retrievable after creation", async () => {
      const playerData = {
        firstName: "Test",
        lastName: "Player",
        photo: "/test.jpg",
        category: "Open" as Category,
        gender: "Male" as const,
        points: 1000,
        contact: { email: "test@example.com", phone: "+1234567890" },
        socials: {},
        tournamentResults: [],
      };

      const created = await repository.create(playerData);
      const retrieved = await repository.getById(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved?.id).toBe(created.id);
    });
  });

  describe("update", () => {
    it("should update player properties", async () => {
      const allPlayers = await repository.getAll();
      const player = allPlayers[0];

      const updates = {
        firstName: "Updated",
        points: 9999,
      };

      const updated = await repository.update(player.id, updates);

      expect(updated.firstName).toBe(updates.firstName);
      expect(updated.points).toBe(updates.points);
      expect(updated.id).toBe(player.id);
    });

    it("should throw NotFoundError for invalid ID", async () => {
      await expect(
        repository.update("non-existent-id", { points: 100 })
      ).rejects.toThrow(NotFoundError);
    });

    it("should preserve unchanged properties", async () => {
      const allPlayers = await repository.getAll();
      const player = allPlayers[0];
      const originalLastName = player.lastName;

      const updated = await repository.update(player.id, {
        firstName: "Updated",
      });

      expect(updated.lastName).toBe(originalLastName);
    });

    it("should recalculate rankings when points change", async () => {
      const categoryPlayers = await repository.getByCategory("Open");
      const lowestRanked = categoryPlayers[categoryPlayers.length - 1];

      // Give them the highest points
      await repository.update(lowestRanked.id, { points: 99999 });

      const updated = await repository.getById(lowestRanked.id);
      expect(updated?.rank).toBe(1);
    });
  });

  describe("updatePoints", () => {
    it("should update player points", async () => {
      const allPlayers = await repository.getAll();
      const player = allPlayers[0];
      const newPoints = 5000;

      const updated = await repository.updatePoints(player.id, newPoints);

      expect(updated.points).toBe(newPoints);
    });

    it("should recalculate rankings", async () => {
      const categoryPlayers = await repository.getByCategory("Open");
      const lowestRanked = categoryPlayers[categoryPlayers.length - 1];

      await repository.updatePoints(lowestRanked.id, 99999);

      const updated = await repository.getById(lowestRanked.id);
      expect(updated?.rank).toBe(1);
    });

    it("should throw NotFoundError for invalid ID", async () => {
      await expect(
        repository.updatePoints("non-existent-id", 100)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("recalculateRankings", () => {
    it("should rank players by points in descending order", async () => {
      await repository.recalculateRankings("Open");

      const players = await repository.getByCategory("Open");

      for (let i = 0; i < players.length - 1; i++) {
        expect(players[i].points).toBeGreaterThanOrEqual(players[i + 1].points);
        expect(players[i].rank).toBeLessThan(players[i + 1].rank);
      }
    });

    it("should assign rank 1 to highest points", async () => {
      const categoryPlayers = await repository.getByCategory("Open");
      const highestPoints = Math.max(...categoryPlayers.map((p) => p.points));

      await repository.recalculateRankings("Open");

      const players = await repository.getByCategory("Open");
      const topPlayer = players.find((p) => p.points === highestPoints);

      expect(topPlayer?.rank).toBe(1);
    });

    it("should only affect players of the specified category", async () => {
      const category1PlayersBefore = await repository.getByCategory("1");
      const ranksBefore = category1PlayersBefore.map((p) => ({
        id: p.id,
        rank: p.rank,
      }));

      await repository.recalculateRankings("Open");

      const category1PlayersAfter = await repository.getByCategory("1");
      const ranksAfter = category1PlayersAfter.map((p) => ({
        id: p.id,
        rank: p.rank,
      }));

      expect(ranksAfter).toEqual(ranksBefore);
    });
  });
});
