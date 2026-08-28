import { collectLegacyIdsFromExpressPairEmbeds } from "@/lib/expressHistoryService";

describe("collectLegacyIdsFromExpressPairEmbeds", () => {
  it("resuelve el legacy id del torneo anfitrión por nombre aunque no coincida con el club de registro", () => {
    const ids = collectLegacyIdsFromExpressPairEmbeds(
      [
        {
          player1_id: "5b0d81c2-fa31-4f7d-897d-d1058275e2fb",
          player2_id: "aed99cb8-6b48-428e-b9dd-4cd44e231127",
          player1_name: "Nevyl",
          player2_name: "Axel A",
        },
        {
          player1_id: "6e1fea73-b465-484c-b644-6f09d845b397",
          player2_id: "cfad717b-a9f5-4565-8fab-190dc23781a3",
          player1_name: "Daniel Miranda",
          player2_name: "Adrian Servin",
        },
      ],
      "Nevyl"
    );

    expect(ids).toEqual(["5b0d81c2-fa31-4f7d-897d-d1058275e2fb"]);
  });

  it("ignora acentos y mayúsculas al comparar nombres", () => {
    const ids = collectLegacyIdsFromExpressPairEmbeds(
      [
        {
          player1_id: "player-1",
          player2_id: "player-2",
          player1_name: "José María",
          player2_name: "Otro",
        },
      ],
      "jose maria"
    );

    expect(ids).toEqual(["player-1"]);
  });

  it("devuelve vacío sin nombre de jugador", () => {
    expect(collectLegacyIdsFromExpressPairEmbeds([], "Nevyl")).toEqual([]);
    expect(
      collectLegacyIdsFromExpressPairEmbeds(
        [
          {
            player1_id: "player-1",
            player2_id: "player-2",
            player1_name: "Nevyl",
            player2_name: "Axel",
          },
        ],
        null
      )
    ).toEqual([]);
  });
});
