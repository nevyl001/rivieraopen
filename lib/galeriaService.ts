import { getSupabaseClient } from "@/lib/supabaseClient";
import { GaleriaEvento } from "@/lib/types/galeria";

export interface FeaturedGalleryPhoto {
  id: string;
  url: string;
  eventoId: string;
  eventoNombre: string;
  eventoFecha: string | null;
  eventoLugar: string | null;
}

interface GaleriaEventoRow {
  id: string;
  evento_nombre: string;
  evento_fecha: string | null;
  evento_lugar: string | null;
  portada_url: string | null;
  fotos: unknown;
  created_at: string;
}

function optimizeCloudinaryUrl(url: string, width = 900): string {
  if (!url.includes("res.cloudinary.com")) return url;

  const uploadMarker = "/upload/";
  const uploadIndex = url.indexOf(uploadMarker);
  if (uploadIndex === -1) return url;

  const afterUpload = url.slice(uploadIndex + uploadMarker.length);
  if (/^(f_|w_|c_|q_|g_)/.test(afterUpload)) return url;

  return `${url.slice(0, uploadIndex + uploadMarker.length)}f_auto,q_auto,w_${width}/${afterUpload}`;
}

function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:") return false;
    if (parsed.hostname === "console.cloudinary.com") return false;
    return (
      parsed.hostname === "res.cloudinary.com" ||
      /\.(jpg|jpeg|png|webp|avif|gif)(\?|$)/i.test(parsed.pathname)
    );
  } catch {
    return false;
  }
}

function normalizeFotos(fotos: unknown): string[] {
  if (!Array.isArray(fotos)) return [];

  return fotos
    .map((item) => {
      if (typeof item === "string" && item.trim()) return item.trim();
      if (item && typeof item === "object" && "url" in item) {
        const url = (item as { url?: string }).url;
        return typeof url === "string" ? url.trim() : null;
      }
      return null;
    })
    .filter((url): url is string => Boolean(url && isValidImageUrl(url)))
    .map((url) => optimizeCloudinaryUrl(url));
}

function resolvePortadaUrl(
  portada_url: string | null,
  fotos: string[]
): string | null {
  if (portada_url && isValidImageUrl(portada_url)) {
    return optimizeCloudinaryUrl(portada_url);
  }
  return fotos[0] ? optimizeCloudinaryUrl(fotos[0]) : null;
}

function mapRowToEvento(row: GaleriaEventoRow): GaleriaEvento {
  const fotos = normalizeFotos(row.fotos);

  return {
    id: row.id,
    evento_nombre: row.evento_nombre,
    evento_fecha: row.evento_fecha,
    evento_lugar: row.evento_lugar,
    portada_url: resolvePortadaUrl(row.portada_url, fotos),
    fotos,
    created_at: row.created_at,
  };
}

/**
 * Todos los eventos de galería ordenados por fecha (más reciente primero).
 */
export async function getEventos(): Promise<GaleriaEvento[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("galeria_eventos")
    .select(
      "id, evento_nombre, evento_fecha, evento_lugar, portada_url, fotos, created_at"
    )
    .order("evento_fecha", { ascending: false, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getEventos:", error.message);
    return [];
  }

  return (data as GaleriaEventoRow[]).map(mapRowToEvento);
}

/**
 * Un evento por ID con todas sus fotos.
 */
export async function getEventoById(id: string): Promise<GaleriaEvento | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("galeria_eventos")
    .select(
      "id, evento_nombre, evento_fecha, evento_lugar, portada_url, fotos, created_at"
    )
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("getEventoById:", error.message);
    return null;
  }

  if (!data) return null;

  return mapRowToEvento(data as GaleriaEventoRow);
}

/**
 * Fotos destacadas para el home (hasta `limit` imágenes de eventos recientes).
 */
/**
 * Un evento = una tarjeta en el home (portada o primera foto válida).
 */
export async function getFeaturedGalleryPhotos(
  limit = 3
): Promise<FeaturedGalleryPhoto[]> {
  const eventos = await getEventos();
  const photos: FeaturedGalleryPhoto[] = [];

  for (const evento of eventos) {
    const url = evento.portada_url || evento.fotos[0];
    if (!url) continue;

    photos.push({
      id: `${evento.id}-cover`,
      url,
      eventoId: evento.id,
      eventoNombre: evento.evento_nombre,
      eventoFecha: evento.evento_fecha,
      eventoLugar: evento.evento_lugar,
    });

    if (photos.length >= limit) {
      break;
    }
  }

  return photos;
}
