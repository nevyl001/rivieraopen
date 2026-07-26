import {
  labelRetaRonda,
  labelRetaRondasForPartidos,
} from "@/lib/retaRoundLabel";

describe("labelRetaRonda", () => {
  it("con metadata vacío numera Ronda 1..N sin inventar Semifinal/Final", () => {
    const labels = labelRetaRondasForPartidos(
      [
        { ronda: 1 },
        { ronda: 2 },
        { ronda: 3 },
        { ronda: 4 },
        { ronda: 5 },
      ],
      {}
    );
    expect(labels).toEqual([
      "Ronda 1",
      "Ronda 2",
      "Ronda 3",
      "Ronda 4",
      "Ronda 5",
    ]);
  });

  it("round_robin sin remontada solo usa Ronda N", () => {
    expect(
      labelRetaRonda(3, {
        formato: "round_robin",
        total_participantes: 6,
        partidos_jugados: 5,
      })
    ).toBe("Ronda 3");
  });

  it("con regular_rondas_max sí etiqueta playoffs", () => {
    const meta = { regular_rondas_max: 3 };
    expect(labelRetaRonda(1, meta)).toBe("Ronda 1");
    expect(labelRetaRonda(3, meta)).toBe("Ronda 3");
    expect(labelRetaRonda(4, meta)).toBe("Semifinal");
    expect(labelRetaRonda(5, meta)).toBe("Final");
  });

  it("con remontada_activa etiqueta fase final", () => {
    const labels = labelRetaRondasForPartidos(
      [{ ronda: 1 }, { ronda: 6 }, { ronda: 7 }],
      {
        formato: "round_robin",
        total_participantes: 6,
        remontada_activa: true,
      }
    );
    expect(labels[0]).toBe("Ronda 1");
    expect(labels[1]).toBe("Semifinal");
    expect(labels[2]).toBe("Final");
  });
});
