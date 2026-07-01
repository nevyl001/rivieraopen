import { getSupabaseClient } from "@/lib/supabaseClient";
import { Category, Gender, Player } from "@/lib/types";
import {
  dbCategoryToUi,
  uiCategoryToDb,
} from "@/lib/categoryUtils";
import { getCompetitionRankAtIndex } from "@/lib/rankingUtils";
import { listGlobalSitioOficialRankingRows } from "@/lib/globalRankingPosition";
import {
  type SitioOficialJugadorRow,
} from "@/lib/officialRankingVisibility";

const DEFAULT_PHOTO = "/img/players/players-1.png";

interface JugadorContactRow {
  id: string;
  instagram_url: string | null;
  facebook_url: string | null;
  email: string | null;
  telefono: string | null;
}

function splitNombre(nombre: string | null): { firstName: string; lastName: string } {
  const trimmed = nombre?.trim() || "Jugador";
  const lastSpace = trimmed.lastIndexOf(" ");
  if (lastSpace <= 0) {
    return { firstName: trimmed, lastName: "" };
  }
  return {
    firstName: trimmed.slice(0, lastSpace),
    lastName: trimmed.slice(lastSpace + 1),
  };
}

function isFemenilGenero(value: string | null): boolean {
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

function normalizeGender(value: string | null): Gender {
  return isFemenilGenero(value) ? "Female" : "Male";
}

function mapRowToPlayer(
  row: SitioOficialJugadorRow,
  contact: JugadorContactRow | undefined,
  rank: number,
  fallbackCategory: Category
): Player | null {
  if (!row.id) return null;

  const { firstName, lastName } = splitNombre(row.nombre);
  const points = Number(row.puntos_totales ?? 0);

  return {
    id: String(row.id),
    firstName,
    lastName,
    photo: row.foto_url?.trim() || DEFAULT_PHOTO,
    category: dbCategoryToUi(row.categoria, fallbackCategory),
    gender: normalizeGender(row.genero),
    points,
    rank,
    contact: {
      email: contact?.email ?? "",
      phone: contact?.telefono ?? "",
    },
    socials: {
      ...(contact?.instagram_url ? { instagram: contact.instagram_url } : {}),
      ...(contact?.facebook_url ? { facebook: contact.facebook_url } : {}),
    },
    tournamentResults: [],
  };
}

async function fetchContactByIds(
  ids: string[]
): Promise<Map<string, JugadorContactRow>> {
  const map = new Map<string, JugadorContactRow>();
  if (!ids.length) return map;

  const supabase = getSupabaseClient();
  if (!supabase) return map;

  const { data, error } = await supabase
    .from("riviera_jugadores")
    .select("id, instagram_url, facebook_url, email, telefono")
    .in("id", ids);

  if (error) {
    console.error("fetchContactByIds:", error.message);
    return map;
  }

  for (const row of data ?? []) {
    map.set(String(row.id), row as JugadorContactRow);
  }

  return map;
}

/**
 * Ranking público por categoría (multi-organizador).
 * Fuente: vista `riviera_jugadores_sitio_oficial`.
 */
export async function getRankingPublico(
  categoria: string,
  genero: Gender = "Male"
): Promise<Player[]> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return [];

    const dbCategory = uiCategoryToDb(categoria);
    if (!dbCategory) return [];

    const uiCategory = (categoria.toLowerCase() === "open"
      ? "Open"
      : categoria) as Category;

    const rows = await listGlobalSitioOficialRankingRows(dbCategory, genero);
    if (!rows.length) return [];

    const sorted = [...rows].sort(
      (a, b) => Number(b.puntos_totales ?? 0) - Number(a.puntos_totales ?? 0)
    );

    const contactMap = await fetchContactByIds(sorted.map((row) => row.id));

    return sorted
      .map((row, index) =>
        mapRowToPlayer(
          row,
          contactMap.get(row.id),
          getCompetitionRankAtIndex(
            sorted,
            index,
            (entry) => Number(entry.puntos_totales ?? 0)
          ),
          uiCategory
        )
      )
      .filter((player): player is Player => player !== null);
  } catch (err) {
    console.error(
      "getRankingPublico:",
      err instanceof Error ? err.message : err
    );
    return [];
  }
}

const FEATURED_CATEGORIES: { category: Category; limit: number }[] = [
  { category: "Open", limit: 3 },
  { category: "5", limit: 2 },
  { category: "4", limit: 2 },
  { category: "1", limit: 2 },
];

/**
 * Jugadores destacados para el home (top por categoría desde Supabase).
 */
export async function getJugadoresDestacados(): Promise<Player[]> {
  const featured: Player[] = [];
  const seen = new Set<string>();

  for (const { category, limit } of FEATURED_CATEGORIES) {
    const players = await getRankingPublico(category, "Male");
    for (const player of players.slice(0, limit)) {
      if (seen.has(player.id)) continue;
      seen.add(player.id);
      featured.push(player);
    }
  }

  const topFemale = (await getRankingPublico("Open", "Female"))[0];
  if (topFemale && !seen.has(topFemale.id)) {
    featured.push(topFemale);
  }

  return featured;
}
