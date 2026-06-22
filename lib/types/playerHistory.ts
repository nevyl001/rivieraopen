export type PlayerEventType =
  | "torneo_express"
  | "liga"
  | "reta"
  | "americano"
  | "duelo"
  | "duelo_2v2"
  | string;

export interface PlayerHistoryMatch {
  id: string;
  round: string;
  opponentLabel: string;
  score: string;
  won: boolean;
  isDraw?: boolean;
  sortDate: string;
}

export interface PlayerHistoryEvent {
  id: string;
  eventoId: string;
  tipoEvento: PlayerEventType;
  nombre: string;
  fecha: string | null;
  categoria: string | null;
  posicionFinal: number | null;
  puntosGanados: number;
  partidosGanados: number | null;
  partidosPerdidos: number | null;
  partidosEmpatados: number | null;
  partidos: PlayerHistoryMatch[];
}

export interface PlayerRival {
  id: string;
  nombre: string;
  foto: string;
  points: number;
  rank: number;
  wins: number;
  losses: number;
  draws: number;
  hasFaced: boolean;
  lastMatchDate: string | null;
}
