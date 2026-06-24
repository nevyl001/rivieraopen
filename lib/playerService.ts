import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  Category,
  Gender,
  PlayerProfileDetail,
  PlayerStatsSummary,
} from "@/lib/types";
import { dbCategoryToUi } from "@/lib/categoryUtils";
import { findCompetitionRank } from "@/lib/rankingUtils";
import {
  computePlayerMatchStats,
  mergePlayerStats,
} from "@/lib/playerMatchStatsService";
import {
  applyParticipacionesStats,
  computeStatsFromParticipaciones,
} from "@/lib/playerParticipacionesService";
import { computePlayerSeasonTimeline } from "@/lib/playerSeasonTimelineService";
import { getPlayerHistoryEvents } from "@/lib/playerHistoryService";
import { getPlayerRivals } from "@/lib/playerRivalsService";
import {
  normalizePlayerRatingFields,
  obtenerHistorialRatingPublic,
} from "@/lib/playerRatingService";
import {
  isJugadorVisibleSitioOficial,
  OFFICIAL_RANKING_VIEW,
} from "@/lib/officialRankingVisibility";

const DEFAULT_PHOTO = "/img/players/players-1.png";

interface JugadorStatsRow {
  jugador_id?: string;
  total_partidos: number | null;
  victorias: number | null;
  derrotas: number | null;
  empates: number | null;
  participaciones_solo: number | null;
  pct_victorias: number | null;
  total_retas: number | null;
  total_torneos_express: number | null;
  total_ligas: number | null;
  total_americanos: number | null;
  sets_favor_total: number | null;
  sets_contra_total: number | null;
  racha_actual: string | null;
  ultima_actividad: string | null;
  puntos_totales: number | null;
}

interface RivieraJugadorRow {
  id: string;
  organizador_id: string;
  legacy_player_id: string | null;
  nombre: string | null;
  slug: string | null;
  categoria: string | null;
  foto_url: string | null;
  genero: string | null;
  instagram_url: string | null;
  facebook_url: string | null;
  tiktok_url: string | null;
  email: string | null;
  telefono: string | null;
  whatsapp: string | null;
  edad: number | null;
  fecha_nacimiento: string | null;
  club: string | null;
  nivel: string | null;
  mano_dominante: string | null;
  en_cancha: string | null;
  pais_codigo: string | null;
  rating?: number | null;
  rating_partidos?: number | null;
  rating_fiabilidad?: number | null;
  jugador_stats: JugadorStatsRow | JugadorStatsRow[] | null;
}

const JUGADOR_SELECT_BASE = `
        id,
        organizador_id,
        legacy_player_id,
        nombre,
        slug,
        categoria,
        foto_url,
        genero,
        instagram_url,
        facebook_url,
        tiktok_url,
        email,
        telefono,
        whatsapp,
        edad,
        fecha_nacimiento,
        club,
        nivel,
        mano_dominante,
        en_cancha,
        pais_codigo,
        jugador_stats (
          total_partidos,
          victorias,
          derrotas,
          empates,
          participaciones_solo,
          pct_victorias,
          total_retas,
          total_torneos_express,
          total_ligas,
          total_americanos,
          sets_favor_total,
          sets_contra_total,
          racha_actual,
          ultima_actividad,
          puntos_totales
        )
      `;

const JUGADOR_SELECT_WITH_RATING = `
        id,
        organizador_id,
        legacy_player_id,
        nombre,
        slug,
        categoria,
        foto_url,
        genero,
        instagram_url,
        facebook_url,
        tiktok_url,
        email,
        telefono,
        whatsapp,
        edad,
        fecha_nacimiento,
        club,
        nivel,
        mano_dominante,
        en_cancha,
        pais_codigo,
        rating,
        rating_partidos,
        rating_fiabilidad,
        jugador_stats (
          total_partidos,
          victorias,
          derrotas,
          empates,
          participaciones_solo,
          pct_victorias,
          total_retas,
          total_torneos_express,
          total_ligas,
          total_americanos,
          sets_favor_total,
          sets_contra_total,
          racha_actual,
          ultima_actividad,
          puntos_totales
        )
      `;

let jugadorRatingColsInDb: boolean | null = null;

