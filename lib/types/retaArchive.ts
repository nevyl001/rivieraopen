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
