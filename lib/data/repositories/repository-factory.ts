import { IPlayerRepository, ITournamentRepository } from "./interfaces";
import { MockPlayerRepository } from "../implementations/mock/mock-player-repository";
import { MockTournamentRepository } from "../implementations/mock/mock-tournament-repository";

class RepositoryFactory {
  private static playerRepository: IPlayerRepository | null = null;
  private static tournamentRepository: ITournamentRepository | null = null;

  static async getPlayerRepository(): Promise<IPlayerRepository> {
    if (!this.playerRepository) {
      this.playerRepository = new MockPlayerRepository();
    }

    return this.playerRepository;
  }

  static async getTournamentRepository(): Promise<ITournamentRepository> {
    if (!this.tournamentRepository) {
      this.tournamentRepository = new MockTournamentRepository();
    }

    return this.tournamentRepository;
  }

  static reset(): void {
    this.playerRepository = null;
    this.tournamentRepository = null;
  }
}

export default RepositoryFactory;
