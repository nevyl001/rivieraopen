"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/admin/ui/Button";
import { Modal } from "@/components/admin/ui/Modal";
import { Input } from "@/components/admin/ui/Input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/admin/ui/Card";
import { optimizeImage, formatFileSize } from "@/lib/utils/imageOptimization";

interface GalleryImage {
  id: number;
  src: string;
  alt: string;
  category?: string;
}

export default function GalleryManagementPage() {
  const [photos, setPhotos] = useState<GalleryImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryImage | null>(null);
  const [editAlt, setEditAlt] = useState("");
  const [editCategory, setEditCategory] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    loadPhotos();
  }, []);

  const loadPhotos = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/admin/gallery?pageSize=100");
      if (!response.ok) {
        throw new Error("Failed to fetch photos");
      }

      const result = await response.json();
      setPhotos(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load photos");
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files[0];
    setIsUploadingPhoto(true);
    setPhotoError(null);

    try {
      // Get original file size
      const originalSize = file.size;

      // Optimize image before upload
      const optimizedFile = await optimizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
      });

      const optimizedSize = optimizedFile.size;
      const savings = ((originalSize - optimizedSize) / originalSize) * 100;

      console.log(
        `Image optimized: ${formatFileSize(originalSize)} → ${formatFileSize(optimizedSize)} (${savings.toFixed(1)}% reduction)`,
      );

      const { uploadAdminImageDirect } = await import(
        "@/lib/admin/client/directCloudinaryUpload"
      );
      const { url } = await uploadAdminImageDirect(optimizedFile, "gallery");

      // Add photo to gallery
      const addPhotoResponse = await fetch("/api/admin/gallery", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          src: url,
          alt: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          category: "Uncategorized",
        }),
      });

      if (!addPhotoResponse.ok) {
        const errorData = await addPhotoResponse.json();
        throw new Error(errorData.error || "Failed to add photo to gallery");
      }

      // Reload photos
      await loadPhotos();

      // Reset file input
      event.target.value = "";
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : "Failed to upload photo",
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleEditPhoto = (photo: GalleryImage) => {
    setEditingPhoto(photo);
    setEditAlt(photo.alt);
    setEditCategory(photo.category || "");
    setShowEditModal(true);
  };

  const handleUpdatePhoto = async () => {
    if (!editingPhoto) return;

    setIsUpdating(true);

    try {
      const response = await fetch(`/api/admin/gallery/${editingPhoto.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          alt: editAlt,
          category: editCategory,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update photo");
      }

      // Reload photos
      await loadPhotos();
      setShowEditModal(false);
      setEditingPhoto(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update photo");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeletePhoto = async (photo: GalleryImage) => {
    if (!confirm(`Are you sure you want to delete "${photo.alt}"?`)) return;

    try {
      const response = await fetch(`/api/admin/gallery/${photo.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete photo");
      }

      // Reload photos
      await loadPhotos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete photo");
    }
  };

  const handlePhotoDragStart = (index: number) => {
    setDraggedPhotoIndex(index);
  };

  const handlePhotoDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handlePhotoDrop = async (dropIndex: number) => {
    if (draggedPhotoIndex === null || draggedPhotoIndex === dropIndex) {
      setDraggedPhotoIndex(null);
      return;
    }

    const reorderedPhotos = [...photos];
    const [draggedPhoto] = reorderedPhotos.splice(draggedPhotoIndex, 1);
    reorderedPhotos.splice(dropIndex, 0, draggedPhoto);

    try {
      const photoIds = reorderedPhotos.map((p) => p.id);
      const response = await fetch("/api/admin/gallery", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ photoIds }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reorder photos");
      }

      setPhotos(reorderedPhotos);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reorder photos");
    } finally {
      setDraggedPhotoIndex(null);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Gallery Management
        </h1>
        <Card>
          <CardContent>
            <p className="text-gray-600">Loading photos...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gallery Management</h1>
        <div>
          <input
            type="file"
            id="gallery-photo-upload"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
            disabled={isUploadingPhoto}
          />
          <label htmlFor="gallery-photo-upload">
            <span
              className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 px-4 py-2 text-base cursor-pointer ${
                isUploadingPhoto
                  ? "bg-blue-400 text-white cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              }`}
            >
              {isUploadingPhoto ? "Uploading..." : "Upload Photo"}
            </span>
          </label>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {photoError && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {photoError}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Gallery Photos ({photos.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {photos.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  className="relative aspect-square group cursor-move"
                  draggable
                  onDragStart={() => handlePhotoDragStart(index)}
                  onDragOver={handlePhotoDragOver}
                  onDrop={() => handlePhotoDrop(index)}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt}
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity rounded-lg flex flex-col items-center justify-center gap-2 p-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleEditPhoto(photo)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-full"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeletePhoto(photo)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity w-full"
                    >
                      Delete
                    </Button>
                  </div>
                  <div className="absolute top-2 left-2 bg-white bg-opacity-75 px-2 py-1 rounded text-xs font-medium">
                    {index + 1}
                  </div>
                  {photo.category && (
                    <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-75 px-2 py-1 rounded text-xs text-white truncate">
                      {photo.category}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">No photos in gallery yet</p>
          )}
        </CardContent>
      </Card>

      {/* Edit Photo Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingPhoto(null);
        }}
        title="Edit Photo"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alt Text
            </label>
            <Input
              type="text"
              value={editAlt}
              onChange={(e) => setEditAlt(e.target.value)}
              placeholder="Photo description"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <Input
              type="text"
              value={editCategory}
              onChange={(e) => setEditCategory(e.target.value)}
              placeholder="e.g., Tournament, Players, Courts"
            />
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowEditModal(false);
                setEditingPhoto(null);
              }}
              disabled={isUpdating}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleUpdatePhoto}
              disabled={isUpdating || !editAlt}
            >
              {isUpdating ? "Updating..." : "Update Photo"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
