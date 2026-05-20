"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tournament, TournamentStatus, TournamentGenre } from "@/lib/types";
import { Button } from "@/components/admin/ui/Button";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/admin/ui/Table";

interface PaginationResult {
  data: Tournament[];
  pagination: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

export default function TournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState<keyof Tournament>("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState<TournamentStatus | "">("");
  const [genreFilter, setGenreFilter] = useState<TournamentGenre | "">("");

  useEffect(() => {
    loadTournaments();
  }, [page, sortBy, sortOrder, statusFilter, genreFilter]);

  const loadTournaments = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: "20",
        sortBy,
        sortOrder,
      });

      if (statusFilter) params.append("status", statusFilter);
      if (genreFilter) params.append("genre", genreFilter);

      const response = await fetch(`/api/admin/tournaments?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tournaments");
      }

      const result: PaginationResult = await response.json();
      setTournaments(result.data);
      setTotalPages(result.pagination.totalPages);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load tournaments",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (column: keyof Tournament) => {
    if (sortBy === column) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(column);
      setSortOrder("asc");
    }
    setPage(1);
  };

  const handleStatusFilterChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    setStatusFilter(e.target.value as TournamentStatus | "");
    setPage(1);
  };

  const handleGenreFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setGenreFilter(e.target.value as TournamentGenre | "");
    setPage(1);
  };

  const clearFilters = () => {
    setStatusFilter("");
    setGenreFilter("");
    setPage(1);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const getSortIndicator = (column: keyof Tournament) => {
    if (sortBy !== column) return null;
    return sortOrder === "asc" ? " ↑" : " ↓";
  };

  if (loading && tournaments.length === 0) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Tournaments</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tournaments</h1>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              const params = new URLSearchParams();
              if (statusFilter) params.append("statusFilter", statusFilter);
              if (genreFilter) params.append("genreFilter", genreFilter);

              window.location.href = `/api/admin/tournaments/export?${params}`;
            }}
          >
            Export to CSV
          </Button>
          <Link href="/admin/tournaments/new">
            <Button variant="primary">Add New Tournament</Button>
          </Link>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="mb-6 bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Genre
            </label>
            <select
              value={genreFilter}
              onChange={handleGenreFilterChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Genres</option>
              <option value="Open">Open</option>
              <option value="Women">Women</option>
            </select>
          </div>

          {(statusFilter || genreFilter) && (
            <div>
              <Button variant="secondary" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Tournaments Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                onClick={() => handleSort("name")}
                className="cursor-pointer hover:bg-gray-50"
              >
                Name{getSortIndicator("name")}
              </TableHead>
              <TableHead
                onClick={() => handleSort("date")}
                className="cursor-pointer hover:bg-gray-50"
              >
                Date{getSortIndicator("date")}
              </TableHead>
              <TableHead>Location</TableHead>
              <TableHead
                onClick={() => handleSort("genre")}
                className="cursor-pointer hover:bg-gray-50"
              >
                Genre{getSortIndicator("genre")}
              </TableHead>
              <TableHead
                onClick={() => handleSort("status")}
                className="cursor-pointer hover:bg-gray-50"
              >
                Status{getSortIndicator("status")}
              </TableHead>
              <TableHead>Categories</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tournaments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500">
                  No tournaments found
                </TableCell>
              </TableRow>
            ) : (
              tournaments.map((tournament) => (
                <TableRow key={tournament.id}>
                  <TableCell className="font-medium">
                    {tournament.name}
                  </TableCell>
                  <TableCell>{formatDate(tournament.date)}</TableCell>
                  <TableCell>{tournament.location}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {tournament.genre}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tournament.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : tournament.status === "in-progress"
                            ? "bg-yellow-100 text-yellow-800"
                            : tournament.status === "upcoming"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {tournament.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    {tournament.categories.length > 0
                      ? tournament.categories.map((c) => c.category).join(", ")
                      : "None"}
                  </TableCell>
                  <TableCell>
                    <Link href={`/admin/tournaments/${tournament.id}`}>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center items-center gap-2">
          <Button
            variant="secondary"
            onClick={() => setPage(page - 1)}
            disabled={page === 1 || loading}
          >
            Previous
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setPage(pageNum)}
                  disabled={loading}
                  className={`px-3 py-1 rounded ${
                    pageNum === page
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-100"
                  } border border-gray-300 disabled:opacity-50`}
                >
                  {pageNum}
                </button>
              ),
            )}
          </div>

          <Button
            variant="secondary"
            onClick={() => setPage(page + 1)}
            disabled={page === totalPages || loading}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
