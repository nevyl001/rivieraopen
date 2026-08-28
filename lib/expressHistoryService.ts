import { getSupabaseClient } from "@/lib/supabaseClient";
import {
  fetchExpressEliminatoriaMatches,
  supplementExpressKnockoutMatches,
} from "@/lib/expressKnockoutService";
import { PlayerHistoryMatch } from "@/lib/types/playerHistory";

export interface ExpressParticipacionMetadata {
  partidos_ganados?: number;
  partidos_perdidos?: number;
  partidos_empatados?: number;
  posicion_final?: number;
  campeon_torneo?: boolean;
  subcampeon_torneo?: boolean;
  pareja_campeon_id?: string;
  pareja_subcampeon_id?: string;
  /** ID del jugador en la app del club anfitrión (puede diferir del club de registro). */
  canonical_legacy_player_id?: string;
  pair_id?: string;
  pareja_id?: string;
}

export interface FetchExpressMatchesOptions {
  /** Nombre del jugador oficial — resuelve el ID correcto en parejas de otro club. */
  playerName?: string | null;
  candidateLegacyIds?: Array<string | null | undefined>;
}

interface GrupoRow {
  id: string;
  torneo_id: string;
  nombre: string | null;
}

interface ParejaEmbed {
  player1_id: string | null;
  player2_id: string | null;
  player1_name: string | null;
  player2_name: string | null;
}

interface ExpressPartidoRow {
  id: string;
  grupo_id: string;
  puntos_local: number | null;
  puntos_visitante: number | null;
  ganador_id: string | null;
  pareja_local_id: string;
  pareja_visitante_id: string;
  created_at: string | null;
  ronda: number | null;
  pareja_local: ParejaEmbed | ParejaEmbed[] | null;
  pareja_visitante: ParejaEmbed | ParejaEmbed[] | null;
}

function unwrapPareja(
  pareja: ParejaEmbed | ParejaEmbed[] | null | undefined
): ParejaEmbed | null {
  if (!pareja) return null;
  return Array.isArray(pareja) ? (pareja[0] ?? null) : pareja;
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

function resolveRoundLabel(
  partido: ExpressPartidoRow,
  grupo?: GrupoRow | null
): string {
  const grupoLabel = grupo?.nombre?.trim();
  const ronda =
    typeof partido.ronda === "number" && partido.ronda > 0
      ? `Ronda ${partido.ronda}`
      : null;

  if (grupoLabel && ronda) return `${grupoLabel} · ${ronda}`;
  if (grupoLabel) return grupoLabel;
  if (ronda) return ronda;
  return "Partido";
}

function normalizePlayerName(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function uniqueIds(ids: Array<string | null | undefined>): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const id of ids) {
    const trimmed = id?.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out;
}

/** Pure helper — exported for tests. */
export function collectLegacyIdsFromExpressPairEmbeds(
  embeds: Array<ParejaEmbed | null>,
  playerName: string | null | undefined
): string[] {
  const normalized = normalizePlayerName(playerName);
  if (!normalized) return [];

  const found: string[] = [];
  for (const pareja of embeds) {
    if (!pareja) continue;
    if (normalizePlayerName(pareja.player1_name) === normalized && pareja.player1_id) {
      found.push(pareja.player1_id);
    }
    if (normalizePlayerName(pareja.player2_name) === normalized && pareja.player2_id) {
      found.push(pareja.player2_id);
    }
  }
  return uniqueIds(found);
}

async function buildLegacyNameMap(
  legacyIds: string[],
  organizadorId: string
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!legacyIds.length) return map;

  const supabase = getSupabaseClient();
  if (!supabase) return map;

  const { data } = await supabase
    .from("riviera_jugadores")
    .select("legacy_player_id, nombre")
    .in("legacy_player_id", legacyIds)
    .eq("organizador_id", organizadorId);

  for (const row of data ?? []) {
    const legacyId = row.legacy_player_id as string | null;
    if (legacyId) {
      map.set(legacyId, (row.nombre as string)?.trim() || "Rival");
    }
  }

  return map;
}

