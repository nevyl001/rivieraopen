import { NextRequest, NextResponse } from "next/server";
import { generateCsrfToken } from "@/lib/admin/security/csrf";

/**
 * GET /api/admin/csrf
 * Get CSRF token for the current session
 */
export async function GET(request: NextRequest) {
  try {
    // Get session ID from cookie
    const sessionId = request.cookies.get("admin_session")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "No session found" } },
        { status: 401 },
      );
    }

    // Generate CSRF token
    const csrfToken = generateCsrfToken(sessionId);

    return NextResponse.json({ csrfToken });
  } catch (error) {
    console.error("Error generating CSRF token:", error);
    return NextResponse.json(
      {
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to generate CSRF token",
        },
      },
      { status: 500 },
    );
  }
}
