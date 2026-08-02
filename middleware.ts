import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the request is for an admin page (excluding login)
  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    const sessionId = request.cookies.get("admin_session")?.value;

    // If no session, redirect to login
    if (!sessionId) {
      const loginUrl = new URL("/admin/login", request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Session validation will be done server-side in the layout
    // Middleware just checks if cookie exists
  }

  // Defense-in-depth: also reject admin API requests with no session cookie
  // at the edge. This does NOT replace per-route auth - it only catches
  // requests before they reach a handler. Real validation
  // (requireAdminSession) still runs inside every protected route.
  if (
    pathname.startsWith("/api/admin") &&
    !pathname.startsWith("/api/admin/auth")
  ) {
    const sessionId = request.cookies.get("admin_session")?.value;

    if (!sessionId) {
      return NextResponse.json(
        { error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        { status: 401 },
      );
    }
  }

  // If accessing /admin root, redirect to dashboard
  if (pathname === "/admin") {
    const dashboardUrl = new URL("/admin/dashboard", request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // If already logged in and trying to access login page, redirect to dashboard
  if (pathname === "/admin/login") {
    const sessionId = request.cookies.get("admin_session")?.value;
    if (sessionId) {
      const dashboardUrl = new URL("/admin/dashboard", request.url);
      return NextResponse.redirect(dashboardUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
