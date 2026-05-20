import { NextRequest, NextResponse } from "next/server";
import { playerAdminService } from "@/lib/admin/services/PlayerAdminService";
import type { CreatePlayerData } from "@/lib/admin/validation/schemas";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const player = await playerAdminService.getPlayer(id);

    if (!player) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json(player);
  } catch (error) {
    console.error("Error fetching player:", error);
    return NextResponse.json(
      { error: "Failed to fetch player" },
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
    const data: Partial<CreatePlayerData> = await request.json();
    const player = await playerAdminService.updatePlayer(id, data);
    return NextResponse.json(player);
  } catch (error) {
    console.error("Error updating player:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update player";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await playerAdminService.deletePlayer(id);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting player:", error);
    const message =
      error instanceof Error ? error.message : "Failed to delete player";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
