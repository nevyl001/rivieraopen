import { NextRequest, NextResponse } from "next/server";
import { validateCsrfToken } from "./csrf";

/**
 * CSRF protection middleware for API routes
 * Validates CSRF token on state-changing requests (POST, PUT, DELETE, PATCH)
 */
export async function csrfProtection(
  request: NextRequest,
): Promise<NextResponse | null> {
  const method = request.method;

  // Only check CSRF for state-changing methods
  if (!["POST", "PUT", "DELETE", "PATCH"].includes(method)) {
    return null; // Allow GET, HEAD, OPTIONS
  }

  // Get session ID from cookie
  const sessionId = request.cookies.get("admin_session")?.value;
  if (!sessionId) {
    return NextResponse.json(
      { error: { code: "UNAUTHORIZED", message: "No session found" } },
      { status: 401 },
    );
  }

  // Get CSRF token from header
  const csrfToken = request.headers.get("x-csrf-token");
  if (!csrfToken) {
    return NextResponse.json(
      {
        error: {
          code: "CSRF_TOKEN_MISSING",
          message: "CSRF token is required",
        },
      },
      { status: 403 },
    );
  }

  // Validate CSRF token
  const isValid = validateCsrfToken(sessionId, csrfToken);
  if (!isValid) {
    return NextResponse.json(
      {
        error: {
          code: "CSRF_TOKEN_INVALID",
          message: "Invalid or expired CSRF token",
        },
      },
      { status: 403 },
    );
  }

  return null; // Token is valid, continue
}
