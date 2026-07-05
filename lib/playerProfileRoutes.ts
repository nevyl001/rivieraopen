import {
  fetchPublicJugadorIdForRivieraId,
} from "@/lib/playerPassportIdentityService";
import { normalizeRivieraId } from "@/lib/playerPassportRowUtils";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isPlayerProfileUuid(value: string): boolean {
  return UUID_RE.test(value.trim());
}

export function buildPlayerProfilePath(
  playerId: string,
  rivieraId?: string | null
): string {
  const normalized = normalizeRivieraId(rivieraId);
  if (normalized) return `/player/${normalized}`;
  return `/players/${playerId}`;
}

export async function resolveJugadorIdFromProfileParam(
  param: string
): Promise<string | null> {
  const trimmed = param.trim();
  if (!trimmed) return null;

  if (isPlayerProfileUuid(trimmed)) return trimmed;

  const rivieraId = normalizeRivieraId(trimmed);
  if (!rivieraId) return null;

  return fetchPublicJugadorIdForRivieraId(rivieraId);
}
