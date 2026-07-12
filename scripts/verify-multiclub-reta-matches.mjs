/**
 * Verifica que el fallback multiclub resuelve partidos por nombre.
 * Uso: node scripts/verify-multiclub-reta-matches.mjs
 */
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

for (const line of readFileSync(resolve(root, ".env.local"), "utf8").split("\n")) {
  const t = line.trim();
  if (!t || t.startsWith("#")) continue;
  const eq = t.indexOf("=");
  if (eq === -1) continue;
  let k = t.slice(0, eq).trim();
  let v = t.slice(eq + 1).trim();
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1);
  }
  if (!process.env[k]) process.env[k] = v;
}

const { fetchRetaMatchesForEvent } = await import(
  pathToFileURL(resolve(root, "lib/retaHistoryService.ts")).href
).catch(async () => {
  // Fallback: inline minimal check via supabase only
  return { fetchRetaMatchesForEvent: null };
});

if (!fetchRetaMatchesForEvent) {
  console.error("No se pudo importar fetchRetaMatchesForEvent (usar tsx)");
  process.exit(1);
}

const HACK_LEGACY = "9875dbfe-5c4d-47aa-bb29-c25c766646cc"; // Poncho club registro
const EVENT_MIXTA = "90baf74c-8e9c-4a8b-8b4b-ec7fc4b827ca";
const EVENT_HACK = "9689bebb-c6a1-4bfe-bc05-d7dd2643b6a8";

for (const [label, eventId] of [
  ["Reta Mixta (Riviera Open)", EVENT_MIXTA],
  ["HACK THE GAME (Riviera Open)", EVENT_HACK],
]) {
  const withoutName = await fetchRetaMatchesForEvent(
    eventId,
    HACK_LEGACY,
    {},
    null,
    null,
    "2026-07-11"
  );
  const withName = await fetchRetaMatchesForEvent(
    eventId,
    HACK_LEGACY,
    {},
    null,
    null,
    "2026-07-11",
    { playerName: "Poncho G" }
  );
  console.log(label, {
    soloLegacyClubRegistro: withoutName.length,
    conNombreMulticlub: withName.length,
    rivals: withName.map((p) => `${p.round}: vs ${p.opponentLabel} ${p.score}`),
  });
}
