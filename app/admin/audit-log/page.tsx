"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/admin/ui/Card";
import { Button } from "@/components/admin/ui/Button";
import {
  Table,
  TableHead,
  TableHeader,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/admin/ui/Table";

interface AuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  entityType: string;
  entityId: string;
  details?: string;
}

interface PaginationInfo {
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    pageSize: 50,
    totalItems: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [entityTypeFilter, setEntityTypeFilter] = useState<string>("");

  useEffect(() => {
    loadLogs();
  }, [pagination.page, actionFilter, entityTypeFilter]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        pageSize: pagination.pageSize.toString(),
      });

      if (actionFilter) params.append("action", actionFilter);
      if (entityTypeFilter) params.append("entityType", entityTypeFilter);

      const response = await fetch(`/api/admin/audit-log?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch audit logs");
      }

      const result = await response.json();
      setLogs(result.data);
      setPagination(result.pagination);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load audit logs",
      );
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case "create":
        return "bg-green-100 text-green-800";
      case "update":
        return "bg-blue-100 text-blue-800";
      case "delete":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleFilterChange = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  if (loading && logs.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Audit Log</h1>
        <Card>
          <CardContent>
            <p className="text-gray-600">Loading audit logs...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Audit Log</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>
              Activity Log ({pagination.totalItems} entries)
            </CardTitle>
            <div className="flex gap-3">
              <select
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  handleFilterChange();
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Actions</option>
                <option value="create">Create</option>
                <option value="update">Update</option>
                <option value="delete">Delete</option>
              </select>
              <select
                value={entityTypeFilter}
                onChange={(e) => {
                  setEntityTypeFilter(e.target.value);
                  handleFilterChange();
                }}
                className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All Types</option>
                <option value="player">Player</option>
                <option value="tournament">Tournament</option>
                <option value="gallery">Gallery</option>
                <option value="category">Category</option>
                <option value="winner">Winner</option>
                <option value="photo">Photo</option>
              </select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length > 0 ? (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Entity Type</TableHead>
                    <TableHead>Entity ID</TableHead>
                    <TableHead>Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="text-sm text-gray-600">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell className="font-medium">{log.user}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getActionBadgeColor(log.action)}`}
                        >
                          {log.action}
                        </span>
                      </TableCell>
                      <TableCell className="capitalize">
                        {log.entityType}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600 font-mono">
                        {log.entityId}
                      </TableCell>
                      <TableCell className="text-sm text-gray-600">
                        {log.details || "-"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* Pagination */}
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {(pagination.page - 1) * pagination.pageSize + 1} to{" "}
                  {Math.min(
                    pagination.page * pagination.pageSize,
                    pagination.totalItems,
                  )}{" "}
                  of {pagination.totalItems} entries
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!pagination.hasPreviousPage || loading}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!pagination.hasNextPage || loading}
                  >
                    Next
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <p className="text-gray-500">No audit logs found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
