import { getSupabaseClient } from "@/lib/supabaseClient";
import { getCompetitionRankAtIndex } from "@/lib/rankingUtils";
import { PlayerRival } from "@/lib/types/playerHistory";

const DEFAULT_PHOTO = "/img/players/players-1.png";

const RANKING_ORGANIZADOR_ID =
  process.env.NEXT_PUBLIC_RANKING_ORGANIZADOR_ID?.trim() ||
  "2770b522-9064-4c7b-a729-4a0ea7e3f6e8";

interface ParejaEmbed {
  player1_id: string | null;
  player2_id: string | null;
}

interface JugadorRow {
  id: string;
  nombre: string | null;
  foto_url: string | null;
  legacy_player_id?: string | null;
  genero: string | null;
  jugador_stats: { puntos_totales: number | null } | { puntos_totales: number | null }[] | null;
}

interface H2HRecord {
  rivalJugadorId: string;
  wins: number;
  losses: number;
  lastMatchDate: string | null;
}

function unwrapPareja(
  pareja: ParejaEmbed | ParejaEmbed[] | null | undefined
): ParejaEmbed | null {
  if (!pareja) return null;
  return Array.isArray(pareja) ? (pareja[0] ?? null) : pareja;
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

function matchesGenderFilter(
  genero: string | null,
  filterGenero: string | null
): boolean {
  const isFemale = isFemenilGenero(genero);
  const wantsFemale = isFemenilGenero(filterGenero);
  return wantsFemale ? isFemale : !isFemale;
}

function extractPoints(
  stats: JugadorRow["jugador_stats"]
): number {
  if (!stats) return 0;
  if (Array.isArray(stats)) return Number(stats[0]?.puntos_totales ?? 0);
  return Number(stats.puntos_totales ?? 0);
}

function updateH2H(
  map: Map<string, H2HRecord>,
  rivalId: string,
  won: boolean,
  matchDate: string | null
) {
  const current = map.get(rivalId) ?? {
    rivalJugadorId: rivalId,
    wins: 0,
    losses: 0,
    lastMatchDate: null,
  };

  if (won) current.wins += 1;
  else current.losses += 1;

  if (matchDate && (!current.lastMatchDate || matchDate > current.lastMatchDate)) {
    current.lastMatchDate = matchDate;
  }

  map.set(rivalId, current);
}

async function buildLegacyToJugadorMap(): Promise<Map<string, string>> {
  const supabase = getSupabaseClient();
  if (!supabase) return new Map();

  const { data } = await supabase
    .from("riviera_jugadores")
    .select("id, legacy_player_id")
    .eq("organizador_id", RANKING_ORGANIZADOR_ID)
    .eq("visible_publico", true)
    .not("legacy_player_id", "is", null);

  const map = new Map<string, string>();
  for (const row of data ?? []) {
    const legacyId = row.legacy_player_id as string | null;
    if (legacyId) map.set(legacyId, row.id as string);
  }
  return map;
}

async function computeHeadToHead(
  jugadorId: string,
  legacyPlayerId: string | null | undefined,
  organizadorId: string
): Promise<Map<string, H2HRecord>> {
  const h2h = new Map<string, H2HRecord>();
  const supabase = getSupabaseClient();
  if (!supabase || !legacyPlayerId?.trim()) return h2h;

  const legacyToJugador = await buildLegacyToJugadorMap();

  const rivalIdsFromPareja = (
    pareja: ParejaEmbed | null,
    won: boolean,
    matchDate: string | null
  ) => {
    if (!pareja) return;
    for (const legacyId of [pareja.player1_id, pareja.player2_id]) {
      if (!legacyId || legacyId === legacyPlayerId) continue;
      const rivalJugadorId = legacyToJugador.get(legacyId);
      if (!rivalJugadorId || rivalJugadorId === jugadorId) continue;
      updateH2H(h2h, rivalJugadorId, won, matchDate);
    }
  };

  const { data: torneos } = await supabase
    .from("torneo_express")
    .select("id")
    .eq("organizador_id", organizadorId);

  if (torneos?.length) {
    const torneoIds = torneos.map((row) => row.id as string);
    const { data: grupos } = await supabase
      .from("torneo_express_grupos")
      .select("id")
      .in("torneo_id", torneoIds);

    if (grupos?.length) {
      const grupoIds = grupos.map((row) => row.id as string);
      const { data: partidos } = await supabase
        .from("torneo_express_partidos")
        .select(
          `
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

      for (const raw of partidos ?? []) {
        const local = unwrapPareja(raw.pareja_local);
        const visit = unwrapPareja(raw.pareja_visitante);
        const inLocal =
          local?.player1_id === legacyPlayerId ||
          local?.player2_id === legacyPlayerId;
        const inVisit =
          visit?.player1_id === legacyPlayerId ||
          visit?.player2_id === legacyPlayerId;
        if (!inLocal && !inVisit) continue;

        const myParejaId = inLocal
          ? raw.pareja_local_id
          : raw.pareja_visitante_id;
        const oppPareja = inLocal ? visit : local;
        const won = Boolean(raw.ganador_id && raw.ganador_id === myParejaId);
        const matchDate = (raw.created_at as string | null)?.slice(0, 10) ?? null;
        rivalIdsFromPareja(oppPareja, won, matchDate);
      }
    }
  }

  const { data: pairs } = await supabase
    .from("pairs")
    .select("id")
    .or(`player1_id.eq.${legacyPlayerId},player2_id.eq.${legacyPlayerId}`);

  if (pairs?.length) {
    const pairIds = pairs.map((row) => row.id as string);
    const pairFilter = pairIds.join(",");

    const { data: orgTournaments } = await supabase
      .from("tournaments")
      .select("id")
      .eq("user_id", organizadorId);

    if (orgTournaments?.length) {
      const tournamentIds = orgTournaments.map((row) => row.id as string);
      const { data: matches } = await supabase
        .from("matches")
        .select("id, pair1_id, pair2_id, pair1_score, pair2_score, created_at")
        .in("tournament_id", tournamentIds)
        .eq("status", "finished")
        .or(`pair1_id.in.(${pairFilter}),pair2_id.in.(${pairFilter})`);

      const seenMatchIds = new Set<string>();
      const opponentPairIds = new Set<string>();

      for (const raw of matches ?? []) {
        if (seenMatchIds.has(raw.id as string)) continue;
        seenMatchIds.add(raw.id as string);

        const inPair1 = pairIds.includes(raw.pair1_id as string);
        const inPair2 = pairIds.includes(raw.pair2_id as string);
        if (!inPair1 && !inPair2) continue;

        const oppPairId = inPair1
          ? (raw.pair2_id as string)
          : (raw.pair1_id as string);
        opponentPairIds.add(oppPairId);
      }

      const pairIdToLegacy = new Map<string, string[]>();
      if (opponentPairIds.size) {
        const { data: oppPairs } = await supabase
          .from("pairs")
          .select("id, player1_id, player2_id")
          .in("id", [...opponentPairIds]);

        for (const pair of oppPairs ?? []) {
          const ids = [pair.player1_id, pair.player2_id].filter(
            (id): id is string => Boolean(id)
          );
          pairIdToLegacy.set(pair.id as string, ids);
        }
      }

      for (const raw of matches ?? []) {
        const inPair1 = pairIds.includes(raw.pair1_id as string);
        const inPair2 = pairIds.includes(raw.pair2_id as string);
        if (!inPair1 && !inPair2) continue;

        const isPair1 = inPair1;
        const myScore = isPair1
          ? Number(raw.pair1_score ?? 0)
          : Number(raw.pair2_score ?? 0);
        const oppScore = isPair1
          ? Number(raw.pair2_score ?? 0)
          : Number(raw.pair1_score ?? 0);
        if (myScore === oppScore) continue;

        const oppPairId = isPair1
          ? (raw.pair2_id as string)
          : (raw.pair1_id as string);
        const oppLegacyIds = pairIdToLegacy.get(oppPairId) ?? [];
        const won = myScore > oppScore;
        const matchDate = (raw.created_at as string | null)?.slice(0, 10) ?? null;

        for (const legacyId of oppLegacyIds) {
          if (legacyId === legacyPlayerId) continue;
          const rivalJugadorId = legacyToJugador.get(legacyId);
          if (!rivalJugadorId || rivalJugadorId === jugadorId) continue;
          updateH2H(h2h, rivalJugadorId, won, matchDate);
        }
      }
    }
  }

  return h2h;
}

async function getCategoryRankMap(
  categoria: string | null,
  genero: string | null
): Promise<Map<string, { rank: number; points: number }>> {
  const map = new Map<string, { rank: number; points: number }>();
  const supabase = getSupabaseClient();
  if (!supabase || !categoria) return map;

  const { data } = await supabase
    .from("riviera_jugadores")
    .select("id, genero, jugador_stats ( puntos_totales )")
    .eq("organizador_id", RANKING_ORGANIZADOR_ID)
    .eq("categoria", categoria)
    .eq("visible_publico", true);

  const ranked = ((data ?? []) as JugadorRow[])
    .filter((row) => matchesGenderFilter(row.genero, genero))
    .map((row) => ({
      id: row.id,
      points: extractPoints(row.jugador_stats),
    }))
    .sort((a, b) => b.points - a.points);

  ranked.forEach((entry, index) => {
    map.set(entry.id, {
      points: entry.points,
      rank: getCompetitionRankAtIndex(ranked, index, (e) => e.points),
    });
  });

  return map;
}

async function getSimilarRankRivals(
  jugadorId: string,
  categoria: string | null,
  genero: string | null,
  playerPoints: number,
  excludeIds: Set<string>,
  rankMap: Map<string, { rank: number; points: number }>
): Promise<PlayerRival[]> {
  const supabase = getSupabaseClient();
  if (!supabase || !categoria) return [];

  const { data } = await supabase
    .from("riviera_jugadores")
    .select("id, nombre, foto_url, genero, jugador_stats ( puntos_totales )")
    .eq("organizador_id", RANKING_ORGANIZADOR_ID)
    .eq("categoria", categoria)
    .eq("visible_publico", true);

  if (!data?.length) return [];

  const filtered = (data as JugadorRow[])
    .filter(
      (row) =>
        row.id !== jugadorId &&
        !excludeIds.has(row.id) &&
        matchesGenderFilter(row.genero, genero)
    )
    .map((row) => ({
      row,
      points: extractPoints(row.jugador_stats),
    }))
    .filter((entry) => Math.abs(entry.points - playerPoints) <= 100)
    .sort((a, b) => Math.abs(a.points - playerPoints) - Math.abs(b.points - playerPoints));

  const sorted = filtered
    .map((entry) => entry.row)
    .sort((a, b) => extractPoints(b.jugador_stats) - extractPoints(a.jugador_stats));

  return sorted.slice(0, 3).map((row) => {
    const rankInfo = rankMap.get(row.id);
    return {
      id: row.id,
      nombre: row.nombre?.trim() || "Jugador",
      foto: row.foto_url?.trim() || DEFAULT_PHOTO,
      points: rankInfo?.points ?? extractPoints(row.jugador_stats),
      rank: rankInfo?.rank ?? 0,
      wins: 0,
      losses: 0,
      hasFaced: false,
      lastMatchDate: null,
    };
  });
}

export async function getPlayerRivals(
  jugadorId: string,
  legacyPlayerId: string | null | undefined,
  categoria: string | null,
  genero: string | null,
  playerPoints: number,
  organizadorId: string = RANKING_ORGANIZADOR_ID
): Promise<PlayerRival[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const h2hMap = await computeHeadToHead(
    jugadorId,
    legacyPlayerId,
    organizadorId
  );

  const rankMap = await getCategoryRankMap(categoria, genero);
  const facedIds = [...h2hMap.keys()];
  const facedRivals: PlayerRival[] = [];

  if (facedIds.length) {
    const { data } = await supabase
      .from("riviera_jugadores")
      .select("id, nombre, foto_url, genero, categoria, jugador_stats ( puntos_totales )")
      .in("id", facedIds)
      .eq("visible_publico", true);

    const rows = ((data ?? []) as JugadorRow[]).filter((row) =>
      matchesGenderFilter(row.genero, genero)
    );

    for (const row of rows) {
      const record = h2hMap.get(row.id);
      if (!record) continue;
      const rankInfo = rankMap.get(row.id);

      facedRivals.push({
        id: row.id,
        nombre: row.nombre?.trim() || "Jugador",
        foto: row.foto_url?.trim() || DEFAULT_PHOTO,
        points: rankInfo?.points ?? extractPoints(row.jugador_stats),
        rank: rankInfo?.rank ?? 0,
        wins: record.wins,
        losses: record.losses,
        hasFaced: true,
        lastMatchDate: record.lastMatchDate,
      });
    }

    facedRivals.sort((a, b) => {
      const dateA = a.lastMatchDate ?? "";
      const dateB = b.lastMatchDate ?? "";
      return dateB.localeCompare(dateA);
    });
  }

  const result = facedRivals.slice(0, 5);
  const usedIds = new Set([jugadorId, ...result.map((r) => r.id)]);

  if (result.length < 5) {
    const similar = await getSimilarRankRivals(
      jugadorId,
      categoria,
      genero,
      playerPoints,
      usedIds,
      rankMap
    );

    for (const rival of similar) {
      if (result.length >= 5) break;
      if (usedIds.has(rival.id)) continue;
      result.push(rival);
      usedIds.add(rival.id);
    }
  }

  return result.slice(0, 5);
}
