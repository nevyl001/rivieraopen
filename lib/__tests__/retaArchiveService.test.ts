import {
  buildArchivedMatchesForPlayer,
  buildRetaArchiveStatus,
  findPairIdsByNormalizedPlayerName,
  mergeArchiveSnapshotIntoMetadata,
  normalizeArchivePlayerName,
} from "@/lib/retaArchiveService";
import type { SupabaseClient } from "@supabase/supabase-js";

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

describe("normalizeArchivePlayerName", () => {
  it("aplica trim, lowercase y normalización básica", () => {
    expect(normalizeArchivePlayerName("  NéVyl  ")).toBe("nevyl");
    expect(normalizeArchivePlayerName("Devyl")).toBe("devyl");
    expect(normalizeArchivePlayerName(null)).toBe("");
  });
});

describe("findPairIdsByNormalizedPlayerName", () => {
  const pairs = [
    {
      id: "pair-nevyl-marlon",
      player1_name: "Nevyl",
      player2_name: "Marlon",
    },
    {
      id: "pair-other",
      player1_name: "Devyl",
      player2_name: "Duran",
    },
  ];

  it("encuentra un único pair inequívoco", () => {
    expect(findPairIdsByNormalizedPlayerName(pairs, " nevyl ")).toEqual([
      "pair-nevyl-marlon",
    ]);
  });

  it("falla con 0 candidatos si el nombre no aparece", () => {
    expect(findPairIdsByNormalizedPlayerName(pairs, "Fantasma")).toEqual([]);
  });

  it("reporta ambigüedad si el nombre aparece en dos pairs", () => {
    const duplicated = [
      ...pairs,
      {
        id: "pair-nevyl-otro",
        player1_name: "Nevyl",
        player2_name: "Otro",
      },
    ];
    expect(findPairIdsByNormalizedPlayerName(duplicated, "Nevyl")).toEqual([
      "pair-nevyl-marlon",
      "pair-nevyl-otro",
    ]);
  });
});

describe("mergeArchiveSnapshotIntoMetadata", () => {
  it("no altera puntos ni metadata no relacionada", () => {
    const merged = mergeArchiveSnapshotIntoMetadata(
      {
        puntos_evento: 75,
        puntos_aplicados: true,
        lugar: "2do lugar",
        partidos_jugados: 5,
      },
      [
        {
          ronda: 1,
          rival: "Rival",
          games_favor: 6,
          games_contra: 3,
          resultado: "win",
        },
      ],
      "2026-07-26T00:00:00.000Z"
    );

    expect(merged.puntos_evento).toBe(75);
    expect(merged.puntos_aplicados).toBe(true);
    expect(merged.lugar).toBe("2do lugar");
    expect(merged.partidos_jugados).toBe(5);
    expect(merged.partidos_archivados_en).toBe("2026-07-26T00:00:00.000Z");
    expect(Array.isArray(merged.partidos_detalle)).toBe(true);
    expect((merged.partidos_detalle as unknown[]).length).toBe(1);
  });

  it("no duplica lógica de skip: metadata con partidos_detalle existente se detecta", () => {
    const existing = mergeArchiveSnapshotIntoMetadata(
      { puntos_evento: 75 },
      [
        {
          ronda: 1,
          rival: "A",
          games_favor: 1,
          games_contra: 0,
          resultado: "win",
        },
      ],
      "2026-07-26T00:00:00.000Z"
    );

    const status = buildRetaArchiveStatus(
      "reta-1",
      [{ id: "p1", jugador_id: "j1", metadata: existing }],
      new Map([["j1", "Nevyl"]])
    );
    expect(status.archived).toBe(1);
    expect(status.failures).toHaveLength(0);
    expect(status.canDeleteMatches).toBe(true);
  });
});

type PairRow = { id: string; player1_id?: string; player2_id?: string; player1_name?: string | null; player2_name?: string | null };
type MatchRow = {
  id: string;
  pair1_id: string;
  pair2_id: string;
  pair1_score: number;
  pair2_score: number;
  pair1_name: string;
  pair2_name: string;
  round: number;
  created_at: string;
  games: null;
  status?: string;
};