function opponentLabelFromPareja(
  pareja: ParejaEmbed | null,
  legacyPlayerId: string,
  nameMap: Map<string, string>
): string {
  if (!pareja) return "Rival";

  const rivals: string[] = [];
  if (pareja.player1_id && pareja.player1_id !== legacyPlayerId) {
    rivals.push(
      pareja.player1_name?.trim() ||
        nameMap.get(pareja.player1_id) ||
        "Jugador"
    );
  }
  if (pareja.player2_id && pareja.player2_id !== legacyPlayerId) {
    rivals.push(
      pareja.player2_name?.trim() ||
        nameMap.get(pareja.player2_id) ||
        "Jugador"
    );
  }

  return rivals.length ? rivals.join(" / ") : "Rival";
}

async function fetchExpressGroupMatchesForLegacyId(
  torneoId: string,
  legacyPlayerId: string,
  organizadorId: string
): Promise<PlayerHistoryMatch[]> {
  const supabase = getSupabaseClient();
  if (!supabase || !legacyPlayerId.trim()) return [];

  const { data: grupos, error: gruposError } = await supabase
    .from("torneo_express_grupos")
    .select("id, torneo_id, nombre")
    .eq("torneo_id", torneoId);

  if (gruposError) {
    console.error("fetchExpressGroupMatchesForLegacyId grupos:", gruposError.message);
  }

  if (!grupos?.length) return [];

  const grupoMap = new Map(
    (grupos as GrupoRow[]).map((grupo) => [grupo.id, grupo])
  );
  const grupoIds = grupos.map((grupo) => grupo.id as string);

  const { data: partidos, error } = await supabase
    .from("torneo_express_partidos")
    .select(
      `
      id,
      grupo_id,
      puntos_local,
      puntos_visitante,
      ganador_id,
      pareja_local_id,
      pareja_visitante_id,
      created_at,
      ronda,
      pareja_local:pareja_local_id ( player1_id, player2_id, player1_name, player2_name ),
      pareja_visitante:pareja_visitante_id ( player1_id, player2_id, player1_name, player2_name )
    `
    )
    .in("grupo_id", grupoIds)
    .eq("estado", "jugado")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("fetchExpressGroupMatchesForLegacyId partidos:", error.message);
    return [];
  }
  if (!partidos?.length) return [];

  const legacyIds = new Set<string>();
  for (const raw of partidos as ExpressPartidoRow[]) {
    for (const pareja of [
      unwrapPareja(raw.pareja_local),
      unwrapPareja(raw.pareja_visitante),
    ]) {
      if (pareja?.player1_id) legacyIds.add(pareja.player1_id);
      if (pareja?.player2_id) legacyIds.add(pareja.player2_id);
    }
  }

  const nameMap = await buildLegacyNameMap([...legacyIds], organizadorId);
  const matches: PlayerHistoryMatch[] = [];

  for (const raw of partidos as ExpressPartidoRow[]) {
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
    const oppPareja = isLocal
      ? unwrapPareja(raw.pareja_visitante)
      : unwrapPareja(raw.pareja_local);

    const won = Boolean(raw.ganador_id && raw.ganador_id === myParejaId);
    const grupo = grupoMap.get(raw.grupo_id);

    matches.push({
      id: raw.id,
      round: resolveRoundLabel(raw, grupo),
      opponentLabel: opponentLabelFromPareja(
        oppPareja,
        legacyPlayerId,
        nameMap
      ),
      score: `${myPts}-${oppPts}`,
      won,
      sortDate: raw.created_at ?? "",
    });
  }

  return matches;
}

/**
 * Cuando el jugador juega en un club distinto al de registro, su ID en `pairs`
 * puede no coincidir con riviera_jugadores.legacy_player_id. Resolvemos
 * candidatos desde metadata y, si hace falta, por nombre en las parejas del torneo.
 */
