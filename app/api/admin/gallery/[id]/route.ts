/**
 * Gallery Photo API Routes
 * GET /api/admin/gallery/[id] - Get photo
 * PUT /api/admin/gallery/[id] - Update photo
 * DELETE /api/admin/gallery/[id] - Delete photo
 * Requirements: 9.3, 9.4
 */

import { NextRequest, NextResponse } from "next/server";
import { galleryAdminService } from "@/lib/admin/services/GalleryAdminService";
import { requireAdminSession } from "@/lib/admin/security/requireAdminSession";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Get a single photo
 */
export async function GET(request: NextRequest, { params }: RouteParams) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const photoId = parseInt(id);

    if (isNaN(photoId)) {
      return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });
    }

    const photo = await galleryAdminService.getPhoto(photoId);
    if (!photo) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    return NextResponse.json(photo, { status: 200 });
  } catch (error) {
    console.error("Get photo error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to get photo" },
      { status: 400 },
    );
  }
}

/**
 * Update photo metadata
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const photoId = parseInt(id);

    if (isNaN(photoId)) {
      return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });
    }

    const { alt, category } = await request.json();

    const photo = await galleryAdminService.updatePhoto(photoId, {
      alt,
      category,
    });
    return NextResponse.json(photo, { status: 200 });
  } catch (error) {
    console.error("Update photo error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update photo",
      },
      { status: 400 },
    );
  }
}

/**
 * Delete a photo
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  try {
    const { id } = await params;
    const photoId = parseInt(id);

    if (isNaN(photoId)) {
      return NextResponse.json({ error: "Invalid photo ID" }, { status: 400 });
    }

    await galleryAdminService.deletePhoto(photoId);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Delete photo error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to delete photo",
      },
      { status: 400 },
    );
  }
}
