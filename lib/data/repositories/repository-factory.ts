import { getEnvironmentConfig } from "@/lib/config/environment";
import { IPlayerRepository, ITournamentRepository } from "./interfaces";
import { MockPlayerRepository } from "../implementations/mock/mock-player-repository";
import { MockTournamentRepository } from "../implementations/mock/mock-tournament-repository";
import { SQLPlayerRepository } from "../implementations/sql/sql-player-repository";
import { SQLTournamentRepository } from "../implementations/sql/sql-tournament-repository";
import { DatabaseClient } from "../database/database-client";

class RepositoryFactory {
  private static playerRepository: IPlayerRepository | null = null;
  private static tournamentRepository: ITournamentRepository | null = null;
  private static dbClient: DatabaseClient | null = null;

  /**
   * Get or create the database client (for production environment)
   */
  private static async getDbClient(): Promise<DatabaseClient> {
    if (!this.dbClient) {
      this.dbClient = DatabaseClient.getInstance();

      // Connect if not already connected
      if (!this.dbClient.getIsConnected()) {
        await this.dbClient.connect();
      }
    }

    return this.dbClient;
  }

  static async getPlayerRepository(): Promise<IPlayerRepository> {
    if (!this.playerRepository) {
      const config = getEnvironmentConfig();

      if (config.env === "dev") {
        this.playerRepository = new MockPlayerRepository();
      } else {
        // Production: use SQL repository
        const dbClient = await this.getDbClient();
        this.playerRepository = new SQLPlayerRepository(dbClient);
      }
    }

    return this.playerRepository;
  }

  static async getTournamentRepository(): Promise<ITournamentRepository> {
    if (!this.tournamentRepository) {
      const config = getEnvironmentConfig();

      if (config.env === "dev") {
        this.tournamentRepository = new MockTournamentRepository();
      } else {
        // Production: use SQL repository
        const dbClient = await this.getDbClient();
        this.tournamentRepository = new SQLTournamentRepository(dbClient);
      }
    }

    return this.tournamentRepository;
  }

  // For testing: reset singleton instances
  static reset(): void {
    this.playerRepository = null;
    this.tournamentRepository = null;

    // Reset database client
    if (this.dbClient) {
      DatabaseClient.reset();
      this.dbClient = null;
    }
  }
}

export default RepositoryFactory;
