/**
 * Verifica que el historial de retas/torneos cuadre con metadata vs partidos leídos.
 * Uso: node scripts/verify-player-history.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(root, ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const value = trimmed.slice(eq + 1).trim();
      if (!process.env[key]) process.env[key] = value;
    }
  } catch {
    // ignore
  }
}

loadEnvLocal();

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ORG = process.env.NEXT_PUBLIC_RANKING_ORGANIZADOR_ID?.trim() ||
  "2770b522-9064-4c7b-a729-4a0ea7e3f6e8";

if (!url || !key) {
  console.error("Falta .env.local con Supabase");
  process.exit(1);
}

const sb = createClient(url, key);

async function fetchRetaPartidos(retaId, legacyPlayerId, metadata) {
  if (!legacyPlayerId) return { source: "none", partidos: [] };

  const detail = metadata?.partidos_detalle;
  if (
    metadata?.subtipo === "reta_cierre" &&
    Array.isArray(detail) &&
    detail.length
  ) {
    return { source: "partidos_detalle", partidos: detail };
  }

  const { data: pairs } = await sb
    .from("pairs")
    .select("id")
    .eq("tournament_id", retaId)
    .or(`player1_id.eq.${legacyPlayerId},player2_id.eq.${legacyPlayerId}`);

  if (!pairs?.length) return { source: "no_pairs", partidos: [] };

  const pairIds = pairs.map((r) => r.id).join(",");
  const { data: matches } = await sb
    .from("matches")
    .select("id, round, pair1_name, pair2_name, pair1_id, pair2_id, games(pair1_games,pair2_games)")
    .eq("tournament_id", retaId)
    .eq("status", "finished")
    .or(`pair1_id.in.(${pairIds}),pair2_id.in.(${pairIds})`)
    .order("round");

  if (matches?.length) return { source: "matches", partidos: matches };

  return { source: "solo_resumen", partidos: [] };
}

async function main() {
  const { data: orgTorneos } = await sb
    .from("torneo_express")
    .select("id")
    .eq("organizador_id", ORG);
  const orgTorneoIds = new Set((orgTorneos ?? []).map((t) => t.id));

  const { data: participaciones } = await sb
    .from("jugador_participaciones")
    .select("id, jugador_id, tipo_evento, evento_id, metadata, sets_favor, sets_contra")
    .order("fecha", { ascending: false });

  const jugadorIds = [...new Set((participaciones ?? []).map((p) => p.jugador_id))];
  const { data: jugadores } = await sb
    .from("riviera_jugadores")
    .select("id, nombre, legacy_player_id")
    .in("id", jugadorIds);

  const jugadorMap = new Map((jugadores ?? []).map((j) => [j.id, j]));

  const retaRows = [];
  const expressRows = [];

  for (const row of participaciones ?? []) {
    if (row.metadata?.subtipo === "ajuste_manual") continue;
    if (row.tipo_evento === "torneo_express" && !orgTorneoIds.has(row.evento_id)) continue;
    if (row.tipo_evento === "reta" && row.metadata?.subtipo === "reta_cierre") {
      retaRows.push(row);
    }
    if (row.tipo_evento === "torneo_express") {
      expressRows.push(row);
    }
  }

  console.log("=== RETAS (reta_cierre) ===");
  console.log("Participaciones:", retaRows.length);

  let retaOk = 0;
  let retaResumen = 0;
  let retaMismatch = 0;
  const retaIssues = [];

  for (const row of retaRows) {
    const j = jugadorMap.get(row.jugador_id);
    const meta = row.metadata ?? {};
    const expected =
      Number(meta.partidos_ganados ?? 0) +
      Number(meta.partidos_perdidos ?? 0) +
      Number(meta.partidos_empatados ?? 0);

    const { source, partidos } = await fetchRetaPartidos(
      row.evento_id,
      j?.legacy_player_id,
      meta
    );
    const got = partidos.length;

    if (got > 0 && expected > 0 && got === expected) {
      retaOk++;
    } else if (got > 0 && expected > 0 && got !== expected) {
      retaMismatch++;
      retaIssues.push({
        jugador: j?.nombre,
        reta: meta.reta_nombre,
        evento: row.evento_id.slice(0, 8),
        expected,
        got,
        source,
      });
    } else if (got === 0 && expected > 0) {
      retaResumen++;
      retaIssues.push({
        jugador: j?.nombre,
        reta: meta.reta_nombre,
        evento: row.evento_id.slice(0, 8),
        expected,
        got: 0,
        source,
      });
    } else if (got > 0) {
      retaOk++;
    }
  }

  console.log("Con detalle completo:", retaOk);
  console.log("Solo resumen (sin partidos en DB):", retaResumen);
  console.log("Mismatch conteo:", retaMismatch);

  if (retaIssues.length) {
    console.log("\nDetalle retas sin partidos o mismatch:");
    for (const i of retaIssues.slice(0, 15)) {
      console.log(`  ${i.jugador} | ${i.reta} | esperado ${i.expected} | leído ${i.got} | ${i.source ?? "solo_resumen"}`);
    }
    if (retaIssues.length > 15) console.log(`  ... +${retaIssues.length - 15} más`);
  }

  console.log("\n=== TORNEOS EXPRESS ===");
  console.log("Participaciones:", expressRows.length);

  let expressOk = 0;
  let expressEmpty = 0;
  const expressIssues = [];

  for (const row of expressRows.slice(0, 80)) {
    const j = jugadorMap.get(row.jugador_id);
    const legacy = j?.legacy_player_id;
    if (!legacy) continue;

    const meta = row.metadata ?? {};
    const expected =
      Number(meta.partidos_ganados ?? 0) +
      Number(meta.partidos_perdidos ?? 0) +
      Number(meta.partidos_empatados ?? 0);

    const { data: grupos } = await sb
      .from("torneo_express_grupos")
      .select("id")
      .eq("torneo_id", row.evento_id);

    let groupCount = 0;
    for (const g of grupos ?? []) {
      const { data: partidos } = await sb
        .from("torneo_express_partidos")
        .select("id, pareja_local_id, pareja_visitante_id, pareja_local:pareja_local_id(player1_id,player2_id), pareja_visitante:pareja_visitante_id(player1_id,player2_id)")
        .eq("grupo_id", g.id);
      for (const p of partidos ?? []) {
        const loc = Array.isArray(p.pareja_local) ? p.pareja_local[0] : p.pareja_local;
        const vis = Array.isArray(p.pareja_visitante) ? p.pareja_visitante[0] : p.pareja_visitante;
        if (loc?.player1_id === legacy || loc?.player2_id === legacy || vis?.player1_id === legacy || vis?.player2_id === legacy) {
          groupCount++;
        }
      }
    }

    const { data: elim } = await sb
      .from("torneo_express_eliminatoria_partidos")
      .select("id, pareja_local_id, pareja_visitante_id")
      .eq("torneo_id", row.evento_id);

    let elimCount = 0;
    for (const e of elim ?? []) {
      const { data: pl } = await sb.from("torneo_express_parejas").select("player1_id,player2_id").eq("id", e.pareja_local_id).maybeSingle();
      const { data: pv } = await sb.from("torneo_express_parejas").select("player1_id,player2_id").eq("id", e.pareja_visitante_id).maybeSingle();
      if ([pl, pv].some(p => p?.player1_id === legacy || p?.player2_id === legacy)) elimCount++;
    }

    const got = groupCount + elimCount;
    if (got > 0) expressOk++;
    else if (expected > 0) {
      expressEmpty++;
      expressIssues.push({ jugador: j?.nombre, torneo: meta.torneo_nombre || meta.evento_nombre, expected, got });
    }
  }

  console.log("Con partidos leídos (muestra):", expressOk);
  console.log("Sin partidos en muestra:", expressEmpty);
  if (expressIssues.length) {
    console.log("Express sin detalle (muestra):", expressIssues.slice(0, 5));
  }

  console.log("\n=== RESUMEN ===");
  const withDetail = retaRows.filter(r => r.metadata?.partidos_detalle?.length).length;
  console.log("partidos_detalle en DB:", withDetail, "/", retaRows.length);
  const { count: matchRetas } = await sb.from("matches").select("tournament_id", { count: "exact", head: true }).eq("status", "finished");
  console.log("\nConclusión:");
  if (retaResumen > 0 && withDetail === 0) {
    console.log("- Retas: lectura OK donde hay matches; el resto solo resumen hasta backfill en app.");
  }
  if (retaOk > 0) {
    console.log(`- ${retaOk} participaciones reta con detalle correcto.`);
  }
  if (retaMismatch > 0) {
    console.log(`- ${retaMismatch} retas con conteo distinto — revisar.`);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
