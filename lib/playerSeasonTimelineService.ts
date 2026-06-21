import { getSupabaseClient } from "@/lib/supabaseClient";
import { getPlayerHistoryEvents } from "@/lib/playerHistoryService";
import { PlayerHistoryEvent } from "@/lib/types/playerHistory";
import { PlayerSeasonTimeline, SeasonTimelinePoint } from "@/lib/types";

const RANKING_ORGANIZADOR_ID =
  process.env.NEXT_PUBLIC_RANKING_ORGANIZADOR_ID?.trim() ||
  "2770b522-9064-4c7b-a729-4a0ea7e3f6e8";

export const CURRENT_SEASON = 2026;

interface ParticipacionMetadata {
  subtipo?: string;
  organizador_id?: string;
  partidos_ganados?: number;
  partidos_perdidos?: number;
  partidos_empatados?: number;
}

interface ParticipacionRow {
  tipo_evento: string;
  evento_id: string;
  fecha: string | null;
  metadata: ParticipacionMetadata | null;
}

interface ParejaEmbed {
  player1_id: string | null;
  player2_id: string | null;
}

interface TimelineEvent {
  date: string;
  wins: number;
  losses: number;
}

function isInSeason(date: string | null | undefined, season: number): boolean {
  if (!date) return false;
  return date.startsWith(String(season));
}

function isAjusteManual(metadata: ParticipacionMetadata | null): boolean {
  return metadata?.subtipo === "ajuste_manual";
}

async function getOrgTorneoExpressIds(
  organizadorId: string
): Promise<Set<string>> {
  const supabase = getSupabaseClient();
  if (!supabase) return new Set();

  const { data, error } = await supabase
    .from("torneo_express")
    .select("id")
    .eq("organizador_id", organizadorId);

  if (error || !data?.length) return new Set();
  return new Set(data.map((row) => row.id as string));
}

function belongsToOrganizador(
  row: ParticipacionRow,
  organizadorId: string,
  orgTorneoExpressIds: Set<string>
): boolean {
  const metadata = row.metadata;
  if (metadata?.organizador_id) {
    return metadata.organizador_id === organizadorId;
  }
  if (row.tipo_evento === "torneo_express") {
    return orgTorneoExpressIds.has(row.evento_id);
  }
  return true;
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

function buildCumulativePoints(
  events: TimelineEvent[],
  season: number
): SeasonTimelinePoint[] {
  const sorted = [...events].sort((a, b) => a.date.localeCompare(b.date));
  if (sorted.length === 0) return [];

  let wins = 0;
  let losses = 0;
  const points: SeasonTimelinePoint[] = [
    {
      date: `${season}-01-01`,
      wins: 0,
      losses: 0,
      balance: 0,
    },
  ];

  for (const event of sorted) {
    wins += event.wins;
    losses += event.losses;
    points.push({
      date: event.date,
      wins,
      losses,
      balance: wins - losses,
    });
  }

  return points;
}

interface MatchResult {
  date: string;
  won: boolean;
}

function expandAggregatedEvent(event: TimelineEvent): MatchResult[] {
  const matches: MatchResult[] = [];
  for (let i = 0; i < event.wins; i++) {
    matches.push({ date: event.date, won: true });
  }
  for (let i = 0; i < event.losses; i++) {
    matches.push({ date: event.date, won: false });
  }
  return matches;
}

function buildCumulativePointsFromMatches(
  matches: MatchResult[],
  season: number
): SeasonTimelinePoint[] {
  const sorted = [...matches].sort((a, b) => a.date.localeCompare(b.date));
  if (!sorted.length) return [];

  let wins = 0;
  let losses = 0;
  const points: SeasonTimelinePoint[] = [
    {
      date: `${season}-01-01`,
      wins: 0,
      losses: 0,
      balance: 0,
    },
  ];

  for (const match of sorted) {
    if (match.won) wins += 1;
    else losses += 1;

    points.push({
      date: match.date,
      wins,
      losses,
      balance: wins - losses,
    });
  }

  return points;
}

function matchesFromHistoryEvents(
  historyEvents: PlayerHistoryEvent[],
  season: number
): MatchResult[] {
  const matches: MatchResult[] = [];

  for (const event of historyEvents) {
    for (const partido of event.partidos) {
      const date = (partido.sortDate || event.fecha || "").slice(0, 10);
      if (!isInSeason(date, season)) continue;
      matches.push({ date, won: partido.won });
    }
  }

  return matches;
}

async function eventsFromParticipaciones(
  jugadorId: string,
  organizadorId: string,
  season: number
): Promise<TimelineEvent[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const orgTorneoIds = await getOrgTorneoExpressIds(organizadorId);

  const { data, error } = await supabase
    .from("jugador_participaciones")
    .select("tipo_evento, evento_id, fecha, metadata")
    .eq("jugador_id", jugadorId)
    .order("fecha", { ascending: true });

  if (error || !data?.length) return [];

  const events: TimelineEvent[] = [];

  for (const raw of data as ParticipacionRow[]) {
    if (isAjusteManual(raw.metadata)) continue;
    if (!belongsToOrganizador(raw, organizadorId, orgTorneoIds)) continue;
    if (!isInSeason(raw.fecha, season)) continue;

    const metadata = raw.metadata ?? {};
    const wins = Number(metadata.partidos_ganados ?? 0);
    const losses = Number(metadata.partidos_perdidos ?? 0);

    if (wins + losses === 0) continue;

    events.push({
      date: raw.fecha!,
      wins,
      losses,
    });
  }

  return events;
}

async function getPlayerPairIds(legacyPlayerId: string): Promise<string[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("pairs")
    .select("id")
    .or(`player1_id.eq.${legacyPlayerId},player2_id.eq.${legacyPlayerId}`);

  if (error || !data?.length) return [];
  return data.map((row) => row.id as string);
}

async function eventsFromExpressPartidos(
  legacyPlayerId: string,
  organizadorId: string,
  season: number
): Promise<TimelineEvent[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data: torneos, error: torneosError } = await supabase
    .from("torneo_express")
    .select("id")
    .eq("organizador_id", organizadorId);

  if (torneosError || !torneos?.length) return [];

  const torneoIds = torneos.map((row) => row.id as string);

  const { data: grupos, error: gruposError } = await supabase
    .from("torneo_express_grupos")
    .select("id")
    .in("torneo_id", torneoIds);

  if (gruposError || !grupos?.length) return [];

  const grupoIds = grupos.map((row) => row.id as string);

  const { data: partidos, error: partidosError } = await supabase
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
    .eq("estado", "jugado")
    .order("created_at", { ascending: true });

  if (partidosError || !partidos?.length) return [];

  const events: TimelineEvent[] = [];

  for (const raw of partidos) {
    const date = raw.created_at as string | null;
    if (!isInSeason(date, season)) continue;

    const inLocal = playerInPareja(
      unwrapPareja(raw.pareja_local),
      legacyPlayerId
    );
    const inVisit = playerInPareja(
      unwrapPareja(raw.pareja_visitante),
      legacyPlayerId
    );
    if (!inLocal && !inVisit) continue;

    const myParejaId = inLocal
      ? raw.pareja_local_id
      : raw.pareja_visitante_id;

    let wins = 0;
    let losses = 0;

    if (!raw.ganador_id) {
      continue;
    } else if (raw.ganador_id === myParejaId) {
      wins = 1;
    } else {
      losses = 1;
    }

    events.push({ date: date!, wins, losses });
  }

  return events;
}

