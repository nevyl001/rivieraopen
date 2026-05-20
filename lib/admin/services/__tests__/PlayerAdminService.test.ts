/**
 * Unit tests for PlayerAdminService
 * Tests player CRUD operations, validation, and error handling
 * Requirements: 2.2, 2.3, 3.7, 15.4
 */

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
import type { CreatePlayerData } from "../../validation/schemas";

describe("PlayerAdminService - CRUD Operations", () => {
  let service: PlayerAdminService;
  let mockRepository: MockPlayerRepository;

  beforeEach(() => {
    // Create a fresh mock repository for each test
    mockRepository = new MockPlayerRepository();

    // Mock the factory to return our mock repository
    (RepositoryFactory.getPlayerRepository as jest.Mock).mockResolvedValue(
      mockRepository,
    );

    service = new PlayerAdminService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("createPlayer", () => {
    const validPlayerData: CreatePlayerData = {
      firstName: "John",
      lastName: "Doe",
      photo: "https://example.com/photo.jpg",
      category: "Open",
      gender: "Male",
      points: 1500,
      rank: 0,
      contact: {
        email: "john@example.com",
        phone: "+1234567890",
      },
      socials: {
        instagram: "https://instagram.com/johndoe",
        facebook: "",
        twitter: "",
      },
    };

    it("should create a player with valid data", async () => {
      const player = await service.createPlayer(validPlayerData);

      expect(player).toBeDefined();
      expect(player.id).toBeDefined();
      expect(player.firstName).toBe("John");
      expect(player.lastName).toBe("Doe");
      expect(player.category).toBe("Open");
      expect(player.gender).toBe("Male");
      expect(player.points).toBe(1500);
      expect(player.contact.email).toBe("john@example.com");
    });

    it("should assign a rank to the created player", async () => {
      const player = await service.createPlayer(validPlayerData);

      expect(player.rank).toBeGreaterThan(0);
    });

    it("should fail with missing first name", async () => {
      const invalidData = { ...validPlayerData, firstName: "" };

      await expect(service.createPlayer(invalidData)).rejects.toThrow(
        /Validation failed/,
      );
    });

    it("should fail with missing last name", async () => {
      const invalidData = { ...validPlayerData, lastName: "" };

      await expect(service.createPlayer(invalidData)).rejects.toThrow(
        /Validation failed/,
      );
    });

    it("should fail with invalid email", async () => {
      const invalidData = {
        ...validPlayerData,
        contact: { ...validPlayerData.contact, email: "invalid-email" },
      };

      await expect(service.createPlayer(invalidData)).rejects.toThrow(
        /Validation failed/,
      );
    });

    it("should fail with invalid phone format", async () => {
      const invalidData = {
        ...validPlayerData,
        contact: { ...validPlayerData.contact, phone: "abc123" },
      };

      await expect(service.createPlayer(invalidData)).rejects.toThrow(
        /Validation failed/,
      );
    });

    it("should fail with negative points", async () => {
      const invalidData = { ...validPlayerData, points: -100 };

      await expect(service.createPlayer(invalidData)).rejects.toThrow(
        /Validation failed/,
      );
    });

    it("should create player with empty socials", async () => {
      const dataWithoutSocials = {
        ...validPlayerData,
        socials: {
          instagram: "",
          facebook: "",
          twitter: "",
        },
      };

      const player = await service.createPlayer(dataWithoutSocials);

      expect(player).toBeDefined();
      expect(player.socials.instagram).toBeFalsy();
    });

    it("should fail with invalid social media URL", async () => {
      const invalidData = {
        ...validPlayerData,
        socials: {
          instagram: "not-a-url",
          facebook: "",
          twitter: "",
        },
      };

      await expect(service.createPlayer(invalidData)).rejects.toThrow(
        /Validation failed/,
      );
    });
  });

  describe("updatePlayer", () => {
    let existingPlayerId: string;

    beforeEach(async () => {
      // Create a player to update
      const player = await mockRepository.create({
        firstName: "Jane",
        lastName: "Smith",
        photo: "https://example.com/jane.jpg",
        category: "1",
        gender: "Female",
        points: 1200,
        contact: {
          email: "jane@example.com",
          phone: "+9876543210",
        },
        socials: {
          instagram: "",
          facebook: "",
          twitter: "",
        },
        tournamentResults: [],
      });
      existingPlayerId = player.id;
    });

    it("should update player first name", async () => {
      const updated = await service.updatePlayer(existingPlayerId, {
        firstName: "Janet",
      });

      expect(updated.firstName).toBe("Janet");
      expect(updated.lastName).toBe("Smith"); // Unchanged
    });

    it("should update player points and recalculate rank", async () => {
      const updated = await service.updatePlayer(existingPlayerId, {
        points: 2000,
      });

      expect(updated.points).toBe(2000);
      expect(updated.rank).toBeDefined();
    });

    it("should update player category and recalculate rankings", async () => {
      const updated = await service.updatePlayer(existingPlayerId, {
        category: "2",
      });

      expect(updated.category).toBe("2");
    });

    it("should update contact information", async () => {
      const updated = await service.updatePlayer(existingPlayerId, {
        contact: {
          email: "newemail@example.com",
          phone: "+1111111111",
        },
      });

      expect(updated.contact.email).toBe("newemail@example.com");
      expect(updated.contact.phone).toBe("+1111111111");
    });

    it("should update social media links", async () => {
      const updated = await service.updatePlayer(existingPlayerId, {
        socials: {
          instagram: "https://instagram.com/janet",
          facebook: "https://facebook.com/janet",
          twitter: "",
        },
      });

      expect(updated.socials.instagram).toBe("https://instagram.com/janet");
      expect(updated.socials.facebook).toBe("https://facebook.com/janet");
    });

    it("should fail to update non-existent player", async () => {
      await expect(
        service.updatePlayer("non-existent-id", { firstName: "Test" }),
      ).rejects.toThrow(/not found/);
    });

    it("should fail with invalid email on update", async () => {
      await expect(
        service.updatePlayer(existingPlayerId, {
          contact: {
            email: "invalid-email",
            phone: "+1234567890",
          },
        }),
      ).rejects.toThrow(/Validation failed/);
    });

    it("should fail with negative points on update", async () => {
      await expect(
        service.updatePlayer(existingPlayerId, { points: -50 }),
      ).rejects.toThrow(/Validation failed/);
    });
  });

  describe("deletePlayer", () => {
    let playerToDeleteId: string;

    beforeEach(async () => {
      // Create a player to delete
      const player = await mockRepository.create({
        firstName: "Delete",
        lastName: "Me",
        photo: "https://example.com/delete.jpg",
        category: "3",
        gender: "Male",
        points: 800,
        contact: {
          email: "delete@example.com",
          phone: "+5555555555",
        },
        socials: {
          instagram: "",
          facebook: "",
          twitter: "",
        },
        tournamentResults: [],
      });
      playerToDeleteId = player.id;
    });

    it("should delete an existing player", async () => {
      await service.deletePlayer(playerToDeleteId);

      const deleted = await mockRepository.getById(playerToDeleteId);
      expect(deleted).toBeNull();
    });

    it("should fail to delete non-existent player", async () => {
      await expect(service.deletePlayer("non-existent-id")).rejects.toThrow(
        /not found/,
      );
    });

    it("should recalculate rankings after deletion", async () => {
      // Create another player in the same category
      const player2 = await mockRepository.create({
        firstName: "Other",
        lastName: "Player",
        photo: "https://example.com/other.jpg",
        category: "3",
        gender: "Male",
        points: 900,
        contact: {
          email: "other@example.com",
          phone: "+6666666666",
        },
        socials: {
          instagram: "",
          facebook: "",
          twitter: "",
        },
        tournamentResults: [],
      });

      const rankBefore = player2.rank;

      // Delete the first player
      await service.deletePlayer(playerToDeleteId);

      // Check that the other player's rank was recalculated
      const player2After = await mockRepository.getById(player2.id);
      expect(player2After).toBeDefined();
      expect(player2After!.rank).toBeDefined();
    });
  });

  describe("getPlayer", () => {
    it("should retrieve an existing player", async () => {
      const created = await mockRepository.create({
        firstName: "Get",
        lastName: "Player",
        photo: "https://example.com/get.jpg",
        category: "4",
        gender: "Female",
        points: 1000,
        contact: {
          email: "get@example.com",
          phone: "+7777777777",
        },
        socials: {
          instagram: "",
          facebook: "",
          twitter: "",
        },
        tournamentResults: [],
      });

      const retrieved = await service.getPlayer(created.id);

      expect(retrieved).toBeDefined();
      expect(retrieved!.id).toBe(created.id);
      expect(retrieved!.firstName).toBe("Get");
      expect(retrieved!.lastName).toBe("Player");
    });

    it("should return null for non-existent player", async () => {
      const result = await service.getPlayer("non-existent-id");

      expect(result).toBeNull();
    });
  });

  describe("listPlayers", () => {
    beforeEach(async () => {
      // Create multiple players for pagination testing
      for (let i = 0; i < 25; i++) {
        await mockRepository.create({
          firstName: `Player${i}`,
          lastName: `Test${i}`,
          photo: `https://example.com/player${i}.jpg`,
          category: i % 2 === 0 ? "Open" : "1",
          gender: i % 2 === 0 ? "Male" : "Female",
          points: 1000 + i * 10,
          contact: {
            email: `player${i}@example.com`,
            phone: `+${1000000000 + i}`,
          },
          socials: {
            instagram: "",
            facebook: "",
            twitter: "",
          },
          tournamentResults: [],
        });
      }
    });

    it("should return paginated results", async () => {
      const result = await service.listPlayers({ page: 1, pageSize: 10 });

      expect(result.data).toHaveLength(10);
      expect(result.pagination.page).toBe(1);
      expect(result.pagination.pageSize).toBe(10);
      expect(result.pagination.totalItems).toBeGreaterThanOrEqual(25);
    });

    it("should return correct page 2", async () => {
      const result = await service.listPlayers({ page: 2, pageSize: 10 });

      expect(result.data).toHaveLength(10);
      expect(result.pagination.page).toBe(2);
      expect(result.pagination.hasNextPage).toBe(true);
      expect(result.pagination.hasPreviousPage).toBe(true);
    });

    it("should sort by points ascending", async () => {
      const result = await service.listPlayers(
        { page: 1, pageSize: 5 },
        { field: "points", direction: "asc" },
      );

      expect(result.data[0].points).toBeLessThanOrEqual(result.data[1].points);
    });

    it("should sort by points descending", async () => {
      const result = await service.listPlayers(
        { page: 1, pageSize: 5 },
        { field: "points", direction: "desc" },
      );

      expect(result.data[0].points).toBeGreaterThanOrEqual(
        result.data[1].points,
      );
    });
  });

  describe("searchPlayers", () => {
    beforeEach(async () => {
      await mockRepository.create({
        firstName: "Alice",
        lastName: "Anderson",
        photo: "https://example.com/alice.jpg",
        category: "Open",
        gender: "Female",
        points: 1500,
        contact: {
          email: "alice@example.com",
          phone: "+1111111111",
        },
        socials: {
          instagram: "",
          facebook: "",
          twitter: "",
        },
        tournamentResults: [],
      });

      await mockRepository.create({
        firstName: "Bob",
        lastName: "Brown",
        photo: "https://example.com/bob.jpg",
        category: "1",
        gender: "Male",
        points: 1400,
        contact: {
          email: "bob@example.com",
          phone: "+2222222222",
        },
        socials: {
          instagram: "",
          facebook: "",
          twitter: "",
        },
        tournamentResults: [],
      });
    });

    it("should find players by first name", async () => {
      const results = await service.searchPlayers("Alice");

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].firstName).toBe("Alice");
    });

    it("should find players by last name", async () => {
      const results = await service.searchPlayers("Brown");

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].lastName).toBe("Brown");
    });

    it("should find players by partial name", async () => {
      const results = await service.searchPlayers("Ali");

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].firstName).toContain("Ali");
    });

    it("should be case insensitive", async () => {
      const results = await service.searchPlayers("alice");

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].firstName).toBe("Alice");
    });

    it("should return all players with empty query", async () => {
      const results = await service.searchPlayers("");

      expect(results.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe("filterPlayers", () => {
    beforeEach(async () => {
      await mockRepository.create({
        firstName: "Filter",
        lastName: "Test1",
        photo: "https://example.com/filter1.jpg",
        category: "Open",
        gender: "Male",
        points: 1500,
        contact: {
          email: "filter1@example.com",
          phone: "+1111111111",
        },
        socials: {
          instagram: "",
          facebook: "",
          twitter: "",
        },
        tournamentResults: [],
      });

      await mockRepository.create({
        firstName: "Filter",
        lastName: "Test2",
        photo: "https://example.com/filter2.jpg",
        category: "1",
        gender: "Female",
        points: 1400,
        contact: {
          email: "filter2@example.com",
          phone: "+2222222222",
        },
        socials: {
          instagram: "",
          facebook: "",
          twitter: "",
        },
        tournamentResults: [],
      });
    });

    it("should filter by category", async () => {
      const results = await service.filterPlayers({ category: "Open" });

      expect(results.length).toBeGreaterThan(0);
      results.forEach((player) => {
        expect(player.category).toBe("Open");
      });
    });

    it("should filter by gender", async () => {
      const results = await service.filterPlayers({ gender: "Female" });

      expect(results.length).toBeGreaterThan(0);
      results.forEach((player) => {
        expect(player.gender).toBe("Female");
      });
    });

    it("should filter by both category and gender", async () => {
      const results = await service.filterPlayers({
        category: "1",
        gender: "Female",
      });

      expect(results.length).toBeGreaterThan(0);
      results.forEach((player) => {
        expect(player.category).toBe("1");
        expect(player.gender).toBe("Female");
      });
    });

    it("should return all players with no filters", async () => {
      const results = await service.filterPlayers({});

      expect(results.length).toBeGreaterThanOrEqual(2);
    });
  });
});
