import { getSupabaseClient } from "@/lib/supabaseClient";
import { PlayerStatsSummary } from "@/lib/types";

const RANKING_ORGANIZADOR_ID =
  process.env.NEXT_PUBLIC_RANKING_ORGANIZADOR_ID?.trim() ||
  "2770b522-9064-4c7b-a729-4a0ea7e3f6e8";

interface ParejaEmbed {
  player1_id: string | null;
  player2_id: string | null;
}

interface GameRow {
  pair1_games: number | null;
  pair2_games: number | null;
}

interface MatchRow {
  pair1_id: string;
  pair2_id: string;
  pair1_score: number | null;
  pair2_score: number | null;
  created_at: string | null;
  games: GameRow | GameRow[] | null;
  torneo: { user_id: string | null } | { user_id: string | null }[] | null;
}

export interface ComputedMatchStats {
  totalPartidos: number;
  victorias: number;
  derrotas: number;
  empates: number;
  pctVictorias: number;
  gamesFavor: number;
  gamesContra: number;
  ultimaActividad: string | null;
}

function emptyComputed(): ComputedMatchStats {
  return {
    totalPartidos: 0,
    victorias: 0,
    derrotas: 0,
    empates: 0,
    pctVictorias: 0,
    gamesFavor: 0,
    gamesContra: 0,
    ultimaActividad: null,
  };
}

function unwrapPareja(
  pareja: ParejaEmbed | ParejaEmbed[] | null | undefined
): ParejaEmbed | null {
  if (!pareja) return null;
  return Array.isArray(pareja) ? pareja[0] ?? null : pareja;
}

function unwrapGames(games: GameRow | GameRow[] | null | undefined): GameRow[] {
  if (!games) return [];
  return Array.isArray(games) ? games : [games];
}

function unwrapTorneoUserId(
  torneo: MatchRow["torneo"]
): string | null {
  if (!torneo) return null;
  const row = Array.isArray(torneo) ? torneo[0] : torneo;
  return row?.user_id ?? null;
}

function playerInPareja(
  pareja: ParejaEmbed | null,
  legacyPlayerId: string
): boolean {
  if (!pareja) return false;
  return (
    pareja.player1_id === legacyPlayerId ||
    pareja.player2_id === legacyPlayerId
  );
}

function formatActivityDate(isoDate: string): string {
  return isoDate.slice(0, 10);
}

function trackActivity(
  current: string | null,
  createdAt: string | null | undefined
): string | null {
  if (!createdAt) return current;
  const date = formatActivityDate(createdAt);
  if (!current || date > current) return date;
  return current;
}

function addStats(
  target: ComputedMatchStats,
  partidos: number,
  victorias: number,
  derrotas: number,
  empates: number,
  gamesFavor: number,
  gamesContra: number,
  ultimaActividad: string | null
): void {
  target.totalPartidos += partidos;
  target.victorias += victorias;
  target.derrotas += derrotas;
  target.empates += empates;
  target.gamesFavor += gamesFavor;
  target.gamesContra += gamesContra;
  if (ultimaActividad) {
    target.ultimaActividad = trackActivity(
      target.ultimaActividad,
      ultimaActividad
    );
  }
}

function finalizePct(stats: ComputedMatchStats): ComputedMatchStats {
  stats.pctVictorias =
    stats.totalPartidos > 0
      ? Math.round((stats.victorias / stats.totalPartidos) * 100)
      : 0;
  return stats;
}

async function getPlayerPairIds(
  legacyPlayerId: string
): Promise<string[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("pairs")
    .select("id")
    .or(
      `player1_id.eq.${legacyPlayerId},player2_id.eq.${legacyPlayerId}`
    );

  if (error || !data?.length) return [];
  return data.map((row) => row.id as string);
}

