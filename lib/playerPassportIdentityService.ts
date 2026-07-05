import { getSupabaseClient } from "@/lib/supabaseClient";
import { isJugadorVisibleSitioOficial } from "@/lib/officialRankingVisibility";
import {
  isMissingRelationError,
  normalizeRivieraId,
  parseOfficialStatus,
  pickBoolean,
  pickString,
  seasonFromDate,
} from "@/lib/playerPassportRowUtils";
import { buildCanonicalPlayerProfileUrl } from "@/lib/playerPassportUrls";
import type {
  PlayerOfficialStatus,
  PlayerPassportIdentity,
} from "@/lib/types/playerPassport";

interface OrganizerAccessRow {
  clubName: string;
  organizerId: string | null;
  isRegistration: boolean;
}

export interface OfficialPlayerIdentityEmbed {
  riviera_id?: string | null;
  debut_at?: string | null;
  [key: string]: unknown;
}

function unwrapIdentityEmbed(
  embed:
    | OfficialPlayerIdentityEmbed
    | OfficialPlayerIdentityEmbed[]
    | null
    | undefined
): OfficialPlayerIdentityEmbed | null {
  if (!embed) return null;
  return Array.isArray(embed) ? (embed[0] ?? null) : embed;
}

function resolveStatusFromRow(
  row: Record<string, unknown> | null,
  fallbackOfficial: boolean
): PlayerOfficialStatus {
  const explicit =
    parseOfficialStatus(
      pickString(row, [
        "estado",
        "status",
        "player_status",
        "riviera_status",
        "tipo_jugador",
      ])
    ) ??
    (pickBoolean(row, ["is_official", "oficial_riviera", "es_oficial"])
      ? "OFICIAL_RIVIERA"
      : pickBoolean(row, ["is_local", "es_local"])
        ? "LOCAL"
        : null);

  if (explicit) return explicit;
  return fallbackOfficial ? "OFICIAL_RIVIERA" : "LOCAL";
}

async function fetchPublicRivieraId(
  jugadorId: string
): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc(
    "get_public_riviera_id_for_jugador",
    { p_jugador_id: jugadorId }
  );

  if (error) {
    if (!isMissingRelationError(error.message)) {
      console.error("fetchPublicRivieraId:", error.message);
    }
    return null;
  }

  return normalizeRivieraId(typeof data === "string" ? data : null);
}

export async function fetchPublicJugadorIdForRivieraId(
  rivieraId: string
): Promise<string | null> {
  const normalized = normalizeRivieraId(rivieraId);
  if (!normalized) return null;

  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase.rpc(
    "get_public_jugador_id_for_riviera_id",
    { p_riviera_id: normalized }
  );

  if (error) {
    if (!isMissingRelationError(error.message)) {
      console.error("fetchPublicJugadorIdForRivieraId:", error.message);
    }
    return null;
  }

  return typeof data === "string" && data.trim() ? data.trim() : null;
}

async function fetchIdentityEmbedFromJugador(
  jugadorId: string
): Promise<OfficialPlayerIdentityEmbed | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("riviera_jugadores")
    .select("riviera_official_player_identity ( riviera_id, debut_at )")
    .eq("id", jugadorId)
    .maybeSingle();

  if (error) {
    if (!isMissingRelationError(error.message)) {
      console.error("fetchIdentityEmbedFromJugador:", error.message);
    }
    return null;
  }

  const row = data as {
    riviera_official_player_identity?:
      | OfficialPlayerIdentityEmbed
      | OfficialPlayerIdentityEmbed[]
      | null;
  } | null;

  return unwrapIdentityEmbed(row?.riviera_official_player_identity);
}

async function fetchIdentityRow(
  jugadorId: string
): Promise<Record<string, unknown> | null> {
  const embed = await fetchIdentityEmbedFromJugador(jugadorId);
  if (!embed) return null;
  return embed as Record<string, unknown>;
}

async function fetchProfileLinkRow(
  jugadorId: string
): Promise<Record<string, unknown> | null> {
  const supabase = getSupabaseClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("riviera_official_player_profile_link")
    .select("*")
    .eq("riviera_jugador_id", jugadorId)
    .maybeSingle();

  if (error) {
    if (!isMissingRelationError(error.message)) {
      console.error("fetchProfileLinkRow:", error.message);
    }
    return null;
  }

  return (data as Record<string, unknown> | null) ?? null;
}

async function fetchOrganizerAccessRows(
  jugadorId: string
): Promise<OrganizerAccessRow[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("organizer_player_access")
    .select("*")
    .eq("jugador_id", jugadorId);

  if (error) {
    if (!isMissingRelationError(error.message)) {
      console.error("fetchOrganizerAccessRows:", error.message);
    }
    return [];
  }

  return (data ?? []).map((raw) => {
    const row = raw as Record<string, unknown>;
    return {
      clubName:
        pickString(row, [
          "club_name",
          "organizer_name",
          "nombre_organizador",
          "nombre_club",
          "club",
        ]) ?? "Club",
      organizerId: pickString(row, ["organizador_id", "organizer_id"]),
      isRegistration: Boolean(
        pickBoolean(row, [
          "is_registration",
          "es_registro",
          "registration",
          "is_primary",
        ])
      ),
    };
  });
}

