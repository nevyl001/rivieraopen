import { getSupabaseClient } from "@/lib/supabaseClient";
import { PlayerHistoryMatch } from "@/lib/types/playerHistory";

type KnockoutRoundKey = "quarter" | "semi" | "final" | "third" | "bestThird";

interface ParticipacionMetadata {
  posicion_final?: number;
  partidos_ganados?: number;
  partidos_perdidos?: number;
  campeon_torneo?: boolean;
  subcampeon_torneo?: boolean;
  pareja_campeon_id?: string;
  pareja_subcampeon_id?: string;
  lugar?: string;
  paso_semifinal?: boolean;
  llego_final?: boolean;
}

interface BracketSlot {
  type?: string;
  qualifier?: {
    parejaId?: string;
    parejaLabel?: string;
    isMejorTercero?: boolean;
    posEnGrupo?: number;
  };
}

interface TorneoPodium {
  campeonPairId: string | null;
  subcampeonPairId: string | null;
  pairByPosition: Map<number, string>;
}

interface KnockoutStep {
  roundKey: KnockoutRoundKey;
  won: boolean;
}

const ROUND_LABELS: Record<KnockoutRoundKey, string> = {
  quarter: "Cuartos de final",
  semi: "Semifinal",
  final: "Final",
  third: "3er lugar",
  bestThird: "Mejor 3er lugar",
};

function pairLabel(
  player1Name: string | null | undefined,
  player2Name: string | null | undefined
): string {
  const names = [player1Name, player2Name]
    .map((name) => name?.trim())
    .filter(Boolean);
  return names.length ? names.join(" / ") : "Rival";
}

function parseSetScore(score: string): { favor: number; against: number } {
  const [myPts, oppPts] = score.split("-").map((value) => Number(value));
  return {
    favor: Number.isFinite(myPts) ? myPts : 0,
    against: Number.isFinite(oppPts) ? oppPts : 0,
  };
}

function sumGroupGames(matches: PlayerHistoryMatch[]): {
  favor: number;
  against: number;
} {
  let favor = 0;
  let against = 0;
  for (const match of matches) {
    for (const setScore of match.score.split(",")) {
      const games = parseSetScore(setScore.trim());
      favor += games.favor;
      against += games.against;
    }
  }
  return { favor, against };
}

function getSetTemplatesForStep(step: KnockoutStep): string[] {
  if (step.roundKey === "quarter" || step.roundKey === "bestThird") {
    return step.won ? ["6-4"] : ["4-6"];
  }

  if (step.roundKey === "third") {
    return step.won ? ["6-3"] : ["3-6"];
  }

  if (step.roundKey === "semi") {
    if (step.won) return ["6-3"];
    return ["4-6"];
  }

  if (step.roundKey === "final") {
    return step.won ? ["6-3", "6-0"] : ["3-6", "0-6"];
  }

  return [step.won ? "6-4" : "4-6"];
}

function sumTemplateGames(templates: string[]): { favor: number; against: number } {
  return templates.reduce(
    (totals, setScore) => {
      const games = parseSetScore(setScore);
      return {
        favor: totals.favor + games.favor,
        against: totals.against + games.against,
      };
    },
    { favor: 0, against: 0 }
  );
}

function isPlausibleSetScore(favor: number, against: number): boolean {
  const high = Math.max(favor, against);
  const low = Math.min(favor, against);
  if (high < 6 || low < 0) return false;
  if (high === 6 && low <= 4) return true;
  if (high === 7 && low >= 5) return true;
  return false;
}

function fitTemplatesToBudget(
  templates: string[],
  favorBudget: number,
  againstBudget: number
): string[] {
  if (!templates.length) return templates;

  const templateTotals = sumTemplateGames(templates);
  if (
    templateTotals.favor === favorBudget &&
    templateTotals.against === againstBudget
  ) {
    return templates;
  }

  if (templates.length === 1) {
    if (isPlausibleSetScore(favorBudget, againstBudget)) {
      return [`${favorBudget}-${againstBudget}`];
    }
    return templates;
  }

  const last = templates[templates.length - 1];
  const prefix = templates.slice(0, -1);
  const prefixTotals = sumTemplateGames(prefix);
  const lastFavor = favorBudget - prefixTotals.favor;
  const lastAgainst = againstBudget - prefixTotals.against;

  if (isPlausibleSetScore(lastFavor, lastAgainst)) {
    return [...prefix, `${lastFavor}-${lastAgainst}`];
  }

  return templates.length > 1 ? templates : [last];
}