async function computeFromExpressPartidos(
  legacyPlayerId: string,
  organizadorId: string
): Promise<ComputedMatchStats> {
  const stats = emptyComputed();
  const supabase = getSupabaseClient();
  if (!supabase) return stats;

  const { data: torneos, error: torneosError } = await supabase
    .from("torneo_express")
    .select("id")
    .eq("organizador_id", organizadorId);

  if (torneosError || !torneos?.length) return stats;

  const torneoIds = torneos.map((row) => row.id as string);

  const { data: grupos, error: gruposError } = await supabase
    .from("torneo_express_grupos")
    .select("id")
    .in("torneo_id", torneoIds);

  if (gruposError || !grupos?.length) return stats;

  const grupoIds = grupos.map((row) => row.id as string);

  const { data: partidos, error: partidosError } = await supabase
    .from("torneo_express_partidos")
    .select(
      `
      puntos_local,
      puntos_visitante,
      ganador_id,
      pareja_local_id,
      pareja_visitante_id,
      created_at,
      pareja_local:pareja_local_id ( player1_id, player2_id ),
      pareja_visitante:pareja_visitante_id ( player1_id, player2_id )
    `
    )
    .in("grupo_id", grupoIds)
    .eq("estado", "jugado");

  if (partidosError || !partidos?.length) return stats;

  for (const raw of partidos) {
    const inLocal = playerInPareja(
      unwrapPareja(raw.pareja_local),
      legacyPlayerId
    );
    const inVisit = playerInPareja(
      unwrapPareja(raw.pareja_visitante),
      legacyPlayerId
    );
    if (!inLocal && !inVisit) continue;

    const isLocal = inLocal;
    const myPts = isLocal
      ? Number(raw.puntos_local ?? 0)
      : Number(raw.puntos_visitante ?? 0);
    const oppPts = isLocal
      ? Number(raw.puntos_visitante ?? 0)
      : Number(raw.puntos_local ?? 0);

    const myParejaId = isLocal
      ? raw.pareja_local_id
      : raw.pareja_visitante_id;

    let victorias = 0;
    let derrotas = 0;
    let empates = 0;

    if (!raw.ganador_id) {
      empates = 1;
    } else if (raw.ganador_id === myParejaId) {
      victorias = 1;
    } else {
      derrotas = 1;
    }

    addStats(
      stats,
      1,
      victorias,
      derrotas,
      empates,
      myPts,
      oppPts,
      raw.created_at
    );
  }

  return finalizePct(stats);
}

async function computeFromRetasMatches(
  legacyPlayerId: string,
  organizadorId: string,
  pairIds: string[]
): Promise<ComputedMatchStats> {
  const stats = emptyComputed();
  if (!pairIds.length) return stats;

  const supabase = getSupabaseClient();
  if (!supabase) return stats;

  const { data: orgTournaments, error: tournamentsError } = await supabase
    .from("tournaments")
    .select("id")
    .eq("user_id", organizadorId);

  if (tournamentsError || !orgTournaments?.length) return stats;

  const tournamentIds = orgTournaments.map((row) => row.id as string);
  const pairFilter = pairIds.join(",");

  const { data: matches, error: matchesError } = await supabase
    .from("matches")
    .select(
      `
      id,
      pair1_id,
      pair2_id,
      pair1_score,
      pair2_score,
      created_at,
      games ( pair1_games, pair2_games ),
      torneo:tournament_id ( user_id )
    `
    )
    .in("tournament_id", tournamentIds)
    .eq("status", "finished")
    .or(`pair1_id.in.(${pairFilter}),pair2_id.in.(${pairFilter})`);

  if (matchesError || !matches?.length) return stats;

  const seenMatchIds = new Set<string>();

  for (const raw of matches as Array<MatchRow & { id: string }>) {
    if (seenMatchIds.has(raw.id)) continue;
    seenMatchIds.add(raw.id);

    if (unwrapTorneoUserId(raw.torneo) !== organizadorId) continue;

    const inPair1 = pairIds.includes(raw.pair1_id);
    const inPair2 = pairIds.includes(raw.pair2_id);
    if (!inPair1 && !inPair2) continue;

    const isPair1 = inPair1;
    const gameRows = unwrapGames(raw.games);

    let victorias = 0;
    let derrotas = 0;
    let empates = 0;

    if (gameRows.length) {
      let myGames = 0;
      let oppGames = 0;
      for (const game of gameRows) {
        myGames += isPair1
          ? Number(game.pair1_games ?? 0)
          : Number(game.pair2_games ?? 0);
        oppGames += isPair1
          ? Number(game.pair2_games ?? 0)
          : Number(game.pair1_games ?? 0);
      }
      if (myGames > oppGames) victorias = 1;
      else if (oppGames > myGames) derrotas = 1;
      else empates = 1;
    } else {
      const myScore = isPair1
        ? Number(raw.pair1_score ?? 0)
        : Number(raw.pair2_score ?? 0);
      const oppScore = isPair1
        ? Number(raw.pair2_score ?? 0)
        : Number(raw.pair1_score ?? 0);

      if (myScore > oppScore) victorias = 1;
      else if (oppScore > myScore) derrotas = 1;
      else if (myScore > 0 || oppScore > 0) empates = 1;
    }

    let gamesFavor = 0;
    let gamesContra = 0;
    for (const game of gameRows) {
      gamesFavor += isPair1
        ? Number(game.pair1_games ?? 0)
        : Number(game.pair2_games ?? 0);
      gamesContra += isPair1
        ? Number(game.pair2_games ?? 0)
        : Number(game.pair1_games ?? 0);
    }

    addStats(
      stats,
      1,
      victorias,
      derrotas,
      empates,
      gamesFavor,
      gamesContra,
      raw.created_at
    );
  }

  return finalizePct(stats);
}

