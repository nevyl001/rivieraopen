import type { NextRequest } from "next/server";

export function isRetaArchiveAuthorized(request: NextRequest): boolean {
  const secret = process.env.RETA_ARCHIVE_SECRET?.trim();
  if (!secret) return false;

  const header = request.headers.get("authorization")?.trim();
  if (header === `Bearer ${secret}`) return true;

  const querySecret = request.nextUrl.searchParams.get("secret")?.trim();
  return querySecret === secret;
}
