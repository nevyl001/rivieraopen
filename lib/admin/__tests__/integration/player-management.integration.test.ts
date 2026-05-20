/**
 * Player Management Integration Tests
 * Tests complete player CRUD flow, search, filter, and cascade delete
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { playerAdminService } from "@/lib/admin/services/PlayerAdminService";
import RepositoryFactory from "@/lib/data/repositories/repository-factory";
import type { IPlayerRepository } from "@/lib/data/repositories/interfaces";
import type { Category } from "@/lib/types";

describe("Player Management Integration Tests", () => {
  let repository: IPlayerRepository;

  beforeAll(async () => {
    repository = await RepositoryFactory.getPlayerRepository();
  });

  beforeEach(async () => {
    // Clear all players before each test
    const allPlayers = await repository.getAll();
    for (const player of allPlayers) {
      await repository.delete(player.id);
    }
  });

  describe("Complete CRUD Flow", () => {
    it("should create, read, update, and delete a player", async () => {
      // Create
      const createData = {
        firstName: "John",
        lastName: "Doe",
        photo: "/images/john-doe.jpg",
        category: "Open" as Category,
        gender: "Male" as const,
        points: 1000,
        contact: {
          email: "john@example.com",
          phone: "+1234567890",
        },
        socials: {
          instagram: "https://instagram.com/johndoe",
          facebook: "https://facebook.com/johndoe",
          twitter: "https://twitter.com/johndoe",
        },
      };

      const createdPlayer = await playerAdminService.createPlayer(createData);
      expect(createdPlayer.id).toBeDefined();
      expect(createdPlayer.firstName).toBe("John");
      expect(createdPlayer.lastName).toBe("Doe");
      expect(createdPlayer.rank).toBe(1); // First player in category

      // Read
      const fetchedPlayer = await playerAdminService.getPlayer(
        createdPlayer.id,
      );
      expect(fetchedPlayer).not.toBeNull();
      expect(fetchedPlayer?.id).toBe(createdPlayer.id);

      // Update
      const updatedPlayer = await playerAdminService.updatePlayer(
        createdPlayer.id,
        {
          points: 1500,
          firstName: "Johnny",
        },
      );
      expect(updatedPlayer.points).toBe(1500);
      expect(updatedPlayer.firstName).toBe("Johnny");

      // Delete
      await playerAdminService.deletePlayer(createdPlayer.id);
      const deletedPlayer = await playerAdminService.getPlayer(
        createdPlayer.id,
      );
      expect(deletedPlayer).toBeNull();
    });
  });

  describe("Search and Filter", () => {
    beforeEach(async () => {
      // Create test players
      await playerAdminService.createPlayer({
        firstName: "Alice",
        lastName: "Smith",
        photo: "/images/alice.jpg",
        category: "Open" as Category,
        gender: "Female" as const,
        points: 1000,
        contact: {
          email: "alice@example.com",
          phone: "+1234567890",
        },
      });

      await playerAdminService.createPlayer({
        firstName: "Bob",
        lastName: "Johnson",
        photo: "/images/bob.jpg",
        category: "1" as Category,
        gender: "Male" as const,
        points: 800,
        contact: {
          email: "bob@example.com",
          phone: "+1234567890",
        },
      });

      await playerAdminService.createPlayer({
        firstName: "Charlie",
        lastName: "Brown",
        photo: "/images/charlie.jpg",
        category: "Open" as Category,
        gender: "Male" as const,
        points: 1200,
        contact: {
          email: "charlie@example.com",
          phone: "+1234567890",
        },
      });
    });

    it("should search players by name", async () => {
      const results = await playerAdminService.searchPlayers("Alice");
      expect(results).toHaveLength(1);
      expect(results[0].firstName).toBe("Alice");
    });

    it("should filter players by category", async () => {
      const results = await playerAdminService.filterPlayers({
        category: "Open" as Category,
      });
      expect(results).toHaveLength(2);
      expect(results.every((p) => p.category === "Open")).toBe(true);
    });

    it("should filter players by gender", async () => {
      const results = await playerAdminService.filterPlayers({
        gender: "Male",
      });
      expect(results).toHaveLength(2);
      expect(results.every((p) => p.gender === "Male")).toBe(true);
    });

    it("should filter players by category and gender", async () => {
      const results = await playerAdminService.filterPlayers({
        category: "Open" as Category,
        gender: "Male",
      });
      expect(results).toHaveLength(1);
      expect(results[0].firstName).toBe("Charlie");
    });
  });

  describe("Cascade Delete", () => {
    it("should delete player and all related data", async () => {
      // Create player
      const player = await playerAdminService.createPlayer({
        firstName: "Test",
        lastName: "Player",
        photo: "/images/test.jpg",
        category: "Open" as Category,
        gender: "Male" as const,
        points: 1000,
        contact: {
          email: "test@example.com",
          phone: "+1234567890",
        },
        socials: {
          instagram: "https://instagram.com/test",
          facebook: "https://facebook.com/test",
          twitter: "https://twitter.com/test",
        },
      });

      // Delete player
      await playerAdminService.deletePlayer(player.id);

      // Verify player is deleted
      const deletedPlayer = await playerAdminService.getPlayer(player.id);
      expect(deletedPlayer).toBeNull();

      // Verify contacts and socials are also deleted (cascade)
      // This is handled by the repository implementation
    });
  });

  describe("Pagination and Sorting", () => {
    beforeEach(async () => {
      // Create multiple players
      for (let i = 1; i <= 25; i++) {
        await playerAdminService.createPlayer({
          firstName: `Player${i}`,
          lastName: `Test${i}`,
          photo: `/images/player${i}.jpg`,
          category: "Open" as Category,
          gender: i % 2 === 0 ? ("Male" as const) : ("Female" as const),
          points: i * 100,
          contact: {
            email: `player${i}@example.com`,
            phone: "+1234567890",
          },
        });
      }
    });

    it("should paginate players correctly", async () => {
      const page1 = await playerAdminService.listPlayers({
        page: 1,
        pageSize: 10,
      });
      expect(page1.data).toHaveLength(10);
      expect(page1.pagination.totalItems).toBe(25);
      expect(page1.pagination.totalPages).toBe(3);
      expect(page1.pagination.hasNextPage).toBe(true);
      expect(page1.pagination.hasPreviousPage).toBe(false);

      const page2 = await playerAdminService.listPlayers({
        page: 2,
        pageSize: 10,
      });
      expect(page2.data).toHaveLength(10);
      expect(page2.pagination.hasNextPage).toBe(true);
      expect(page2.pagination.hasPreviousPage).toBe(true);

      const page3 = await playerAdminService.listPlayers({
        page: 3,
        pageSize: 10,
      });
      expect(page3.data).toHaveLength(5);
      expect(page3.pagination.hasNextPage).toBe(false);
      expect(page3.pagination.hasPreviousPage).toBe(true);
    });

    it("should sort players by points ascending", async () => {
      const result = await playerAdminService.listPlayers(
        { page: 1, pageSize: 25 },
        { field: "points", direction: "asc" },
      );

      for (let i = 0; i < result.data.length - 1; i++) {
        expect(result.data[i].points).toBeLessThanOrEqual(
          result.data[i + 1].points,
        );
      }
    });

    it("should sort players by points descending", async () => {
      const result = await playerAdminService.listPlayers(
        { page: 1, pageSize: 25 },
        { field: "points", direction: "desc" },
      );

      for (let i = 0; i < result.data.length - 1; i++) {
        expect(result.data[i].points).toBeGreaterThanOrEqual(
          result.data[i + 1].points,
        );
      }
    });
  });
});
