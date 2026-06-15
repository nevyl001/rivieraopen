/**
 * Inserta la galería Padelito 13-jun-2026 en Supabase.
 *
 * Requiere en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL=...
 *   SUPABASE_SERVICE_ROLE_KEY=...  (Settings → API en Supabase)
 *
 * Uso: node scripts/seed-galeria-padelito.mjs
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

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
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  console.error(
    "Falta NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local",
  );
  console.error(
    "O ejecuta el SQL en Supabase: supabase/seed_galeria_padelito_2026-06-13.sql",
  );
  process.exit(1);
}

const body = {
  evento_nombre: "Riviera Open Rush Series - Padelito Warehouse",
  evento_fecha: "2026-06-13",
  evento_lugar: "Padelito Warehouse, Ciudad de México",
  portada_url:
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781493570/final_hwb3g3.png",
  fotos: [
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781493570/final_hwb3g3.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781493570/tercer_nxssoh.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781489107/ChatGPT_Image_14_jun_2026_03_27_00_p.m._etfwxt.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781489105/ChatGPT_Image_14_jun_2026_03_28_47_p.m._sueeud.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781489103/ChatGPT_Image_14_jun_2026_03_24_51_p.m._zbdu4y.png",
    "https://res.cloudinary.com/dkqiutbvn/image/upload/v1781489101/ChatGPT_Image_14_jun_2026_03_25_57_p.m._bs3xtl.png",
  ],
};

const res = await fetch(`${url}/rest/v1/galeria_eventos`, {
  method: "POST",
  headers: {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  },
  body: JSON.stringify(body),
});

const text = await res.text();
if (!res.ok) {
  console.error("Error:", res.status, text);
  process.exit(1);
}

console.log("Galería creada:", text);
