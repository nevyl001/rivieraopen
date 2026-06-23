import { getSupabaseClient } from "@/lib/supabaseClient";

export interface Duelo2v2SetDetalle {
  a: number;
  b: number;
}

export interface Duelo2v2ScoreRow {
  id: string;
  detalle_sets: Duelo2v2SetDetalle[];
  sets_pareja_a: number;
  sets_pareja_b: number;
  pareja_a_j1_id: string | null;
  pareja_a_j2_id: string | null;
  pareja_b_j1_id: string | null;
  pareja_b_j2_id: string | null;
}

export function parseDetalleSets(raw: unknown): Duelo2v2SetDetalle[] {
  if (!Array.isArray(raw)) return [];
  const out: Duelo2v2SetDetalle[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const a = Number(row.a);
    const b = Number(row.b);
    if (!Number.isFinite(a) || !Number.isFinite(b)) continue;
    if (a <= 0 && b <= 0) continue;
    out.push({ a, b });
  }
  return out;
}

function isPlayerOnParejaA(
  duelo: Duelo2v2ScoreRow,
  jugadorId: string
): boolean {
  return (
    duelo.pareja_a_j1_id === jugadorId ||
    duelo.pareja_a_j2_id === jugadorId
  );
}

/** Marcador legible por sets (ej. "6-3, 6-3") desde la perspectiva del jugador. */
export function formatDueloMarcador(
  duelo: Duelo2v2ScoreRow,
  jugadorId: string
): string | null {
  const esParejaA = isPlayerOnParejaA(duelo, jugadorId);
  const detalle = duelo.detalle_sets;

  if (detalle.length > 0) {
    const parts = detalle.map((row) => {
      const favor = esParejaA ? row.a : row.b;
      const contra = esParejaA ? row.b : row.a;
      return `${favor}-${contra}`;
    });
    if (parts.length > 0) return parts.join(", ");
  }

  const setsFavor = esParejaA ? duelo.sets_pareja_a : duelo.sets_pareja_b;
  const setsContra = esParejaA ? duelo.sets_pareja_b : duelo.sets_pareja_a;
  if (setsFavor > 0 || setsContra > 0) {
    return `${setsFavor}-${setsContra} sets`;
  }

  return null;
}

export async function fetchDuelosScoreMap(
  dueloIds: string[]
): Promise<Map<string, Duelo2v2ScoreRow>> {
  const map = new Map<string, Duelo2v2ScoreRow>();
  if (!dueloIds.length) return map;

  const supabase = getSupabaseClient();
  if (!supabase) return map;

  const { data, error } = await supabase
    .from("duelos_2v2")
    .select(
      "id, detalle_sets, sets_pareja_a, sets_pareja_b, pareja_a_j1_id, pareja_a_j2_id, pareja_b_j1_id, pareja_b_j2_id"
    )
    .in("id", dueloIds);

  if (error) {
    console.error("fetchDuelosScoreMap:", error.message);
    return map;
  }

  for (const row of data ?? []) {
    const r = row as Record<string, unknown>;
    map.set(String(r.id), {
      id: String(r.id),
      detalle_sets: parseDetalleSets(r.detalle_sets),
      sets_pareja_a: Number(r.sets_pareja_a ?? 0),
      sets_pareja_b: Number(r.sets_pareja_b ?? 0),
      pareja_a_j1_id: r.pareja_a_j1_id ? String(r.pareja_a_j1_id) : null,
      pareja_a_j2_id: r.pareja_a_j2_id ? String(r.pareja_a_j2_id) : null,
      pareja_b_j1_id: r.pareja_b_j1_id ? String(r.pareja_b_j1_id) : null,
      pareja_b_j2_id: r.pareja_b_j2_id ? String(r.pareja_b_j2_id) : null,
    });
  }

  return map;
}
