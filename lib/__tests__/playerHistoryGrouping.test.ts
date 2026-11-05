import type { PassportHistoryEvent } from "@/lib/types/playerPassport";
import { groupPlayerHistory } from "@/lib/playerHistoryGrouping";

function event(
  partial: Partial<PassportHistoryEvent> & Pick<PassportHistoryEvent, "id">
): PassportHistoryEvent {
  return {
    eventoId: partial.eventoId ?? partial.id,
    tipoEvento: partial.tipoEvento ?? "liga",
    nombre: partial.nombre ?? partial.id,
    fecha: partial.fecha ?? null,
    categoria: null,
    posicionFinal: partial.posicionFinal ?? null,
    puntosGanados: partial.puntosGanados ?? 0,
    partidosGanados: null,
    partidosPerdidos: null,
    partidosEmpatados: null,
    partidos: [],
    ...partial,
  };
}

describe("groupPlayerHistory", () => {
  it("returns no years when there is no history", () => {
    const grouped = groupPlayerHistory([]);
    expect(grouped.years).toEqual([]);
    expect(grouped.participationCount).toBe(0);
    expect(grouped.distinctEventCount).toBe(0);
  });

  it("keeps a single participation in its month", () => {
    const grouped = groupPlayerHistory([
      event({ id: "a", fecha: "2026-11-02", tipoEvento: "reta" }),
    ]);
    expect(grouped.years).toEqual([2026]);
    expect(grouped.monthsByYear.get(2026)?.map((month) => month.month)).toEqual([
      11,
    ]);
    expect(grouped.monthsByYear.get(2026)?.[0].events).toHaveLength(1);
  });

  it("groups several participations in the same month without dropping any", () => {
    const grouped = groupPlayerHistory([
      event({ id: "a", fecha: "2026-10-20", tipoEvento: "americano", puntosGanados: 130 }),
      event({ id: "b", fecha: "2026-10-05", tipoEvento: "liga", puntosGanados: 0 }),
      event({ id: "c", fecha: "2026-10-26", tipoEvento: "liga", puntosGanados: 50 }),
    ]);
    const october = grouped.monthsByYear.get(2026)?.[0];
    expect(october?.month).toBe(10);
    expect(october?.events.map((item) => item.id)).toEqual(["c", "a", "b"]);
    expect(october?.events.map((item) => item.puntosGanados)).toEqual([50, 130, 0]);
  });

  it("lists only years with activity, newest first, and months newest first", () => {
    const grouped = groupPlayerHistory([
      event({ id: "old", fecha: "2025-01-10" }),
      event({ id: "mid", fecha: "2026-03-01", tipoEvento: "torneo_express" }),
      event({ id: "new", fecha: "2026-11-02", tipoEvento: "americano" }),
    ]);
    expect(grouped.years).toEqual([2026, 2025]);
    expect(grouped.monthsByYear.get(2026)?.map((month) => month.key)).toEqual([
      "2026-11",
      "2026-03",
    ]);
    expect(grouped.monthsByYear.get(2025)?.map((month) => month.month)).toEqual([1]);
  });

  it("does not shift a date-only day into the previous month via UTC", () => {
    const grouped = groupPlayerHistory([
      event({ id: "edge", fecha: "2026-11-01" }),
    ]);
    expect(grouped.monthsByYear.get(2026)?.[0].month).toBe(11);
  });

  it("places an ISO timestamp in the Mexico sports timezone", () => {
    const grouped = groupPlayerHistory([
      event({ id: "utc", fecha: "2026-11-01T04:30:00.000Z" }),
    ]);
    expect(grouped.monthsByYear.get(2026)?.[0].month).toBe(10);
  });

  it("counts participations and distinct events from the full list", () => {
    const grouped = groupPlayerHistory([
      event({ id: "a", eventoId: "same", fecha: "2026-10-01" }),
      event({ id: "b", eventoId: "same", fecha: "2026-10-02" }),
      event({ id: "c", eventoId: "other", fecha: "2025-05-01", tipoEvento: "reta" }),
    ]);
    expect(grouped.participationCount).toBe(3);
    expect(grouped.distinctEventCount).toBe(2);
  });

  it("omits the distinct-event count when an event id is missing", () => {
    const grouped = groupPlayerHistory([
      event({ id: "a", eventoId: "same", fecha: "2026-10-01" }),
      event({ id: "b", eventoId: "  ", fecha: "2026-10-02" }),
    ]);
    expect(grouped.participationCount).toBe(2);
    expect(grouped.distinctEventCount).toBe(0);
  });

  it("keeps undated rows instead of hiding them", () => {
    const grouped = groupPlayerHistory([
      event({ id: "dated", fecha: "2026-08-01" }),
      event({ id: "none", fecha: null }),
    ]);
    expect(grouped.undated.map((item) => item.id)).toEqual(["none"]);
    expect(grouped.participationCount).toBe(2);
  });

  it("keeps every row when a month has a long history", () => {
    const events = Array.from({ length: 1000 }, (_, index) =>
      event({
        id: String(index),
        eventoId: `event-${index % 40}`,
        fecha: `2024-06-${String((index % 28) + 1).padStart(2, "0")}`,
        puntosGanados: index % 5 === 0 ? 0 : 10,
        tipoEvento: index % 2 === 0 ? "liga" : "americano",
      })
    );
    const grouped = groupPlayerHistory(events);
    expect(grouped.years).toEqual([2024]);
    expect(grouped.monthsByYear.get(2024)).toHaveLength(1);
    expect(grouped.monthsByYear.get(2024)?.[0].events).toHaveLength(1000);
    expect(grouped.participationCount).toBe(1000);
    expect(grouped.distinctEventCount).toBe(40);
  });
});
