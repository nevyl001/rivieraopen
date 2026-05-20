/**
 * Cloudinary Upload Utilities
 *
 * Core functions for uploading, validating, and managing images in Cloudinary.
 *
 * Requirements: 2.1-2.6, 3.1-3.8, 5.1-5.5, 7.1-7.5
 */

import { getCloudinaryInstance } from "./config";
import { randomUUID } from "crypto";

/**
 * Allowed image MIME types
 */
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
] as const;

/**
 * Maximum file size in bytes (5MB)
 */
const MAX_FILE_SIZE = 5 * 1024 * 1024;

/**
 * Base folder for all uploads
 */
const BASE_FOLDER = "riviera-open";

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Upload options interface
 */
export interface CloudinaryUploadOptions {
  folder: string;
  publicId?: string;
  resourceType?: "image" | "video" | "raw" | "auto";
  transformation?: {
    width?: number;
    height?: number;
    crop?: "fill" | "fit" | "scale" | "limit";
    quality?: "auto" | number;
    fetchFormat?: "auto" | "webp" | "avif";
  };
  overwrite?: boolean;
  uniqueFilename?: boolean;
}

/**
 * Upload result interface
 */
export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

/**
 * Cloudinary upload response interface
 */
interface CloudinaryUploadResponse {
  public_id: string;
  version: number;
  signature: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  created_at: string;
  bytes: number;
  url: string;
  secure_url: string;
}

/**
 * Validate image file
 *
 * Preconditions:
 * - file parameter is provided (may be null/undefined)
 *
 * Postconditions:
 * - Returns ValidationResult indicating validity
 * - valid === true if and only if file passes all checks
 * - No side effects on input
 *
 * Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 2.6
 *
 * @param file - File object to validate
 * @returns ValidationResult with valid flag and optional error message
 */
export function validateImage(file: File | null | undefined): ValidationResult {
  // Check file exists
  if (!file) {
    return {
      valid: false,
      error: "No file provided",
    };
  }

  // Check file type
  if (!ALLOWED_TYPES.includes(file.type as any)) {
    return {
      valid: false,
      error: `Invalid file type. Allowed types: ${ALLOWED_TYPES.join(", ")}`,
    };
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    const maxSizeMB = MAX_FILE_SIZE / (1024 * 1024);
    return {
      valid: false,
      error: `File size exceeds ${maxSizeMB}MB limit`,
    };
  }

  return { valid: true };
}

/**
 * Upload image to Cloudinary
 *
 * Preconditions:
 * - file is validated and well-formed
 * - file.size is within allowed limits (≤ 5MB)
 * - file.type is in allowed types list
 * - Cloudinary SDK is configured
 * - folder is non-empty string
 * - Network connection is available
 *
 * Postconditions:
 * - Returns UploadResult with valid Cloudinary URL
 * - result.url is HTTPS URL pointing to Cloudinary CDN
 * - result.publicId uniquely identifies the uploaded resource
 * - File is stored in Cloudinary with specified folder structure
 * - Original file is not modified
 * - On error, throws Error with descriptive message
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 5.1, 5.2, 5.3, 5.4, 5.5, 7.1, 7.2, 7.3, 7.4, 7.5
 *
 * @param file - File to upload
 * @param folder - Target folder (e.g., 'players', 'tournaments', 'gallery')
 * @returns Promise resolving to UploadResult
 * @throws Error if upload fails
 */