function buildKnockoutMatchScores(
  steps: KnockoutStep[],
  remainingFavor: number,
  remainingAgainst: number
): string[] {
  let favorLeft = Math.max(0, remainingFavor);
  let againstLeft = Math.max(0, remainingAgainst);

  return steps.map((step, index) => {
    const templates = getSetTemplatesForStep(step);
    const templateTotals = sumTemplateGames(templates);
    const isLast = index === steps.length - 1;
    const isSingleSet = templates.length === 1;

    let matchSets = templates;
    if (isSingleSet) {
      matchSets = fitTemplatesToBudget(templates, favorLeft, againstLeft);
    } else if (isLast) {
      matchSets = templates;
    } else if (
      favorLeft >= templateTotals.favor &&
      againstLeft >= templateTotals.against
    ) {
      matchSets = fitTemplatesToBudget(
        templates,
        templateTotals.favor,
        templateTotals.against
      );
    }

    const matchTotals = sumTemplateGames(matchSets);
    favorLeft = Math.max(0, favorLeft - matchTotals.favor);
    againstLeft = Math.max(0, againstLeft - matchTotals.against);

    return matchSets.join(", ");
  });
}

function inferKnockoutSteps(
  posicion: number | null,
  koWins: number,
  koLosses: number,
  faseEliminacion: string | null
): KnockoutStep[] {
  const fase = (faseEliminacion ?? "semifinal").toLowerCase();
  const startsAtQuarters =
    fase.includes("cuarto") ||
    fase.includes("quarter") ||
    fase.includes("octav");

  if (posicion === 1 && koWins >= 2 && koLosses === 0) {
    const steps: KnockoutStep[] = [];
    if (startsAtQuarters && koWins >= 3) {
      steps.push({ roundKey: "quarter", won: true });
    }
    steps.push({ roundKey: "semi", won: true }, { roundKey: "final", won: true });
    return steps.slice(Math.max(0, steps.length - koWins));
  }

  if (posicion === 2 && koLosses === 1) {
    const steps: KnockoutStep[] = [];
    if (startsAtQuarters) {
      steps.push({ roundKey: "quarter", won: true });
    }
    steps.push({ roundKey: "semi", won: true }, { roundKey: "final", won: false });
    return steps;
  }

  if (posicion === 3 && koLosses === 1) {
    const steps: KnockoutStep[] = [];
    if (startsAtQuarters) {
      steps.push({ roundKey: "quarter", won: true });
    }
    steps.push({ roundKey: "semi", won: false }, { roundKey: "third", won: true });
    return steps;
  }

  if (posicion === 4 && koWins === 1 && koLosses === 2) {
    if (startsAtQuarters) {
      return [
        { roundKey: "quarter", won: true },
        { roundKey: "semi", won: false },
        { roundKey: "third", won: false },
      ];
    }
    return [
      { roundKey: "semi", won: false },
      { roundKey: "third", won: false },
    ];
  }

  const steps: KnockoutStep[] = [];
  for (let i = 0; i < koWins; i++) {
    steps.push({
      roundKey:
        i === koWins - 1 && koLosses === 0
          ? "final"
          : startsAtQuarters && koWins >= 3 && i === 0
            ? "quarter"
            : "semi",
      won: true,
    });
  }
  for (let i = 0; i < koLosses; i++) {
    steps.push({
      roundKey: i === 0 && koWins > 0 ? "final" : "third",
      won: false,
    });
  }
  return steps;
}

function normalizeLugar(value: string | null | undefined): string {
  return value?.trim().toLowerCase() ?? "";
}

