const DEFAULT_SITE_ORIGIN = "https://rivieraopen.com";

export function getSiteOrigin(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (configured) return configured.replace(/\/$/, "");
  return DEFAULT_SITE_ORIGIN;
}

export function buildCanonicalPlayerProfileUrl(
  rivieraId: string | null | undefined
): string | null {
  const normalized = rivieraId?.trim().toUpperCase();
  if (!normalized || !normalized.startsWith("RIV-")) return null;
  return `${getSiteOrigin()}/player/${normalized}`;
}

export function buildLegacyPlayerProfileUrl(playerId: string): string {
  return `${getSiteOrigin()}/players/${playerId}`;
}

export function resolveShareProfileUrl(
  playerId: string,
  rivieraId: string | null | undefined
): string {
  return buildCanonicalPlayerProfileUrl(rivieraId) ?? buildLegacyPlayerProfileUrl(playerId);
}
