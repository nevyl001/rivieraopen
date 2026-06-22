import { NextRequest, NextResponse } from "next/server";
import { archiveRetaResults } from "@/lib/retaArchiveService";

export const dynamic = "force-dynamic";

function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.RETA_ARCHIVE_SECRET?.trim();
  if (!secret) return false;

  const header = request.headers.get("authorization")?.trim();
  if (header === `Bearer ${secret}`) return true;

  const querySecret = request.nextUrl.searchParams.get("secret")?.trim();
  return querySecret === secret;
}

/**
 * POST /api/retas/[retaId]/archive-results
 *
 * Archiva partidos de la reta en jugador_participaciones.metadata.partidos_detalle
 * para que el historial sobreviva si se borra la reta.
 *
 * Llamar desde la app al cerrar la reta, ANTES de eliminar matches.
 * Header: Authorization: Bearer <RETA_ARCHIVE_SECRET>
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ retaId: string }> }
) {
  if (!isAuthorized(request)) {
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

  if (result.errors.length && result.updated === 0) {
    return NextResponse.json(result, { status: 422 });
  }

  return NextResponse.json(result);
}
