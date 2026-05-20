/**
 * API route for exporting players to CSV
 * Requirements: 17.1, 17.2, 17.3, 17.4, 17.5
 */

import { NextRequest, NextResponse } from "next/server";
import { playerAdminService } from "@/lib/admin/services/PlayerAdminService";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const searchQuery = searchParams.get("searchQuery") || undefined;
    const categoryFilter = searchParams.get("categoryFilter") || undefined;
    const genderFilter = searchParams.get("genderFilter") || undefined;

    // Generate CSV
    const csvContent = await playerAdminService.exportPlayers({
      searchQuery,
      categoryFilter,
      genderFilter,
    });

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="players-export-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Export players error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to export players",
      },
      { status: 500 },
    );
  }
}
