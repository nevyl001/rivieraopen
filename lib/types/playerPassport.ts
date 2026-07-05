import type { PlayerHistoryEvent } from "./playerHistory";

export type PlayerOfficialStatus = "LOCAL" | "OFICIAL_RIVIERA";

export interface PlayerPassportIdentity {
  rivieraId: string | null;
  registrationClubName: string | null;
  registrationOrganizerId: string | null;
  debutDate: string | null;
  debutSeason: string | null;
  status: PlayerOfficialStatus;
  canonicalProfileUrl: string | null;
}

export interface PlayerClubParticipation {
  clubName: string;
  eventCount: number;
}

export interface PlayerCareerSummary {
  registrationClubName: string | null;
  participatedClubs: PlayerClubParticipation[];
  totalClubs: number;
  totalEvents: number;
  totalTorneos: number;
  totalRetas: number;
  totalLigas: number;
  totalAmericanos: number;
  totalDuelos: number;
}

export interface PlayerPartnerStat {
  id: string | null;
  nombre: string;
  foto: string | null;
  matchesTogether: number;
  winsTogether: number;
  lossesTogether: number;
}

export interface PlayerAchievement {
  id: string;
  labelKey: string;
  date: string | null;
  context?: string | null;
}

export interface PassportHistoryEvent extends PlayerHistoryEvent {
  organizerName?: string | null;
  partners?: string[];
  rivals?: string[];
  ratingChange?: number | null;
  ratingAfter?: number | null;
  resultLabel?: string | null;
}
