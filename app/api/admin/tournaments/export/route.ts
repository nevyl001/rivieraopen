/**
 * API route for exporting tournaments to CSV
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5
 */

import { NextRequest, NextResponse } from "next/server";
import { tournamentAdminService } from "@/lib/admin/services/TournamentAdminService";
import { requireAdminSession } from "@/lib/admin/security/requireAdminSession";

export async function GET(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  try {
    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get("statusFilter") || undefined;
    const genreFilter = searchParams.get("genreFilter") || undefined;

    // Generate CSV
    const csvContent = await tournamentAdminService.exportTournaments({
      statusFilter,
      genreFilter,
    });

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="tournaments-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export tournaments error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to export tournaments",
      },
      { status: 500 },
    );
  }
}
