/**
 * FileUploadService
 * Service for handling file uploads in the admin interface using Cloudinary
 * Requirements: 3.1-3.8, 4.1-4.4, 6.1-6.5, 8.2, 8.5, 8.6, 9.1-9.3
 */

import {
  validateImage as cloudinaryValidateImage,
  uploadToCloudinary,
  deleteImageByUrl,
  extractPublicIdFromUrl,
  type UploadResult as CloudinaryUploadResult,
  type ValidationResult as CloudinaryValidationResult,
} from "@/lib/cloudinary/upload";

export interface UploadResult {
  url: string;
  publicId: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

export class FileUploadService {
  /**
   * Validate image file
   * Requirements: 2.1-2.6, 8.5, 8.6, 9.1, 9.2
   */
  validateImage(file: File): ValidationResult {
    return cloudinaryValidateImage(file);
  }

  /**
   * Upload image file to Cloudinary
   * Requirements: 3.1-3.8, 4.1-4.4, 8.2, 9.1, 9.2, 9.3
   *
   * @param file - File to upload
   * @param folder - Target folder (e.g., 'players', 'tournaments', 'gallery')
   * @returns Promise resolving to UploadResult with Cloudinary URL and metadata
   */
  async uploadImage(
    file: File,
    folder: string = "gallery",
  ): Promise<UploadResult> {
    // Upload to Cloudinary
    const result = await uploadToCloudinary(file, folder);

    return {
      url: result.url,
      publicId: result.publicId,
      width: result.width,
      height: result.height,
      format: result.format,
      bytes: result.bytes,
    };
  }

  /**
   * Delete image from Cloudinary by URL
   * Requirements: 6.1-6.5
   *
   * @param url - Cloudinary URL to delete
   */
  async deleteImage(url: string): Promise<void> {
    await deleteImageByUrl(url);
  }

  /**
   * Extract public ID from Cloudinary URL
   *
   * @param url - Cloudinary URL
   * @returns Public ID or null if not a Cloudinary URL
   */
  extractPublicId(url: string): string | null {
    return extractPublicIdFromUrl(url);
  }
}

// Export singleton instance
export const fileUploadService = new FileUploadService();
