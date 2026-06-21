import { getSupabaseClient } from "@/lib/supabaseClient";
import { dbCategoryToUi } from "@/lib/categoryUtils";
import { supplementExpressKnockoutMatches } from "@/lib/expressKnockoutService";
import {
  PlayerHistoryEvent,
  PlayerHistoryMatch,
} from "@/lib/types/playerHistory";

const RANKING_ORGANIZADOR_ID =
  process.env.NEXT_PUBLIC_RANKING_ORGANIZADOR_ID?.trim() ||
  "2770b522-9064-4c7b-a729-4a0ea7e3f6e8";

interface ParticipacionMetadata {
  subtipo?: string;
  organizador_id?: string;
  evento_nombre?: string;
  torneo_nombre?: string;
  nombre?: string;
  categoria?: string;
  posicion_final?: number;
  puntos_ganados?: number;
  puntos_evento?: number;
  partidos_ganados?: number;
  partidos_perdidos?: number;
  campeon_torneo?: boolean;
  subcampeon_torneo?: boolean;
  pareja_campeon_id?: string;
  pareja_subcampeon_id?: string;
}

interface ParticipacionRow {
  id: string;
  tipo_evento: string;
  evento_id: string;
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
    meta.evento_nombre?.trim() ||
    meta.torneo_nombre?.trim() ||
    meta.nombre?.trim() ||
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
  legacyIds: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!legacyIds.length) return map;

  const supabase = getSupabaseClient();
  if (!supabase) return map;

  const { data } = await supabase
    .from("riviera_jugadores")
    .select("legacy_player_id, nombre")
    .in("legacy_player_id", legacyIds)
    .eq("organizador_id", RANKING_ORGANIZADOR_ID);

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
  legacyPlayerId: string
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

  const nameMap = await buildLegacyNameMap([...legacyIds]);
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
      "id, tipo_evento, evento_id, fecha, pareja_con, sets_favor, sets_contra, metadata"
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
    return buildEventsFromParticipaciones(rows, legacyPlayerId);
  }

  if (legacyPlayerId?.trim()) {
    return buildEventsFromExpressPartidos(legacyPlayerId, organizadorId);
  }

  return [];
}

async function buildEventsFromParticipaciones(
  rows: ParticipacionRow[],
  legacyPlayerId: string | null | undefined
): Promise<PlayerHistoryEvent[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

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
        legacyPlayerId
      );
      partidos = await supplementExpressKnockoutMatches(
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
    }

    const posicionFinal = meta.posicion_final ?? null;
    const puntosGanados =
      Number(meta.puntos_evento ?? meta.puntos_ganados ?? 0) || 0;

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
      partidosGanados:
        typeof meta.partidos_ganados === "number"
          ? meta.partidos_ganados
          : null,
      partidosPerdidos:
        typeof meta.partidos_perdidos === "number"
          ? meta.partidos_perdidos
          : null,
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
      legacyPlayerId
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
      partidos,
    });
  }

  return events;
}
