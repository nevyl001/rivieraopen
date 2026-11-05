import {
  fiabilidadFromRatedMatches,
  resolvePublicRatingSample,
} from "@/lib/playerRatingService";

describe("public rating sample", () => {
  it("uses the engine curve of 0.2 + 0.04 per match, capped at 1", () => {
    expect(fiabilidadFromRatedMatches(0)).toBe(0.2);
    expect(fiabilidadFromRatedMatches(2)).toBe(0.28);
    expect(fiabilidadFromRatedMatches(9)).toBe(0.56);
    expect(fiabilidadFromRatedMatches(34)).toBe(1);
  });

  it("counts career matches when the public rating ledger only stored a few", () => {
    expect(
      resolvePublicRatingSample({ careerMatches: 34, ratedMatches: 2 })
    ).toEqual({ partidos: 34, fiabilidad: 1 });
  });

  it("keeps a larger rated ledger when the career summary is smaller", () => {
    expect(
      resolvePublicRatingSample({ careerMatches: 4, ratedMatches: 12 })
    ).toEqual({ partidos: 12, fiabilidad: 0.68 });
  });

  it("stays at the base reliability when there are no matches", () => {
    expect(
      resolvePublicRatingSample({ careerMatches: 0, ratedMatches: 0 })
    ).toEqual({ partidos: 0, fiabilidad: 0.2 });
  });
});