async function eventsFromRetasMatches(
  legacyPlayerId: string,
  organizadorId: string,
  pairIds: string[],
  season: number
): Promise<TimelineEvent[]> {
  if (!pairIds.length) return [];

  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data: orgTournaments, error: tournamentsError } = await supabase
    .from("tournaments")
    .select("id")
    .eq("user_id", organizadorId);

  if (tournamentsError || !orgTournaments?.length) return [];

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
      torneo:tournament_id ( user_id )
    `
    )
    .in("tournament_id", tournamentIds)
    .eq("status", "finished")
    .or(`pair1_id.in.(${pairFilter}),pair2_id.in.(${pairFilter})`)
    .order("created_at", { ascending: true });

  if (matchesError || !matches?.length) return [];

  const events: TimelineEvent[] = [];
  const seenMatchIds = new Set<string>();

  for (const raw of matches) {
    if (seenMatchIds.has(raw.id as string)) continue;
    seenMatchIds.add(raw.id as string);

    const date = raw.created_at as string | null;
    if (!isInSeason(date, season)) continue;

    const torneo = raw.torneo as
      | { user_id: string | null }
      | { user_id: string | null }[]
      | null;
    const torneoRow = Array.isArray(torneo) ? torneo[0] : torneo;
    if (torneoRow?.user_id !== organizadorId) continue;

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

    let wins = 0;
    let losses = 0;

    if (myScore > oppScore) wins = 1;
    else if (oppScore > myScore) losses = 1;
    else continue;

    events.push({ date: date!, wins, losses });
  }

  return events;
}

/**
 * Evolución de ganados/perdidos en la temporada (participaciones o partidos).
 */
export async function computePlayerSeasonTimeline(
  jugadorId: string,
  legacyPlayerId: string | null | undefined,
  season: number = CURRENT_SEASON,
  organizadorId: string = RANKING_ORGANIZADOR_ID,
  historyEvents?: PlayerHistoryEvent[]
): Promise<PlayerSeasonTimeline> {
  const history =
    historyEvents ??
    (await getPlayerHistoryEvents(jugadorId, legacyPlayerId, organizadorId));

  const historyMatches = matchesFromHistoryEvents(history, season);
  if (historyMatches.length > 0) {
    return {
      season,
      points: buildCumulativePointsFromMatches(historyMatches, season),
    };
  }

  const participacionEvents = await eventsFromParticipaciones(
    jugadorId,
    organizadorId,
    season
  );

  let events: TimelineEvent[];

  if (participacionEvents.length > 0) {
    events = participacionEvents;
  } else if (legacyPlayerId?.trim()) {
    const pairIds = await getPlayerPairIds(legacyPlayerId);
    const [expressEvents, retasEvents] = await Promise.all([
      eventsFromExpressPartidos(legacyPlayerId, organizadorId, season),
      eventsFromRetasMatches(
        legacyPlayerId,
        organizadorId,
        pairIds,
        season
      ),
    ]);
    events = [...expressEvents, ...retasEvents];
  } else {
    events = [];
  }

  const fallbackMatches = events.flatMap(expandAggregatedEvent);

  return {
    season,
    points:
      fallbackMatches.length > 0
        ? buildCumulativePointsFromMatches(fallbackMatches, season)
        : buildCumulativePoints(events, season),
  };
}
