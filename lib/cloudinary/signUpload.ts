/**
 * Cloudinary signed upload parameter generation (server-only).
 *
 * The API secret never leaves the server. Clients receive a short-lived
 * signature and must POST the file directly to Cloudinary.
 */

import { createHash } from "crypto";
import { getCloudinaryInstance } from "./config";

export const ALLOWED_UPLOAD_FOLDERS = [
  "players",
  "tournaments",
  "gallery",
] as const;

export type AllowedUploadFolder = (typeof ALLOWED_UPLOAD_FOLDERS)[number];

/** Cloudinary folder prefix used by historical server uploads. */
export const CLOUDINARY_BASE_FOLDER = "riviera-open";

/** Signature lifetime window (Cloudinary default is 1 hour; we keep it short). */
export const UPLOAD_SIGNATURE_TTL_SECONDS = 5 * 60;

const ALLOWED_FORMATS = "jpg,png,webp";

export function isAllowedUploadFolder(
  value: unknown,
): value is AllowedUploadFolder {
  return (
    typeof value === "string" &&
    (ALLOWED_UPLOAD_FOLDERS as readonly string[]).includes(value)
  );
}

export function buildCloudinaryFolder(folder: AllowedUploadFolder): string {
  return `${CLOUDINARY_BASE_FOLDER}/${folder}`;
}

/**
 * Exact params the client must send (except `file` and `api_key`).
 * Only these keys are signed — arbitrary client params are rejected by Cloudinary.
 */
/**
 * Params signed AND posted by the client (except file + api_key).
 * String booleans keep FormData and api_sign_request in lockstep.
 */
export function buildSignedUploadParams(
  folder: AllowedUploadFolder,
  timestamp: number,
): Record<string, string | number> {
  return {
    allowed_formats: ALLOWED_FORMATS,
    folder: buildCloudinaryFolder(folder),
    overwrite: "false",
    timestamp,
    unique_filename: "true",
    use_filename: "false",
  };
}

export interface SignedUploadCredentials {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  /** Echo of the allowlisted logical folder (players|tournaments|gallery). */
  logicalFolder: AllowedUploadFolder;
  expiresAt: number;
}

/**
 * Generate a Cloudinary upload signature for direct browser upload.
 * Must only be called after admin session validation.
 */
export function generateSignedUploadCredentials(
  folder: AllowedUploadFolder,
): SignedUploadCredentials {
  const cloudinary = getCloudinaryInstance();
  const cfg = cloudinary.config();

  const cloudName = cfg.cloud_name;
  const apiKey = cfg.api_key;
  const apiSecret = cfg.api_secret;

  if (!cloudName || !apiKey || !apiSecret) {
    throw new Error("Cloudinary is not fully configured");
  }

  const timestamp = Math.floor(Date.now() / 1000);
  const params = buildSignedUploadParams(folder, timestamp);

  // Prefer SDK signing so stringification matches Cloudinary's expectations.
  const signature =
    typeof cloudinary.utils?.api_sign_request === "function"
      ? cloudinary.utils.api_sign_request(params, apiSecret)
      : signParamsFallback(params, apiSecret);

  return {
    signature,
    timestamp,
    cloudName,
    apiKey,
    folder: buildCloudinaryFolder(folder),
    logicalFolder: folder,
    expiresAt: timestamp + UPLOAD_SIGNATURE_TTL_SECONDS,
  };
}

/**
 * Fallback SHA-1 signer matching Cloudinary's documented algorithm.
 * @see https://cloudinary.com/documentation/authentication_signatures
 */
function signParamsFallback(
  params: Record<string, string | number>,
  apiSecret: string,
): string {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1")
    .update(toSign + apiSecret)
    .digest("hex");
}
