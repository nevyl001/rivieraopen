/**
 * Player Bulk Operations API Route
 * POST /api/admin/players/bulk - Bulk operations (delete, update category)
 * Requirements: 18.1, 18.2, 18.3, 18.4, 18.5
 */

import { NextRequest, NextResponse } from "next/server";
import { playerAdminService } from "@/lib/admin/services/PlayerAdminService";
import { Category } from "@/lib/types";
import { requireAdminSession } from "@/lib/admin/security/requireAdminSession";

export async function POST(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  try {
    const { operation, playerIds, category } = await request.json();

    if (!operation || !playerIds || !Array.isArray(playerIds)) {
      return NextResponse.json(
        { error: "Operation and player IDs are required" },
        { status: 400 },
      );
    }

    if (playerIds.length === 0) {
      return NextResponse.json(
        { error: "At least one player ID is required" },
        { status: 400 },
      );
    }

    let result;

    switch (operation) {
      case "delete":
        result = await playerAdminService.bulkDelete(playerIds);
        break;

      case "updateCategory":
        if (!category) {
          return NextResponse.json(
            { error: "Category is required for update operation" },
            { status: 400 },
          );
        }
        result = await playerAdminService.bulkUpdateCategory(
          playerIds,
          category as Category,
        );
        break;

      default:
        return NextResponse.json(
          { error: `Unknown operation: ${operation}` },
          { status: 400 },
        );
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("Bulk operation error:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Bulk operation failed",
      },
      { status: 400 },
    );
  }
}
