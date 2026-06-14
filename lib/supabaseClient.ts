import { createClient, SupabaseClient } from "@supabase/supabase-js";

const PLACEHOLDER_KEYS = new Set([
  "pega_aqui_tu_anon_key",
  "your_anon_key",
  "tu_anon_key",
]);

function getSupabaseConfig() {
  const url =
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ??
    process.env.VITE_SUPABASE_URL?.trim();
  const anonKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim() ??
    process.env.VITE_SUPABASE_ANON_KEY?.trim();

  return { url, anonKey };
}

function isValidConfig(url?: string, anonKey?: string): boolean {
  if (!url || !anonKey) return false;
  if (!url.startsWith("https://") || !url.includes("supabase.co")) return false;
  if (PLACEHOLDER_KEYS.has(anonKey)) return false;
  return anonKey.length > 20;
}

let client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  const { url, anonKey } = getSupabaseConfig();

  if (!isValidConfig(url, anonKey)) {
    console.error(
      "Supabase: configura NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en .env.local"
    );
    return null;
  }

  if (!client) {
    client = createClient(url!, anonKey!);
  }

  return client;
}
