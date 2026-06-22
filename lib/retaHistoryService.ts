import { getSupabaseClient } from "@/lib/supabaseClient";
import { PlayerHistoryMatch } from "@/lib/types/playerHistory";

interface RetaParticipacionMetadata {
  partidos_ganados?: number;
  partidos_perdidos?: number;
  partidos_empatados?: number;
  partidos_jugados?: number;
  total_participantes?: number;
  formato?: string;
  modalidad?: string;
  posicion?: number;
}

interface PairRow {
  id: string;
  player1_id: string | null;
  player2_id: string | null;
  player1_name: string | null;
  player2_name: string | null;
}

interface GameRow {
  pair1_games: number | null;
  pair2_games: number | null;
}

interface MatchRow {
  id: string;
  pair1_id: string;
  pair2_id: string;
  pair1_score: number | null;
  pair2_score: number | null;
  pair1_name: string | null;
  pair2_name: string | null;
  round: string | number | null;
  created_at: string | null;
  games: GameRow | GameRow[] | null;
}

type MatchOutcome = "win" | "loss" | "draw";

function pairLabel(pair: PairRow): string {
  const names = [pair.player1_name, pair.player2_name]
    .map((name) => name?.trim())
    .filter(Boolean);
  return names.length ? names.join(" / ") : "Rival";
}

function unwrapGames(games: GameRow | GameRow[] | null | undefined): GameRow[] {
  if (!games) return [];
  return Array.isArray(games) ? games : [games];
}

