import { getSupabaseClient } from "@/lib/supabaseClient";
import type { RatingHistorialEntry } from "@/lib/types/player";

const DEFAULT_RATING = 3.0;
const DEFAULT_RATING_PARTIDOS = 0;
const DEFAULT_RATING_FIABILIDAD = 0.2;

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
