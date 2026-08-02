import { NextRequest, NextResponse } from "next/server";
import { adminAuthProvider } from "@/lib/admin/auth/AdminAuthProvider";

/**
 * Rejects requests that lack a valid admin session.
 * Must be called as the first operation in every protected admin route handler,
 * before reading the request body (JSON, form data, etc).
 *
 * @returns a 401 NextResponse if the request is unauthorized, otherwise null
 */
export async function requireAdminSession(
  request: NextRequest,
): Promise<NextResponse | null> {
  const sessionId = request.cookies.get("admin_session")?.value;

  if (!sessionId) {
    return unauthorized();
  }

  const isValid = await adminAuthProvider.validateSession(sessionId);
  if (!isValid) {
    return unauthorized();
  }

  return null;
}

function unauthorized(): NextResponse {
  return NextResponse.json(
    { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
    { status: 401 },
  );
}
