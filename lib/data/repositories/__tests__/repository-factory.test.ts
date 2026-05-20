import RepositoryFactory from "../repository-factory";
import { MockPlayerRepository } from "../../implementations/mock/mock-player-repository";
import { MockTournamentRepository } from "../../implementations/mock/mock-tournament-repository";

describe("RepositoryFactory", () => {
  beforeEach(() => {
    RepositoryFactory.reset();
  });

  describe("getPlayerRepository", () => {
    it("should return a MockPlayerRepository", async () => {
      const repository = await RepositoryFactory.getPlayerRepository();

      expect(repository).toBeInstanceOf(MockPlayerRepository);
    });

    it("should return the same instance on multiple calls (singleton)", async () => {
      const repository1 = await RepositoryFactory.getPlayerRepository();
      const repository2 = await RepositoryFactory.getPlayerRepository();

      expect(repository1).toBe(repository2);
    });
  });

  describe("getTournamentRepository", () => {
    it("should return a MockTournamentRepository", async () => {
      const repository = await RepositoryFactory.getTournamentRepository();

      expect(repository).toBeInstanceOf(MockTournamentRepository);
    });

    it("should return the same instance on multiple calls (singleton)", async () => {
      const repository1 = await RepositoryFactory.getTournamentRepository();
      const repository2 = await RepositoryFactory.getTournamentRepository();

      expect(repository1).toBe(repository2);
    });
  });

  describe("reset", () => {
    it("should clear singleton instances", async () => {
      const repository1 = await RepositoryFactory.getPlayerRepository();

      RepositoryFactory.reset();

      const repository2 = await RepositoryFactory.getPlayerRepository();

      expect(repository1).not.toBe(repository2);
    });
  });
});
