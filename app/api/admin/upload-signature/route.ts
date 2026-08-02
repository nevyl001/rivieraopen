/**
 * POST /api/admin/upload-signature
 *
 * Returns a short-lived Cloudinary upload signature for direct browser upload.
 * Never accepts or proxies file bytes through Vercel.
 */

import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/admin/security/requireAdminSession";
import { rateLimitMiddleware } from "@/lib/admin/security/rateLimitMiddleware";
import { RATE_LIMITS } from "@/lib/admin/security/rateLimit";
import {
  generateSignedUploadCredentials,
  isAllowedUploadFolder,
} from "@/lib/cloudinary/signUpload";

function logReject(code: string): void {
  console.warn(`upload-signature:reject:${code}`);
}

export async function POST(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) {
    logReject("unauthorized");
    return authError;
  }

  const sessionId = request.cookies.get("admin_session")!.value;
  const rateLimitResponse = await rateLimitMiddleware(
    request,
    RATE_LIMITS.UPLOAD,
    sessionId,
  );
  if (rateLimitResponse) {
    logReject("rate_limited");
    return rateLimitResponse;
  }

  const contentType = request.headers.get("content-type") || "";
  if (!contentType.toLowerCase().includes("application/json")) {
    logReject("unsupported_media_type");
    return NextResponse.json(
      { error: "Content-Type must be application/json" },
      { status: 415 },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    logReject("invalid_json");
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const folder =
    body && typeof body === "object" && "folder" in body
      ? (body as { folder: unknown }).folder
      : undefined;

  if (!isAllowedUploadFolder(folder)) {
    logReject("invalid_folder");
    return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
  }

  try {
    const credentials = generateSignedUploadCredentials(folder);

    return NextResponse.json(
      {
        signature: credentials.signature,
        timestamp: credentials.timestamp,
        cloudName: credentials.cloudName,
        apiKey: credentials.apiKey,
        folder: credentials.folder,
        expiresAt: credentials.expiresAt,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error(
      "upload-signature:error",
      error instanceof Error ? error.message : "unknown",
    );
    return NextResponse.json(
      { error: "Failed to generate upload signature" },
      { status: 500 },
    );
  }
}
