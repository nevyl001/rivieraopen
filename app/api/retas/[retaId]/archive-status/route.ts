import { NextRequest, NextResponse } from "next/server";
import { getRetaArchiveStatus } from "@/lib/retaArchiveService";
import { isRetaArchiveAuthorized } from "@/lib/retaArchiveApiAuth";

export const dynamic = "force-dynamic";

/**
 * GET /api/retas/[retaId]/archive-status
 *
 * Consulta si es seguro borrar matches de la reta (todos los jugadores archivados).
 * Llamar inmediatamente antes de DELETE en matches/tournament.
 *
 * Header: Authorization: Bearer <RETA_ARCHIVE_SECRET>
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ retaId: string }> }
) {
  if (!isRetaArchiveAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const { retaId } = await context.params;
  if (!retaId?.trim()) {
    return NextResponse.json({ error: "retaId requerido" }, { status: 400 });
  }

  const status = await getRetaArchiveStatus(retaId.trim());

  if (status.total === 0) {
    return NextResponse.json(
      { error: "Sin participaciones para esta reta", ...status },
      { status: 404 }
    );
  }

  const httpStatus = status.canDeleteMatches ? 200 : 409;
  return NextResponse.json(status, { status: httpStatus });
}
