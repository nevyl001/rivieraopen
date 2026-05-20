/**
 * Image optimization utilities for client-side compression and resizing
 * Requirements: 16.3
 */

export interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0-1
  format?: "image/jpeg" | "image/png" | "image/webp";
}

const DEFAULT_OPTIONS: ImageOptimizationOptions = {
  maxWidth: 1920,
  maxHeight: 1920,
  quality: 0.85,
  format: "image/jpeg",
};

/**
 * Compress and resize an image file
 * @param file - The image file to optimize
 * @param options - Optimization options
 * @returns Promise<File> - Optimized image file
 */
export async function optimizeImage(
  file: File,
  options: ImageOptimizationOptions = {},
): Promise<File> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        const maxWidth = opts.maxWidth!;
        const maxHeight = opts.maxHeight!;

        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }

        // Create canvas and draw resized image
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Failed to get canvas context"));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        // Convert to blob
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to create blob"));
              return;
            }

            // Create new file with optimized image
            const optimizedFile = new File([blob], file.name, {
              type: opts.format!,
              lastModified: Date.now(),
            });

            resolve(optimizedFile);
          },
          opts.format,
          opts.quality,
        );
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Get image dimensions without loading the full image
 * @param file - The image file
 * @returns Promise<{width: number, height: number}>
 */
export async function getImageDimensions(
  file: File,
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const img = new Image();

      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };

      img.onerror = () => {
        reject(new Error("Failed to load image"));
      };

      img.src = e.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error("Failed to read file"));
    };

    reader.readAsDataURL(file);
  });
}

/**
 * Format file size for display
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "2.5 MB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
}
