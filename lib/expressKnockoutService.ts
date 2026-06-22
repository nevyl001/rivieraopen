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

function sumGroupGames(matches: PlayerHistoryMatch[]): {
  favor: number;
  against: number;
} {
  let favor = 0;
  let against = 0;
  for (const match of matches) {
    const [myPts, oppPts] = match.score.split("-").map((value) => Number(value));
    if (Number.isFinite(myPts)) favor += myPts;
    if (Number.isFinite(oppPts)) against += oppPts;
  }
  return { favor, against };
}

function splitKnockoutScores(
  remainingFavor: number,
  remainingAgainst: number,
  results: boolean[]
): string[] {
  if (!results.length) return [];

  let favorLeft = Math.max(0, remainingFavor);
  let againstLeft = Math.max(0, remainingAgainst);
  const scores: string[] = [];

  for (let index = 0; index < results.length; index++) {
    const isLast = index === results.length - 1;
    const won = results[index];

    if (isLast) {
      scores.push(`${favorLeft}-${againstLeft}`);
      break;
    }

    let myGames = won ? 6 : 4;
    let oppGames = won ? 4 : 6;

    if (favorLeft - myGames < 0 || againstLeft - oppGames < 0) {
      myGames = Math.max(1, Math.min(favorLeft, won ? favorLeft : 4));
      oppGames = Math.max(1, Math.min(againstLeft, won ? 4 : againstLeft));
    }

    scores.push(`${myGames}-${oppGames}`);
    favorLeft -= myGames;
    againstLeft -= oppGames;
  }

  return scores;
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

  if (posicion === 2 && koWins === 1 && koLosses === 1) {
    return [
      { roundKey: "semi", won: true },
      { roundKey: "final", won: false },
    ];
  }

  if (posicion === 3 && koWins === 2 && koLosses === 1) {
    return [
      { roundKey: "semi", won: false },
      { roundKey: "third", won: true },
    ];
  }

  if (posicion === 4 && koWins === 1 && koLosses === 2) {
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
    if (posicion === 1) return fourth;
    if (posicion === 2) return third;
    if (posicion === 3) return sub;
    if (posicion === 4) return champ;
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
  const scores = splitKnockoutScores(
    remainingFavor,
    remainingAgainst,
    steps.map((step) => step.won)
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