function isMissingRatingColumnError(
  error: { code?: string; message?: string } | null
): boolean {
  if (!error) return false;
  const message = (error.message ?? "").toLowerCase();
  return (
    error.code === "PGRST204" ||
    message.includes("rating") ||
    message.includes("rating_partidos") ||
    message.includes("rating_fiabilidad")
  );
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

function extractStats(
  stats: JugadorStatsRow | JugadorStatsRow[] | null
): PlayerStatsSummary {
  const row = Array.isArray(stats) ? stats[0] : stats;

  return {
    totalPartidos: Number(row?.total_partidos ?? 0),
    victorias: Number(row?.victorias ?? 0),
    derrotas: Number(row?.derrotas ?? 0),
    empates: Number(row?.empates ?? 0),
    pctVictorias: Number(row?.pct_victorias ?? 0),
    setsFavor: Number(row?.sets_favor_total ?? 0),
    setsContra: Number(row?.sets_contra_total ?? 0),
    rachaActual: row?.racha_actual ?? null,
    ultimaActividad: row?.ultima_actividad ?? null,
    totalRetas: Number(row?.total_retas ?? 0),
    totalTorneosExpress: Number(row?.total_torneos_express ?? 0),
    totalLigas: Number(row?.total_ligas ?? 0),
    totalAmericanos: Number(row?.total_americanos ?? 0),
    participacionesSolo: Number(row?.participaciones_solo ?? 0),
  };
}

function extractPoints(stats: JugadorStatsRow | JugadorStatsRow[] | null): number {
  const row = Array.isArray(stats) ? stats[0] : stats;
  return Number(row?.puntos_totales ?? 0);
}

async function computeRank(
  categoria: string | null,
  genero: string | null,
  jugadorId: string,
  points: number
): Promise<number> {
  const supabase = getSupabaseClient();
  if (!supabase || !categoria) return 0;

  const { data, error } = await supabase
    .from(OFFICIAL_RANKING_VIEW)
    .select("id, genero, puntos_totales")
    .eq("categoria", categoria);

  if (error || !data) return 0;

  const gender = normalizeGender(genero);
  const ranked = (data as { id: string; genero: string | null; puntos_totales: number }[])
    .filter((row) => normalizeGender(row.genero) === gender)
    .map((row) => ({
      id: row.id,
      points: Number(row.puntos_totales ?? 0),
    }))
    .sort((a, b) => b.points - a.points);

  const index = ranked.findIndex((row) => row.id === jugadorId);
  if (index < 0) return 0;

  return findCompetitionRank(
    ranked,
    (row) => row.id === jugadorId,
    (row) => row.points
  );
}

function mapRowToProfile(
  row: RivieraJugadorRow,
  rank: number
): PlayerProfileDetail {
  const { firstName, lastName } = splitNombre(row.nombre);
  const stats = extractStats(row.jugador_stats);
  const points = extractPoints(row.jugador_stats);
  const ratingFields = normalizePlayerRatingFields(row);

  return {
    id: String(row.id),
    firstName,
    lastName,
    photo: row.foto_url?.trim() || DEFAULT_PHOTO,
    category: dbCategoryToUi(row.categoria),
    gender: normalizeGender(row.genero),
    points,
    rank,
    contact: {
      email: row.email ?? "",
      phone: row.telefono ?? "",
    },
    socials: {
      ...(row.instagram_url ? { instagram: row.instagram_url } : {}),
      ...(row.facebook_url ? { facebook: row.facebook_url } : {}),
      ...(row.tiktok_url ? { tiktok: row.tiktok_url } : {}),
    },
    tournamentResults: [],
    slug: row.slug,
    age: row.edad,
    birthDate: row.fecha_nacimiento,
    club: row.club,
    nivel: row.nivel,
    manoDominante: row.mano_dominante,
    enCancha: row.en_cancha,
    paisCodigo: row.pais_codigo,
    whatsapp: row.whatsapp,
    stats,
    ...ratingFields,
  };
}

/**
 * Perfil público de un jugador desde Supabase (riviera_jugadores + jugador_stats).
 * Visibilidad: RPC is_jugador_visible_sitio_oficial (multi-organizador).
 */
export async function getJugadorPublico(
  id: string
): Promise<PlayerProfileDetail | null> {
  try {
    const supabase = getSupabaseClient();
    if (!supabase) return null;

    const visible = await isJugadorVisibleSitioOficial(id);
    if (!visible) return null;

    const selectCols =
      jugadorRatingColsInDb === false
        ? JUGADOR_SELECT_BASE
        : JUGADOR_SELECT_WITH_RATING;

    let data: RivieraJugadorRow | null = null;
    let error: { code?: string; message?: string } | null = null;

    const primary = await supabase
      .from("riviera_jugadores")
      .select(selectCols)
      .eq("id", id)
      .maybeSingle();

    data = (primary.data as RivieraJugadorRow | null) ?? null;
    error = primary.error;

    if (error && isMissingRatingColumnError(error)) {
      jugadorRatingColsInDb = false;
      const fallback = await supabase
        .from("riviera_jugadores")
        .select(JUGADOR_SELECT_BASE)
        .eq("id", id)
        .maybeSingle();
      data = (fallback.data as RivieraJugadorRow | null) ?? null;
      error = fallback.error;
    } else if (!error) {
      jugadorRatingColsInDb = true;
    }

    if (error) {
      console.error("getJugadorPublico:", error.message);
      return null;
    }

    if (!data) return null;

    const row = data;
    const organizadorId = row.organizador_id;
    const points = extractPoints(row.jugador_stats);
    const rank = await computeRank(row.categoria, row.genero, row.id, points);

    const baseProfile = mapRowToProfile(row, rank);

    const [participacionesStats, computedStats, historyEvents, ratingHistorial] =
      await Promise.all([
        computeStatsFromParticipaciones(row.id, organizadorId),
        computePlayerMatchStats(row.legacy_player_id, organizadorId),
        getPlayerHistoryEvents(row.id, row.legacy_player_id, organizadorId),
        obtenerHistorialRatingPublic(row.id, 10),
      ]);

    const seasonTimeline = await computePlayerSeasonTimeline(
      row.id,
      row.legacy_player_id,
      undefined,
      organizadorId,
      historyEvents
    );

    const rivals = await getPlayerRivals(
      row.id,
      row.legacy_player_id,
      row.categoria,
      row.genero,
      points,
      organizadorId,
      historyEvents
    );

    const statsFromPartidos = mergePlayerStats(
      baseProfile.stats,
      computedStats
    );

    const stats = applyParticipacionesStats(
      statsFromPartidos,
      participacionesStats
    );

    return {
      ...baseProfile,
      stats,
      ratingHistorial,
      seasonTimeline,
      historyEvents,
      rivals,
    };
  } catch (err) {
    console.error(
      "getJugadorPublico:",
      err instanceof Error ? err.message : err
    );
    return null;
  }
}
