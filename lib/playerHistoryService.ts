import { getSupabaseClient } from "@/lib/supabaseClient";
import { dbCategoryToUi } from "@/lib/categoryUtils";
import { fetchRetaMatchesForEvent } from "@/lib/retaHistoryService";
import { partidosDetalleToPlayerHistory } from "@/lib/partidosDetalleService";
import {
  fetchDuelosScoreMap,
  formatDueloMarcador,
  getOpponentNamesFromDuelo,
  getAllDueloJugadorIds,
  getOpponentJugadorIdsFromDuelo,
  didPlayerWinDuelo,
  resolveDueloJugadorId,
  type Duelo2v2ScoreRow,
} from "@/lib/duelo2v2ScoreService";
import {
  fetchExpressEliminatoriaMatches,
  supplementExpressKnockoutMatches,
} from "@/lib/expressKnockoutService";
import {
  PlayerHistoryEvent,
  PlayerHistoryMatch,
} from "@/lib/types/playerHistory";
import type { OfficialHistorialEntry } from "@/lib/officialPlayerProfileService";
import { ParticipacionMetadataWithDetalle } from "@/lib/types/partidosDetalle";
import type { PlayerStatsSummary } from "@/lib/types";

const RANKING_ORGANIZADOR_ID =
  process.env.NEXT_PUBLIC_RANKING_ORGANIZADOR_ID?.trim() ||
  "2770b522-9064-4c7b-a729-4a0ea7e3f6e8";

interface ParticipacionMetadata {
  subtipo?: string;
  organizador_id?: string;
  evento_nombre?: string;
  torneo_nombre?: string;
  reta_nombre?: string;
  nombre?: string;
  categoria?: string;
  posicion_final?: number;
  posicion?: number;
  puntos_ganados?: number;
  puntos_evento?: number;
  partidos_ganados?: number;
  partidos_perdidos?: number;
  partidos_empatados?: number;
  partidos_jugados?: number;
  campeon_torneo?: boolean;
  subcampeon_torneo?: boolean;
  pareja_campeon_id?: string;
  pareja_subcampeon_id?: string;
  modalidad_label?: string;
  canonical_legacy_player_id?: string;
  pair_id?: string;
}

interface ParticipacionRow {
  id: string;
  tipo_evento: string;
  evento_id: string;
  evento_nombre?: string | null;
  fecha: string | null;
  sets_favor?: number | null;
  sets_contra?: number | null;
  metadata: ParticipacionMetadata | null;
}

