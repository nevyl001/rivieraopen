/**
 * @jest-environment node
 */

/**
 * Security regression test: every protected /api/admin/* route handler must
 * reject anonymous requests (no admin_session cookie) with 401, before any
 * database/service call is made. Login is intentionally excluded - it is
 * the one route that must accept unauthenticated requests.
 */

import { describe, it, expect } from "@jest/globals";
import { NextRequest } from "next/server";

const BASE_URL = "https://www.rivieraopen.com";
const dummyParams = { params: Promise.resolve({ id: "1" }) };

function request(path: string, method: string): NextRequest {
  return new NextRequest(`${BASE_URL}${path}`, { method });
}

type RouteCase = {
  path: string;
  modulePath: string;
  method: string;
  args?: unknown[];
};

const cases: RouteCase[] = [
  { path: "/api/admin/players", modulePath: "../players/route", method: "GET" },
  { path: "/api/admin/players", modulePath: "../players/route", method: "POST" },
  {
    path: "/api/admin/players/1",
    modulePath: "../players/[id]/route",
    method: "GET",
    args: [dummyParams],
  },
  {
    path: "/api/admin/players/1",
    modulePath: "../players/[id]/route",
    method: "PUT",
    args: [dummyParams],
  },
  {
    path: "/api/admin/players/1",
    modulePath: "../players/[id]/route",
    method: "DELETE",
    args: [dummyParams],
  },
  {
    path: "/api/admin/players/bulk",
    modulePath: "../players/bulk/route",
    method: "POST",
  },
  {
    path: "/api/admin/players/export",
    modulePath: "../players/export/route",
    method: "GET",
  },
  {
    path: "/api/admin/tournaments",
    modulePath: "../tournaments/route",
    method: "GET",
  },
  {
    path: "/api/admin/tournaments",
    modulePath: "../tournaments/route",
    method: "POST",
  },
  {
    path: "/api/admin/tournaments/1",
    modulePath: "../tournaments/[id]/route",
    method: "GET",
    args: [dummyParams],
  },
  {
    path: "/api/admin/tournaments/1",
    modulePath: "../tournaments/[id]/route",
    method: "PUT",
    args: [dummyParams],
  },
  {
    path: "/api/admin/tournaments/1",
    modulePath: "../tournaments/[id]/route",
    method: "DELETE",
    args: [dummyParams],
  },
  {
    path: "/api/admin/tournaments/1/categories",
    modulePath: "../tournaments/[id]/categories/route",
    method: "GET",
    args: [dummyParams],
  },
  {
    path: "/api/admin/tournaments/1/categories",
    modulePath: "../tournaments/[id]/categories/route",
    method: "POST",
    args: [dummyParams],
  },
  {
    path: "/api/admin/tournaments/1/categories",
    modulePath: "../tournaments/[id]/categories/route",
    method: "DELETE",
    args: [dummyParams],
  },
  {
    path: "/api/admin/tournaments/1/photos",
    modulePath: "../tournaments/[id]/photos/route",
    method: "POST",
    args: [dummyParams],
  },
  {
    path: "/api/admin/tournaments/1/photos",
    modulePath: "../tournaments/[id]/photos/route",
    method: "DELETE",
    args: [dummyParams],
  },
  {
    path: "/api/admin/tournaments/1/photos",
    modulePath: "../tournaments/[id]/photos/route",
    method: "PUT",
    args: [dummyParams],
  },
  {
    path: "/api/admin/tournaments/1/search-players",
    modulePath: "../tournaments/[id]/search-players/route",
    method: "GET",
    args: [dummyParams],
  },
  {
    path: "/api/admin/tournaments/1/winners",
    modulePath: "../tournaments/[id]/winners/route",
    method: "POST",
    args: [dummyParams],
  },
  {
    path: "/api/admin/tournaments/1/winners",
    modulePath: "../tournaments/[id]/winners/route",
    method: "DELETE",
    args: [dummyParams],
  },
  {
    path: "/api/admin/tournaments/bulk",
    modulePath: "../tournaments/bulk/route",
    method: "POST",
  },
  {
    path: "/api/admin/tournaments/export",
    modulePath: "../tournaments/export/route",
    method: "GET",
  },
  { path: "/api/admin/gallery", modulePath: "../gallery/route", method: "GET" },
  { path: "/api/admin/gallery", modulePath: "../gallery/route", method: "POST" },
  { path: "/api/admin/gallery", modulePath: "../gallery/route", method: "PUT" },
  {
    path: "/api/admin/gallery/1",
    modulePath: "../gallery/[id]/route",
    method: "GET",
    args: [dummyParams],
  },
  {
    path: "/api/admin/gallery/1",
    modulePath: "../gallery/[id]/route",
    method: "PUT",
    args: [dummyParams],
  },
  {
    path: "/api/admin/gallery/1",
    modulePath: "../gallery/[id]/route",
    method: "DELETE",
    args: [dummyParams],
  },
  { path: "/api/admin/audit-log", modulePath: "../audit-log/route", method: "GET" },
];

describe("Admin API routes reject anonymous requests", () => {
  it.each(cases)(
    "$method $path -> 401 without a session",
    async ({ path, modulePath, method, args }) => {
      const routeModule = await import(modulePath);
      const handler = routeModule[method];
      expect(typeof handler).toBe("function");

      const response = await handler(request(path, method), ...(args ?? []));

      expect(response.status).toBe(401);
    },
  );
});
