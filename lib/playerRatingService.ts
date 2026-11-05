import { getSupabaseClient } from "@/lib/supabaseClient";
import type { RatingHistorialEntry } from "@/lib/types/player";

const DEFAULT_RATING = 3.0;
const DEFAULT_RATING_PARTIDOS = 0;
const DEFAULT_RATING_FIABILIDAD = 0.2;

/**
 * Misma curva que `aplicar_rating_partido`:
 * fiabilidad = min(1, 0.2 + partidos * 0.04), redondeada a 2 decimales.
 */
export function fiabilidadFromRatedMatches(partidos: number): number {
  if (partidos <= 0) return DEFAULT_RATING_FIABILIDAD;
  const raw = Math.min(1, 0.2 + partidos * 0.04);
  return Math.round(raw * 100) / 100;
}

/**
 * La ficha pública debe contar los partidos ya registrados en la carrera
 * y los que sí entraron al libro de rating, aunque vivan en otro perfil local.
 */
export function resolvePublicRatingSample(params: {
  careerMatches: number;
  ratedMatches: number;
}): { partidos: number; fiabilidad: number } {
  const partidos = Math.max(
    0,
    Math.trunc(params.careerMatches) || 0,
    Math.trunc(params.ratedMatches) || 0
  );
  return {
    partidos,
    fiabilidad: fiabilidadFromRatedMatches(partidos),
  };
}

function isMissingTableOrColumnError(
  error: { code?: string; message?: string } | null
): boolean {
  if (!error) return false;
  const code = error.code ?? "";
  const message = (error.message ?? "").toLowerCase();
  return (
    code === "PGRST204" ||
    code === "42P01" ||
    message.includes("does not exist") ||
    message.includes("could not find")
  );
}

export function normalizePlayerRatingFields(raw: {
  rating?: unknown;
  rating_partidos?: unknown;
  rating_fiabilidad?: unknown;
}): {
  rating: number;
  ratingPartidos: number;
  ratingFiabilidad: number;
} {
  const ratingRaw = raw.rating;
  const partidosRaw = raw.rating_partidos;
  const fiabRaw = raw.rating_fiabilidad;

  return {
    rating:
      ratingRaw != null && Number.isFinite(Number(ratingRaw))
        ? Number(ratingRaw)
        : DEFAULT_RATING,
    ratingPartidos:
      partidosRaw != null && Number.isFinite(Number(partidosRaw))
        ? Number(partidosRaw)
        : DEFAULT_RATING_PARTIDOS,
    ratingFiabilidad:
      fiabRaw != null && Number.isFinite(Number(fiabRaw))
        ? Number(fiabRaw)
        : DEFAULT_RATING_FIABILIDAD,
  };
}

/** Historial de rating para vista pública (últimos N por jugador_id). */
export async function obtenerHistorialRatingPublic(
  jugadorId: string,
  limite = 10
): Promise<RatingHistorialEntry[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("rating_historial")
    .select(
      "id, fecha, rating_antes, rating_despues, delta, modo_juego, descripcion"
    )
    .eq("jugador_id", jugadorId)
    .order("fecha", { ascending: false })
    .limit(limite);

  if (error) {
    if (isMissingTableOrColumnError(error)) return [];
    console.error("obtenerHistorialRatingPublic:", error.message);
    return [];
  }

  return (data ?? []).map((row) => {
    const r = row as Record<string, unknown>;
    return {
      id: String(r.id),
      fecha: String(r.fecha),
      rating_antes: Number(r.rating_antes ?? 0),
      rating_despues: Number(r.rating_despues ?? 0),
      delta: Number(r.delta ?? 0),
      modo_juego: String(r.modo_juego ?? ""),
      descripcion: String(r.descripcion ?? ""),
    };
  });
}

export interface PublicRatingBundle {
  ratedMatches: number;
  /** Último rating aplicado sobre el perfil público, si el libro lo tiene. */
  canonicalRating: number | null;
  historial: RatingHistorialEntry[];
}

function mapHistorialRow(row: Record<string, unknown>): RatingHistorialEntry {
  return {
    id: String(row.id),
    fecha: String(row.fecha),
    rating_antes: Number(row.rating_antes ?? 0),
    rating_despues: Number(row.rating_despues ?? 0),
    delta: Number(row.delta ?? 0),
    modo_juego: String(row.modo_juego ?? ""),
    descripcion: String(row.descripcion ?? ""),
  };
}

/** Libro de rating de toda la identidad oficial. Null si la función aún no está. */
export async function obtenerRatingPublicoBundle(
  jugadorId: string
): Promise<PublicRatingBundle | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc(
    "get_public_jugador_rating_bundle",
    { p_jugador_id: jugadorId }
  );

  if (error) {
    if (isMissingTableOrColumnError(error)) return null;
    console.error("obtenerRatingPublicoBundle:", error.message);
    return null;
  }

  if (!data || typeof data !== "object") return null;
  const raw = data as Record<string, unknown>;
  const historialRaw = Array.isArray(raw.historial) ? raw.historial : [];
  const canonicalRaw = raw.canonical_rating;

  return {
    ratedMatches: Number(raw.rated_matches ?? historialRaw.length) || 0,
    canonicalRating:
      canonicalRaw != null && Number.isFinite(Number(canonicalRaw))
        ? Number(canonicalRaw)
        : null,
    historial: historialRaw
      .filter((row): row is Record<string, unknown> => !!row && typeof row === "object")
      .map(mapHistorialRow),
  };
}
