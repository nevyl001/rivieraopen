/**
 * Gallery API Routes
 * GET /api/admin/gallery - List photos
 * POST /api/admin/gallery - Upload photo
 * PUT /api/admin/gallery - Reorder photos
 * Requirements: 9.1, 9.2, 9.5
 */

import { NextRequest, NextResponse } from "next/server";
import { galleryAdminService } from "@/lib/admin/services/GalleryAdminService";

/**
 * List gallery photos with pagination
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

    const result = await galleryAdminService.listPhotos({ page, pageSize });
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("List photos error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to list photos",
      },
      { status: 400 },
    );
  }
}

/**
 * Upload a new photo
 */
export async function POST(request: NextRequest) {
  try {
    const { src, alt, category } = await request.json();

    if (!src || !alt) {
      return NextResponse.json(
        { error: "Photo URL and alt text are required" },
        { status: 400 },
      );
    }

    const photo = await galleryAdminService.uploadPhoto({ src, alt, category });
    return NextResponse.json(photo, { status: 201 });
  } catch (error) {
    console.error("Upload photo error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to upload photo",
      },
      { status: 400 },
    );
  }
}

/**
 * Reorder photos
 */
export async function PUT(request: NextRequest) {
  try {
    const { photoIds } = await request.json();

    if (!photoIds || !Array.isArray(photoIds)) {
      return NextResponse.json(
        { error: "Photo IDs array is required" },
        { status: 400 },
      );
    }

    const photos = await galleryAdminService.reorderPhotos(photoIds);
    return NextResponse.json(photos, { status: 200 });
  } catch (error) {
    console.error("Reorder photos error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to reorder photos",
      },
      { status: 400 },
    );
  }
}
