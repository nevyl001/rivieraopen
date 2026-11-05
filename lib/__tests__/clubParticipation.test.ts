import { computeClubParticipation } from "@/lib/playerPassportAnalyticsService";
import type { PlayerHistoryEvent } from "@/lib/types/playerHistory";

function event(sourceClubName: string): PlayerHistoryEvent {
  return {
    id: sourceClubName,
    eventoId: sourceClubName,
    tipoEvento: "liga",
    nombre: sourceClubName,
    fecha: null,
    categoria: null,
    posicionFinal: null,
    puntosGanados: 0,
    partidosGanados: null,
    partidosPerdidos: null,
    partidosEmpatados: null,
    partidos: [],
    sourceClubName,
  };
}

describe("club participation labels", () => {
  it("counts spelling variants of the same club once", () => {
    const clubs = computeClubParticipation(
      [event("Hackpadel"), event("Hack Pádel"), event("Riviera Open")],
      "Hackpadel"
    );

    expect(clubs).toEqual([
      { clubName: "Hack Pádel", eventCount: 2 },
      { clubName: "Riviera Open", eventCount: 1 },
    ]);
  });
});