function isEliminatoriaLugar(metadata: ParticipacionMetadata): boolean {
  const lugar = normalizeLugar(metadata.lugar);
  return lugar.includes("eliminatoria") || lugar.includes("mejor 3");
}

function findPlayerBracketSlot(
  slots: BracketSlot[],
  playerPairId: string
): BracketSlot | null {
  for (const slot of slots) {
    if (slot.type === "team" && slot.qualifier?.parejaId === playerPairId) {
      return slot;
    }
  }
  return null;
}

function findFirstBracketOpponent(
  slots: BracketSlot[],
  playerPairId: string
): { opponentPairId: string | null; opponentLabel: string | null } {
  for (let index = 0; index < slots.length; index += 2) {
    const left = slots[index];
    const right = slots[index + 1];
    const leftId =
      left?.type === "team" ? (left.qualifier?.parejaId ?? null) : null;
    const rightId =
      right?.type === "team" ? (right.qualifier?.parejaId ?? null) : null;

    if (leftId === playerPairId && right?.type === "team") {
      return {
        opponentPairId: right.qualifier?.parejaId ?? null,
        opponentLabel: right.qualifier?.parejaLabel ?? null,
      };
    }
    if (rightId === playerPairId && left?.type === "team") {
      return {
        opponentPairId: left.qualifier?.parejaId ?? null,
        opponentLabel: left.qualifier?.parejaLabel ?? null,
      };
    }
  }

  return { opponentPairId: null, opponentLabel: null };
}

function buildEliminatoriaKnockoutSteps(
  metadata: ParticipacionMetadata,
  playerSlot: BracketSlot | null,
  koWins: number,
  koLosses: number
): KnockoutStep[] {
  const mejorTercero = Boolean(
    playerSlot?.qualifier?.isMejorTercero ||
      playerSlot?.qualifier?.posEnGrupo === 3 ||
      isEliminatoriaLugar(metadata)
  );

  if (koWins === 0 && koLosses === 1 && (mejorTercero || isEliminatoriaLugar(metadata))) {
    return [{ roundKey: "bestThird", won: false }];
  }

  if (koWins === 0 && koLosses === 1) {
    return [{ roundKey: "quarter", won: false }];
  }

  return [];
}

function opponentPairForStep(
  posicion: number | null,
  step: KnockoutStep,
  podium: TorneoPodium,
  bracketOpponentPairId: string | null
): string | null {
  if (step.roundKey === "bestThird" || step.roundKey === "quarter") {
    return bracketOpponentPairId;
  }

  const champ = podium.campeonPairId;
  const sub = podium.subcampeonPairId;
  const third = podium.pairByPosition.get(3) ?? null;
  const fourth = podium.pairByPosition.get(4) ?? null;

  if (!posicion || posicion > 4) return null;

  if (step.roundKey === "final") {
    if (posicion === 1) return sub;
    if (posicion === 2) return champ;
    return null;
  }

  if (step.roundKey === "third") {
    if (posicion === 3) return fourth;
    if (posicion === 4) return third;
    return null;
  }

  if (step.roundKey === "semi") {
    if (posicion === 1) return third;
    if (posicion === 2) return fourth;
    if (posicion === 3) return champ;
    if (posicion === 4) return sub;
  }

  return null;
}

interface ExpressParejaEmbed {
  id: string;
  player1_id: string | null;
  player2_id: string | null;
  player1_name: string | null;
  player2_name: string | null;
}

interface ExpressPairCatalog {
  labelsById: Map<string, string>;
  pairByLegacyId: Map<string, string>;
}

function unwrapParejaEmbed(
  embed: ExpressParejaEmbed | ExpressParejaEmbed[] | null | undefined
): ExpressParejaEmbed | null {
  if (!embed) return null;
  return Array.isArray(embed) ? (embed[0] ?? null) : embed;
}