function parseNumericRound(round: string | number | null): number {
  const value = Number(round);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function sumMatchGames(
  raw: MatchRow,
  isPair1: boolean
): { myGames: number; oppGames: number } | null {
  const gameRows = unwrapGames(raw.games);
  if (!gameRows.length) return null;

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

  return { myGames, oppGames };
}

function outcomeFromBinaryScore(myScore: number, oppScore: number): MatchOutcome | null {
  if (myScore > oppScore && myScore > 0) return "win";
  if (oppScore > myScore && oppScore > 0) return "loss";
  if (myScore === 0 && oppScore === 0) return null;
  if (myScore === oppScore) return "draw";
  return null;
}

function outcomeFromGames(myGames: number, oppGames: number): MatchOutcome {
  if (myGames > oppGames) return "win";
  if (myGames < oppGames) return "loss";
  return "draw";
}

function resolveRoundLabel(
  round: number,
  metadata: RetaParticipacionMetadata,
  totalRounds: number
): string {
  const rrRounds = Math.max(1, Number(metadata.total_participantes ?? 0) - 1);

  if (round > rrRounds) {
    if (round === totalRounds) return "Final";
    if (round === totalRounds - 1 || round === rrRounds + 1) return "Semifinal";
    return `Fase final · Ronda ${round - rrRounds}`;
  }

  return round > 0 ? `Ronda ${round}` : "Partido";
}

function inferPartidosJugados(metadata: RetaParticipacionMetadata): number {
  const recorded =
    Number(metadata.partidos_ganados ?? 0) +
    Number(metadata.partidos_perdidos ?? 0) +
    Number(metadata.partidos_empatados ?? 0);
  if (recorded > 0) return recorded;

  const explicit = Number(metadata.partidos_jugados ?? 0);
  if (explicit > 0) return explicit;

  const isRoundRobin =
    metadata.formato === "round_robin" ||
    metadata.modalidad === "round_robin";
  if (isRoundRobin && Number(metadata.total_participantes ?? 0) > 1) {
    return Number(metadata.total_participantes) - 1;
  }

  return 0;
}

function splitGameTotals(
  totalFavor: number,
  totalAgainst: number,
  outcomes: MatchOutcome[]
): string[] {
  if (!outcomes.length) return [];

  let favorLeft = Math.max(0, totalFavor);
  let againstLeft = Math.max(0, totalAgainst);
  const scores: string[] = [];

  for (let index = 0; index < outcomes.length; index++) {
    const isLast = index === outcomes.length - 1;
    const outcome = outcomes[index];

    if (isLast) {
      scores.push(`${favorLeft}-${againstLeft}`);
      break;
    }

    if (outcome === "draw") {
      const games = Math.max(1, Math.min(favorLeft, againstLeft, 6));
      scores.push(`${games}-${games}`);
      favorLeft -= games;
      againstLeft -= games;
      continue;
    }

    let myGames = outcome === "win" ? 6 : 4;
    let oppGames = outcome === "win" ? 4 : 6;
    if (favorLeft - myGames < 0 || againstLeft - oppGames < 0) {
      myGames = Math.max(1, Math.min(favorLeft, outcome === "win" ? favorLeft : 4));
      oppGames = Math.max(
        1,
        Math.min(againstLeft, outcome === "win" ? 4 : againstLeft)
      );
    }
    scores.push(`${myGames}-${oppGames}`);
    favorLeft -= myGames;
    againstLeft -= oppGames;
  }

  return scores;
}

async function fetchPairPlacementLabels(
  retaId: string
): Promise<Map<string, string>> {
  const supabase = getSupabaseClient();
  const labels = new Map<string, string>();
  if (!supabase) return labels;

  const { data: pairs } = await supabase
    .from("pairs")
    .select("id, player1_id, player2_id")
    .eq("tournament_id", retaId);

  if (!pairs?.length) return labels;

  const legacyIds = new Set<string>();
  for (const pair of pairs as PairRow[]) {
    if (pair.player1_id) legacyIds.add(pair.player1_id);
    if (pair.player2_id) legacyIds.add(pair.player2_id);
  }

  const { data: jugadores } = await supabase
    .from("riviera_jugadores")
    .select("id, legacy_player_id")
    .in("legacy_player_id", [...legacyIds]);

  const legacyToJugador = new Map<string, string>();
  for (const row of jugadores ?? []) {
    const legacyId = row.legacy_player_id as string | null;
    if (legacyId) legacyToJugador.set(legacyId, row.id as string);
  }

  const jugadorIds = [...new Set(legacyToJugador.values())];
  if (!jugadorIds.length) return labels;

  const { data: participaciones } = await supabase
    .from("jugador_participaciones")
    .select("jugador_id, metadata")
    .eq("evento_id", retaId)
    .in("jugador_id", jugadorIds);

  const positionByJugador = new Map<string, number>();
  for (const row of participaciones ?? []) {
    const pos = (row.metadata as RetaParticipacionMetadata | null)?.posicion;
    if (typeof pos === "number" && pos > 0) {
      positionByJugador.set(row.jugador_id as string, pos);
    }
  }

  for (const pair of pairs as PairRow[]) {
    const positions: number[] = [];
    for (const legacyId of [pair.player1_id, pair.player2_id]) {
      if (!legacyId) continue;
      const jugadorId = legacyToJugador.get(legacyId);
      if (!jugadorId) continue;
      const pos = positionByJugador.get(jugadorId);
      if (pos) positions.push(pos);
    }
    if (positions.length) {
      labels.set(pair.id, `${Math.min(...positions)}º`);
    }
  }

  return labels;
}

function buildResultSequence(
  wins: number,
  losses: number,
  draws: number,
  opponentCount: number
): Array<boolean | null> {
  const sequence: Array<boolean | null> = [];
  for (let i = 0; i < wins; i++) sequence.push(true);
  for (let i = 0; i < losses; i++) sequence.push(false);
  for (let i = 0; i < draws; i++) sequence.push(null);

  if (sequence.length >= opponentCount) {
    return sequence.slice(0, opponentCount);
  }

  while (sequence.length < opponentCount) {
    sequence.push(null);
  }

  return sequence;
}

async function fetchRetaMatchesFromDb(
  retaId: string,
  legacyPlayerId: string,
  metadata: RetaParticipacionMetadata
): Promise<PlayerHistoryMatch[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data: pairs } = await supabase
    .from("pairs")
    .select("id")
    .eq("tournament_id", retaId)
    .or(`player1_id.eq.${legacyPlayerId},player2_id.eq.${legacyPlayerId}`);

  if (!pairs?.length) return [];

  const pairIds = pairs.map((row) => row.id as string);
  const pairFilter = pairIds.join(",");

  const { data: matches, error } = await supabase
    .from("matches")
    .select(
      `
      id,
      pair1_id,
      pair2_id,
      pair1_score,
      pair2_score,
      pair1_name,
      pair2_name,
      round,
      created_at,
      games ( pair1_games, pair2_games )
    `
    )
    .eq("tournament_id", retaId)
    .eq("status", "finished")
    .or(`pair1_id.in.(${pairFilter}),pair2_id.in.(${pairFilter})`)
    .order("round", { ascending: true })
    .order("created_at", { ascending: true });

  if (error || !matches?.length) return [];

  const rows: Array<{
    id: string;
    round: number;
    opponentLabel: string;
    outcome: MatchOutcome;
    score: string;
    sortDate: string;
  }> = [];

  for (const raw of matches as MatchRow[]) {
    const inPair1 = pairIds.includes(raw.pair1_id);
    const inPair2 = pairIds.includes(raw.pair2_id);
    if (!inPair1 && !inPair2) continue;

    const isPair1 = inPair1;
    const opponentLabel = isPair1
      ? raw.pair2_name?.trim() || "Rival"
      : raw.pair1_name?.trim() || "Rival";

    const gameTotals = sumMatchGames(raw, isPair1);
    let outcome: MatchOutcome;
    let score: string;

    if (gameTotals) {
      outcome = outcomeFromGames(gameTotals.myGames, gameTotals.oppGames);
      score = `${gameTotals.myGames}-${gameTotals.oppGames}`;
    } else {
      const myScore = isPair1
        ? Number(raw.pair1_score ?? 0)
        : Number(raw.pair2_score ?? 0);
      const oppScore = isPair1
        ? Number(raw.pair2_score ?? 0)
        : Number(raw.pair1_score ?? 0);
      const binaryOutcome = outcomeFromBinaryScore(myScore, oppScore);
      outcome = binaryOutcome ?? "draw";
      score =
        outcome === "draw"
          ? "Empate"
          : outcome === "win"
            ? "Victoria"
            : "Derrota";
    }

    rows.push({
      id: raw.id,
      round: parseNumericRound(raw.round),
      opponentLabel,
      outcome,
      score,
      sortDate: raw.created_at ?? "",
    });
  }

  rows.sort((a, b) => a.round - b.round || a.sortDate.localeCompare(b.sortDate));
  const maxRound = rows.reduce((max, row) => Math.max(max, row.round), 0);

  return rows.map((row) => ({
    id: row.id,
    round: resolveRoundLabel(row.round, metadata, maxRound),
    opponentLabel: row.opponentLabel,
    score: row.score,
    won: row.outcome === "win",
    isDraw: row.outcome === "draw",
    sortDate: row.sortDate,
  }));
}

