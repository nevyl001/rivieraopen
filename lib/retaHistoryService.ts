import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  canUsePartidosDetalle,
  partidosDetalleToPlayerHistory,
} from "@/lib/partidosDetalleService";
import {
  labelRetaRondasForPartidos,
  RetaRoundLabelMetadata,
} from "@/lib/retaRoundLabel";
import { RetaParticipacionMetadataWithArchive } from "@/lib/types/retaArchive";
import { PlayerHistoryMatch } from "@/lib/types/playerHistory";

interface RetaParticipacionMetadata extends RetaParticipacionMetadataWithArchive {
  partidos_ganados?: number;
  partidos_perdidos?: number;
  partidos_empatados?: number;
  posicion?: number;
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

function formatMatchGameScores(
  gameRows: GameRow[],
  isPair1: boolean
): string {
  return gameRows
    .map((game) => {
      const my = isPair1
        ? Number(game.pair1_games ?? 0)
        : Number(game.pair2_games ?? 0);
      const opp = isPair1
        ? Number(game.pair2_games ?? 0)
        : Number(game.pair1_games ?? 0);
      return `${my}-${opp}`;
    })
    .join(", ");
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
    ronda: number;
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
      const gameRows = unwrapGames(raw.games);
      score =
        gameRows.length > 1
          ? formatMatchGameScores(gameRows, isPair1)
          : `${gameTotals.myGames}-${gameTotals.oppGames}`;
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
      ronda: parseNumericRound(raw.round),
      opponentLabel,
      outcome,
      score,
      sortDate: raw.created_at ?? "",
    });
  }

  rows.sort((a, b) => a.ronda - b.ronda || a.sortDate.localeCompare(b.sortDate));

  const labels = labelRetaRondasForPartidos(
    rows.map((row) => ({ ronda: row.ronda, fecha: row.sortDate })),
    metadata as RetaRoundLabelMetadata
  );

  return rows.map((row, index) => ({
    id: row.id,
    round: labels[index],
    opponentLabel: row.opponentLabel,
    score: row.score,
    won: row.outcome === "win",
    isDraw: row.outcome === "draw",
    sortDate: row.sortDate,
  }));
}

export async function fetchRetaMatchesForEvent(
  retaId: string,
  legacyPlayerId: string,
  metadata: RetaParticipacionMetadata,
  _setsFavor: number | null,
  _setsContra: number | null,
  eventDate: string | null
): Promise<PlayerHistoryMatch[]> {
  if (!legacyPlayerId.trim()) return [];

  if (canUsePartidosDetalle(metadata)) {
    return partidosDetalleToPlayerHistory(metadata, eventDate);
  }

  const fromDb = await fetchRetaMatchesFromDb(retaId, legacyPlayerId, metadata);
  if (fromDb.length) return fromDb;

  if (metadata.subtipo === "reta_cierre") {
    return partidosDetalleToPlayerHistory(metadata, eventDate);
  }

  return [];
}
