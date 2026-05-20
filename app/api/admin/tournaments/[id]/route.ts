import { NextRequest, NextResponse } from "next/server";
import { tournamentAdminService } from "@/lib/admin/services/TournamentAdminService";
import type { CreateTournamentData } from "@/lib/admin/validation/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const tournament = await tournamentAdminService.getTournament(id);

    if (!tournament) {
      return NextResponse.json(
        { error: "Tournament not found" },
        { status: 404 },
      );
    }

    return NextResponse.json(tournament);
  } catch (error) {
    console.error("Error fetching tournament:", error);
    return NextResponse.json(
      { error: "Failed to fetch tournament" },
      { status: 500 },
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const data: Partial<CreateTournamentData> = await request.json();

    // Convert date string to Date object if needed
    if (data.date && typeof data.date === "string") {
      data.date = new Date(data.date);
    }

    const tournament = await tournamentAdminService.updateTournament(id, data);
    return NextResponse.json(tournament);
  } catch (error) {
    console.error("Error updating tournament:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update tournament";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await tournamentAdminService.deleteTournament(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting tournament:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete tournament";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