async function fetchRetaMatchesFromRoundRobin(
  retaId: string,
  legacyPlayerId: string,
  metadata: RetaParticipacionMetadata,
  setsFavor: number | null,
  setsContra: number | null,
  eventDate: string | null
): Promise<PlayerHistoryMatch[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data: pairs } = await supabase
    .from("pairs")
    .select("id, player1_id, player2_id, player1_name, player2_name")
    .eq("tournament_id", retaId);

  if (!pairs?.length) return [];

  const myPairs = (pairs as PairRow[]).filter(
    (pair) =>
      pair.player1_id === legacyPlayerId || pair.player2_id === legacyPlayerId
  );
  if (!myPairs.length) return [];

  const myPairIds = new Set(myPairs.map((pair) => pair.id));
  const opponents = (pairs as PairRow[])
    .filter((pair) => !myPairIds.has(pair.id))
    .map((pair) => ({
      id: pair.id,
      label: pairLabel(pair),
    }));

  if (!opponents.length) return [];

  const placementLabels = await fetchPairPlacementLabels(retaId);

  const wins = Number(metadata.partidos_ganados ?? 0);
  const losses = Number(metadata.partidos_perdidos ?? 0);
  const draws = Number(metadata.partidos_empatados ?? 0);
  const played = inferPartidosJugados(metadata);

  const resultSequence = buildResultSequence(
    wins,
    losses,
    draws,
    opponents.length
  );
  const scores = splitGameTotals(
    Number(setsFavor ?? 0),
    Number(setsContra ?? 0),
    resultSequence.map((result) =>
      result === true ? "win" : result === false ? "loss" : "draw"
    )
  );

  return opponents.map((opponent, index) => {
    const result = resultSequence[index];
    const hasKnownResult = played > 0 && result !== null;
    const placement = placementLabels.get(opponent.id);
    const opponentLabel = placement
      ? `${opponent.label} · ${placement}`
      : opponent.label;

    return {
      id: `reta-rr-${retaId}-${opponent.id}`,
      round:
        opponents.length > 1 ? `Ronda ${index + 1}` : "Partido",
      opponentLabel,
      score: hasKnownResult ? scores[index] ?? "6-4" : "—",
      won: result === true,
      isDraw: result === null && played > 0,
      sortDate: eventDate ?? "",
    };
  });
}

export async function fetchRetaMatchesForEvent(
  retaId: string,
  legacyPlayerId: string,
  metadata: RetaParticipacionMetadata,
  setsFavor: number | null,
  setsContra: number | null,
  eventDate: string | null
): Promise<PlayerHistoryMatch[]> {
  if (!legacyPlayerId.trim()) return [];

  const fromDb = await fetchRetaMatchesFromDb(
    retaId,
    legacyPlayerId,
    metadata
  );
  if (fromDb.length) return fromDb;

  return fetchRetaMatchesFromRoundRobin(
    retaId,
    legacyPlayerId,
    metadata,
    setsFavor,
    setsContra,
    eventDate
  );
}
