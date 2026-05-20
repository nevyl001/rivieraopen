import { NextRequest, NextResponse } from "next/server";
import { adminAuthProvider } from "@/lib/admin/auth/AdminAuthProvider";
import type { AdminCredentials } from "@/lib/admin/auth/types";
import { rateLimitMiddleware } from "@/lib/admin/security/rateLimitMiddleware";
import { RATE_LIMITS } from "@/lib/admin/security/rateLimit";

export async function POST(request: NextRequest) {
  // Apply rate limiting for login attempts
  const rateLimitResponse = rateLimitMiddleware(request, RATE_LIMITS.LOGIN);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  try {
    const body = await request.json();
    const credentials: AdminCredentials = {
      username: body.username,
      password: body.password,
    };

    // Validate input
    if (!credentials.username || !credentials.password) {
      return NextResponse.json(
        {
          error: {
            code: "MISSING_CREDENTIALS",
            message: "Username and password are required",
          },
        },
        { status: 400 },
      );
    }

    // Attempt login
    const session = await adminAuthProvider.login(credentials);

    // Create response with session cookie
    const response = NextResponse.json(
      {
        success: true,
        message: "Login successful",
      },
      { status: 200 },
    );

    // Set HTTP-only cookie with session ID
    response.cookies.set("admin_session", session.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 60 * 60, // 24 hours
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);

    return NextResponse.json(
      {
        error: {
          code: "INVALID_CREDENTIALS",
          message:
            error instanceof Error ? error.message : "Invalid credentials",
        },
      },
      { status: 401 },
    );
  }
}
