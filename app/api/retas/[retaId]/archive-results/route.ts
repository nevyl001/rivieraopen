import { NextRequest, NextResponse } from "next/server";
import { archiveRetaResults } from "@/lib/retaArchiveService";
import { isRetaArchiveAuthorized } from "@/lib/retaArchiveApiAuth";

export const dynamic = "force-dynamic";

/**
 * POST /api/retas/[retaId]/archive-results
 *
 * Archiva partidos de la reta en jugador_participaciones.metadata.partidos_detalle.
 * Llamar al cerrar la reta, ANTES de eliminar matches.
 *
 * La reta puede cerrarse (puntos/ranking) aunque canDeleteMatches sea false.
 * Solo borrar matches cuando canDeleteMatches === true.
 *
 * Header: Authorization: Bearer <RETA_ARCHIVE_SECRET>
 */
export async function POST(
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

  let force = false;
  try {
    const body = await request.json().catch(() => ({}));
    force = Boolean(body?.force);
  } catch {
    // body opcional
  }

  const result = await archiveRetaResults(retaId.trim(), { force });

  if (result.errors.length && result.updated === 0 && result.alreadyArchived === 0) {
    return NextResponse.json(result, { status: 422 });
  }

  return NextResponse.json(result);
}
