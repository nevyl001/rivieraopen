import { NextRequest, NextResponse } from "next/server";
import { tournamentAdminService } from "@/lib/admin/services/TournamentAdminService";
import type { TournamentStatus, TournamentGenre } from "@/lib/types";
import type { CreateTournamentData } from "@/lib/admin/validation/schemas";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const sortBy = (searchParams.get("sortBy") || "date") as any;
    const sortOrder = (searchParams.get("sortOrder") || "desc") as
      | "asc"
      | "desc";
    const status = searchParams.get("status") as TournamentStatus | null;
    const genre = searchParams.get("genre") as TournamentGenre | null;

    const filters: any = {};
    if (status) filters.status = status;
    if (genre) filters.genre = genre;

    const result = await tournamentAdminService.listTournaments(
      { page, pageSize },
      sortBy,
      sortOrder,
      filters,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching tournaments:", error);
    return NextResponse.json(
      { error: "Failed to fetch tournaments" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: CreateTournamentData = await request.json();

    // Convert date string to Date object if needed
    if (typeof data.date === "string") {
      data.date = new Date(data.date);
    }

    const tournament = await tournamentAdminService.createTournament(data);
    return NextResponse.json(tournament, { status: 201 });
  } catch (error) {
    console.error("Error creating tournament:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create tournament";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