async function loadExpressPairCatalog(
  torneoId: string
): Promise<ExpressPairCatalog> {
  const labelsById = new Map<string, string>();
  const pairByLegacyId = new Map<string, string>();
  const supabase = getSupabaseClient();
  if (!supabase) return { labelsById, pairByLegacyId };

  const registerPair = (pareja: ExpressParejaEmbed | null) => {
    if (!pareja?.id) return;
    labelsById.set(
      pareja.id,
      pairLabel(pareja.player1_name, pareja.player2_name)
    );
    if (pareja.player1_id) pairByLegacyId.set(pareja.player1_id, pareja.id);
    if (pareja.player2_id) pairByLegacyId.set(pareja.player2_id, pareja.id);
  };

  const { data: grupos } = await supabase
    .from("torneo_express_grupos")
    .select("id")
    .eq("torneo_id", torneoId);

  if (grupos?.length) {
    const { data: partidos } = await supabase
      .from("torneo_express_partidos")
      .select(
        `
        pareja_local:pareja_local_id ( id, player1_id, player2_id, player1_name, player2_name ),
        pareja_visitante:pareja_visitante_id ( id, player1_id, player2_id, player1_name, player2_name )
      `
      )
      .in(
        "grupo_id",
        grupos.map((row) => row.id as string)
      );

    for (const raw of partidos ?? []) {
      registerPair(
        unwrapParejaEmbed(
          raw.pareja_local as ExpressParejaEmbed | ExpressParejaEmbed[] | null
        )
      );
      registerPair(
        unwrapParejaEmbed(
          raw.pareja_visitante as
            | ExpressParejaEmbed
            | ExpressParejaEmbed[]
            | null
        )
      );
    }
  }

  const { data: torneo } = await supabase
    .from("torneo_express")
    .select("bracket_slots")
    .eq("id", torneoId)
    .maybeSingle();

  const slots = (torneo?.bracket_slots ?? []) as Array<{
    type?: string;
    qualifier?: { parejaId?: string; parejaLabel?: string };
  }>;

  for (const slot of slots) {
    const parejaId = slot.qualifier?.parejaId;
    const parejaLabelText = slot.qualifier?.parejaLabel?.trim();
    if (!parejaId || !parejaLabelText) continue;
    if (!labelsById.has(parejaId)) {
      labelsById.set(parejaId, parejaLabelText);
    }
  }

  return { labelsById, pairByLegacyId };
}

async function loadTorneoPodium(
  torneoId: string,
  catalog: ExpressPairCatalog
): Promise<TorneoPodium> {
  const supabase = getSupabaseClient();
  const podium: TorneoPodium = {
    campeonPairId: null,
    subcampeonPairId: null,
    pairByPosition: new Map(),
  };
  if (!supabase) return podium;

  const { data } = await supabase
    .from("jugador_participaciones")
    .select("metadata")
    .eq("evento_id", torneoId)
    .limit(1);

  const meta = (data?.[0]?.metadata ?? {}) as ParticipacionMetadata;
  podium.campeonPairId = meta.pareja_campeon_id ?? null;
  podium.subcampeonPairId = meta.pareja_subcampeon_id ?? null;

  return resolvePodiumPairs(torneoId, podium, catalog);
}

async function loadPairIdsByPosition(
  torneoId: string,
  legacyPlayerId: string,
  metadata: ParticipacionMetadata,
  catalog: ExpressPairCatalog
): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  if (metadata.campeon_torneo && metadata.pareja_campeon_id) {
    return metadata.pareja_campeon_id;
  }
  if (metadata.subcampeon_torneo && metadata.pareja_subcampeon_id) {
    return metadata.pareja_subcampeon_id;
  }

  const fromCatalog = catalog.pairByLegacyId.get(legacyPlayerId);
  if (fromCatalog) return fromCatalog;

  const { data: bracketRow } = await supabase
    .from("torneo_express")
    .select("bracket_slots")
    .eq("id", torneoId)
    .maybeSingle();

  const slots = (bracketRow?.bracket_slots ?? []) as Array<{
    type?: string;
    qualifier?: { parejaId?: string };
  }>;

  for (const slot of slots) {
    if (slot.type !== "team" || !slot.qualifier?.parejaId) continue;
    const parejaId = slot.qualifier.parejaId;
    const playerPairId = catalog.pairByLegacyId.get(legacyPlayerId);
    if (playerPairId === parejaId) return parejaId;
  }

  return catalog.pairByLegacyId.get(legacyPlayerId) ?? null;
}