async function fetchOrganizerName(organizerId: string): Promise<string | null> {
  const supabase = getSupabaseClient();
  if (!supabase || !organizerId.trim()) return null;

  for (const table of ["organizadores", "profiles", "users"]) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .eq("id", organizerId)
      .maybeSingle();

    if (error) {
      if (!isMissingRelationError(error.message)) {
        console.error(`fetchOrganizerName(${table}):`, error.message);
      }
      continue;
    }

    const row = data as Record<string, unknown> | null;
    const name = pickString(row, [
      "nombre",
      "name",
      "club_name",
      "nombre_club",
      "display_name",
      "business_name",
    ]);
    if (name) return name;
  }

  return null;
}

export async function fetchOrganizerNamesByIds(
  organizerIds: string[]
): Promise<Map<string, string>> {
  const map = new Map<string, string>();
  const unique = [...new Set(organizerIds.filter(Boolean))];
  await Promise.all(
    unique.map(async (id) => {
      const name = await fetchOrganizerName(id);
      if (name) map.set(id, name);
    })
  );
  return map;
}

export async function loadPlayerPassportIdentity(
  jugadorId: string,
  options: {
    registrationOrganizerId?: string | null;
    fallbackClubName?: string | null;
    fallbackDebutDate?: string | null;
    identityEmbed?: OfficialPlayerIdentityEmbed | null;
  } = {}
): Promise<PlayerPassportIdentity> {
  const embeddedIdentity = unwrapIdentityEmbed(options.identityEmbed);
  const [
    publicRivieraId,
    identityRow,
    profileLinkRow,
    accessRows,
    isOfficialVisible,
  ] = await Promise.all([
    fetchPublicRivieraId(jugadorId),
    embeddedIdentity
      ? Promise.resolve(embeddedIdentity as Record<string, unknown>)
      : fetchIdentityRow(jugadorId),
    fetchProfileLinkRow(jugadorId),
    fetchOrganizerAccessRows(jugadorId),
    isJugadorVisibleSitioOficial(jugadorId),
  ]);

  const rivieraId =
    publicRivieraId ??
    normalizeRivieraId(
      pickString(identityRow, [
        "riviera_id",
        "public_id",
        "codigo_riviera",
        "player_code",
      ])
    ) ??
    normalizeRivieraId(
      pickString(profileLinkRow, ["riviera_id", "public_id", "codigo_riviera"])
    );

  const registrationOrganizerId =
    pickString(identityRow, [
      "registration_organizer_id",
      "organizador_registro_id",
      "organizador_id",
    ]) ??
    pickString(profileLinkRow, [
      "registration_organizer_id",
      "organizador_registro_id",
    ]) ??
    options.registrationOrganizerId ??
    accessRows.find((row) => row.isRegistration)?.organizerId ??
    null;

  let registrationClubName =
    pickString(identityRow, [
      "registration_club_name",
      "club_registro",
      "club_name",
      "nombre_club",
    ]) ??
    pickString(profileLinkRow, [
      "registration_club_name",
      "club_registro",
      "club_name",
    ]) ??
    accessRows.find((row) => row.isRegistration)?.clubName ??
    options.fallbackClubName ??
    null;

  if (!registrationClubName && registrationOrganizerId) {
    registrationClubName = await fetchOrganizerName(registrationOrganizerId);
  }

  const debutDate =
    pickString(identityRow, [
      "debut_at",
      "debut_date",
      "fecha_debut",
      "riviera_debut_at",
      "created_at",
    ]) ??
    pickString(profileLinkRow, ["debut_at", "debut_date", "fecha_debut"]) ??
    options.fallbackDebutDate ??
    null;

  const debutSeason =
    pickString(identityRow, [
      "debut_season",
      "temporada_debut",
      "season_debut",
    ]) ??
    pickString(profileLinkRow, ["debut_season", "temporada_debut"]) ??
    seasonFromDate(debutDate);

  const status = resolveStatusFromRow(identityRow, isOfficialVisible);

  const canonicalProfileUrl =
    pickString(profileLinkRow, ["canonical_url", "profile_url"]) ??
    buildCanonicalPlayerProfileUrl(rivieraId);

  return {
    rivieraId,
    registrationClubName,
    registrationOrganizerId,
    debutDate: debutDate?.slice(0, 10) ?? null,
    debutSeason,
    status,
    canonicalProfileUrl,
  };
}

export function listActiveClubsFromAccess(
  accessRows: OrganizerAccessRow[]
): string[] {
  const names = new Set<string>();
  for (const row of accessRows) {
    if (row.clubName.trim()) names.add(row.clubName.trim());
  }
  return [...names];
}

export async function loadOrganizerAccessForPlayer(
  jugadorId: string
): Promise<OrganizerAccessRow[]> {
  return fetchOrganizerAccessRows(jugadorId);
}
