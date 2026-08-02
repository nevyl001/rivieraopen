/**
 * Audit Log API Route
 * GET /api/admin/audit-log - List audit logs
 * Requirements: 13.4, 13.5
 */

import { NextRequest, NextResponse } from "next/server";
import {
  auditLogService,
  AuditAction,
  EntityType,
} from "@/lib/admin/services/AuditLogService";
import { requireAdminSession } from "@/lib/admin/security/requireAdminSession";

export async function GET(request: NextRequest) {
  const authError = await requireAdminSession(request);
  if (authError) return authError;

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
    const action = searchParams.get("action") as AuditAction | null;
    const entityType = searchParams.get("entityType") as EntityType | null;
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const filters = {
      ...(action && { action }),
      ...(entityType && { entityType }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };

    const result = await auditLogService.listLogs({ page, pageSize }, filters);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("List audit logs error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to list audit logs",
      },
      { status: 400 },
    );
  }
}
