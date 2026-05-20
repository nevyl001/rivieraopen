/**
 * GalleryAdminService
 * Service for managing gallery photos in the admin interface
 * Requirements: 9.1, 9.2, 9.3, 9.4, 9.5
 */

import { galleryImages, GalleryImage } from "@/lib/data/mock/gallery";
import { fileUploadService } from "./FileUploadService";
import { auditLogService } from "./AuditLogService";

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export interface CreatePhotoData {
  src: string;
  alt: string;
  category?: string;
}

export interface UpdatePhotoData {
  alt?: string;
  category?: string;
}

export class GalleryAdminService {
  private photos: GalleryImage[] = [...galleryImages];

  /**
   * List photos with pagination
   * Requirements: 9.1
   */
  async listPhotos(
    params: PaginationParams = { page: 1, pageSize: 20 },
  ): Promise<PaginationResult<GalleryImage>> {
    const { page, pageSize } = params;
    const totalItems = this.photos.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = this.photos.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Upload a new photo
   * Requirements: 9.2
   */
  async uploadPhoto(data: CreatePhotoData): Promise<GalleryImage> {
    const newPhoto: GalleryImage = {
      id: Math.max(...this.photos.map((p) => p.id), 0) + 1,
      src: data.src,
      alt: data.alt,
      category: data.category,
    };

    this.photos.push(newPhoto);

    // Audit log
    await auditLogService.log(
      "admin",
      "create",
      "gallery",
      newPhoto.id.toString(),
      `Uploaded photo: ${newPhoto.alt}`,
    );

    return newPhoto;
  }

  /**
   * Update photo metadata
   * Requirements: 9.3
   */
  async updatePhoto(id: number, data: UpdatePhotoData): Promise<GalleryImage> {
    const photoIndex = this.photos.findIndex((p) => p.id === id);
    if (photoIndex === -1) {
      throw new Error("Photo not found");
    }

    const updatedPhoto = {
      ...this.photos[photoIndex],
      ...(data.alt !== undefined && { alt: data.alt }),
      ...(data.category !== undefined && { category: data.category }),
    };

    this.photos[photoIndex] = updatedPhoto;

    // Audit log
    await auditLogService.log(
      "admin",
      "update",
      "gallery",
      id.toString(),
      `Updated photo: ${updatedPhoto.alt}`,
    );

    return updatedPhoto;
  }

  /**
   * Delete a photo
   * Requirements: 9.4
   */
  async deletePhoto(id: number): Promise<void> {
    const photoIndex = this.photos.findIndex((p) => p.id === id);
    if (photoIndex === -1) {
      throw new Error("Photo not found");
    }

    const photo = this.photos[photoIndex];

    // Delete file from Cloudinary (works for both Cloudinary URLs and old /uploads/ paths)
    await fileUploadService.deleteImage(photo.src);

    this.photos.splice(photoIndex, 1);

    // Audit log
    await auditLogService.log(
      "admin",
      "delete",
      "gallery",
      id.toString(),
      `Deleted photo: ${photo.alt}`,
    );
  }

  /**
   * Reorder photos
   * Requirements: 9.5
   */
  async reorderPhotos(photoIds: number[]): Promise<GalleryImage[]> {
    // Validate that all IDs exist
    const allIdsExist = photoIds.every((id) =>
      this.photos.some((p) => p.id === id),
    );
    if (!allIdsExist) {
      throw new Error("Invalid photo IDs in reorder request");
    }

    // Validate that the count matches
    if (photoIds.length !== this.photos.length) {
      throw new Error("Photo count mismatch in reorder request");
    }

    // Reorder photos based on the provided IDs
    const reorderedPhotos = photoIds.map((id) => {
      const photo = this.photos.find((p) => p.id === id);
      if (!photo) {
        throw new Error(`Photo with ID ${id} not found`);
      }
      return photo;
    });

    this.photos = reorderedPhotos;
    return this.photos;
  }

  /**
   * Get a single photo by ID
   */
  async getPhoto(id: number): Promise<GalleryImage | null> {
    return this.photos.find((p) => p.id === id) || null;
  }
}

// Export singleton instance
export const galleryAdminService = new GalleryAdminService();
