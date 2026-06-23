import {
  formatDueloMarcador,
  type Duelo2v2ScoreRow,
} from "@/lib/duelo2v2ScoreService";

describe("formatDueloMarcador", () => {
  const duelo: Duelo2v2ScoreRow = {
    id: "d1",
    detalle_sets: [
      { a: 6, b: 3 },
      { a: 6, b: 3 },
    ],
    sets_pareja_a: 2,
    sets_pareja_b: 0,
    pareja_a_j1_id: "player-a1",
    pareja_a_j2_id: "player-a2",
    pareja_b_j1_id: "player-b1",
    pareja_b_j2_id: "player-b2",
  };

  it("muestra sets jugados desde la pareja ganadora", () => {
    expect(formatDueloMarcador(duelo, "player-a1")).toBe("6-3, 6-3");
  });

  it("muestra sets desde la perspectiva de la pareja perdedora", () => {
    expect(formatDueloMarcador(duelo, "player-b1")).toBe("3-6, 3-6");
  });

  it("usa sets ganados si no hay detalle_sets", () => {
    const sinDetalle: Duelo2v2ScoreRow = {
      ...duelo,
      detalle_sets: [],
    };
    expect(formatDueloMarcador(sinDetalle, "player-a1")).toBe("2-0 sets");
  });
});
