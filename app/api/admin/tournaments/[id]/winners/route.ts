import { NextRequest, NextResponse } from "next/server";
import { tournamentAdminService } from "@/lib/admin/services/TournamentAdminService";
import type { Category } from "@/lib/types";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { category, placement, playerId } = (await request.json()) as {
      category: Category;
      placement: 1 | 2;
      playerId: string;
    };

    const tournament = await tournamentAdminService.setWinner(
      id,
      category,
      placement,
      playerId,
    );
    return NextResponse.json(tournament);
  } catch (error) {
    console.error("Error setting winner:", error);
    const message =
      error instanceof Error ? error.message : "Failed to set winner";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { category, placement } = (await request.json()) as {
      category: Category;
      placement: 1 | 2;
    };

    const tournament = await tournamentAdminService.removeWinner(
      id,
      category,
      placement,
    );
    return NextResponse.json(tournament);
  } catch (error) {
    console.error("Error removing winner:", error);
    const message =
      error instanceof Error ? error.message : "Failed to remove winner";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
