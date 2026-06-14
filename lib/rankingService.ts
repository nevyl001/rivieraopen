import { getSupabaseClient } from "@/lib/supabaseClient";
import { Category, Gender, Player } from "@/lib/types";
import {
  dbCategoryToUi,
  uiCategoryToDb,
} from "@/lib/categoryUtils";
import { getCompetitionRankAtIndex } from "@/lib/rankingUtils";

const DEFAULT_PHOTO = "/img/players/players-1.png";

/** Cuenta nevyl (nrm001sm@hotmail.com) en Supabase */
const RANKING_ORGANIZADOR_ID =
  process.env.NEXT_PUBLIC_RANKING_ORGANIZADOR_ID?.trim() ||
  "2770b522-9064-4c7b-a729-4a0ea7e3f6e8";

type JugadorStatsRow =
  | { puntos_totales: number | null }
  | { puntos_totales: number | null }[];

interface RivieraJugadorRow {
  id: string;
  nombre: string | null;
  categoria: string | null;
  foto_url: string | null;
  genero: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  email: string | null;
  telefono: string | null;
  jugador_stats: JugadorStatsRow | null;
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

function matchesGenderFilter(genero: string | null, filter: Gender): boolean {
  const isFemale = isFemenilGenero(genero);
  return filter === "Female" ? isFemale : !isFemale;
}

function extractPoints(stats: JugadorStatsRow | null): number {
  if (!stats) return 0;
  if (Array.isArray(stats)) {
    return Number(stats[0]?.puntos_totales ?? 0);
  }
  return Number(stats.puntos_totales ?? 0);
}

function mapRowToPlayer(
  row: RivieraJugadorRow,
  rank: number,
  fallbackCategory: Category
): Player | null {
  if (!row.id) return null;

  const { firstName, lastName } = splitNombre(row.nombre);

  return {
    id: String(row.id),
    firstName,
    lastName,
    photo: row.foto_url?.trim() || DEFAULT_PHOTO,
    category: dbCategoryToUi(row.categoria, fallbackCategory),
    gender: normalizeGender(row.genero),
    points: extractPoints(row.jugador_stats),
    rank,
    contact: {
      email: row.email ?? "",
      phone: row.telefono ?? "",
    },
    socials: {
      ...(row.instagram_url ? { instagram: row.instagram_url } : {}),
      ...(row.facebook_url ? { facebook: row.facebook_url } : {}),
    },
    tournamentResults: [],
  };
}

/**
 * Ranking público por categoría desde Supabase (riviera_jugadores + jugador_stats).
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

    const { data, error } = await supabase
      .from("riviera_jugadores")
      .select(
        `
        id,
        nombre,
        categoria,
        foto_url,
        genero,
        instagram_url,
        facebook_url,
        email,
        telefono,
        jugador_stats ( puntos_totales )
      `
      )
      .eq("categoria", dbCategory)
      .eq("organizador_id", RANKING_ORGANIZADOR_ID)
      .eq("visible_publico", true);

    if (error) {
      console.error("getRankingPublico:", error.message);
      return [];
    }

    if (!data || data.length === 0) {
      return [];
    }

    const rows = (data as RivieraJugadorRow[]).filter((row) =>
      matchesGenderFilter(row.genero, genero)
    );

    const sorted = rows
      .map((row) => ({
        row,
        points: extractPoints(row.jugador_stats),
      }))
      .sort((a, b) => b.points - a.points);

    return sorted
      .map(({ row, points }, index) =>
        mapRowToPlayer(
          row,
          getCompetitionRankAtIndex(sorted, index, (e) => e.points),
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
