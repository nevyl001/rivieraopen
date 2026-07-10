import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  extractPartidosDetalle,
  partidosDetalleToPlayerHistory,
} from "@/lib/partidosDetalleService";
import {
  RetaPartidoArchivado,
  RetaPartidoResultado,
  RetaParticipacionMetadataWithArchive,
  type ArchiveRetaResultsSummary,
  type RetaArchiveParticipacionFailure,
  type RetaArchiveStatus,
} from "@/lib/types/retaArchive";
import { PlayerHistoryMatch } from "@/lib/types/playerHistory";
import type { SupabaseClient } from "@supabase/supabase-js";

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

interface ParticipacionArchiveRow {
  id: string;
  jugador_id: string;
  metadata: Record<string, unknown> | null;
}

function emptyArchiveSummary(retaId: string): ArchiveRetaResultsSummary {
  return {
    retaId,
    total: 0,
    updated: 0,
    alreadyArchived: 0,
    failed: 0,
    archived: 0,
    complete: false,
    canDeleteMatches: false,
    errors: [],
    failures: [],
  };
}

export function buildRetaArchiveStatus(
  retaId: string,
  participaciones: ParticipacionArchiveRow[],
  jugadorNames: Map<string, string>
): RetaArchiveStatus {
  const failures: RetaArchiveParticipacionFailure[] = [];

  for (const participacion of participaciones) {
    const participacionId = participacion.id;
    const jugadorId = participacion.jugador_id;
    const jugadorNombre = jugadorNames.get(jugadorId);
    const metadata = (participacion.metadata ??
      {}) as RetaParticipacionMetadataWithArchive;
    const archivedMatches = extractPartidosDetalle(metadata);

    if (archivedMatches.length > 0) continue;

    failures.push({
      participacionId,
      jugadorId,
      jugadorNombre,
      reason: "no_pairs_or_matches",
      message: jugadorNombre
        ? `${jugadorNombre}: sin partidos_detalle archivado`
        : `Participación ${participacionId}: sin partidos_detalle archivado`,
    });
  }

  const total = participaciones.length;
  const archived = total - failures.length;

  return {
    retaId,
    total,
    archived,
    complete: total > 0 && failures.length === 0,
    canDeleteMatches: total > 0 && failures.length === 0,
    failures,
  };
}

/**
 * Lee el estado de archivado sin escribir. Usar antes de borrar matches.
 */
export async function getRetaArchiveStatus(
  retaId: string,
  supabase?: SupabaseClient | null
): Promise<RetaArchiveStatus> {
  const client =
    supabase ??
    (await import("@/lib/supabaseAdminClient")).getSupabaseAdminClient() ??
    getSupabaseClient();

  if (!client) {
    return {
      retaId,
      total: 0,
      archived: 0,
      complete: false,
      canDeleteMatches: false,
      failures: [],
    };
  }

  const { data: participaciones, error } = await client
    .from("jugador_participaciones")
    .select("id, jugador_id, metadata")
    .eq("tipo_evento", "reta")
    .eq("evento_id", retaId);

  if (error || !participaciones?.length) {
    return {
      retaId,
      total: 0,
      archived: 0,
      complete: false,
      canDeleteMatches: false,
      failures: [],
    };
  }

  const rows = participaciones as ParticipacionArchiveRow[];
  const jugadorIds = [...new Set(rows.map((row) => row.jugador_id))];
  const { data: jugadores } = await client
    .from("riviera_jugadores")
    .select("id, nombre")
    .in("id", jugadorIds);

  const jugadorNames = new Map<string, string>();
  for (const jugador of jugadores ?? []) {
    const nombre = (jugador.nombre as string | null)?.trim();
    if (nombre) jugadorNames.set(jugador.id as string, nombre);
  }

  return buildRetaArchiveStatus(retaId, rows, jugadorNames);
}

