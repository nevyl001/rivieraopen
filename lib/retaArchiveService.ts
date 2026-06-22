import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  extractPartidosDetalle,
  partidosDetalleToPlayerHistory,
} from "@/lib/partidosDetalleService";
import {
  RetaPartidoArchivado,
  RetaPartidoResultado,
  RetaParticipacionMetadataWithArchive,
} from "@/lib/types/retaArchive";
import { PlayerHistoryMatch } from "@/lib/types/playerHistory";

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

function outcomeFromGames(
  myGames: number,
  oppGames: number
): RetaPartidoResultado {
  if (myGames > oppGames) return "win";
  if (myGames < oppGames) return "loss";
  return "draw";
}

export function parseArchivedMatchesFromMetadata(
  metadata: RetaParticipacionMetadataWithArchive | null | undefined,
  eventDate: string | null
): PlayerHistoryMatch[] {
  return partidosDetalleToPlayerHistory(metadata, eventDate);
}

/** Construye el snapshot desde matches/games (para reta_cierre o backfill). */
export async function buildArchivedMatchesForPlayer(
  retaId: string,
  legacyPlayerId: string,
  supabase = getSupabaseClient()
): Promise<RetaPartidoArchivado[]> {
  if (!supabase || !legacyPlayerId.trim()) return [];

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

  const archived: RetaPartidoArchivado[] = [];

  for (const raw of matches as MatchRow[]) {
    const inPair1 = pairIds.includes(raw.pair1_id);
    const inPair2 = pairIds.includes(raw.pair2_id);
    if (!inPair1 && !inPair2) continue;

    const isPair1 = inPair1;
    const rival = isPair1
      ? raw.pair2_name?.trim() || "Rival"
      : raw.pair1_name?.trim() || "Rival";

    const gameTotals = sumMatchGames(raw, isPair1);
    let gamesFavor: number;
    let gamesContra: number;
    let resultado: RetaPartidoResultado;

    if (gameTotals) {
      gamesFavor = gameTotals.myGames;
      gamesContra = gameTotals.oppGames;
      resultado = outcomeFromGames(gamesFavor, gamesContra);
    } else {
      gamesFavor = isPair1
        ? Number(raw.pair1_score ?? 0)
        : Number(raw.pair2_score ?? 0);
      gamesContra = isPair1
        ? Number(raw.pair2_score ?? 0)
        : Number(raw.pair1_score ?? 0);
      if (gamesFavor > gamesContra) resultado = "win";
      else if (gamesContra > gamesFavor) resultado = "loss";
      else resultado = "draw";
    }

    archived.push({
      id: raw.id,
      ronda: parseNumericRound(raw.round),
      rival,
      games_favor: gamesFavor,
      games_contra: gamesContra,
      resultado,
      fecha: raw.created_at ?? undefined,
    });
  }

  return archived.sort((a, b) => a.ronda - b.ronda);
}

export interface ArchiveRetaResultsSummary {
  retaId: string;
  updated: number;
  skipped: number;
  errors: string[];
}

/**
 * Copia partidos de matches/games a metadata.partidos_detalle en cada
 * jugador_participaciones de la reta. Debe llamarse al cerrar la reta,
 * antes de borrar filas en matches.
 */
export async function archiveRetaResults(
  retaId: string,
  options: { force?: boolean } = {}
): Promise<ArchiveRetaResultsSummary> {
  const { getSupabaseAdminClient } = await import("@/lib/supabaseAdminClient");
  const admin = getSupabaseAdminClient();
  const summary: ArchiveRetaResultsSummary = {
    retaId,
    updated: 0,
    skipped: 0,
    errors: [],
  };

  if (!admin) {
    summary.errors.push("SUPABASE_SERVICE_ROLE_KEY no configurada");
    return summary;
  }

  const { data: participaciones, error: partError } = await admin
    .from("jugador_participaciones")
    .select("id, jugador_id, metadata")
    .eq("tipo_evento", "reta")
    .eq("evento_id", retaId);

  if (partError) {
    summary.errors.push(partError.message);
    return summary;
  }

  if (!participaciones?.length) {
    summary.errors.push("Sin participaciones para esta reta");
    return summary;
  }

  const jugadorIds = [
    ...new Set(participaciones.map((row) => row.jugador_id as string)),
  ];

  const { data: jugadores, error: jugError } = await admin
    .from("riviera_jugadores")
    .select("id, legacy_player_id")
    .in("id", jugadorIds);

  if (jugError) {
    summary.errors.push(jugError.message);
    return summary;
  }

  const legacyByJugador = new Map<string, string>();
  for (const row of jugadores ?? []) {
    const legacy = row.legacy_player_id as string | null;
    if (legacy?.trim()) {
      legacyByJugador.set(row.id as string, legacy.trim());
    }
  }

  for (const participacion of participaciones) {
    const participacionId = participacion.id as string;
    const jugadorId = participacion.jugador_id as string;
    const metadata = (participacion.metadata ?? {}) as Record<string, unknown>;

    const existing = extractPartidosDetalle(
      metadata as RetaParticipacionMetadataWithArchive
    );
    if (existing.length && !options.force) {
      summary.skipped += 1;
      continue;
    }

    const legacyPlayerId = legacyByJugador.get(jugadorId);
    if (!legacyPlayerId) {
      summary.errors.push(`Participación ${participacionId}: sin legacy_player_id`);
      summary.skipped += 1;
      continue;
    }

    const partidosDetalle = await buildArchivedMatchesForPlayer(
      retaId,
      legacyPlayerId,
      admin
    );

    if (!partidosDetalle.length) {
      summary.skipped += 1;
      continue;
    }

    const nextMetadata = {
      ...metadata,
      partidos_detalle: partidosDetalle,
      partidos_archivados_en: new Date().toISOString(),
    };

    const { error: updateError } = await admin
      .from("jugador_participaciones")
      .update({ metadata: nextMetadata })
      .eq("id", participacionId);

    if (updateError) {
      summary.errors.push(`Participación ${participacionId}: ${updateError.message}`);
      summary.skipped += 1;
      continue;
    }

    summary.updated += 1;
  }

  return summary;
}
