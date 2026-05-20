/**
 * Tournament Management Integration Tests
 * Tests complete tournament CRUD flow, category management, winner management, and photo management
 * Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 6.3, 7.1, 7.2, 8.1, 8.2
 */

import { tournamentAdminService } from "@/lib/admin/services/TournamentAdminService";
import { playerAdminService } from "@/lib/admin/services/PlayerAdminService";
import RepositoryFactory from "@/lib/data/repositories/repository-factory";
import type {
  ITournamentRepository,
  IPlayerRepository,
} from "@/lib/data/repositories/interfaces";
import type { Category } from "@/lib/types";

describe("Tournament Management Integration Tests", () => {
  let tournamentRepository: ITournamentRepository;
  let playerRepository: IPlayerRepository;

  beforeAll(async () => {
    tournamentRepository = await RepositoryFactory.getTournamentRepository();
    playerRepository = await RepositoryFactory.getPlayerRepository();
  });

  beforeEach(async () => {
    // Clear all tournaments and players before each test
    const allTournaments = await tournamentRepository.getAll();
    for (const tournament of allTournaments) {
      await tournamentRepository.delete(tournament.id);
    }

    const allPlayers = await playerRepository.getAll();
    for (const player of allPlayers) {
      await playerRepository.delete(player.id);
    }
  });

  describe("Complete CRUD Flow", () => {
    it("should create, read, update, and delete a tournament", async () => {
      // Create
      const createData = {
        name: "Test Tournament",
        date: new Date("2024-12-01"),
        club: "Test Club",
        location: "Test Location",
        genre: "Open" as const,
        status: "upcoming" as const,
        registrationOpen: true,
        description: "Test Description",
      };

      const createdTournament =
        await tournamentAdminService.createTournament(createData);
      expect(createdTournament.id).toBeDefined();
      expect(createdTournament.name).toBe("Test Tournament");
      expect(createdTournament.categories).toHaveLength(0);

      // Read
      const fetchedTournament = await tournamentAdminService.getTournament(
        createdTournament.id,
      );
      expect(fetchedTournament).not.toBeNull();
      expect(fetchedTournament?.id).toBe(createdTournament.id);

      // Update
      const updatedTournament = await tournamentAdminService.updateTournament(
        createdTournament.id,
        {
          name: "Updated Tournament",
          status: "in-progress" as const,
        },
      );
      expect(updatedTournament.name).toBe("Updated Tournament");
      expect(updatedTournament.status).toBe("in-progress");

      // Delete
      await tournamentAdminService.deleteTournament(createdTournament.id);
      const deletedTournament = await tournamentAdminService.getTournament(
        createdTournament.id,
      );
      expect(deletedTournament).toBeNull();
    });
  });

  describe("Category Management", () => {
    let tournamentId: string;

    beforeEach(async () => {
      const tournament = await tournamentAdminService.createTournament({
        name: "Category Test Tournament",
        date: new Date("2024-12-01"),
        club: "Test Club",
        location: "Test Location",
        genre: "Open" as const,
        status: "upcoming" as const,
        registrationOpen: true,
      });
      tournamentId = tournament.id;
    });

    it("should add and list categories", async () => {
      // Add categories
      await tournamentAdminService.addCategory(
        tournamentId,
        "Open" as Category,
      );
      await tournamentAdminService.addCategory(tournamentId, "1" as Category);

      // List categories
      const categories =
        await tournamentAdminService.listCategories(tournamentId);
      expect(categories).toHaveLength(2);
      expect(categories).toContain("Open");
      expect(categories).toContain("1");
    });

    it("should prevent duplicate categories", async () => {
      await tournamentAdminService.addCategory(
        tournamentId,
        "Open" as Category,
      );

      await expect(
        tournamentAdminService.addCategory(tournamentId, "Open" as Category),
      ).rejects.toThrow("already exists");
    });

    it("should remove category", async () => {
      await tournamentAdminService.addCategory(
        tournamentId,
        "Open" as Category,
      );
      await tournamentAdminService.addCategory(tournamentId, "1" as Category);

      await tournamentAdminService.removeCategory(
        tournamentId,
        "Open" as Category,
      );

      const categories =
        await tournamentAdminService.listCategories(tournamentId);
      expect(categories).toHaveLength(1);
      expect(categories).toContain("1");
      expect(categories).not.toContain("Open");
    });
  });

  describe("Winner Management", () => {
    let tournamentId: string;
    let playerId: string;

    beforeEach(async () => {
      // Create tournament
      const tournament = await tournamentAdminService.createTournament({
        name: "Winner Test Tournament",
        date: new Date("2024-12-01"),
        club: "Test Club",
        location: "Test Location",
        genre: "Open" as const,
        status: "upcoming" as const,
        registrationOpen: true,
      });
      tournamentId = tournament.id;

      // Add category
      await tournamentAdminService.addCategory(
        tournamentId,
        "Open" as Category,
      );

      // Create player
      const player = await playerAdminService.createPlayer({
        firstName: "Winner",
        lastName: "Player",
        photo: "/images/winner.jpg",
        category: "Open" as Category,
        gender: "Male" as const,
        points: 1000,
        contact: {
          email: "winner@example.com",
          phone: "+1234567890",
        },
      });
      playerId = player.id;
    });

    it("should set first place winner", async () => {
      const updatedTournament = await tournamentAdminService.setWinner(
        tournamentId,
        "Open" as Category,
        1,
        playerId,
      );

      const category = updatedTournament.categories.find(
        (c) => c.category === "Open",
      );
      expect(category?.results?.first.playerId).toBe(playerId);
      expect(category?.results?.first.playerName).toBe("Winner Player");
    });

    it("should set second place winner", async () => {
      const updatedTournament = await tournamentAdminService.setWinner(
        tournamentId,
        "Open" as Category,
        2,
        playerId,
      );

      const category = updatedTournament.categories.find(
        (c) => c.category === "Open",
      );
      expect(category?.results?.second.playerId).toBe(playerId);
      expect(category?.results?.second.playerName).toBe("Winner Player");
    });

    it("should remove winner", async () => {
      // Set winner
      await tournamentAdminService.setWinner(
        tournamentId,
        "Open" as Category,
        1,
        playerId,
      );

      // Remove winner
      const updatedTournament = await tournamentAdminService.removeWinner(
        tournamentId,
        "Open" as Category,
        1,
      );

      const category = updatedTournament.categories.find(
        (c) => c.category === "Open",
      );
      expect(category?.results?.first.playerId).toBe("");
    });
  });

  describe("Photo Management", () => {
    let tournamentId: string;

    beforeEach(async () => {
      const tournament = await tournamentAdminService.createTournament({
        name: "Photo Test Tournament",
        date: new Date("2024-12-01"),
        club: "Test Club",
        location: "Test Location",
        genre: "Open" as const,
        status: "upcoming" as const,
        registrationOpen: true,
      });
      tournamentId = tournament.id;
    });

    it("should add photos", async () => {
      const photo1 = "/uploads/photo1.jpg";
      const photo2 = "/uploads/photo2.jpg";

      await tournamentAdminService.addPhoto(tournamentId, photo1);
      await tournamentAdminService.addPhoto(tournamentId, photo2);

      const tournament =
        await tournamentAdminService.getTournament(tournamentId);
      expect(tournament?.photos).toHaveLength(2);
      expect(tournament?.photos).toContain(photo1);
      expect(tournament?.photos).toContain(photo2);
    });

    it("should remove photo", async () => {
      const photo1 = "/uploads/photo1.jpg";
      const photo2 = "/uploads/photo2.jpg";

      await tournamentAdminService.addPhoto(tournamentId, photo1);
      await tournamentAdminService.addPhoto(tournamentId, photo2);

      await tournamentAdminService.removePhoto(tournamentId, photo1);

      const tournament =
        await tournamentAdminService.getTournament(tournamentId);
      expect(tournament?.photos).toHaveLength(1);
      expect(tournament?.photos).toContain(photo2);
      expect(tournament?.photos).not.toContain(photo1);
    });

    it("should reorder photos", async () => {
      const photo1 = "/uploads/photo1.jpg";
      const photo2 = "/uploads/photo2.jpg";
      const photo3 = "/uploads/photo3.jpg";

      await tournamentAdminService.addPhoto(tournamentId, photo1);
      await tournamentAdminService.addPhoto(tournamentId, photo2);
      await tournamentAdminService.addPhoto(tournamentId, photo3);

      // Reorder: [photo1, photo2, photo3] -> [photo3, photo1, photo2]
      await tournamentAdminService.reorderPhotos(tournamentId, [
        photo3,
        photo1,
        photo2,
      ]);

      const tournament =
        await tournamentAdminService.getTournament(tournamentId);
      expect(tournament?.photos).toEqual([photo3, photo1, photo2]);
    });
  });
});
