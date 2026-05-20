/**
 * Tournament Photos API Routes
 * POST /api/admin/tournaments/[id]/photos - Add photo
 * DELETE /api/admin/tournaments/[id]/photos - Remove photo
 * PUT /api/admin/tournaments/[id]/photos - Reorder photos
 * Requirements: 8.1, 8.2, 8.3, 8.4
 */

import { NextRequest, NextResponse } from "next/server";
import { tournamentAdminService } from "@/lib/admin/services/TournamentAdminService";
import { fileUploadService } from "@/lib/admin/services/FileUploadService";

interface RouteParams {
  params: Promise<{
    id: string;
  }>;
}

/**
 * Add a photo to a tournament
 */
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { photoUrl } = await request.json();

    if (!photoUrl) {
      return NextResponse.json(
        { error: "Photo URL is required" },
        { status: 400 },
      );
    }

    const tournament = await tournamentAdminService.addPhoto(id, photoUrl);
    return NextResponse.json(tournament, { status: 200 });
  } catch (error) {
    console.error("Add photo error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to add photo" },
      { status: 400 },
    );
  }
}

/**
 * Remove a photo from a tournament
 */
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { photoUrl } = await request.json();

    if (!photoUrl) {
      return NextResponse.json(
        { error: "Photo URL is required" },
        { status: 400 },
      );
    }

    // Delete the file from Cloudinary
    await fileUploadService.deleteImage(photoUrl);

    // Remove from tournament
    const tournament = await tournamentAdminService.removePhoto(id, photoUrl);
    return NextResponse.json(tournament, { status: 200 });
  } catch (error) {
    console.error("Remove photo error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to remove photo",
      },
      { status: 400 },
    );
  }
}

/**
 * Reorder photos in a tournament
 */
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    const { id } = await params;
    const { photoUrls } = await request.json();

    if (!photoUrls || !Array.isArray(photoUrls)) {
      return NextResponse.json(
        { error: "Photo URLs array is required" },
        { status: 400 },
      );
    }

    const tournament = await tournamentAdminService.reorderPhotos(
      id,
      photoUrls,
    );
    return NextResponse.json(tournament, { status: 200 });
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
