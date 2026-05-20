import { NextRequest, NextResponse } from "next/server";
import { tournamentAdminService } from "@/lib/admin/services/TournamentAdminService";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("query") || "";

    const players = await tournamentAdminService.searchPlayersForWinner(query);
    return NextResponse.json(players);
  } catch (error) {
    console.error("Error searching players:", error);
    const message =
      error instanceof Error ? error.message : "Failed to search players";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
