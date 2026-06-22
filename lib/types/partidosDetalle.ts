export type PartidoDetalleResultado = "win" | "loss" | "draw";

export interface PartidoDetalle {
  id?: string;
  ronda: number;
  fase?: string;
  rival: string;
  games_favor: number;
  games_contra: number;
  resultado: PartidoDetalleResultado;
  fecha?: string;
}

export interface ParticipacionMetadataWithDetalle {
  subtipo?: string;
  partidos_detalle?: PartidoDetalle[];
  remontada_activa?: boolean;
  regular_rondas_max?: number;
  posicion?: number;
  posicion_rr?: number;
  posicion_final?: number;
  formato?: string;
  modalidad?: string;
  total_participantes?: number;
  partidos_jugados?: number;
  liga_nombre?: string;
  jornada_numero?: number;
  americano_nombre?: string;
  reta_nombre?: string;
}
