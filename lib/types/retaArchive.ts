/**
 * Copia inmutable de partidos por jugador, guardada en
 * jugador_participaciones.metadata.partidos_detalle al cerrar la reta.
 * Sobrevive si se elimina la reta o filas en matches/games.
 */
export type RetaPartidoResultado = "win" | "loss" | "draw";

export interface RetaPartidoArchivado {
  id?: string;
  ronda: number;
  rival: string;
  games_favor: number;
  games_contra: number;
  resultado: RetaPartidoResultado;
  /** ISO date; opcional si coincide con fecha de la participación */
  fecha?: string;
}

export interface RetaParticipacionMetadataWithArchive {
  subtipo?: string;
  partidos_detalle?: RetaPartidoArchivado[];
  remontada_activa?: boolean;
  regular_rondas_max?: number;
  posicion?: number;
  posicion_rr?: number;
  formato?: string;
  modalidad?: string;
  total_participantes?: number;
  partidos_jugados?: number;
}

export type RetaArchiveFailureReason =
  | "missing_legacy_player_id"
  | "no_pairs_or_matches"
  | "update_failed";

export interface RetaArchiveParticipacionFailure {
  participacionId: string;
  jugadorId: string;
  jugadorNombre?: string;
  reason: RetaArchiveFailureReason;
  message: string;
}

export interface RetaArchiveStatus {
  retaId: string;
  total: number;
  archived: number;
  complete: boolean;
  /** false mientras falte partidos_detalle en alguna participación — no borrar matches */
  canDeleteMatches: boolean;
  failures: RetaArchiveParticipacionFailure[];
}

export interface ArchiveRetaResultsSummary extends RetaArchiveStatus {
  updated: number;
  alreadyArchived: number;
  failed: number;
  errors: string[];
}