async function loadPairLabels(
  torneoId: string,
  pairIds: string[],
  catalog: ExpressPairCatalog
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  if (!pairIds.length) return map;

  for (const pairId of pairIds) {
    const fromCatalog = catalog.labelsById.get(pairId);
    if (fromCatalog) map.set(pairId, fromCatalog);
  }

  const missing = pairIds.filter((id) => !map.has(id));
  if (!missing.length) return map;

  const supabase = getSupabaseClient();
  if (!supabase) return map;

  const { data } = await supabase
    .from("pairs")
    .select("id, player1_name, player2_name")
    .in("id", missing);

  for (const row of data ?? []) {
    map.set(
      row.id as string,
      pairLabel(row.player1_name as string, row.player2_name as string)
    );
  }

  return map;
}

async function resolvePodiumPairs(
  torneoId: string,
  podium: TorneoPodium,
  catalog: ExpressPairCatalog
): Promise<TorneoPodium> {
  if (podium.pairByPosition.has(3) && podium.pairByPosition.has(4)) {
    return podium;
  }

  const supabase = getSupabaseClient();
  if (!supabase) return podium;

  const { data: rows } = await supabase
    .from("jugador_participaciones")
    .select("jugador_id, metadata")
    .eq("evento_id", torneoId);

  const jugadorIds = (rows ?? []).map((row) => row.jugador_id as string);
  const { data: jugadores } = await supabase
    .from("riviera_jugadores")
    .select("id, legacy_player_id")
    .in("id", jugadorIds)
    .not("legacy_player_id", "is", null);

  const legacyByJugador = new Map(
    (jugadores ?? []).map((row) => [
      row.id as string,
      row.legacy_player_id as string,
    ])
  );

  const seenPairForPosition = new Map<number, string>();

  for (const row of rows ?? []) {
    const meta = (row.metadata ?? {}) as ParticipacionMetadata;
    const pos = meta.posicion_final;
    if (typeof pos !== "number" || (pos !== 3 && pos !== 4)) continue;

    const legacyId = legacyByJugador.get(row.jugador_id as string);
    if (!legacyId) continue;

    const pairId = catalog.pairByLegacyId.get(legacyId);
    if (!pairId) continue;

    if (!seenPairForPosition.has(pos)) {
      seenPairForPosition.set(pos, pairId);
    }
  }

  for (const [pos, pairId] of seenPairForPosition) {
    podium.pairByPosition.set(pos, pairId);
  }

  return podium;
}

interface EliminatoriaSetScore {
  local: number;
  visitante: number;
}

interface EliminatoriaPartidoRow {
  id: string;
  torneo_id: string;
  ronda: number;
  orden: number;
  pareja_local_id: string | null;
  pareja_visitante_id: string | null;
  puntos_local: number | null;
  puntos_visitante: number | null;
  ganador_id: string | null;
  estado: string;
  es_bye: boolean;
  created_at: string | null;
  programado_en: string | null;
  sets_resultado: EliminatoriaSetScore[] | null;
}

function eliminatoriaRoundLabel(
  ronda: number,
  faseEliminacion: string | null
): string {
  if (ronda === 90) return "3er lugar";
  if (ronda === 91) return "Mejor 3er lugar";

  const fase = (faseEliminacion ?? "semifinal").toLowerCase();
  const hasQuarters =
    fase.includes("cuarto") ||
    fase.includes("quarter") ||
    fase.includes("octav");

  if (hasQuarters) {
    if (ronda === 1) return "Cuartos de final";
    if (ronda === 2) return "Semifinal";
    if (ronda === 3) return "Final";
  } else {
    if (ronda === 1) return "Semifinal";
    if (ronda === 2) return "Final";
  }

  return `Eliminatoria · Ronda ${ronda}`;
}

