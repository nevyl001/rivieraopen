/**
 * File Upload API Route
 * POST /api/admin/upload
 * Requirements: 8.1, 8.2, 8.3, 8.4, 8.5, 8.6
 */

import { NextRequest, NextResponse } from "next/server";
import { fileUploadService } from "@/lib/admin/services/FileUploadService";
import { requireAdminSession } from "@/lib/admin/security/requireAdminSession";
import { rateLimitMiddleware } from "@/lib/admin/security/rateLimitMiddleware";
import { RATE_LIMITS } from "@/lib/admin/security/rateLimit";
import { validateFileSignature } from "@/lib/admin/security/fileSignature";

// Allowed upload destinations. Never accept an arbitrary/user-supplied path here.
const ALLOWED_FOLDERS = ["players", "tournaments", "gallery"] as const;
type AllowedFolder = (typeof ALLOWED_FOLDERS)[number];

// Files are capped at 5MB; allow headroom for multipart overhead.
const MAX_REQUEST_BYTES = 6 * 1024 * 1024;

export async function POST(request: NextRequest) {
  // 1. Authenticate before touching the request body.
  const authError = await requireAdminSession(request);
  if (authError) {
    return authError;
  }

  // 2. Rate limit, scoped to the authenticated session and IP.
  const sessionId = request.cookies.get("admin_session")!.value;
  const rateLimitResponse = rateLimitMiddleware(
    request,
    RATE_LIMITS.UPLOAD,
    sessionId,
  );
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  // 3. Reject anything that isn't declared as multipart form data.
  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("multipart/form-data")) {
    return NextResponse.json(
      { error: "Content-Type must be multipart/form-data" },
      { status: 415 },
    );
  }

  // 4. Reject oversized requests early based on the declared Content-Length.
  // Note: Content-Length can be omitted or spoofed by a client, so this is
  // an early mitigation, not the sole size enforcement - the parsed file
  // size is validated again below.
  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > MAX_REQUEST_BYTES) {
    return NextResponse.json(
      { error: "Request payload too large" },
      { status: 413 },
    );
  }

  try {
    // Get form data
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const folder = (formData.get("folder") as string) || "gallery";

    // Validate folder against a strict allowlist - never pass client input
    // straight through to storage paths.
    if (!ALLOWED_FOLDERS.includes(folder as AllowedFolder)) {
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }

    // Validate file exists
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file before upload
    const validation = fileUploadService.validateImage(file);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // Verify the file's actual bytes (not just the client-supplied MIME
    // type) match an allowed image signature. Rejects SVGs and any other
    // disguised file type.
    const buffer = new Uint8Array(await file.arrayBuffer());
    const signature = validateFileSignature(buffer);
    if (!signature.valid) {
      return NextResponse.json(
        { error: "File content does not match an allowed image type" },
        { status: 400 },
      );
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
