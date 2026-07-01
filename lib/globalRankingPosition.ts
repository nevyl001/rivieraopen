import { getSupabaseClient } from "@/lib/supabaseClient";
import { uiCategoryToDb } from "@/lib/categoryUtils";
import { findCompetitionRank } from "@/lib/rankingUtils";
import {
  OFFICIAL_RANKING_VIEW,
  type SitioOficialJugadorRow,
} from "@/lib/officialRankingVisibility";
import { Gender } from "@/lib/types";

function isFemenilGenero(value: string | null | undefined): boolean {
  if (!value) return false;
  const lower = value.toLowerCase().trim();
  return (
    lower === "f" ||
    lower === "female" ||
    lower === "femenino" ||
    lower === "femenil" ||
    lower === "mujer"
  );
}

function resolveDbCategory(categoria: string | null | undefined): string | null {
  if (!categoria?.trim()) return null;
  if (categoria.includes("_")) return categoria.trim();
  return uiCategoryToDb(categoria);
}

function matchesGenderFilter(genero: string | null, filter: Gender): boolean {
  const isFemale = isFemenilGenero(genero);
  return filter === "Female" ? isFemale : !isFemale;
}

export async function listGlobalSitioOficialRankingRows(
  dbCategory: string,
  gender: Gender
): Promise<SitioOficialJugadorRow[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const generoParam = gender === "Female" ? "F" : "M";
  const { data, error } = await supabase.rpc(
    "riviera_ranking_sitio_oficial_global",
    {
      p_categoria: dbCategory,
      p_genero: generoParam,
    }
  );

  if (!error && data?.length) {
    return (data as SitioOficialJugadorRow[]).filter((row) =>
      matchesGenderFilter(row.genero, gender)
    );
  }

  if (
    error &&
    !error.message?.includes("riviera_ranking_sitio_oficial_global")
  ) {
    console.error("listGlobalSitioOficialRankingRows:", error.message);
  }

  const { data: viewData, error: viewError } = await supabase
    .from(OFFICIAL_RANKING_VIEW)
    .select(
      "id, organizador_id, nombre, slug, foto_url, categoria, genero, pais_codigo, club, puntos_totales, total_partidos, victorias"
    )
    .eq("categoria", dbCategory);

  if (viewError) {
    console.error("listGlobalSitioOficialRankingRows view:", viewError.message);
    return [];
  }

  return ((viewData ?? []) as SitioOficialJugadorRow[]).filter((row) =>
    matchesGenderFilter(row.genero, gender)
  );
}

/**
 * Posición en el ranking global de rivieraopen.com (todos los clubes publicados).
 * Misma lógica que `/rankings` (vista + ranking de competición).
 * No usar ranking_posicion del RPC de perfil (es por club).
 */
export async function getGlobalSitioOficialRankingPosicion(
  jugadorId: string,
  categoria: string | null | undefined,
  genero: string | null | undefined,
  puntosOverride?: number
): Promise<number> {
  const dbCategory = resolveDbCategory(categoria);
  if (!dbCategory?.trim() || !jugadorId?.trim()) return 0;

  const gender: Gender = isFemenilGenero(genero) ? "Female" : "Male";
  const rows = await listGlobalSitioOficialRankingRows(dbCategory, gender);
  if (!rows.length) return 0;

  const normalizedId = jugadorId.trim();
  const hasOverride =
    puntosOverride != null && Number.isFinite(Number(puntosOverride));

  const sorted = [...rows]
    .map((row) => ({
      id: String(row.id),
      points:
        hasOverride && String(row.id) === normalizedId
          ? Number(puntosOverride)
          : Number(row.puntos_totales ?? 0),
    }))
    .sort((a, b) => b.points - a.points);

  return findCompetitionRank(
    sorted,
    (row) => row.id === normalizedId,
    (row) => row.points
  );
}
