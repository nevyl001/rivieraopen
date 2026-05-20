import { NextRequest, NextResponse } from "next/server";
import { adminAuthProvider } from "@/lib/admin/auth/AdminAuthProvider";
import { deleteCsrfToken } from "@/lib/admin/security/csrf";

export async function POST(request: NextRequest) {
  try {
    const sessionId = request.cookies.get("admin_session")?.value;

    if (sessionId) {
      await adminAuthProvider.logout(sessionId);
      // Clean up CSRF token
      deleteCsrfToken(sessionId);
    }

    // Create response
    const response = NextResponse.json(
      {
        success: true,
        message: "Logout successful",
      },
      { status: 200 },
    );

    // Delete session cookie
    response.cookies.delete("admin_session");

    return response;
  } catch (error) {
    console.error("Logout error:", error);

    return NextResponse.json(
      {
        error: {
          code: "LOGOUT_ERROR",
          message: "An error occurred during logout",
        },
      },
      { status: 500 },
    );
  }
}
