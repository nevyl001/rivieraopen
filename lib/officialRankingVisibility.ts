import { getSupabaseClient } from "@/lib/supabaseClient";

/** Vista SQL: jugadores visibles en www.rivieraopen.com (multi-organizador). */
export const OFFICIAL_RANKING_VIEW = "riviera_jugadores_sitio_oficial";

export interface SitioOficialJugadorRow {
  id: string;
  organizador_id: string;
  nombre: string | null;
  slug: string | null;
  foto_url: string | null;
  categoria: string | null;
  genero: string | null;
  pais_codigo: string | null;
  club: string | null;
  puntos_totales: number;
  total_partidos: number;
  victorias: number;
}

/**
 * Valida si un jugador debe mostrarse en el sitio oficial.
 * RPC definida en supabase/ranking-oficial-sitio-web.sql (repo app Riviera).
 */
export async function isJugadorVisibleSitioOficial(
  jugadorId: string
): Promise<boolean> {
  const supabase = getSupabaseClient();
  if (!supabase) return false;

  const { data, error } = await supabase.rpc(
    "is_jugador_visible_sitio_oficial",
    { p_jugador_id: jugadorId }
  );

  if (error) {
    console.error("isJugadorVisibleSitioOficial:", error.message);
    return false;
  }

  return Boolean(data);
}
