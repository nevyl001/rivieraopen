import { buildRetaArchiveStatus } from "@/lib/retaArchiveService";

describe("buildRetaArchiveStatus", () => {
  const retaId = "reta-1";

  it("marca complete y canDeleteMatches cuando todas tienen partidos_detalle", () => {
    const status = buildRetaArchiveStatus(
      retaId,
      [
        {
          id: "p1",
          jugador_id: "j1",
          metadata: {
            partidos_detalle: [
              {
                ronda: 1,
                rival: "Rival A",
                games_favor: 6,
                games_contra: 3,
                resultado: "win",
              },
            ],
          },
        },
        {
          id: "p2",
          jugador_id: "j2",
          metadata: {
            partidos_detalle: [
              {
                ronda: 1,
                rival: "Rival B",
                games_favor: 3,
                games_contra: 6,
                resultado: "loss",
              },
            ],
          },
        },
      ],
      new Map([
        ["j1", "Jugador Uno"],
        ["j2", "Jugador Dos"],
      ])
    );

    expect(status.total).toBe(2);
    expect(status.archived).toBe(2);
    expect(status.complete).toBe(true);
    expect(status.canDeleteMatches).toBe(true);
    expect(status.failures).toHaveLength(0);
  });

  it("bloquea canDeleteMatches si falta partidos_detalle en alguna participación", () => {
    const status = buildRetaArchiveStatus(
      retaId,
      [
        {
          id: "p1",
          jugador_id: "j1",
          metadata: {
            partidos_detalle: [
              {
                ronda: 1,
                rival: "Rival A",
                games_favor: 6,
                games_contra: 3,
                resultado: "win",
              },
            ],
          },
        },
        {
          id: "p2",
          jugador_id: "j2",
          metadata: { partidos_ganados: 3, partidos_perdidos: 2 },
        },
      ],
      new Map([
        ["j1", "Jugador Uno"],
        ["j2", "Eduardo L"],
      ])
    );

    expect(status.archived).toBe(1);
    expect(status.complete).toBe(false);
    expect(status.canDeleteMatches).toBe(false);
    expect(status.failures).toHaveLength(1);
    expect(status.failures[0]).toMatchObject({
      participacionId: "p2",
      jugadorId: "j2",
      jugadorNombre: "Eduardo L",
      reason: "no_pairs_or_matches",
    });
  });

  it("devuelve canDeleteMatches false cuando no hay participaciones", () => {
    const status = buildRetaArchiveStatus(retaId, [], new Map());

    expect(status.total).toBe(0);
    expect(status.canDeleteMatches).toBe(false);
    expect(status.complete).toBe(false);
  });
});
