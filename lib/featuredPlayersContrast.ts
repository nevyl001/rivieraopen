/**
 * Maps sampled relative luminance (0–1) of the photo's text zone
 * to a black overlay opacity that keeps white text AA-compliant.
 *
 * White (#FFF) on effective background needs ≥ 4.5:1 (normal) / ≥ 3:1 (large).
 * Large display type (Bebas ≥ 24px) → target effective bg ≤ ~#767676 (3:1).
 * We bias toward darker overlays so meta text (Manrope ~12px) also clears 4.5:1.
 */
export function overlayOpacityFromLuminance(luminance: number): number {
  const L = Number.isFinite(luminance) ? Math.min(1, Math.max(0, luminance)) : 0.5;
  const min = 0.32; // dark photos: keep a readable scrub
  const max = 0.82; // bright photos: heavy veil under text
  return min + L * (max - min);
}

/** Relative luminance of an sRGB pixel (WCAG). */
export function relativeLuminance(r: number, g: number, b: number): number {
  const toLinear = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return (
    0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b)
  );
}

/**
 * Average relative luminance of ImageData (typically the bottom crop).
 */
export function averageLuminanceFromImageData(data: Uint8ClampedArray): number {
  if (!data.length) return 0.5;
  let sum = 0;
  let pixels = 0;
  for (let i = 0; i < data.length; i += 4) {
    sum += relativeLuminance(data[i], data[i + 1], data[i + 2]);
    pixels += 1;
  }
  return pixels ? sum / pixels : 0.5;
}

export function formatFeaturedRank(rank: number): string {
  const n = Math.max(0, Math.floor(Number(rank) || 0));
  return String(n).padStart(2, "0");
}
