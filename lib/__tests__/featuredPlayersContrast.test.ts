import {
  averageLuminanceFromImageData,
  overlayOpacityFromLuminance,
  formatFeaturedRank,
} from "@/lib/featuredPlayersContrast";

describe("featuredPlayersContrast", () => {
  it("maps bright luminance to a heavier overlay", () => {
    expect(overlayOpacityFromLuminance(0.85)).toBeGreaterThan(0.7);
    expect(overlayOpacityFromLuminance(0.1)).toBeLessThan(0.45);
  });

  it("clamps invalid luminance", () => {
    expect(overlayOpacityFromLuminance(Number.NaN)).toBeCloseTo(
      overlayOpacityFromLuminance(0.5)
    );
    expect(overlayOpacityFromLuminance(-1)).toBe(overlayOpacityFromLuminance(0));
    expect(overlayOpacityFromLuminance(2)).toBe(overlayOpacityFromLuminance(1));
  });

  it("averages ImageData luminance", () => {
    // pure white pixels
    const white = new Uint8ClampedArray([255, 255, 255, 255, 255, 255, 255, 255]);
    expect(averageLuminanceFromImageData(white)).toBeCloseTo(1, 2);

    const black = new Uint8ClampedArray([0, 0, 0, 255, 0, 0, 0, 255]);
    expect(averageLuminanceFromImageData(black)).toBeCloseTo(0, 2);
  });

  it("formats rank as two digits", () => {
    expect(formatFeaturedRank(1)).toBe("01");
    expect(formatFeaturedRank(12)).toBe("12");
  });
});
