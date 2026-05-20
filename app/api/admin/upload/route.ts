/**
 * File Upload API Route
 * POST /api/admin/upload
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */

import { NextRequest, NextResponse } from "next/server";
import { fileUploadService } from "@/lib/admin/services/FileUploadService";

export async function POST(request: NextRequest) {
  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "gallery";

    // Validate file exists
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file before upload
    const validation = fileUploadService.validateImage(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Upload file to Cloudinary
    const result = await fileUploadService.uploadImage(file, folder);

    // Return result with all metadata
    return NextResponse.json(
      {
        url: result.url,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        format: result.format,
        bytes: result.bytes,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("File upload error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      const errorMessage = error.message.toLowerCase();

      // Validation errors (400)
      if (
        errorMessage.includes("invalid file type") ||
        errorMessage.includes("file size exceeds") ||
        errorMessage.includes("no file provided") ||
        errorMessage.includes("folder parameter")
      ) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Storage quota exceeded (507)
      if (
        errorMessage.includes("quota") ||
        errorMessage.includes("storage limit") ||
        errorMessage.includes("insufficient storage")
      ) {
        return NextResponse.json(
          {
            error:
              "Storage quota exceeded. Please upgrade your plan or delete unused images.",
          },
          { status: 507 },
        );
      }

      // Authentication errors (401)
      if (
        errorMessage.includes("authentication") ||
        errorMessage.includes("credentials") ||
        errorMessage.includes("api key")
      ) {
        return NextResponse.json(
          {
            error:
              "Cloudinary authentication failed. Please check your credentials.",
          },
          { status: 500 },
        );
      }

      // Network/Cloudinary errors (500)
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Unknown error (500)
    return NextResponse.json(
      { error: "Failed to upload file" },
      { status: 500 },
    );
  }
}
