/**
 * Legacy proxied upload endpoint — retired.
 *
 * Returns 410 without reading the request body.
 * Vercel Firewall must also DENY this path so large bodies never count as FDT.
 */

import { NextResponse } from "next/server";

export const runtime = "nodejs";

async function gone() {
  return NextResponse.json(
    {
      error:
        "This upload endpoint has been retired. Use /api/admin/upload-signature and upload directly to Cloudinary.",
      code: "UPLOAD_ENDPOINT_GONE",
    },
    {
      status: 410,
      headers: {
        Allow: "",
      },
    },
  );
}

export async function POST() {
  return gone();
}

export async function GET() {
  return gone();
}

export async function PUT() {
  return gone();
}

export async function PATCH() {
  return gone();
}

export async function DELETE() {
  return gone();
}