export async function resolveExpressLegacyPlayerIds(
  torneoId: string,
  metadata: ExpressParticipacionMetadata,
  options: FetchExpressMatchesOptions = {}
): Promise<string[]> {
  const candidates = uniqueIds([
    ...(options.candidateLegacyIds ?? []),
    metadata.canonical_legacy_player_id,
  ]);

  const supabase = getSupabaseClient();
  if (!supabase) return candidates;

  const pairId = metadata.pair_id?.trim() || metadata.pareja_id?.trim();
  if (pairId) {
    const { data: pair } = await supabase
      .from("pairs")
      .select("player1_id, player2_id")
      .eq("id", pairId)
      .maybeSingle();
    if (pair) {
      return uniqueIds([
        ...candidates,
        pair.player1_id as string | null,
        pair.player2_id as string | null,
      ]);
    }
  }

  const playerName = normalizePlayerName(options.playerName);
  if (!playerName) return candidates;

  const { data: grupos } = await supabase
    .from("torneo_express_grupos")
    .select("id")
    .eq("torneo_id", torneoId);

  const grupoIds = (grupos ?? []).map((row) => row.id as string);
  if (!grupoIds.length) return candidates;

  const { data: partidos } = await supabase
    .from("torneo_express_partidos")
    .select(
      `
      pareja_local:pareja_local_id ( player1_id, player2_id, player1_name, player2_name ),
      pareja_visitante:pareja_visitante_id ( player1_id, player2_id, player1_name, player2_name )
    `
    )
    .in("grupo_id", grupoIds);

  const embeds: Array<ParejaEmbed | null> = [];
  for (const raw of partidos ?? []) {
    embeds.push(unwrapPareja(raw.pareja_local as ParejaEmbed | ParejaEmbed[] | null));
    embeds.push(
      unwrapPareja(raw.pareja_visitante as ParejaEmbed | ParejaEmbed[] | null)
    );
  }

  return uniqueIds([
    ...candidates,
    ...collectLegacyIdsFromExpressPairEmbeds(embeds, options.playerName),
  ]);
}

async function fetchExpressMatchesForResolvedLegacyId(
  torneoId: string,
  legacyPlayerId: string,
  metadata: ExpressParticipacionMetadata,
  organizadorId: string,
  torneoCreatedAt: string | null,
  setsFavor: number | null,
  setsContra: number | null
): Promise<PlayerHistoryMatch[]> {
  const groupMatches = await fetchExpressGroupMatchesForLegacyId(
    torneoId,
    legacyPlayerId,
    organizadorId
  );
  const eliminatoriaMatches = await fetchExpressEliminatoriaMatches(
    torneoId,
    legacyPlayerId,
    metadata
  );

  if (eliminatoriaMatches !== null) {
    return [...groupMatches, ...eliminatoriaMatches];
  }

  return supplementExpressKnockoutMatches(
    torneoId,
    legacyPlayerId,
    groupMatches,
    {
      metadata,
      setsFavor,
      setsContra,
      torneoCreatedAt,
    }
  );
}

/**
 * Partidos de torneo express con resolución multiclub del legacy_player_id.
 */
export async function fetchExpressMatchesForEvent(
  torneoId: string,
  legacyPlayerId: string | null | undefined,
  metadata: ExpressParticipacionMetadata,
  organizadorId: string,
  options: FetchExpressMatchesOptions & {
    setsFavor?: number | null;
    setsContra?: number | null;
    torneoCreatedAt?: string | null;
  } = {}
): Promise<PlayerHistoryMatch[]> {
  const legacyCandidates = await resolveExpressLegacyPlayerIds(torneoId, metadata, {
    playerName: options.playerName,
    candidateLegacyIds: [
      legacyPlayerId,
      ...(options.candidateLegacyIds ?? []),
      metadata.canonical_legacy_player_id,
    ],
  });

  if (!legacyCandidates.length) return [];

  for (const candidateId of legacyCandidates) {
    const partidos = await fetchExpressMatchesForResolvedLegacyId(
      torneoId,
      candidateId,
      metadata,
      organizadorId,
      options.torneoCreatedAt ?? null,
      options.setsFavor ?? null,
      options.setsContra ?? null
    );
    if (partidos.length) return partidos;
  }

  return [];
}
