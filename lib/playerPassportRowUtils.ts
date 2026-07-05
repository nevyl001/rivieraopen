export function pickString(
  row: Record<string, unknown> | null | undefined,
  keys: string[]
): string | null {
  if (!row) return null;
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }
  return null;
}

export function pickNumber(
  row: Record<string, unknown> | null | undefined,
  keys: string[]
): number | null {
  if (!row) return null;
  for (const key of keys) {
    const value = row[key];
    if (value != null && Number.isFinite(Number(value))) {
      return Number(value);
    }
  }
  return null;
}

export function pickBoolean(
  row: Record<string, unknown> | null | undefined,
  keys: string[]
): boolean | null {
  if (!row) return null;
  for (const key of keys) {
    const value = row[key];
    if (typeof value === "boolean") return value;
    if (value === "true" || value === 1 || value === "1") return true;
    if (value === "false" || value === 0 || value === "0") return false;
  }
  return null;
}

export function isMissingRelationError(message: string | undefined): boolean {
  if (!message) return false;
  const lower = message.toLowerCase();
  return (
    lower.includes("does not exist") ||
    lower.includes("could not find") ||
    lower.includes("schema cache") ||
    lower.includes("relation")
  );
}

export function normalizeRivieraId(value: string | null | undefined): string | null {
  if (!value?.trim()) return null;
  const trimmed = value.trim().toUpperCase();
  if (/^RIV-\d+$/.test(trimmed)) return trimmed;
  if (/^\d+$/.test(trimmed)) {
    return `RIV-${trimmed.padStart(8, "0")}`;
  }
  return trimmed.startsWith("RIV-") ? trimmed : null;
}

export function parseOfficialStatus(
  raw: string | null | undefined
): "LOCAL" | "OFICIAL_RIVIERA" | null {
  if (!raw?.trim()) return null;
  const normalized = raw.trim().toUpperCase().replace(/\s+/g, "_");
  if (
    normalized === "OFICIAL" ||
    normalized === "OFICIAL_RIVIERA" ||
    normalized === "RIVIERA_OFICIAL"
  ) {
    return "OFICIAL_RIVIERA";
  }
  if (normalized === "LOCAL") return "LOCAL";
  return null;
}

export function seasonFromDate(date: string | null | undefined): string | null {
  if (!date?.trim()) return null;
  const year = date.trim().slice(0, 4);
  return /^\d{4}$/.test(year) ? year : null;
}
