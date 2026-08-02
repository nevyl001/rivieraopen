/**
 * Magic-byte (file signature) validation.
 *
 * Client-supplied MIME types are untrustworthy - this inspects the actual
 * file bytes so a renamed/mislabeled file cannot slip past MIME-based checks.
 */

export type DetectedImageType = "image/jpeg" | "image/png" | "image/webp";

/**
 * Detects the image type from a file's magic bytes.
 * Returns null if the bytes don't match any allowed signature.
 */
export function detectImageType(bytes: Uint8Array): DetectedImageType | null {
  if (isJpeg(bytes)) return "image/jpeg";
  if (isPng(bytes)) return "image/png";
  if (isWebp(bytes)) return "image/webp";
  return null;
}

/**
 * Verifies that the file's actual bytes match one of the allowed image
 * signatures. Does not compare against the client-supplied MIME type -
 * callers should treat any non-null result as the authoritative type.
 */
export function validateFileSignature(bytes: Uint8Array): {
  valid: boolean;
  detectedType: DetectedImageType | null;
} {
  const detectedType = detectImageType(bytes);
  return { valid: detectedType !== null, detectedType };
}

function isJpeg(bytes: Uint8Array): boolean {
  return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
}

function isPng(bytes: Uint8Array): boolean {
  const signature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
  if (bytes.length < signature.length) return false;
  return signature.every((byte, index) => bytes[index] === byte);
}

function isWebp(bytes: Uint8Array): boolean {
  if (bytes.length < 12) return false;
  const isRiff =
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46;
  const isWebpFormat =
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50;
  return isRiff && isWebpFormat;
}
