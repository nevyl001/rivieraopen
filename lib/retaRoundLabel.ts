/** Alineado con labelRetaRonda en retas-new-main/buildRetaPartidosDetalle.ts */
export interface RetaRoundLabelMetadata {
  subtipo?: string;
  regular_rondas_max?: number;
  remontada_activa?: boolean;
  formato?: string;
  modalidad?: string;
  total_participantes?: number;
  partidos_jugados?: number;
}

export interface LabelRetaRondaOptions {
  /** Índice 0-based entre partidos del jugador con la misma ronda en playoffs */
  playoffIndexInRound?: number;
  /** Cuántos partidos del jugador comparten esta ronda en playoffs */
  playoffCountInRound?: number;
  /** Ronda máxima del jugador (fallback sin regular_rondas_max) */
  maxRound?: number;
}

function isRoundRobinFormat(metadata: RetaRoundLabelMetadata): boolean {
  return (
    metadata.formato === "round_robin" || metadata.modalidad === "round_robin"
  );
}

/**
 * Solo aplicar Semifinal/Final cuando el metadata lo indica de forma explícita.
 * Sin total_participantes / regular_rondas_max / remontada, NO inventar playoffs
 * (antes rrRounds caía a 1 y etiquetaba mal Ronda 2+ como Semifinal/Final).
 */
function hasExplicitPlayoffStructure(metadata: RetaRoundLabelMetadata): boolean {
  const regularMax = Number(metadata.regular_rondas_max);
  if (Number.isFinite(regularMax) && regularMax > 0) return true;
  if (metadata.remontada_activa === true) return true;
  const total = Number(metadata.total_participantes ?? 0);
  return isRoundRobinFormat(metadata) && total > 1;
}

export function labelRetaRonda(
  ronda: number,
  metadata: RetaRoundLabelMetadata,
  options: LabelRetaRondaOptions = {}
): string {
  if (ronda <= 0) return "Partido";
  if (ronda === 90) return "3er lugar";

  const regularMax = Number(metadata.regular_rondas_max);
  if (Number.isFinite(regularMax) && regularMax > 0) {
    if (ronda <= regularMax) return `Ronda ${ronda}`;
    if (ronda === regularMax + 1) return "Semifinal";
    if (ronda >= regularMax + 2) {
      const count = options.playoffCountInRound ?? 1;
      const index = options.playoffIndexInRound ?? 0;
      if (count > 1 && index > 0) return "3er lugar";
      return "Final";
    }
  }

  // Sin estructura de playoff/remontada confiable → solo numerar por registro del jugador
  if (!hasExplicitPlayoffStructure(metadata)) {
    return `Ronda ${ronda}`;
  }

  const isRoundRobin = isRoundRobinFormat(metadata);
  const total = Number(metadata.total_participantes ?? 0);
  const rrRounds = Math.max(1, total - 1);
  const played = Number(metadata.partidos_jugados ?? 0);
  const maxRound = options.maxRound ?? 0;
  const hasRemontadaPhase =
    metadata.remontada_activa === true ||
    (isRoundRobin &&
      (maxRound > rrRounds || (played > rrRounds && played > 0)));

  if (hasRemontadaPhase) {
    if (ronda > rrRounds) {
      if (ronda === maxRound) return "Final";
      if (ronda === maxRound - 1 || ronda === rrRounds + 1) return "Semifinal";
      return `Fase final · Ronda ${ronda - rrRounds}`;
    }
    return `Ronda ${ronda}`;
  }

  if (isRoundRobin) return `Ronda ${ronda}`;

  if (ronda > rrRounds) {
    if (ronda === maxRound) return "Final";
    if (ronda === maxRound - 1 || ronda === rrRounds + 1) return "Semifinal";
    return `Fase final · Ronda ${ronda - rrRounds}`;
  }

  return `Ronda ${ronda}`;
}

interface RoundSortable {
  ronda: number;
  fecha?: string;
}

/** Etiqueta cada partido considerando rondas duplicadas en playoffs (Final vs 3er lugar). */
export function labelRetaRondasForPartidos<T extends RoundSortable>(
  partidos: T[],
  metadata: RetaRoundLabelMetadata
): string[] {
  const sorted = [...partidos].sort(
    (a, b) => a.ronda - b.ronda || (a.fecha ?? "").localeCompare(b.fecha ?? "")
  );
  const maxRound = sorted.reduce((max, row) => Math.max(max, row.ronda), 0);
  const regularMax = Number(metadata.regular_rondas_max);
  const playoffStart =
    Number.isFinite(regularMax) && regularMax > 0 ? regularMax + 2 : maxRound;

  const playoffCounts = new Map<number, number>();
  for (const row of sorted) {
    if (row.ronda >= playoffStart || row.ronda === 90) {
      playoffCounts.set(row.ronda, (playoffCounts.get(row.ronda) ?? 0) + 1);
    }
  }

  const playoffSeen = new Map<number, number>();

  return sorted.map((row) => {
    let playoffIndex = 0;
    if (row.ronda >= playoffStart || row.ronda === 90) {
      playoffIndex = playoffSeen.get(row.ronda) ?? 0;
      playoffSeen.set(row.ronda, playoffIndex + 1);
    }

    return labelRetaRonda(row.ronda, metadata, {
      playoffIndexInRound: playoffIndex,
      playoffCountInRound: playoffCounts.get(row.ronda),
      maxRound,
    });
  });
}
