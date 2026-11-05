import type { PassportHistoryEvent } from "@/lib/types/playerPassport";

/** Circuito Riviera: el mes se decide en hora de México, no en UTC. */
export const HISTORY_SPORT_TIME_ZONE = "America/Mexico_City";

/** Cuántas filas monta un mes abierto antes de pedir el resto. */
export const HISTORY_MONTH_PAGE_SIZE = 24;

export interface HistoryMonthGroup {
  key: string;
  year: number;
  month: number;
  events: PassportHistoryEvent[];
}

export interface GroupedPlayerHistory {
  years: number[];
  monthsByYear: Map<number, HistoryMonthGroup[]>;
  undated: PassportHistoryEvent[];
  participationCount: number;
  distinctEventCount: number;
}

function calendarParts(fecha: string): { year: number; month: number } | null {
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(fecha.trim());
  if (dateOnly) {
    const month = Number(dateOnly[2]);
    if (month < 1 || month > 12) return null;
    return { year: Number(dateOnly[1]), month };
  }

  const parsed = new Date(fecha);
  if (Number.isNaN(parsed.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: HISTORY_SPORT_TIME_ZONE,
    year: "numeric",
    month: "2-digit",
  }).formatToParts(parsed);
  const year = Number(parts.find((part) => part.type === "year")?.value);
  const month = Number(parts.find((part) => part.type === "month")?.value);
  if (!year || month < 1 || month > 12) return null;
  return { year, month };
}

/**
 * Agrupa el historial ya cargado. No consulta ni reordena resultados:
 * dentro de cada mes se conserva el orden de entrada (más reciente primero).
 */
export function groupPlayerHistory(
  events: PassportHistoryEvent[]
): GroupedPlayerHistory {
  const monthsByYear = new Map<number, Map<number, PassportHistoryEvent[]>>();
  const undated: PassportHistoryEvent[] = [];
  const eventIds = new Set<string>();
  let everyEventHasId = events.length > 0;

  for (const event of events) {
    const eventId = event.eventoId?.trim() ?? "";
    if (!eventId) everyEventHasId = false;
    else eventIds.add(eventId);
    const parts = event.fecha ? calendarParts(event.fecha) : null;
    if (!parts) {
      undated.push(event);
      continue;
    }
    const yearMonths = monthsByYear.get(parts.year) ?? new Map();
    const bucket = yearMonths.get(parts.month) ?? [];
    bucket.push(event);
    yearMonths.set(parts.month, bucket);
    monthsByYear.set(parts.year, yearMonths);
  }

  const years = [...monthsByYear.keys()].sort((a, b) => b - a);
  const groupedMonths = new Map<number, HistoryMonthGroup[]>();

  for (const year of years) {
    const months = [...(monthsByYear.get(year)?.entries() ?? [])]
      .sort((a, b) => b[0] - a[0])
      .map(([month, monthEvents]) => ({
        key: `${year}-${String(month).padStart(2, "0")}`,
        year,
        month,
        events: [...monthEvents].sort((a, b) =>
          (b.fecha ?? "").localeCompare(a.fecha ?? "")
        ),
      }));
    groupedMonths.set(year, months);
  }

  return {
    years,
    monthsByYear: groupedMonths,
    undated,
    participationCount: events.length,
    distinctEventCount: everyEventHasId ? eventIds.size : 0,
  };
}
