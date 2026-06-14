import { getSupabaseClient } from "@/lib/supabaseClient";
import { PlayerStatsSummary } from "@/lib/types";

const RANKING_ORGANIZADOR_ID =
  process.env.NEXT_PUBLIC_RANKING_ORGANIZADOR_ID?.trim() ||
  "2770b522-9064-4c7b-a729-4a0ea7e3f6e8";

interface ParticipacionMetadata {
  subtipo?: string;
  organizador_id?: string;
  partidos_ganados?: number;
  partidos_perdidos?: number;
  partidos_empatados?: number;
  formato?: string;
  total_participantes?: number;
  modalidad?: string;
}

interface ParticipacionRow {
  tipo_evento: string;
  evento_id: string;
  fecha: string | null;
  pareja_con: string | null;
  sets_favor: number | null;
  sets_contra: number | null;
  metadata: ParticipacionMetadata | null;
}

export interface ParticipacionesStats {
  totalPartidos: number;
  victorias: number;
  derrotas: number;
  empates: number;
  pctVictorias: number;
  gamesFavor: number;
  gamesContra: number;
  ultimaActividad: string | null;
  totalTorneosExpress: number;
  totalRetas: number;
  totalLigas: number;
  totalAmericanos: number;
  hasParticipaciones: boolean;
}

function emptyParticipacionesStats(): ParticipacionesStats {
  return {
    totalPartidos: 0,
    victorias: 0,
    derrotas: 0,
    empates: 0,
    pctVictorias: 0,
    gamesFavor: 0,
    gamesContra: 0,
    ultimaActividad: null,
    totalTorneosExpress: 0,
    totalRetas: 0,
    totalLigas: 0,
    totalAmericanos: 0,
    hasParticipaciones: false,
  };
}

function isAjusteManual(metadata: ParticipacionMetadata | null): boolean {
  return metadata?.subtipo === "ajuste_manual";
}

function inferSoloPartidos(metadata: ParticipacionMetadata | null): number {
  if (!metadata) return 0;
  const recorded =
    Number(metadata.partidos_ganados ?? 0) +
    Number(metadata.partidos_perdidos ?? 0) +
    Number(metadata.partidos_empatados ?? 0);
  if (recorded > 0) return recorded;

  if (
    metadata.formato === "round_robin" &&
    Number(metadata.total_participantes ?? 0) > 1
  ) {
    return Number(metadata.total_participantes) - 1;
  }

  return 0;
}

function belongsToOrganizador(
  row: ParticipacionRow,
  organizadorId: string,
  orgTorneoExpressIds: Set<string>
): boolean {
  const metadata = row.metadata;

  if (metadata?.organizador_id) {
    return metadata.organizador_id === organizadorId;
  }

  if (row.tipo_evento === "torneo_express") {
    return orgTorneoExpressIds.has(row.evento_id);
  }

  return true;
}

async function getOrgTorneoExpressIds(
  organizadorId: string
): Promise<Set<string>> {
  const supabase = getSupabaseClient();
  if (!supabase) return new Set();

  const { data, error } = await supabase
    .from("torneo_express")
    .select("id")
    .eq("organizador_id", organizadorId);

  if (error || !data?.length) return new Set();
  return new Set(data.map((row) => row.id as string));
}

/**
 * Estadísticas autoritativas desde jugador_participaciones (incluye fase de grupos
 * y eliminatoria). Excluye ajustes manuales de puntos.
 */
export async function computeStatsFromParticipaciones(
  jugadorId: string,
  organizadorId: string = RANKING_ORGANIZADOR_ID
): Promise<ParticipacionesStats> {
  const supabase = getSupabaseClient();
  if (!supabase) return emptyParticipacionesStats();

  const [orgTorneoIds, participacionesResult] = await Promise.all([
    getOrgTorneoExpressIds(organizadorId),
    supabase
      .from("jugador_participaciones")
      .select(
        "tipo_evento, evento_id, fecha, pareja_con, sets_favor, sets_contra, metadata"
      )
      .eq("jugador_id", jugadorId)
      .order("fecha", { ascending: false }),
  ]);

  const { data: participaciones, error } = participacionesResult;
  if (error || !participaciones?.length) return emptyParticipacionesStats();

  const stats = emptyParticipacionesStats();
  const rows = participaciones as ParticipacionRow[];

  for (const row of rows) {
    if (isAjusteManual(row.metadata)) continue;
    if (!belongsToOrganizador(row, organizadorId, orgTorneoIds)) continue;

    stats.hasParticipaciones = true;
    const metadata = row.metadata ?? {};

    const victorias = Number(metadata.partidos_ganados ?? 0);
    const derrotas = Number(metadata.partidos_perdidos ?? 0);
    const empates = Number(metadata.partidos_empatados ?? 0);
    let partidosEvento = victorias + derrotas + empates;

    const isSoloReta =
      row.tipo_evento === "reta" &&
      !row.pareja_con &&
      (metadata.formato === "round_robin" || metadata.modalidad === "round_robin");

    if (partidosEvento === 0 && isSoloReta) {
      partidosEvento = inferSoloPartidos(metadata);
    }

    stats.totalPartidos += partidosEvento;
    stats.victorias += victorias;
    stats.derrotas += derrotas;
    stats.empates += empates;
    stats.gamesFavor += Number(row.sets_favor ?? 0);
    stats.gamesContra += Number(row.sets_contra ?? 0);

    if (row.tipo_evento === "torneo_express") stats.totalTorneosExpress += 1;
    if (row.tipo_evento === "reta") stats.totalRetas += 1;
    if (row.tipo_evento === "liga") stats.totalLigas += 1;
    if (row.tipo_evento === "americano") stats.totalAmericanos += 1;

    if (row.fecha) {
      if (!stats.ultimaActividad || row.fecha > stats.ultimaActividad) {
        stats.ultimaActividad = row.fecha;
      }
    }
  }

  stats.pctVictorias =
    stats.totalPartidos > 0
      ? Math.round((stats.victorias / stats.totalPartidos) * 100)
      : 0;

  return stats;
}

export function applyParticipacionesStats(
  base: PlayerStatsSummary,
  participaciones: ParticipacionesStats
): PlayerStatsSummary {
  if (!participaciones.hasParticipaciones) return base;

  return {
    ...base,
    totalPartidos: participaciones.totalPartidos,
    victorias: participaciones.victorias,
    derrotas: participaciones.derrotas,
    empates: participaciones.empates,
    pctVictorias: participaciones.pctVictorias,
    setsFavor: participaciones.gamesFavor,
    setsContra: participaciones.gamesContra,
    ultimaActividad:
      participaciones.ultimaActividad ?? base.ultimaActividad,
    totalTorneosExpress: participaciones.totalTorneosExpress,
    totalRetas: participaciones.totalRetas,
    totalLigas: participaciones.totalLigas,
    totalAmericanos: participaciones.totalAmericanos,
  };
}
