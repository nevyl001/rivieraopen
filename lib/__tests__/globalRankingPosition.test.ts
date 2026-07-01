import { findCompetitionRank } from "@/lib/rankingUtils";

describe("global sitio oficial ranking position (caso Aime)", () => {
  const global = [
    { id: "santiago", puntos_totales: 200 },
    { id: "diego", puntos_totales: 70 },
    { id: "gabriel", puntos_totales: 50 },
    { id: "roberto", puntos_totales: 50 },
    { id: "juan", puntos_totales: 50 },
    { id: "sergio", puntos_totales: 50 },
    { id: "oswaldo", puntos_totales: 50 },
    { id: "yusuke", puntos_totales: 50 },
    { id: "jaime", puntos_totales: 50 },
    { id: "rodrigo", puntos_totales: 50 },
    { id: "aime", puntos_totales: 25 },
  ].sort((a, b) => b.puntos_totales - a.puntos_totales);

  it("Aime #11 global, no #1 del subconjunto Hack", () => {
    expect(
      findCompetitionRank(
        global,
        (row) => row.id === "aime",
        (row) => row.puntos_totales
      )
    ).toBe(11);

    const soloHack = [{ id: "aime", puntos_totales: 25 }];
    expect(
      findCompetitionRank(
        soloHack,
        (row) => row.id === "aime",
        (row) => row.puntos_totales
      )
    ).toBe(1);
  });
});
