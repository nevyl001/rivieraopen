import { NextRequest, NextResponse } from "next/server";
import { getRankingPublico } from "@/lib/rankingService";
import { Gender } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const categoria =
    request.nextUrl.searchParams.get("categoria")?.trim() || "Open";
  const generoParam = request.nextUrl.searchParams.get("genero")?.trim();
  const genero: Gender = generoParam === "Female" ? "Female" : "Male";

  const players = await getRankingPublico(categoria, genero);
  return NextResponse.json(players);
}