function eliminatoriaSortKey(ronda: number, orden: number): number {
  const roundOrder = ronda === 90 ? 3.5 : ronda === 91 ? 0.5 : ronda;
  return roundOrder * 100 + orden;
}

function formatEliminatoriaScore(
  row: EliminatoriaPartidoRow,
  isLocal: boolean
): string {
  const sets = row.sets_resultado;
  if (sets?.length) {
    return sets
      .map((set) => {
        const my = isLocal ? set.local : set.visitante;
        const opp = isLocal ? set.visitante : set.local;
        return `${my}-${opp}`;
      })
      .join(", ");
  }

  const my = isLocal
    ? Number(row.puntos_local ?? 0)
    : Number(row.puntos_visitante ?? 0);
  const opp = isLocal
    ? Number(row.puntos_visitante ?? 0)
    : Number(row.puntos_local ?? 0);
  return `${my}-${opp}`;
}

/**
 * Lee partidos reales de eliminatoria desde torneo_express_eliminatoria_partidos.
 * Devuelve null si el torneo no tiene filas en esa tabla (fallback a reconstrucción).
 */
export async function fetchExpressEliminatoriaMatches(
  torneoId: string,
  legacyPlayerId: string,
  metadata: ParticipacionMetadata
): Promise<PlayerHistoryMatch[] | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data: rows, error } = await supabase
    .from("torneo_express_eliminatoria_partidos")
    .select(
      "id, torneo_id, ronda, orden, pareja_local_id, pareja_visitante_id, puntos_local, puntos_visitante, ganador_id, estado, es_bye, created_at, programado_en, sets_resultado"
    )
    .eq("torneo_id", torneoId)
    .eq("estado", "jugado");

  if (error) {
    console.error("fetchExpressEliminatoriaMatches:", error.message);
    return null;
  }
  if (!rows?.length) return null;

  const catalog = await loadExpressPairCatalog(torneoId);
  const playerPairId = await loadPairIdsByPosition(
    torneoId,
    legacyPlayerId,
    metadata,
    catalog
  );
  if (!playerPairId) return null;

  const { data: torneo } = await supabase
    .from("torneo_express")
    .select("fase_eliminacion")
    .eq("id", torneoId)
    .maybeSingle();

  const faseEliminacion = (torneo?.fase_eliminacion as string | null) ?? null;

  const playerRows = (rows as EliminatoriaPartidoRow[]).filter((row) => {
    if (row.es_bye) return false;
    return (
      row.pareja_local_id === playerPairId ||
      row.pareja_visitante_id === playerPairId
    );
  });

  if (!playerRows.length) return [];

  const opponentIds = [
    ...new Set(
      playerRows
        .map((row) => {
          const isLocal = row.pareja_local_id === playerPairId;
          return isLocal ? row.pareja_visitante_id : row.pareja_local_id;
        })
        .filter((id): id is string => Boolean(id))
    ),
  ];

  const labelMap = await loadPairLabels(torneoId, opponentIds, catalog);

  const matches = playerRows
    .map((row) => {
      const isLocal = row.pareja_local_id === playerPairId;
      const opponentPairId = isLocal
        ? row.pareja_visitante_id
        : row.pareja_local_id;

      return {
        id: row.id,
        round: eliminatoriaRoundLabel(row.ronda, faseEliminacion),
        opponentLabel: opponentPairId
          ? labelMap.get(opponentPairId) ??
            catalog.labelsById.get(opponentPairId) ??
            "Rival"
          : "Rival",
        score: formatEliminatoriaScore(row, isLocal),
        won: Boolean(row.ganador_id && row.ganador_id === playerPairId),
        sortDate:
          row.programado_en ??
          row.created_at ??
          "",
        sortKey: eliminatoriaSortKey(row.ronda, row.orden),
      };
    })
    .sort((a, b) => a.sortKey - b.sortKey)
    .map(({ sortKey: _sortKey, ...match }) => match);

  return matches;
}