interface TorneoExpressRow {
  id: string;
  nombre: string | null;
  created_at: string | null;
  categoria: string | null;
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

function isAjusteManual(metadata: ParticipacionMetadata | null): boolean {
  return metadata?.subtipo === "ajuste_manual";
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

function formatCategoryLabel(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const ui = dbCategoryToUi(value);
  return ui === "Open" ? "Open" : `${ui}ª Fuerza`;
}

function resolveEventName(
  row: ParticipacionRow,
  torneo?: TorneoExpressRow | null
): string {
  if (torneo?.nombre?.trim()) return torneo.nombre.trim();
  const meta = row.metadata ?? {};
  return (
    meta.reta_nombre?.trim() ||
    row.evento_nombre?.trim() ||
    meta.evento_nombre?.trim() ||
    meta.torneo_nombre?.trim() ||
    meta.nombre?.trim() ||
    meta.modalidad_label?.trim() ||
    row.tipo_evento.replace(/_/g, " ")
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

async function getOrgTorneoExpressIds(
  organizadorId: string
): Promise<Set<string>> {
  const supabase = getSupabaseClient();
  if (!supabase) return new Set();

  const { data } = await supabase
    .from("torneo_express")
    .select("id")
    .eq("organizador_id", organizadorId);

  return new Set((data ?? []).map((row) => row.id as string));
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

async function fetchExpressMatchesForTorneo(
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
    console.error("fetchExpressMatchesForTorneo grupos:", gruposError.message);
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
    console.error("fetchExpressMatchesForTorneo partidos:", error.message);
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

export async function getPlayerHistoryEvents(
  jugadorId: string,
  legacyPlayerId: string | null | undefined,
  organizadorId: string = RANKING_ORGANIZADOR_ID
): Promise<PlayerHistoryEvent[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const orgTorneoIds = await getOrgTorneoExpressIds(organizadorId);

  const { data, error } = await supabase
    .from("jugador_participaciones")
    .select(
      "id, tipo_evento, evento_id, evento_nombre, fecha, pareja_con, sets_favor, sets_contra, metadata"
    )
    .eq("jugador_id", jugadorId)
    .order("fecha", { ascending: false });

  if (error) {
    console.error("getPlayerHistoryEvents:", error.message);
  }

  const rows = ((data ?? []) as ParticipacionRow[]).filter((row) => {
    if (isAjusteManual(row.metadata)) return false;
    const meta = row.metadata;
    if (meta?.organizador_id && meta.organizador_id !== organizadorId) {
      return false;
    }
    if (row.tipo_evento === "torneo_express") {
      return orgTorneoIds.has(row.evento_id);
    }
    return true;
  });

  if (rows.length > 0) {
    return buildEventsFromParticipaciones(
      rows,
      jugadorId,
      legacyPlayerId,
      organizadorId
    );
  }

  if (legacyPlayerId?.trim()) {
    return buildEventsFromExpressPartidos(legacyPlayerId, organizadorId);
  }

  return [];
}

async function buildEventsFromParticipaciones(
  rows: ParticipacionRow[],
  jugadorId: string,
  legacyPlayerId: string | null | undefined,
  organizadorId: string
): Promise<PlayerHistoryEvent[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const dueloIds = [
    ...new Set(
      rows
        .filter((row) => row.tipo_evento === "duelo_2v2")
        .map((row) => row.evento_id)
    ),
  ];
  const dueloScoreMap = await fetchDuelosScoreMap(dueloIds);

  const expressIds = [
    ...new Set(
      rows
        .filter((row) => row.tipo_evento === "torneo_express")
        .map((row) => row.evento_id)
    ),
  ];

  const torneoMap = new Map<string, TorneoExpressRow>();
  if (expressIds.length) {
    const { data: torneos } = await supabase
      .from("torneo_express")
      .select("id, nombre, created_at, categoria")
      .in("id", expressIds);

    for (const torneo of (torneos ?? []) as TorneoExpressRow[]) {
      torneoMap.set(torneo.id, torneo);
    }
  }

  const events: PlayerHistoryEvent[] = [];

  for (const row of rows) {
    const meta = row.metadata ?? {};
    const torneo =
      row.tipo_evento === "torneo_express"
        ? torneoMap.get(row.evento_id)
        : null;

    let partidos: PlayerHistoryMatch[] = [];
    if (row.tipo_evento === "torneo_express" && legacyPlayerId) {
      const groupMatches = await fetchExpressMatchesForTorneo(
        row.evento_id,
        legacyPlayerId,
        organizadorId
      );
      const eliminatoriaMatches = await fetchExpressEliminatoriaMatches(
        row.evento_id,
        legacyPlayerId,
        meta
      );
      partidos =
        eliminatoriaMatches !== null
          ? [...groupMatches, ...eliminatoriaMatches]
          : await supplementExpressKnockoutMatches(
              row.evento_id,
              legacyPlayerId,
              groupMatches,
              {
                metadata: meta,
                setsFavor: row.sets_favor ?? null,
                setsContra: row.sets_contra ?? null,
                torneoCreatedAt: torneo?.created_at ?? null,
              }
            );
    } else if (row.tipo_evento === "reta" && legacyPlayerId) {
      partidos = await fetchRetaMatchesForEvent(
        row.evento_id,
        legacyPlayerId,
        meta,
        row.sets_favor ?? null,
        row.sets_contra ?? null,
        row.fecha
      );
    } else if (
      row.tipo_evento === "americano" ||
      row.tipo_evento === "liga" ||
      row.tipo_evento === "duelo_2v2" ||
      row.tipo_evento === "duelo"
    ) {
      partidos = partidosDetalleToPlayerHistory(meta, row.fecha);
      if (row.tipo_evento === "duelo_2v2") {
        const duelo = dueloScoreMap.get(row.evento_id);
        const marcador = duelo ? formatDueloMarcador(duelo, jugadorId) : null;
        if (marcador) {
          partidos = partidos.map((partido) => ({
            ...partido,
            score: marcador,
          }));
        }
      }
    }

    const posicionFinal =
      row.tipo_evento === "reta" || row.tipo_evento === "duelo_2v2"
        ? typeof meta.posicion === "number"
          ? meta.posicion
          : null
        : meta.posicion_final ??
          (typeof meta.posicion === "number" ? meta.posicion : null);
    const puntosGanados =
      Number(meta.puntos_evento ?? meta.puntos_ganados ?? 0) || 0;

    const wins = Number(meta.partidos_ganados ?? 0);
    const losses = Number(meta.partidos_perdidos ?? 0);
    const draws = Number(meta.partidos_empatados ?? 0);
    const hasRecordTotals = wins + losses + draws > 0;

    events.push({
      id: row.id,
      eventoId: row.evento_id,
      tipoEvento: row.tipo_evento,
      nombre: resolveEventName(row, torneo),
      fecha:
        row.fecha ?? torneo?.created_at?.slice(0, 10) ?? null,
      categoria:
        formatCategoryLabel(meta.categoria) ??
        formatCategoryLabel(torneo?.categoria ?? null),
      posicionFinal:
        typeof posicionFinal === "number" ? posicionFinal : null,
      puntosGanados,
      partidosGanados: hasRecordTotals ? wins : null,
      partidosPerdidos: hasRecordTotals ? losses : null,
      partidosEmpatados: hasRecordTotals ? draws : null,
      partidos,
    });
  }

  return events.sort((a, b) => {
    const dateA = a.fecha ?? "";
    const dateB = b.fecha ?? "";
    return dateB.localeCompare(dateA);
  });
}

/** Fallback cuando no hay filas en jugador_participaciones pero sí partidos jugados. */
async function buildEventsFromExpressPartidos(
  legacyPlayerId: string,
  organizadorId: string
): Promise<PlayerHistoryEvent[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data: torneos } = await supabase
    .from("torneo_express")
    .select("id, nombre, created_at, categoria")
    .eq("organizador_id", organizadorId)
    .order("created_at", { ascending: false });

  if (!torneos?.length) return [];

  const events: PlayerHistoryEvent[] = [];

  for (const torneo of torneos as TorneoExpressRow[]) {
    const partidos = await fetchExpressMatchesForTorneo(
      torneo.id,
      legacyPlayerId,
      organizadorId
    );
    if (!partidos.length) continue;

    events.push({
      id: `express-${torneo.id}`,
      eventoId: torneo.id,
      tipoEvento: "torneo_express",
      nombre: torneo.nombre?.trim() || "Torneo Express",
      fecha: torneo.created_at?.slice(0, 10) ?? null,
      categoria: formatCategoryLabel(torneo.categoria),
      posicionFinal: null,
      puntosGanados: 0,
      partidosGanados: null,
      partidosPerdidos: null,
      partidosEmpatados: null,
      partidos,
    });
  }

  return events;
}

interface ParticipacionHydratedRow {
  id: string;
  tipo_evento: string;
  evento_id: string;
  fecha: string | null;
  sets_favor: number | null;
  sets_contra: number | null;
  metadata: ParticipacionMetadata | null;
  jugador_id: string | null;
  legacy_player_id: string | null;
}

function registerPlayerName(
  map: Map<string, string>,
  id: string | null | undefined,
  name: string | null | undefined
): void {
  const trimmedId = id?.trim();
  const trimmedName = name?.trim();
  if (!trimmedId || !trimmedName) return;
  map.set(trimmedId, trimmedName);
}

async function fetchPlayerDisplayNames(
  ids: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const uniqueIds = [...new Set(ids.filter((id) => id?.trim()))];
  if (!uniqueIds.length) return map;

  const supabase = getSupabaseClient();
  if (!supabase) return map;

  const { data: byRivieraId, error: rivieraError } = await supabase
    .from("riviera_jugadores")
    .select("id, nombre, legacy_player_id")
    .in("id", uniqueIds);

  if (rivieraError) {
    console.error("fetchPlayerDisplayNames riviera_jugadores.id:", rivieraError.message);
  }

  for (const row of byRivieraId ?? []) {
    registerPlayerName(map, String(row.id), String(row.nombre ?? ""));
    registerPlayerName(
      map,
      row.legacy_player_id ? String(row.legacy_player_id) : null,
      String(row.nombre ?? "")
    );
  }

  const missingAfterId = uniqueIds.filter((id) => !map.has(id));
  if (missingAfterId.length) {
    const { data: byLegacyId, error: legacyError } = await supabase
      .from("riviera_jugadores")
      .select("id, nombre, legacy_player_id")
      .in("legacy_player_id", missingAfterId);

    if (legacyError) {
      console.error(
        "fetchPlayerDisplayNames riviera_jugadores.legacy_player_id:",
        legacyError.message
      );
    }

    for (const row of byLegacyId ?? []) {
      registerPlayerName(map, String(row.id), String(row.nombre ?? ""));
      registerPlayerName(
        map,
        row.legacy_player_id ? String(row.legacy_player_id) : null,
        String(row.nombre ?? "")
      );
    }
  }

  const missingAfterLegacy = uniqueIds.filter((id) => !map.has(id));
  if (missingAfterLegacy.length) {
    const { data: legacyPlayers, error: playersError } = await supabase
      .from("players")
      .select("id, name")
      .in("id", missingAfterLegacy);

    if (playersError) {
      console.error("fetchPlayerDisplayNames players:", playersError.message);
    }

    for (const row of legacyPlayers ?? []) {
      registerPlayerName(map, String(row.id), String(row.name ?? ""));
    }
  }

  return map;
}

function formatOpponentLabelFromNames(names: string[]): string | null {
  const cleaned = names.map((name) => name.trim()).filter(Boolean);
  return cleaned.length ? cleaned.join(" / ") : null;
}

function formatOpponentLabel(
  opponentIds: string[],
  jugadorNameMap: Map<string, string>,
  dueloNames?: string[]
): string | null {
  const fromDuelo = formatOpponentLabelFromNames(dueloNames ?? []);
  if (fromDuelo) return fromDuelo;

  const fromIds = opponentIds
    .map((id) => jugadorNameMap.get(id)?.trim())
    .filter((name): name is string => Boolean(name && name !== "Jugador"));

  return fromIds.length ? fromIds.join(" / ") : null;
}

async function hydrateParticipacionesForHistorial(
  historial: OfficialHistorialEntry[]
): Promise<Map<string, ParticipacionHydratedRow>> {
  const map = new Map<string, ParticipacionHydratedRow>();
  const ids = [
    ...new Set(historial.map((entry) => entry.participacion_id).filter(Boolean)),
  ];
  if (!ids.length) return map;

  const supabase = getSupabaseClient();
  if (!supabase) return map;

  const { data, error } = await supabase
    .from("jugador_participaciones")
    .select(
      "id, tipo_evento, evento_id, fecha, sets_favor, sets_contra, metadata, jugador_id"
    )
    .in("id", ids);

  if (error) {
    console.error("hydrateParticipacionesForHistorial:", error.message);
    return map;
  }

  const jugadorIds = [
    ...new Set(
      (data ?? [])
        .map((row) => row.jugador_id as string | null)
        .filter((id): id is string => Boolean(id?.trim()))
    ),
  ];

  const legacyByJugadorId = new Map<string, string | null>();
  if (jugadorIds.length) {
    const { data: jugadores, error: jugadoresError } = await supabase
      .from("riviera_jugadores")
      .select("id, legacy_player_id")
      .in("id", jugadorIds);

    if (jugadoresError) {
      console.error(
        "hydrateParticipacionesForHistorial jugadores:",
        jugadoresError.message
      );
    } else {
      for (const jugador of jugadores ?? []) {
        legacyByJugadorId.set(
          String(jugador.id),
          jugador.legacy_player_id ? String(jugador.legacy_player_id) : null
        );
      }
    }
  }

  for (const row of data ?? []) {
    const jugadorId = row.jugador_id ? String(row.jugador_id) : "";
    map.set(String(row.id), {
      id: String(row.id),
      tipo_evento: String(row.tipo_evento ?? ""),
      evento_id: String(row.evento_id ?? ""),
      fecha: row.fecha ? String(row.fecha) : null,
      sets_favor:
        row.sets_favor != null ? Number(row.sets_favor) : null,
      sets_contra:
        row.sets_contra != null ? Number(row.sets_contra) : null,
      metadata: (row.metadata as ParticipacionMetadata | null) ?? null,
      jugador_id: jugadorId || null,
      legacy_player_id: jugadorId
        ? (legacyByJugadorId.get(jugadorId) ?? null)
        : null,
    });
  }

  return map;
}

function mergeEntryWithParticipacion(
  entry: OfficialHistorialEntry,
  hydrated?: ParticipacionHydratedRow
): OfficialHistorialEntry {
  if (!hydrated) return entry;

  const dbMeta = (hydrated.metadata ?? {}) as ParticipacionMetadataWithDetalle;
  const rpcMeta = (entry.metadata ?? {}) as ParticipacionMetadataWithDetalle;

  return {
    ...entry,
    event_type: entry.event_type || hydrated.tipo_evento,
    event_id: entry.event_id || hydrated.evento_id,
    activity_at: entry.activity_at || hydrated.fecha || entry.activity_at,
    metadata: {
      ...dbMeta,
      ...rpcMeta,
      partidos_detalle:
        dbMeta.partidos_detalle ??
        rpcMeta.partidos_detalle ??
        undefined,
      sets_favor: hydrated.sets_favor ?? undefined,
      sets_contra: hydrated.sets_contra ?? undefined,
    },
  };
}

async function buildDueloPartidosFromScore(
  entry: OfficialHistorialEntry,
  profileJugadorId: string,
  participacionJugadorId: string | null,
  dueloScoreMap: Map<string, Duelo2v2ScoreRow>,
  jugadorNameMap: Map<string, string>
): Promise<PlayerHistoryMatch[]> {
  const duelo = dueloScoreMap.get(entry.event_id);
  if (!duelo) return [];

  const dueloJugadorId = resolveDueloJugadorId(
    duelo,
    profileJugadorId,
    participacionJugadorId
  );
  const opponentIds = getOpponentJugadorIdsFromDuelo(duelo, dueloJugadorId);
  const dueloNames = getOpponentNamesFromDuelo(
    duelo,
    profileJugadorId,
    participacionJugadorId
  );
  const opponentLabel =
    formatOpponentLabel(opponentIds, jugadorNameMap, dueloNames) ?? "Rival";
  const score = formatDueloMarcador(duelo, dueloJugadorId) ?? "—";

  return [
    {
      id: `duelo-${entry.event_id}`,
      round: "Duelo 2 vs 2",
      opponentLabel,
      score,
      won: didPlayerWinDuelo(duelo, dueloJugadorId),
      sortDate: entry.activity_at ?? "",
    },
  ];
}

function patchDueloPartidoLabels(
  partidos: PlayerHistoryMatch[],
  entry: OfficialHistorialEntry,
  profileJugadorId: string,
  participacionJugadorId: string | null,
  dueloScoreMap: Map<string, Duelo2v2ScoreRow>,
  jugadorNameMap: Map<string, string>
): PlayerHistoryMatch[] {
  if (entry.event_type !== "duelo_2v2" || !partidos.length) return partidos;

  const duelo = dueloScoreMap.get(entry.event_id);
  if (!duelo) return partidos;

  const dueloJugadorId = resolveDueloJugadorId(
    duelo,
    profileJugadorId,
    participacionJugadorId
  );
  const opponentIds = getOpponentJugadorIdsFromDuelo(duelo, dueloJugadorId);
  const dueloNames = getOpponentNamesFromDuelo(
    duelo,
    profileJugadorId,
    participacionJugadorId
  );
  const opponentLabel = formatOpponentLabel(
    opponentIds,
    jugadorNameMap,
    dueloNames
  );
  const marcador = formatDueloMarcador(duelo, dueloJugadorId);
  const won = didPlayerWinDuelo(duelo, dueloJugadorId);

  return partidos.map((partido) => ({
    ...partido,
    opponentLabel:
      opponentLabel &&
      (!partido.opponentLabel?.trim() || partido.opponentLabel === "Rival")
        ? opponentLabel
        : partido.opponentLabel,
    score: marcador ?? partido.score,
    won,
  }));
}

function resolveEntryOrganizadorId(
  entry: OfficialHistorialEntry,
  fallbackOrganizadorId: string
): string {
  const orgId = entry.metadata?.organizador_id;
  return typeof orgId === "string" && orgId.trim()
    ? orgId.trim()
    : fallbackOrganizadorId;
}

async function buildMatchesForOfficialEntry(
  entry: OfficialHistorialEntry,
  legacyPlayerId: string | null | undefined,
  fallbackOrganizadorId: string,
  profileJugadorId: string,
  participacionJugadorId: string | null,
  dueloScoreMap: Map<string, Duelo2v2ScoreRow>,
  jugadorNameMap: Map<string, string>,
  playerName?: string | null
): Promise<PlayerHistoryMatch[]> {
  const meta = (entry.metadata ?? {}) as ParticipacionMetadataWithDetalle &
    ParticipacionMetadata & {
      sets_favor?: number | null;
      sets_contra?: number | null;
      canonical_legacy_player_id?: string | null;
    };
  const eventOrgId = resolveEntryOrganizadorId(entry, fallbackOrganizadorId);
  let partidos = partidosDetalleToPlayerHistory(meta, entry.activity_at);

  if (
    !partidos.length &&
    (legacyPlayerId?.trim() ||
      playerName?.trim() ||
      meta.canonical_legacy_player_id)
  ) {
    if (entry.event_type === "torneo_express" && legacyPlayerId?.trim()) {
      const groupMatches = await fetchExpressMatchesForTorneo(
        entry.event_id,
        legacyPlayerId,
        eventOrgId
      );
      const eliminatoriaMatches = await fetchExpressEliminatoriaMatches(
        entry.event_id,
        legacyPlayerId,
        meta
      );
      partidos =
        eliminatoriaMatches !== null
          ? [...groupMatches, ...eliminatoriaMatches]
          : await supplementExpressKnockoutMatches(
              entry.event_id,
              legacyPlayerId,
              groupMatches,
              {
                metadata: meta,
                setsFavor:
                  typeof meta.sets_favor === "number" ? meta.sets_favor : null,
                setsContra:
                  typeof meta.sets_contra === "number" ? meta.sets_contra : null,
                torneoCreatedAt: entry.activity_at?.slice(0, 10) ?? null,
              }
            );
    } else if (entry.event_type === "reta") {
      partidos = await fetchRetaMatchesForEvent(
        entry.event_id,
        legacyPlayerId?.trim() || "",
        {
          ...meta,
          canonical_legacy_player_id:
            meta.canonical_legacy_player_id ?? undefined,
          pair_id: meta.pair_id ?? undefined,
        },
        typeof meta.sets_favor === "number" ? meta.sets_favor : null,
        typeof meta.sets_contra === "number" ? meta.sets_contra : null,
        entry.activity_at,
        {
          playerName,
          candidateLegacyIds: [
            legacyPlayerId,
            meta.canonical_legacy_player_id,
          ],
        }
      );
    } else if (
      entry.event_type === "americano" ||
      entry.event_type === "liga" ||
      entry.event_type === "duelo_2v2" ||
      entry.event_type === "duelo"
    ) {
      partidos = partidosDetalleToPlayerHistory(meta, entry.activity_at);
    }
  }

  if (!partidos.length && entry.event_type === "duelo_2v2") {
    partidos = await buildDueloPartidosFromScore(
      entry,
      profileJugadorId,
      participacionJugadorId,
      dueloScoreMap,
      jugadorNameMap
    );
  }

  if (partidos.length && entry.event_type === "duelo_2v2") {
    partidos = patchDueloPartidoLabels(
      partidos,
      entry,
      profileJugadorId,
      participacionJugadorId,
      dueloScoreMap,
      jugadorNameMap
    );
  }

  return partidos;
}

function applyDueloMarcadorToPartidos(
  partidos: PlayerHistoryMatch[],
  entry: OfficialHistorialEntry,
  profileJugadorId: string,
  participacionJugadorId: string | null,
  dueloScoreMap: Map<string, Duelo2v2ScoreRow>,
  jugadorNameMap: Map<string, string>
): PlayerHistoryMatch[] {
  if (entry.event_type !== "duelo_2v2" || !partidos.length) return partidos;

  return patchDueloPartidoLabels(
    partidos,
    entry,
    profileJugadorId,
    participacionJugadorId,
    dueloScoreMap,
    jugadorNameMap
  );
}

/**
 * Completa rival/resultado en historial RPC cuando metadata no trae partidos_detalle.
 * Para retas multiclub, resuelve el ID del jugador en pairs aunque no sea el
 * legacy_player_id del club de registro (p. ej. Hackpadel → Riviera Open).
 */
export async function enrichOfficialHistoryEvents(
  events: PlayerHistoryEvent[],
  historial: OfficialHistorialEntry[],
  jugadorId: string,
  legacyPlayerId: string | null | undefined,
  organizadorId: string,
  playerName?: string | null
): Promise<PlayerHistoryEvent[]> {
  if (!events.length || !historial.length) return events;

  const entryById = new Map(
    historial.map((entry) => [entry.participacion_id, entry])
  );
  const hydratedMap = await hydrateParticipacionesForHistorial(historial);

  const dueloIds = [
    ...new Set(
      historial
        .filter((entry) => entry.event_type === "duelo_2v2")
        .map((entry) => entry.event_id)
    ),
  ];
  const dueloScoreMap = dueloIds.length
    ? await fetchDuelosScoreMap(dueloIds)
    : new Map<string, Duelo2v2ScoreRow>();

  const nameLookupIds = new Set<string>();
  for (const duelo of dueloScoreMap.values()) {
    for (const id of getAllDueloJugadorIds(duelo)) {
      nameLookupIds.add(id);
    }
  }
  const jugadorNameMap = await fetchPlayerDisplayNames([...nameLookupIds]);

  const resolvedPlayerName =
    playerName?.trim() ||
    (await fetchPlayerDisplayNames([jugadorId])).get(jugadorId) ||
    null;

  const enriched = await Promise.all(
    events.map(async (event) => {
      const rawEntry = entryById.get(event.id);
      if (!rawEntry) return event;

      const hydrated = hydratedMap.get(rawEntry.participacion_id);
      const entry = mergeEntryWithParticipacion(rawEntry, hydrated);
      const participacionJugadorId = hydrated?.jugador_id?.trim() || null;
      const entryLegacyPlayerId =
        hydrated?.legacy_player_id?.trim() || legacyPlayerId?.trim() || null;

      let partidos = partidosDetalleToPlayerHistory(
        (entry.metadata ?? {}) as ParticipacionMetadataWithDetalle,
        entry.activity_at
      );

      if (!partidos.length) {
        partidos = await buildMatchesForOfficialEntry(
          entry,
          entryLegacyPlayerId,
          organizadorId,
          jugadorId,
          participacionJugadorId,
          dueloScoreMap,
          jugadorNameMap,
          resolvedPlayerName
        );
      } else if (entry.event_type === "duelo_2v2") {
        partidos = patchDueloPartidoLabels(
          partidos,
          entry,
          jugadorId,
          participacionJugadorId,
          dueloScoreMap,
          jugadorNameMap
        );
      }

      partidos = applyDueloMarcadorToPartidos(
        partidos,
        entry,
        jugadorId,
        participacionJugadorId,
        dueloScoreMap,
        jugadorNameMap
      );

      const record = resolveEventRecord(event, entry, partidos);

      return {
        ...event,
        partidos,
        partidosGanados: record.partidosGanados ?? event.partidosGanados,
        partidosPerdidos: record.partidosPerdidos ?? event.partidosPerdidos,
        partidosEmpatados: record.partidosEmpatados ?? event.partidosEmpatados,
      };
    })
  );

  return enriched;
}

function parseScoreGames(score: string): { favor: number; contra: number } {
  if (!score?.trim() || score === "—" || score === "Empate") {
    return { favor: 0, contra: 0 };
  }

  let favor = 0;
  let contra = 0;

  for (const part of score.split(",")) {
    const match = part.trim().match(/^(\d+)\s*-\s*(\d+)/);
    if (!match) continue;
    favor += Number(match[1]);
    contra += Number(match[2]);
  }

  return { favor, contra };
}

function recordFromHistoryEvent(event: PlayerHistoryEvent): {
  wins: number;
  losses: number;
  draws: number;
  setsFavor: number;
  setsContra: number;
} {
  if (event.partidos.length > 0) {
    let wins = 0;
    let losses = 0;
    let draws = 0;
    let setsFavor = 0;
    let setsContra = 0;

    for (const partido of event.partidos) {
      if (partido.isDraw) draws += 1;
      else if (partido.won) wins += 1;
      else losses += 1;

      const games = parseScoreGames(partido.score);
      setsFavor += games.favor;
      setsContra += games.contra;
    }

    return { wins, losses, draws, setsFavor, setsContra };
  }

  return {
    wins: Number(event.partidosGanados ?? 0),
    losses: Number(event.partidosPerdidos ?? 0),
    draws: Number(event.partidosEmpatados ?? 0),
    setsFavor: 0,
    setsContra: 0,
  };
}

function resolveEventRecord(
  event: PlayerHistoryEvent,
  entry: OfficialHistorialEntry,
  partidos: PlayerHistoryMatch[]
): Pick<
  PlayerHistoryEvent,
  "partidosGanados" | "partidosPerdidos" | "partidosEmpatados"
> {
  const fromPartidos = recordFromHistoryEvent({ ...event, partidos });
  if (partidos.length > 0) {
    return {
      partidosGanados: fromPartidos.wins,
      partidosPerdidos: fromPartidos.losses,
      partidosEmpatados: fromPartidos.draws,
    };
  }

  const meta = entry.metadata ?? {};
  return {
    partidosGanados:
      meta.partidos_ganados != null ? Number(meta.partidos_ganados) : null,
    partidosPerdidos:
      meta.partidos_perdidos != null ? Number(meta.partidos_perdidos) : null,
    partidosEmpatados:
      meta.partidos_empatados != null ? Number(meta.partidos_empatados) : null,
  };
}

/** Stats de partidos desde historial oficial multiclub (RPC + detalle). */
export function computeStatsFromHistoryEvents(
  historyEvents: PlayerHistoryEvent[]
): Pick<
  PlayerStatsSummary,
  | "totalPartidos"
  | "victorias"
  | "derrotas"
  | "empates"
  | "pctVictorias"
  | "setsFavor"
  | "setsContra"
  | "ultimaActividad"
> {
  let totalPartidos = 0;
  let victorias = 0;
  let derrotas = 0;
  let empates = 0;
  let setsFavor = 0;
  let setsContra = 0;
  let ultimaActividad: string | null = null;

  for (const event of historyEvents) {
    const record = recordFromHistoryEvent(event);
    const played = record.wins + record.losses + record.draws;
    if (played === 0) continue;

    totalPartidos += played;
    victorias += record.wins;
    derrotas += record.losses;
    empates += record.draws;
    setsFavor += record.setsFavor;
    setsContra += record.setsContra;

    const eventDate = (event.fecha ?? "").slice(0, 10);
    if (eventDate && (!ultimaActividad || eventDate > ultimaActividad)) {
      ultimaActividad = eventDate;
    }
  }

  const pctVictorias =
    totalPartidos > 0 ? Math.round((victorias / totalPartidos) * 100) : 0;

  return {
    totalPartidos,
    victorias,
    derrotas,
    empates,
    pctVictorias,
    setsFavor,
    setsContra,
    ultimaActividad,
  };
}