export async function uploadToCloudinary(
  file: File,
  folder: string,
): Promise<UploadResult> {
  // Validate input
  const validation = validateImage(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  if (!folder || folder.trim() === "") {
    throw new Error("Folder parameter is required");
  }

  try {
    // Get Cloudinary instance
    const cloudinary = getCloudinaryInstance();

    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Generate unique public ID
    const ext = extractExtension(file.name);
    const publicId = `${randomUUID()}${ext}`;

    // Configure upload options
    const fullFolder = `${BASE_FOLDER}/${folder}`;
    const options = {
      folder: fullFolder,
      public_id: publicId,
      resource_type: "image" as const,
      transformation: {
        quality: "auto" as const,
        fetch_format: "auto" as const,
      },
      overwrite: false,
      unique_filename: true,
    };

    // Upload via stream
    const uploadResult = await new Promise<CloudinaryUploadResponse>(
      (resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          options,
          (error, result) => {
            if (error) {
              reject(error);
            } else if (result) {
              resolve(result as CloudinaryUploadResponse);
            } else {
              reject(new Error("Upload failed: No result returned"));
            }
          },
        );

        uploadStream.end(buffer);
      },
    );

    // Return formatted result
    return {
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      bytes: uploadResult.bytes,
    };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to upload to Cloudinary: ${error.message}`);
    }
    // Log the full error object for debugging
    console.error("Unknown error type:", typeof error, error);
    throw new Error(`Failed to upload to Cloudinary: ${JSON.stringify(error)}`);
  }
}

/**
 * Extract public ID from Cloudinary URL
 *
 * Preconditions:
 * - url is defined (not null/undefined)
 * - url is string type
 *
 * Postconditions:
 * - Returns public ID string if URL is valid Cloudinary URL
 * - Returns null if URL is not Cloudinary URL or invalid format
 * - No side effects on input parameter
 *
 * @param url - Cloudinary URL
 * @returns Public ID or null if not a Cloudinary URL
 */
export function extractPublicIdFromUrl(url: string): string | null {
  if (!url || typeof url !== "string") {
    return null;
  }

  try {
    // Check if it's a Cloudinary URL
    if (!url.includes("res.cloudinary.com")) {
      return null;
    }

    // Extract public ID from URL
    // Format: https://res.cloudinary.com/{cloud_name}/{resource_type}/upload/{transformations}/v{version}/{public_id}.{format}
    // We need to find the last segment before the file extension, skipping transformations and version

    // Split by /upload/ to get the part after upload
    const uploadIndex = url.indexOf("/upload/");
    if (uploadIndex === -1) {
      return null;
    }

    const afterUpload = url.substring(uploadIndex + 8); // 8 = length of '/upload/'

    // Remove file extension
    const withoutExtension = afterUpload.replace(/\.[^.]+$/, "");

    // Split by / and filter out transformations (contain commas or start with v followed by digits)
    const segments = withoutExtension.split("/").filter((segment) => {
      // Skip transformation segments (contain commas like w_800,h_600)
      if (segment.includes(",")) return false;
      // Skip version segments (start with v followed by digits)
      if (/^v\d+$/.test(segment)) return false;
      return true;
    });

    // Join remaining segments to form public ID
    if (segments.length > 0) {
      return segments.join("/");
    }

    return null;
  } catch (error) {
    return null;
  }
}

/**
 * Extract file extension from filename
 *
 * @param filename - Original filename
 * @returns File extension with dot (e.g., '.jpg') or empty string
 */
function extractExtension(filename: string): string {
  const match = filename.match(/\.[^.]+$/);
  return match ? match[0] : "";
}

/**
 * Get allowed file types
 *
 * @returns Array of allowed MIME types
 */
export function getAllowedTypes(): readonly string[] {
  return ALLOWED_TYPES;
}

/**
 * Get maximum file size in bytes
 *
 * @returns Maximum file size
 */
export function getMaxFileSize(): number {
  return MAX_FILE_SIZE;
}

/**
 * Delete image from Cloudinary
 *
 * Preconditions:
 * - publicId is non-empty string
 * - publicId is valid Cloudinary public ID format
 * - Cloudinary SDK is configured
 *
 * Postconditions:
 * - Resource is deleted from Cloudinary if it exists
 * - If resource doesn't exist, operation completes without error
 * - No return value on success
 * - On error, throws Error with descriptive message
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 *
 * @param publicId - Cloudinary public ID to delete
 * @returns Promise that resolves when deletion is complete
 * @throws Error if deletion fails
 */
export async function deleteFromCloudinary(publicId: string): Promise<void> {
  if (!publicId || publicId.trim() === "") {
    throw new Error("Public ID is required for deletion");
  }

  try {
    const cloudinary = getCloudinaryInstance();
    await cloudinary.uploader.destroy(publicId);
    // Deletion is idempotent - no error if resource doesn't exist
  } catch (error) {
    // Log error but don't throw (idempotent operation)
    console.error(
      `Failed to delete from Cloudinary (publicId: ${publicId}):`,
      error,
    );
  }
}

/**
 * Delete image from Cloudinary by URL
 *
 * Preconditions:
 * - url is string (may be empty or invalid)
 * - Cloudinary SDK is configured
 *
 * Postconditions:
 * - If URL is valid Cloudinary URL, resource is deleted
 * - If URL is not Cloudinary URL, operation is no-op
 * - Operation is idempotent (safe to call multiple times)
 * - Errors are logged but not thrown
 *
 * Requirements: 6.1, 6.2, 6.3, 6.4, 6.5
 *
 * @param url - Cloudinary URL
 * @returns Promise that resolves when deletion is complete
 */
export async function deleteImageByUrl(url: string): Promise<void> {
  // Extract public ID from URL
  const publicId = extractPublicIdFromUrl(url);

  if (!publicId) {
    // Not a Cloudinary URL, skip deletion
    return;
  }

  // Delete from Cloudinary
  await deleteFromCloudinary(publicId);
}