/**
 * Copia partidos de matches/games a metadata.partidos_detalle en cada
 * jugador_participaciones de la reta. Debe llamarse al cerrar la reta,
 * antes de eliminar filas en matches.
 *
 * Si canDeleteMatches es false, la reta puede cerrarse (puntos/ranking) pero
 * NO se deben borrar filas en matches hasta resolver failures.
 */
export async function archiveRetaResults(
  retaId: string,
  options: { force?: boolean } = {}
): Promise<ArchiveRetaResultsSummary> {
  const { getSupabaseAdminClient } = await import("@/lib/supabaseAdminClient");
  const admin = getSupabaseAdminClient();
  const summary = emptyArchiveSummary(retaId);

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

  summary.total = participaciones.length;

  const jugadorIds = [
    ...new Set(participaciones.map((row) => row.jugador_id as string)),
  ];

  const { data: jugadores, error: jugError } = await admin
    .from("riviera_jugadores")
    .select("id, legacy_player_id, nombre")
    .in("id", jugadorIds);

  if (jugError) {
    summary.errors.push(jugError.message);
    return summary;
  }

  const legacyByJugador = new Map<string, string>();
  const jugadorNames = new Map<string, string>();
  for (const row of jugadores ?? []) {
    const id = row.id as string;
    const legacy = row.legacy_player_id as string | null;
    if (legacy?.trim()) {
      legacyByJugador.set(id, legacy.trim());
    }
    const nombre = (row.nombre as string | null)?.trim();
    if (nombre) jugadorNames.set(id, nombre);
  }

  const runFailures: RetaArchiveParticipacionFailure[] = [];

  for (const participacion of participaciones) {
    const participacionId = participacion.id as string;
    const jugadorId = participacion.jugador_id as string;
    const jugadorNombre = jugadorNames.get(jugadorId);
    const metadata = (participacion.metadata ?? {}) as Record<string, unknown>;

    const existing = extractPartidosDetalle(
      metadata as RetaParticipacionMetadataWithArchive
    );
    if (existing.length && !options.force) {
      summary.alreadyArchived += 1;
      continue;
    }

    const legacyPlayerId = legacyByJugador.get(jugadorId);
    if (!legacyPlayerId) {
      const message = jugadorNombre
        ? `${jugadorNombre}: sin legacy_player_id en riviera_jugadores`
        : `Participación ${participacionId}: sin legacy_player_id`;
      summary.errors.push(message);
      runFailures.push({
        participacionId,
        jugadorId,
        jugadorNombre,
        reason: "missing_legacy_player_id",
        message,
      });
      summary.failed += 1;
      continue;
    }

    const partidosDetalle = await buildArchivedMatchesForPlayer(
      retaId,
      legacyPlayerId,
      admin
    );

    if (!partidosDetalle.length) {
      const message = jugadorNombre
        ? `${jugadorNombre}: sin pairs/matches finalizados para archivar`
        : `Participación ${participacionId}: sin pairs/matches finalizados para archivar`;
      summary.errors.push(message);
      runFailures.push({
        participacionId,
        jugadorId,
        jugadorNombre,
        reason: "no_pairs_or_matches",
        message,
      });
      summary.failed += 1;
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
      const message = jugadorNombre
        ? `${jugadorNombre}: error al guardar partidos_detalle (${updateError.message})`
        : `Participación ${participacionId}: ${updateError.message}`;
      summary.errors.push(message);
      runFailures.push({
        participacionId,
        jugadorId,
        jugadorNombre,
        reason: "update_failed",
        message,
      });
      summary.failed += 1;
      continue;
    }

    summary.updated += 1;
  }

  const finalStatus = await getRetaArchiveStatus(retaId, admin);

  return {
    ...summary,
    archived: finalStatus.archived,
    complete: finalStatus.complete,
    canDeleteMatches: finalStatus.canDeleteMatches,
    failures: finalStatus.failures.length ? finalStatus.failures : runFailures,
  };
}
