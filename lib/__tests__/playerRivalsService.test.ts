/**
 * Regression: ENFRENTADOS must never link rivals by display name.
 * Homonyms (e.g. several "Hector") previously mapped Bazán → wrong profile.
 *
 * Head-to-head is resolved only via legacy_player_id / jugador UUID
 * (see computeHeadToHead in playerRivalsService.ts).
 */
describe("playerRivalsService identity rules", () => {
  it("documents that name-based rival mapping is not exported", async () => {
    const mod = await import("@/lib/playerRivalsService");
    expect(mod.getPlayerRivals).toBeDefined();
    expect(
      Object.keys(mod).some((key) => /nameToJugador|NameToJugador|byName/i.test(key))
    ).toBe(false);
  });
});
