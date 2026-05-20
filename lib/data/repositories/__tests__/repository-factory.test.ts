import RepositoryFactory from "../repository-factory";
import { MockPlayerRepository } from "../../implementations/mock/mock-player-repository";
import { MockTournamentRepository } from "../../implementations/mock/mock-tournament-repository";
import { SQLPlayerRepository } from "../../implementations/sql/sql-player-repository";
import { SQLTournamentRepository } from "../../implementations/sql/sql-tournament-repository";

// Mock the environment config
jest.mock("../../../config/environment", () => ({
  getEnvironmentConfig: jest.fn(() => ({
    env: "dev",
  })),
}));

// Mock the DatabaseClient
jest.mock("../../database/database-client", () => {
  const mockClient = {
    connect: jest.fn().mockResolvedValue(undefined),
    getIsConnected: jest.fn().mockReturnValue(false),
    query: jest.fn(),
    close: jest.fn(),
  };

  return {
    DatabaseClient: {
      getInstance: jest.fn(() => mockClient),
      reset: jest.fn(),
    },
  };
});

describe("RepositoryFactory", () => {
  beforeEach(() => {
    // Reset singleton instances before each test
    RepositoryFactory.reset();
    jest.clearAllMocks();
  });

  describe("getPlayerRepository", () => {
    it("should return a MockPlayerRepository in dev environment", async () => {
      const repository = await RepositoryFactory.getPlayerRepository();

      expect(repository).toBeInstanceOf(MockPlayerRepository);
    });

    it("should return the same instance on multiple calls (singleton)", async () => {
      const repository1 = await RepositoryFactory.getPlayerRepository();
      const repository2 = await RepositoryFactory.getPlayerRepository();

      expect(repository1).toBe(repository2);
    });

    it("should return SQLPlayerRepository in prod environment", async () => {
      const { getEnvironmentConfig } = require("../../../config/environment");
      getEnvironmentConfig.mockReturnValueOnce({
        env: "prod",
        databaseUrl: "postgresql://localhost:5432/test",
      });

      const repository = await RepositoryFactory.getPlayerRepository();

      expect(repository).toBeInstanceOf(SQLPlayerRepository);
    });

    it("should connect to database when creating SQL repository", async () => {
      const { getEnvironmentConfig } = require("../../../config/environment");
      const { DatabaseClient } = require("../../database/database-client");

      getEnvironmentConfig.mockReturnValueOnce({
        env: "prod",
        databaseUrl: "postgresql://localhost:5432/test",
      });

      await RepositoryFactory.getPlayerRepository();

      const mockClient = DatabaseClient.getInstance();
      expect(mockClient.connect).toHaveBeenCalled();
    });
  });

  describe("getTournamentRepository", () => {
    it("should return a MockTournamentRepository in dev environment", async () => {
      const repository = await RepositoryFactory.getTournamentRepository();

      expect(repository).toBeInstanceOf(MockTournamentRepository);
    });

    it("should return the same instance on multiple calls (singleton)", async () => {
      const repository1 = await RepositoryFactory.getTournamentRepository();
      const repository2 = await RepositoryFactory.getTournamentRepository();

      expect(repository1).toBe(repository2);
    });

    it("should return SQLTournamentRepository in prod environment", async () => {
      const { getEnvironmentConfig } = require("../../../config/environment");
      getEnvironmentConfig.mockReturnValueOnce({
        env: "prod",
        databaseUrl: "postgresql://localhost:5432/test",
      });

      const repository = await RepositoryFactory.getTournamentRepository();

      expect(repository).toBeInstanceOf(SQLTournamentRepository);
    });

    it("should connect to database when creating SQL repository", async () => {
      const { getEnvironmentConfig } = require("../../../config/environment");
      const { DatabaseClient } = require("../../database/database-client");

      getEnvironmentConfig.mockReturnValueOnce({
        env: "prod",
        databaseUrl: "postgresql://localhost:5432/test",
      });

      await RepositoryFactory.getTournamentRepository();

      const mockClient = DatabaseClient.getInstance();
      expect(mockClient.connect).toHaveBeenCalled();
    });
  });

  describe("Environment Switching", () => {
    it("should use mock repositories in dev environment", async () => {
      const playerRepo = await RepositoryFactory.getPlayerRepository();
      const tournamentRepo = await RepositoryFactory.getTournamentRepository();

      expect(playerRepo).toBeInstanceOf(MockPlayerRepository);
      expect(tournamentRepo).toBeInstanceOf(MockTournamentRepository);
    });

    it("should use SQL repositories in prod environment", async () => {
      const { getEnvironmentConfig } = require("../../../config/environment");

      // First call for player repository
      getEnvironmentConfig.mockReturnValueOnce({
        env: "prod",
        databaseUrl: "postgresql://localhost:5432/test",
      });

      const playerRepo = await RepositoryFactory.getPlayerRepository();

      // Reset to get fresh instance for tournament
      RepositoryFactory.reset();

      // Second call for tournament repository
      getEnvironmentConfig.mockReturnValueOnce({
        env: "prod",
        databaseUrl: "postgresql://localhost:5432/test",
      });

      const tournamentRepo = await RepositoryFactory.getTournamentRepository();

      expect(playerRepo).toBeInstanceOf(SQLPlayerRepository);
      expect(tournamentRepo).toBeInstanceOf(SQLTournamentRepository);
    });

    it("should reuse database client across repositories", async () => {
      const { getEnvironmentConfig } = require("../../../config/environment");
      const { DatabaseClient } = require("../../database/database-client");

      // Mock prod environment for both calls
      getEnvironmentConfig.mockReturnValue({
        env: "prod",
        databaseUrl: "postgresql://localhost:5432/test",
      });

      await RepositoryFactory.getPlayerRepository();
      await RepositoryFactory.getTournamentRepository();

      // DatabaseClient.getInstance should be called but connect only once
      const mockClient = DatabaseClient.getInstance();
      expect(DatabaseClient.getInstance).toHaveBeenCalled();
      expect(mockClient.connect).toHaveBeenCalledTimes(1);
    });
  });

  describe("reset", () => {
    it("should clear singleton instances", async () => {
      const repository1 = await RepositoryFactory.getPlayerRepository();

      RepositoryFactory.reset();

      const repository2 = await RepositoryFactory.getPlayerRepository();

      // After reset, should get a new instance
      expect(repository1).not.toBe(repository2);
    });

    it("should clear both player and tournament repository instances", async () => {
      const playerRepo1 = await RepositoryFactory.getPlayerRepository();
      const tournamentRepo1 = await RepositoryFactory.getTournamentRepository();

      RepositoryFactory.reset();

      const playerRepo2 = await RepositoryFactory.getPlayerRepository();
      const tournamentRepo2 = await RepositoryFactory.getTournamentRepository();

      expect(playerRepo1).not.toBe(playerRepo2);
      expect(tournamentRepo1).not.toBe(tournamentRepo2);
    });

    it("should reset database client", async () => {
      const { getEnvironmentConfig } = require("../../../config/environment");
      const { DatabaseClient } = require("../../database/database-client");

      getEnvironmentConfig.mockReturnValue({
        env: "prod",
        databaseUrl: "postgresql://localhost:5432/test",
      });

      await RepositoryFactory.getPlayerRepository();

      RepositoryFactory.reset();

      expect(DatabaseClient.reset).toHaveBeenCalled();
    });
  });
});