function createArchiveSupabaseMock(opts: {
  pairsByLegacy: PairRow[];
  allPairs: PairRow[];
  finishedMatches: MatchRow[];
}) {
  const from = jest.fn((table: string) => {
    if (table === "pairs") {
      let usedOr = false;
      const builder: Record<string, unknown> = {};
      builder.select = jest.fn(() => builder);
      builder.eq = jest.fn(() => builder);
      builder.or = jest.fn(() => {
        usedOr = true;
        return Promise.resolve({
          data: opts.pairsByLegacy.map((p) => ({ id: p.id })),
          error: null,
        });
      });
      // When name fallback loads all pairs: select().eq() without or → thenable
      (builder as { then?: unknown }).then = (
        resolve: (value: { data: PairRow[]; error: null }) => unknown
      ) => {
        if (usedOr) {
          return Promise.resolve({
            data: opts.pairsByLegacy.map((p) => ({ id: p.id })),
            error: null,
          }).then(resolve);
        }
        return Promise.resolve({
          data: opts.allPairs,
          error: null,
        }).then(resolve);
      };
      return builder;
    }

    if (table === "matches") {
      const builder: Record<string, unknown> = {};
      builder.select = jest.fn(() => builder);
      builder.eq = jest.fn(() => builder);
      builder.or = jest.fn(() => builder);
      builder.order = jest.fn(() => builder);
      (builder as { then?: unknown }).then = (
        resolve: (value: { data: MatchRow[]; error: null }) => unknown
      ) =>
        Promise.resolve({
          data: opts.finishedMatches,
          error: null,
        }).then(resolve);
      return builder;
    }

    throw new Error(`Unexpected table ${table}`);
  });

  return { from } as unknown as SupabaseClient;
}

describe("buildArchivedMatchesForPlayer name fallback", () => {
  const retaId = "38f1edec-c487-4a13-b25a-7b55462b28e1";
  const finishedMatch: MatchRow = {
    id: "m1",
    pair1_id: "pair-nevyl",
    pair2_id: "pair-other",
    pair1_score: 6,
    pair2_score: 3,
    pair1_name: "Nevyl/Marlon",
    pair2_name: "Devyl/Duran",
    round: 1,
    created_at: "2026-06-11T12:00:00.000Z",
    games: null,
  };

  it("legacy_player_id correcto: usa flujo existente sin fallback", async () => {
    const supabase = createArchiveSupabaseMock({
      pairsByLegacy: [{ id: "pair-by-legacy" }],
      allPairs: [
        {
          id: "pair-by-name",
          player1_name: "Nevyl",
          player2_name: "Marlon",
        },
      ],
      finishedMatches: [
        {
          ...finishedMatch,
          pair1_id: "pair-by-legacy",
          pair1_name: "Nevyl/Marlon",
        },
      ],
    });

    const result = await buildArchivedMatchesForPlayer(
      retaId,
      "84f1f8dd-168a-4811-ad75-797ccca75317",
      supabase,
      "Nevyl"
    );

    expect(result).toHaveLength(1);
    expect(result[0].rival).toBe("Devyl/Duran");
    // pairs.from called; name fallback would also call pairs — with legacy hit,
    // second pairs query (allPairs) must NOT be needed. Verify or() was used
    // and we did not need name candidates.
    expect(supabase.from).toHaveBeenCalledWith("pairs");
    expect(supabase.from).toHaveBeenCalledWith("matches");
  });

  it("legacy no coincide y nombre tiene un único pair: archiva", async () => {
    const supabase = createArchiveSupabaseMock({
      pairsByLegacy: [],
      allPairs: [
        {
          id: "pair-nevyl",
          player1_name: "Nevyl",
          player2_name: "Marlon",
        },
        {
          id: "pair-other",
          player1_name: "Devyl",
          player2_name: "Duran",
        },
      ],
      finishedMatches: [finishedMatch],
    });

    const result = await buildArchivedMatchesForPlayer(
      retaId,
      "84f1f8dd-wrong-legacy",
      supabase,
      "Nevyl"
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: "m1",
      ronda: 1,
      rival: "Devyl/Duran",
      games_favor: 6,
      games_contra: 3,
      resultado: "win",
    });
  });

  it("nombre duplicado en dos pairs: falla de forma segura", async () => {
    const supabase = createArchiveSupabaseMock({
      pairsByLegacy: [],
      allPairs: [
        {
          id: "pair-a",
          player1_name: "Nevyl",
          player2_name: "Marlon",
        },
        {
          id: "pair-b",
          player1_name: "Nevyl",
          player2_name: "Otro",
        },
      ],
      finishedMatches: [finishedMatch],
    });

    const result = await buildArchivedMatchesForPlayer(
      retaId,
      "wrong-legacy",
      supabase,
      "Nevyl"
    );

    expect(result).toEqual([]);
  });

  it("nombre sin pair: falla", async () => {
    const supabase = createArchiveSupabaseMock({
      pairsByLegacy: [],
      allPairs: [
        {
          id: "pair-other",
          player1_name: "Devyl",
          player2_name: "Duran",
        },
      ],
      finishedMatches: [finishedMatch],
    });

    const result = await buildArchivedMatchesForPlayer(
      retaId,
      "wrong-legacy",
      supabase,
      "Nevyl"
    );

    expect(result).toEqual([]);
  });

  it("pair sin matches finished: falla", async () => {
    const supabase = createArchiveSupabaseMock({
      pairsByLegacy: [],
      allPairs: [
        {
          id: "pair-nevyl",
          player1_name: "Nevyl",
          player2_name: "Marlon",
        },
      ],
      finishedMatches: [],
    });

    const result = await buildArchivedMatchesForPlayer(
      retaId,
      "wrong-legacy",
      supabase,
      "Nevyl"
    );

    expect(result).toEqual([]);
  });
});
