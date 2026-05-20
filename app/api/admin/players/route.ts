import { NextRequest, NextResponse } from "next/server";
import { playerAdminService } from "@/lib/admin/services/PlayerAdminService";
import type { CreatePlayerData } from "@/lib/admin/validation/schemas";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const sortField = searchParams.get("sortField") as any;
    const sortDirection = searchParams.get("sortDirection") as "asc" | "desc";

    const sortParams =
      sortField && sortDirection
        ? { field: sortField, direction: sortDirection }
        : undefined;

    const result = await playerAdminService.listPlayers(
      { page, pageSize },
      sortParams,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error fetching players:", error);
    return NextResponse.json(
      { error: "Failed to fetch players" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const data: CreatePlayerData = await request.json();
    const player = await playerAdminService.createPlayer(data);
    return NextResponse.json(player, { status: 201 });
  } catch (error) {
    console.error("Error creating player:", error);
    const message =
      error instanceof Error ? error.message : "Failed to create player";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
