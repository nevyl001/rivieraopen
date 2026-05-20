import { NextRequest, NextResponse } from "next/server";
import { tournamentAdminService } from "@/lib/admin/services/TournamentAdminService";
import type { Category } from "@/lib/types";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const categories = await tournamentAdminService.listCategories(id);
    return NextResponse.json(categories);
  } catch (error) {
    console.error("Error fetching categories:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch categories";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { category } = (await request.json()) as { category: Category };

    const tournament = await tournamentAdminService.addCategory(id, category);
    return NextResponse.json(tournament);
  } catch (error) {
    console.error("Error adding category:", error);
    const message =
      error instanceof Error ? error.message : "Failed to add category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { category } = (await request.json()) as { category: Category };

    const tournament = await tournamentAdminService.removeCategory(
      id,
      category,
    );
    return NextResponse.json(tournament);
  } catch (error) {
    console.error("Error removing category:", error);
    const message =
      error instanceof Error ? error.message : "Failed to remove category";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