function combineComputed(
  express: ComputedMatchStats,
  retas: ComputedMatchStats
): ComputedMatchStats {
  const combined = emptyComputed();

  addStats(
    combined,
    express.totalPartidos,
    express.victorias,
    express.derrotas,
    express.empates,
    express.gamesFavor,
    express.gamesContra,
    express.ultimaActividad
  );

  addStats(
    combined,
    retas.totalPartidos,
    retas.victorias,
    retas.derrotas,
    retas.empates,
    retas.gamesFavor,
    retas.gamesContra,
    retas.ultimaActividad
  );

  return finalizePct(combined);
}

/**
 * Calcula estadísticas en tiempo real desde partidos de torneos express y retas.
 * Se ejecuta en cada visita al perfil (sin caché).
 */
export async function computePlayerMatchStats(
  legacyPlayerId: string | null | undefined,
  organizadorId: string = RANKING_ORGANIZADOR_ID
): Promise<ComputedMatchStats> {
  if (!legacyPlayerId?.trim()) return emptyComputed();

  const pairIds = await getPlayerPairIds(legacyPlayerId);
  const [express, retas] = await Promise.all([
    computeFromExpressPartidos(legacyPlayerId, organizadorId),
    computeFromRetasMatches(legacyPlayerId, organizadorId, pairIds),
  ]);

  return combineComputed(express, retas);
}

/**
 * Combina el conteo calculado desde partidos con jugador_stats de Supabase.
 * Prioriza partidos reales calculados; usa jugador_stats para retas solo sin filas.
 */
export function mergePlayerStats(
  fromDb: PlayerStatsSummary,
  computed: ComputedMatchStats
): PlayerStatsSummary {
  let totalPartidos = Math.max(computed.totalPartidos, fromDb.totalPartidos);
  let victorias = Math.max(computed.victorias, fromDb.victorias);
  let derrotas = Math.max(computed.derrotas, fromDb.derrotas);
  let empates = Math.max(computed.empates, fromDb.empates);
  let gamesFavor = Math.max(computed.gamesFavor, fromDb.setsFavor);
  let gamesContra = Math.max(computed.gamesContra, fromDb.setsContra);

  const hasComputedMatches = computed.totalPartidos > 0;

  if (hasComputedMatches) {
    totalPartidos = computed.totalPartidos;
    victorias = computed.victorias;
    derrotas = computed.derrotas;
    empates = computed.empates;
    gamesFavor = computed.gamesFavor;
    gamesContra = computed.gamesContra;
  }

  if (
    fromDb.participacionesSolo > totalPartidos &&
    (fromDb.totalRetas > 0 || fromDb.totalLigas > 0)
  ) {
    totalPartidos = fromDb.participacionesSolo;
    victorias = Math.max(victorias, fromDb.victorias);
    derrotas = Math.max(derrotas, fromDb.derrotas);
    if (!hasComputedMatches) {
      gamesFavor = Math.max(gamesFavor, fromDb.setsFavor);
      gamesContra = Math.max(gamesContra, fromDb.setsContra);
    }
  } else if (!hasComputedMatches) {
    totalPartidos = Math.max(totalPartidos, fromDb.totalPartidos);
    victorias = Math.max(victorias, fromDb.victorias);
    derrotas = Math.max(derrotas, fromDb.derrotas);
    empates = Math.max(empates, fromDb.empates);
  }

  const pctVictorias =
    totalPartidos > 0
      ? Math.round((victorias / totalPartidos) * 100)
      : fromDb.pctVictorias;

  return {
    ...fromDb,
    totalPartidos,
    victorias,
    derrotas,
    empates,
    pctVictorias,
    setsFavor: gamesFavor,
    setsContra: gamesContra,
    ultimaActividad: computed.ultimaActividad ?? fromDb.ultimaActividad,
  };
}

/** @deprecated Use computePlayerMatchStats */
export const computeMatchStatsFromPartidos = computePlayerMatchStats;
