/**
 * AuditLogService
 * Service for logging admin actions
 * Requirements: 13.1, 13.2, 13.3, 13.4, 13.5
 */

export type AuditAction = "create" | "update" | "delete";
export type EntityType =
  | "player"
  | "tournament"
  | "gallery"
  | "category"
  | "winner"
  | "photo";

export interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: AuditAction;
  entityType: EntityType;
  entityId: string;
  details?: string;
}

export interface AuditLogFilters {
  action?: AuditAction;
  entityType?: EntityType;
  startDate?: string;
  endDate?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginationResult<T> {
  data: T[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export class AuditLogService {
  private logs: AuditLog[] = [];

  /**
   * Log an action
   * Requirements: 13.1, 13.2
   */
  async log(
    user: string,
    action: AuditAction,
    entityType: EntityType,
    entityId: string,
    details?: string,
  ): Promise<AuditLog> {
    const logEntry: AuditLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      user,
      action,
      entityType,
      entityId,
      details,
    };

    this.logs.unshift(logEntry); // Add to beginning for newest first
    return logEntry;
  }

  /**
   * List logs with pagination and filtering
   * Requirements: 13.3, 13.4, 13.5
   */
  async listLogs(
    params: PaginationParams = { page: 1, pageSize: 50 },
    filters?: AuditLogFilters,
  ): Promise<PaginationResult<AuditLog>> {
    let filteredLogs = [...this.logs];

    // Apply filters
    if (filters?.action) {
      filteredLogs = filteredLogs.filter(
        (log) => log.action === filters.action,
      );
    }
    if (filters?.entityType) {
      filteredLogs = filteredLogs.filter(
        (log) => log.entityType === filters.entityType,
      );
    }
    if (filters?.startDate) {
      filteredLogs = filteredLogs.filter(
        (log) => log.timestamp >= filters.startDate!,
      );
    }
    if (filters?.endDate) {
      filteredLogs = filteredLogs.filter(
        (log) => log.timestamp <= filters.endDate!,
      );
    }

    // Calculate pagination
    const { page, pageSize } = params;
    const totalItems = filteredLogs.length;
    const totalPages = Math.ceil(totalItems / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filteredLogs.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      pagination: {
        page,
        pageSize,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get total log count
   */
  async getLogCount(): Promise<number> {
    return this.logs.length;
  }
}

// Export singleton instance
export const auditLogService = new AuditLogService();
