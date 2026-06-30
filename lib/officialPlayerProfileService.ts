import { getSupabaseClient } from "@/lib/supabaseClient";
import { dbCategoryToUi } from "@/lib/categoryUtils";
import { PlayerHistoryEvent } from "@/lib/types/playerHistory";

export interface OfficialHistorialMetadata {
  categoria?: string | null;
  posicion_final?: number | null;
  posicion?: number | null;
  partidos_ganados?: number | null;
  partidos_perdidos?: number | null;
  partidos_empatados?: number | null;
  [key: string]: unknown;
}

export interface OfficialHistorialEntry {
  participacion_id: string;
  event_type: string;
  event_id: string;
  event_name: string;
  points: number;
  source_club_name: string | null;
  activity_at: string;
  metadata?: OfficialHistorialMetadata | null;
}

export interface OfficialJugadorPublicProfile {
  jugador_id: string;
  organizador_id: string;
  puntos_totales: number;
  ranking_posicion: number;
  historial: OfficialHistorialEntry[];
}

function formatCategoryLabel(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const ui = dbCategoryToUi(value);
  return ui === "Open" ? "Open" : `${ui}ª Fuerza`;
}

function parseOfficialProfile(data: unknown): OfficialJugadorPublicProfile | null {
  if (!data || typeof data !== "object") return null;

  const row = data as Record<string, unknown>;
  const jugadorId = row.jugador_id;
  const organizadorId = row.organizador_id;

  if (typeof jugadorId !== "string" || typeof organizadorId !== "string") {
    return null;
  }

  const historialRaw = Array.isArray(row.historial) ? row.historial : [];

  const historial: OfficialHistorialEntry[] = historialRaw
    .map((entry) => {
      if (!entry || typeof entry !== "object") return null;
      const item = entry as Record<string, unknown>;
      const participacionId = item.participacion_id;
      const eventType = item.event_type;
      const eventId = item.event_id;
      const eventName = item.event_name;
      const activityAt = item.activity_at;

      if (
        typeof participacionId !== "string" ||
        typeof eventType !== "string" ||
        typeof eventId !== "string" ||
        typeof eventName !== "string" ||
        typeof activityAt !== "string"
      ) {
        return null;
      }

      return {
        participacion_id: participacionId,
        event_type: eventType,
        event_id: eventId,
        event_name: eventName,
        points: Number(item.points ?? 0),
        source_club_name:
          typeof item.source_club_name === "string"
            ? item.source_club_name
            : null,
        activity_at: activityAt,
        metadata:
          item.metadata && typeof item.metadata === "object"
            ? (item.metadata as OfficialHistorialMetadata)
            : null,
      };
    })
    .filter((entry): entry is OfficialHistorialEntry => entry !== null);

  return {
    jugador_id: jugadorId,
    organizador_id: organizadorId,
    puntos_totales: Number(row.puntos_totales ?? 0),
    ranking_posicion: Number(row.ranking_posicion ?? 0),
    historial,
  };
}

/**
 * Perfil oficial multiclub (puntos ROMC, ranking y historial global).
 * RPC definida en Supabase (repo app Riviera).
 */
export async function getOfficialJugadorPublicProfile(
  jugadorId: string
): Promise<OfficialJugadorPublicProfile | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc(
    "get_riviera_oficial_jugador_public_profile",
    { p_jugador_id: jugadorId }
  );

  if (error) {
    console.error("getOfficialJugadorPublicProfile:", error.message);
    return null;
  }

  return parseOfficialProfile(data);
}

export function mapOfficialHistorialToHistoryEvents(
  historial: OfficialHistorialEntry[]
): PlayerHistoryEvent[] {
  return historial.map((entry) => {
    const metadata = entry.metadata ?? {};
    const posicionRaw = metadata.posicion_final ?? metadata.posicion ?? null;
    const posicionFinal =
      posicionRaw != null && !Number.isNaN(Number(posicionRaw))
        ? Number(posicionRaw)
        : null;

    return {
      id: entry.participacion_id,
      eventoId: entry.event_id,
      tipoEvento: entry.event_type,
      nombre: entry.event_name,
      fecha: entry.activity_at,
      categoria: formatCategoryLabel(
        typeof metadata.categoria === "string" ? metadata.categoria : null
      ),
      posicionFinal,
      puntosGanados: Number(entry.points ?? 0),
      partidosGanados:
        metadata.partidos_ganados != null
          ? Number(metadata.partidos_ganados)
          : null,
      partidosPerdidos:
        metadata.partidos_perdidos != null
          ? Number(metadata.partidos_perdidos)
          : null,
      partidosEmpatados:
        metadata.partidos_empatados != null
          ? Number(metadata.partidos_empatados)
          : null,
      partidos: [],
      sourceClubName: entry.source_club_name?.trim() || null,
    };
  });
}
