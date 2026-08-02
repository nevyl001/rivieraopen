/**
 * @jest-environment node
 */

/**
 * Category 2 from the persistence review: a session created through the
 * real (persistence-backed) AdminAuthProvider must grant access to a
 * protected admin route - not just reject anonymous requests, which is
 * covered separately in admin-routes-auth.security.test.ts.
 *
 * The singleton `adminAuthProvider` used by requireAdminSession is
 * replaced with a fresh, real AdminAuthProvider instance (not mocked
 * behavior) so this exercises the actual login -> validateSession code
 * path, just against the in-memory fallback store (no Supabase
 * credentials in this environment - see sessionPersistence.test.ts for
 * the store-swap and Supabase-backed coverage).
 */

import { describe, it, expect, beforeAll } from "@jest/globals";
import { NextRequest } from "next/server";

jest.mock("@/lib/admin/auth/AdminAuthProvider", () => {
  const actual = jest.requireActual("@/lib/admin/auth/AdminAuthProvider");
  return {
    ...actual,
    adminAuthProvider: new actual.AdminAuthProvider(),
  };
});

jest.mock("@/lib/data/repositories/repository-factory", () => ({
  __esModule: true,
  default: {
    getPlayerRepository: jest.fn().mockResolvedValue({
      getAll: jest.fn().mockResolvedValue([]),
    }),
  },
}));

describe("Authenticated access to admin routes", () => {
  let sessionCookie: string;

  beforeAll(async () => {
    process.env.ADMIN_USERNAME = "admin";
    process.env.ADMIN_PASSWORD = "admin123";

    const { adminAuthProvider } = await import(
      "@/lib/admin/auth/AdminAuthProvider"
    );
    const session = await adminAuthProvider.login({
      username: "admin",
      password: "admin123",
    });
    sessionCookie = session.id;
  });

  it("requireAdminSession lets a real, freshly-issued session through", async () => {
    const { requireAdminSession } = await import(
      "@/lib/admin/security/requireAdminSession"
    );

    const request = new NextRequest("https://www.rivieraopen.com/api/admin/players", {
      headers: { cookie: `admin_session=${sessionCookie}` },
    });

    expect(await requireAdminSession(request)).toBeNull();
  });

  it("GET /api/admin/players does not 401 with a valid session", async () => {
    const { GET } = await import("../players/route");

    const request = new NextRequest("https://www.rivieraopen.com/api/admin/players", {
      headers: { cookie: `admin_session=${sessionCookie}` },
    });

    const response = await GET(request);

    expect(response.status).not.toBe(401);
  });
});