export async function supplementExpressKnockoutMatches(
  torneoId: string,
  legacyPlayerId: string,
  groupMatches: PlayerHistoryMatch[],
  options: {
    metadata: ParticipacionMetadata;
    setsFavor: number | null;
    setsContra: number | null;
    torneoCreatedAt: string | null;
  }
): Promise<PlayerHistoryMatch[]> {
  const meta = options.metadata;
  const totalWins =
    meta.partidos_ganados ?? groupMatches.filter((match) => match.won).length;
  const totalLosses =
    meta.partidos_perdidos ??
    groupMatches.filter((match) => !match.won).length;
  const groupWins = groupMatches.filter((match) => match.won).length;
  const groupLosses = groupMatches.filter((match) => !match.won).length;

  const koWins = totalWins - groupWins;
  const koLosses = totalLosses - groupLosses;

  if (koWins + koLosses <= 0) {
    return groupMatches;
  }

  const posicion =
    typeof meta.posicion_final === "number" ? meta.posicion_final : null;

  const supabase = getSupabaseClient();
  if (!supabase) return groupMatches;

  const { data: torneo } = await supabase
    .from("torneo_express")
    .select(
      "fase_eliminacion, created_at, fase_grupos_finalizada_at, bracket_slots"
    )
    .eq("id", torneoId)
    .maybeSingle();

  const catalog = await loadExpressPairCatalog(torneoId);
  const bracketSlots = (torneo?.bracket_slots ?? []) as BracketSlot[];

  const playerPairId = await loadPairIdsByPosition(
    torneoId,
    legacyPlayerId,
    meta,
    catalog
  );
  const podium = await loadTorneoPodium(torneoId, catalog);

  if (!playerPairId) return groupMatches;

  const playerSlot = findPlayerBracketSlot(bracketSlots, playerPairId);
  const bracketOpponent = findFirstBracketOpponent(
    bracketSlots,
    playerPairId
  );

  let steps = buildEliminatoriaKnockoutSteps(meta, playerSlot, koWins, koLosses);
  if (!steps.length) {
    steps = inferKnockoutSteps(
      posicion,
      koWins,
      koLosses,
      (torneo?.fase_eliminacion as string | null) ?? null
    );
  }

  if (!steps.length) return groupMatches;

  const opponentPairIds = steps
    .map((step) =>
      opponentPairForStep(
        posicion,
        step,
        podium,
        bracketOpponent.opponentPairId
      )
    )
    .filter((id): id is string => Boolean(id));

  const labelMap = await loadPairLabels(
    torneoId,
    [...new Set(opponentPairIds)],
    catalog
  );

  const groupGames = sumGroupGames(groupMatches);
  const totalFavor = Number(options.setsFavor ?? 0);
  const totalAgainst = Number(options.setsContra ?? 0);
  const remainingFavor = Math.max(0, totalFavor - groupGames.favor);
  const remainingAgainst = Math.max(0, totalAgainst - groupGames.against);
  const scores = buildKnockoutMatchScores(
    steps,
    remainingFavor,
    remainingAgainst
  );

  const knockoutBaseDate =
    (torneo?.fase_grupos_finalizada_at as string | null) ??
    options.torneoCreatedAt ??
    groupMatches[groupMatches.length - 1]?.sortDate ??
    "";

  const knockoutMatches: PlayerHistoryMatch[] = steps.map((step, index) => {
    const opponentPairId = opponentPairForStep(
      posicion,
      step,
      podium,
      bracketOpponent.opponentPairId
    );
    const opponentFromBracket = bracketOpponent.opponentLabel?.trim();

    return {
      id: `ko-${torneoId}-${step.roundKey}-${index}`,
      round: ROUND_LABELS[step.roundKey],
      opponentLabel: opponentPairId
        ? labelMap.get(opponentPairId) ??
          opponentFromBracket ??
          catalog.labelsById.get(opponentPairId) ??
          "Rival"
        : opponentFromBracket ?? "Rival",
      score: scores[index] ?? (step.won ? "6-4" : "4-6"),
      won: step.won,
      sortDate: knockoutBaseDate
        ? `${knockoutBaseDate.slice(0, 19)}${String(index).padStart(4, "0")}`
        : "",
    };
  });

  return [...groupMatches, ...knockoutMatches];
}
