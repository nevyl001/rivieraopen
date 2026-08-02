/**
 * Browser-side direct upload to Cloudinary using a server-issued signature.
 * The file never passes through a Vercel Function.
 */

export type AdminUploadFolder = "players" | "tournaments" | "gallery";

export interface DirectUploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_BYTES = 5 * 1024 * 1024;
const MAX_NETWORK_RETRIES = 1;

export class ClientUploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ClientUploadValidationError";
  }
}

export function validateAdminUploadFile(file: File): void {
  const name = file.name.toLowerCase();
  if (name.endsWith(".svg") || file.type === "image/svg+xml") {
    throw new ClientUploadValidationError("SVG files are not allowed");
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    throw new ClientUploadValidationError(
      "Invalid file type. Please upload JPEG, PNG, or WebP.",
    );
  }

  if (file.size > MAX_BYTES) {
    throw new ClientUploadValidationError("File size exceeds 5MB limit.");
  }
}

interface SignatureResponse {
  signature: string;
  timestamp: number;
  cloudName: string;
  apiKey: string;
  folder: string;
  expiresAt: number;
}

async function requestUploadSignature(
  folder: AdminUploadFolder,
): Promise<SignatureResponse> {
  const response = await fetch("/api/admin/upload-signature", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });

  if (!response.ok) {
    let message = "Failed to obtain upload signature";
    try {
      const data = (await response.json()) as {
        error?: string | { message?: string };
      };
      if (typeof data.error === "string") message = data.error;
      else if (data.error && typeof data.error.message === "string") {
        message = data.error.message;
      }
    } catch {
      // ignore parse errors
    }
    throw new Error(message);
  }

  return (await response.json()) as SignatureResponse;
}

async function postToCloudinary(
  file: File,
  signature: SignatureResponse,
): Promise<DirectUploadResult> {
  const endpoint = `https://api.cloudinary.com/v1_1/${signature.cloudName}/image/upload`;

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", signature.apiKey);
  formData.append("timestamp", String(signature.timestamp));
  formData.append("signature", signature.signature);
  formData.append("folder", signature.folder);
  formData.append("overwrite", "false");
  formData.append("unique_filename", "true");
  formData.append("use_filename", "false");
  formData.append("allowed_formats", "jpg,png,webp");

  const response = await fetch(endpoint, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    let message = "Cloudinary upload failed";
    try {
      const data = (await response.json()) as { error?: { message?: string } };
      if (data.error?.message) message = data.error.message;
    } catch {
      // ignore
    }
    throw new Error(message);
  }

  const result = (await response.json()) as {
    secure_url: string;
    public_id: string;
    width: number;
    height: number;
    format: string;
    bytes: number;
  };

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
    format: result.format,
    bytes: result.bytes,
  };
}

/**
 * Validate locally, fetch signature, upload file directly to Cloudinary.
 * At most one network retry on transient fetch failures (not on 4xx).
 */
export async function uploadAdminImageDirect(
  file: File,
  folder: AdminUploadFolder,
): Promise<DirectUploadResult> {
  validateAdminUploadFile(file);

  const signature = await requestUploadSignature(folder);

  let lastError: unknown;
  for (let attempt = 0; attempt <= MAX_NETWORK_RETRIES; attempt++) {
    try {
      return await postToCloudinary(file, signature);
    } catch (error) {
      lastError = error;
      const message = error instanceof Error ? error.message : "";
      const isTransient =
        message.includes("Failed to fetch") ||
        message.includes("NetworkError") ||
        message.includes("network");
      if (!isTransient || attempt === MAX_NETWORK_RETRIES) {
        throw error instanceof Error ? error : new Error(String(error));
      }
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Upload failed");
}
