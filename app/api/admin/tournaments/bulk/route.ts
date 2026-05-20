/**
 * Tournament Bulk Operations API Route
 * POST /api/admin/tournaments/bulk - Bulk update status
 * Requirements: 18.2, 18.4, 18.5
 */

import { NextRequest, NextResponse } from "next/server";
import { tournamentAdminService } from "@/lib/admin/services/TournamentAdminService";
import { TournamentStatus } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const { operation, tournamentIds, status } = await request.json();

    if (!operation || !tournamentIds || !Array.isArray(tournamentIds)) {
      return NextResponse.json(
        { error: "Operation and tournament IDs are required" },
        { status: 400 },
      );
    }

    if (tournamentIds.length === 0) {
      return NextResponse.json(
        { error: "At least one tournament ID is required" },
        { status: 400 },
      );
    }

    let result;

    switch (operation) {
      case "updateStatus":
        if (!status) {
          return NextResponse.json(
            { error: "Status is required for update operation" },
            { status: 400 },
          );
        }
        result = await tournamentAdminService.bulkUpdateStatus(
          tournamentIds,
          status as TournamentStatus,
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
