"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Player } from "@/lib/types";
import type { PaginatedResult } from "@/lib/admin/services/PlayerAdminService";
import {
  Table,
  TableHeader,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
} from "@/components/admin/ui/Table";
import { Button } from "@/components/admin/ui/Button";
import { Modal } from "@/components/admin/ui/Modal";
import { Input } from "@/components/admin/ui/Input";
import { useDebounce } from "@/lib/hooks/useDebounce";

export default function PlayersPage() {
  const [players, setPlayers] = useState<PaginatedResult<Player> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Player>("rank");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [genderFilter, setGenderFilter] = useState<string>("");
  const [selectedPlayers, setSelectedPlayers] = useState<Set<string>>(
    new Set(),
  );
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkOperation, setBulkOperation] = useState<string>("");
  const [bulkCategory, setBulkCategory] = useState<string>("");
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);
  const [bulkResult, setBulkResult] = useState<{
    successCount: number;
    failureCount: number;
    errors: Array<{ id: string; error: string }>;
  } | null>(null);
  const pageSize = 20;

  // Debounce search query with 300ms delay
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams({
          page: currentPage.toString(),
          pageSize: pageSize.toString(),
          sortField,
          sortDirection,
        });

        const response = await fetch(`/api/admin/players?${params}`);
        if (!response.ok) {
          throw new Error("Failed to fetch players");
        }

        const result = await response.json();

        // Apply client-side filtering
        let filteredData = result.data;

        // Search filter (using debounced value)
        if (debouncedSearchQuery.trim()) {
          const query = debouncedSearchQuery.toLowerCase();
          filteredData = filteredData.filter((player: Player) => {
            const fullName =
              `${player.firstName} ${player.lastName}`.toLowerCase();
            return fullName.includes(query);
          });
        }

        // Category filter
        if (categoryFilter) {
          filteredData = filteredData.filter(
            (player: Player) => player.category === categoryFilter,
          );
        }

        // Gender filter
        if (genderFilter) {
          filteredData = filteredData.filter(
            (player: Player) => player.gender === genderFilter,
          );
        }

        // Update pagination info based on filtered data
        const filteredResult = {
          ...result,
          data: filteredData,
          pagination: {
            ...result.pagination,
            totalItems: filteredData.length,
            totalPages: Math.ceil(filteredData.length / pageSize),
          },
        };

        setPlayers(filteredResult);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load players");
      } finally {
        setLoading(false);
      }
    };

    fetchPlayers();
  }, [
    currentPage,
    sortField,
    sortDirection,
    debouncedSearchQuery,
    categoryFilter,
    genderFilter,
  ]);

  const loadPlayers = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
        sortField,
        sortDirection,
      });

      const response = await fetch(`/api/admin/players?${params}`);
      if (!response.ok) {
        throw new Error("Failed to fetch players");
      }

      const result = await response.json();
      setPlayers(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load players");
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Player) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
    setCurrentPage(1); // Reset to first page when sorting changes
  };

  const getSortIcon = (field: keyof Player) => {
    if (sortField !== field) {
      return <span className="text-gray-400">↕</span>;
    }
    return sortDirection === "asc" ? (
      <span className="text-blue-600">↑</span>
    ) : (
      <span className="text-blue-600">↓</span>
    );
  };

  const handleSelectPlayer = (playerId: string) => {
    const newSelected = new Set(selectedPlayers);
    if (newSelected.has(playerId)) {
      newSelected.delete(playerId);
    } else {
      newSelected.add(playerId);
    }
    setSelectedPlayers(newSelected);
  };

  const handleSelectAll = () => {
    if (!players) return;
    if (selectedPlayers.size === players.data.length) {
      setSelectedPlayers(new Set());
    } else {
      setSelectedPlayers(new Set(players.data.map((p) => p.id)));
    }
  };

  const handleBulkAction = (operation: string) => {
    if (selectedPlayers.size === 0) return;
    setBulkOperation(operation);
    setShowBulkModal(true);
    setBulkResult(null);
  };

  const executeBulkOperation = async () => {
    if (selectedPlayers.size === 0) return;

    setIsBulkProcessing(true);
    setBulkResult(null);

    try {
      const response = await fetch("/api/admin/players/bulk", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          operation: bulkOperation,
          playerIds: Array.from(selectedPlayers),
          ...(bulkOperation === "updateCategory" && { category: bulkCategory }),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Bulk operation failed");
      }

      const result = await response.json();
      setBulkResult(result);

      // Reload players if any succeeded
      if (result.successCount > 0) {
        await loadPlayers();
        setSelectedPlayers(new Set());
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Bulk operation failed");
    } finally {
      setIsBulkProcessing(false);
    }
  };

  if (loading && !players) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Players Management
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Loading players...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Players Management
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-red-600">Error: {error}</p>
          <Button onClick={loadPlayers} className="mt-4">
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Players Management</h1>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => {
              const params = new URLSearchParams();
              if (searchQuery) params.append("searchQuery", searchQuery);
              if (categoryFilter)
                params.append("categoryFilter", categoryFilter);
              if (genderFilter) params.append("genderFilter", genderFilter);

              window.location.href = `/api/admin/players/export?${params}`;
            }}
          >
            Export to CSV
          </Button>
          <Link href="/admin/players/new">
            <Button variant="primary">Add New Player</Button>
          </Link>
        </div>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search by Name
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset to first page on search
              }}
              placeholder="Enter player name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Category
            </label>
            <select
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1); // Reset to first page on filter
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              <option value="Open">Open</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
            </select>
          </div>

          {/* Gender Filter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter by Gender
            </label>
            <select
              value={genderFilter}
              onChange={(e) => {
                setGenderFilter(e.target.value);
                setCurrentPage(1); // Reset to first page on filter
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Genders</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchQuery || categoryFilter || genderFilter) && (
          <div className="mt-4">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("");
                setGenderFilter("");
                setCurrentPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Bulk Operations */}
      {selectedPlayers.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedPlayers.size} player(s) selected
            </span>
            <div className="flex gap-2">
              <Button
                variant="danger"
                size="sm"
                onClick={() => handleBulkAction("delete")}
              >
                Delete Selected
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleBulkAction("updateCategory")}
              >
                Update Category
              </Button>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedPlayers(new Set())}
              >
                Clear Selection
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input
                    type="checkbox"
                    checked={
                      !!(
                        players &&
                        selectedPlayers.size === players.data.length &&
                        players.data.length > 0
                      )
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("rank")}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    Rank {getSortIcon("rank")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("firstName")}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    Name {getSortIcon("firstName")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("category")}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    Category {getSortIcon("category")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("gender")}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    Gender {getSortIcon("gender")}
                  </button>
                </TableHead>
                <TableHead>
                  <button
                    onClick={() => handleSort("points")}
                    className="flex items-center gap-1 hover:text-blue-600"
                  >
                    Points {getSortIcon("points")}
                  </button>
                </TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {players && players.data.length > 0 ? (
                players.data.map((player) => (
                  <TableRow key={player.id}>
                    <TableCell>
                      <input
                        type="checkbox"
                        checked={selectedPlayers.has(player.id)}
                        onChange={() => handleSelectPlayer(player.id)}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                    </TableCell>
                    <TableCell>{player.rank}</TableCell>
                    <TableCell>
                      <Link
                        href={`/admin/players/${player.id}`}
                        className="text-blue-600 hover:text-blue-800 hover:underline"
                      >
                        {player.firstName} {player.lastName}
                      </Link>
                    </TableCell>
                    <TableCell>{player.category}</TableCell>
                    <TableCell>{player.gender}</TableCell>
                    <TableCell>{player.points}</TableCell>
                    <TableCell>
                      <Link href={`/admin/players/${player.id}`}>
                        <Button variant="ghost" size="sm">
                          View
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell className="text-center text-gray-500">
                    <div className="py-8">No players found</div>
                  </TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                  <TableCell> </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Controls */}
        {players && players.pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(currentPage - 1) * pageSize + 1} to{" "}
              {Math.min(currentPage * pageSize, players.pagination.totalItems)}{" "}
              of {players.pagination.totalItems} players
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={!players.pagination.hasPreviousPage || loading}
              >
                Previous
              </Button>
              <div className="flex items-center gap-2">
                {Array.from(
                  { length: players.pagination.totalPages },
                  (_, i) => i + 1,
                )
                  .filter((page) => {
                    // Show first page, last page, current page, and pages around current
                    return (
                      page === 1 ||
                      page === players.pagination.totalPages ||
                      Math.abs(page - currentPage) <= 1
                    );
                  })
                  .map((page, index, array) => {
                    // Add ellipsis if there's a gap
                    const prevPage = array[index - 1];
                    const showEllipsis = prevPage && page - prevPage > 1;

                    return (
                      <div key={page} className="flex items-center gap-2">
                        {showEllipsis && (
                          <span className="text-gray-500">...</span>
                        )}
                        <Button
                          variant={page === currentPage ? "primary" : "ghost"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                          disabled={loading}
                        >
                          {page}
                        </Button>
                      </div>
                    );
                  })}
              </div>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={!players.pagination.hasNextPage || loading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Bulk Operation Modal */}
      <Modal
        isOpen={showBulkModal}
        onClose={() => {
          setShowBulkModal(false);
          setBulkResult(null);
          setBulkCategory("");
        }}
        title={
          bulkOperation === "delete"
            ? "Bulk Delete Players"
            : "Bulk Update Category"
        }
      >
        <div className="space-y-4">
          {!bulkResult ? (
            <>
              <p className="text-gray-700">
                {bulkOperation === "delete" ? (
                  <>
                    Are you sure you want to delete{" "}
                    <strong>{selectedPlayers.size}</strong> player(s)? This
                    action cannot be undone.
                  </>
                ) : (
                  <>
                    Update category for <strong>{selectedPlayers.size}</strong>{" "}
                    player(s):
                  </>
                )}
              </p>

              {bulkOperation === "updateCategory" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Category
                  </label>
                  <select
                    value={bulkCategory}
                    onChange={(e) => setBulkCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select a category</option>
                    <option value="Open">Open</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4</option>
                    <option value="5">5</option>
                    <option value="6">6</option>
                  </select>
                </div>
              )}

              <div className="flex gap-3 justify-end">
                <Button
                  variant="secondary"
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkCategory("");
                  }}
                  disabled={isBulkProcessing}
                >
                  Cancel
                </Button>
                <Button
                  variant={bulkOperation === "delete" ? "danger" : "primary"}
                  onClick={executeBulkOperation}
                  disabled={
                    isBulkProcessing ||
                    (bulkOperation === "updateCategory" && !bulkCategory)
                  }
                >
                  {isBulkProcessing
                    ? "Processing..."
                    : bulkOperation === "delete"
                      ? "Delete Players"
                      : "Update Category"}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-3">
                <div className="bg-green-50 border border-green-200 px-4 py-3 rounded">
                  <p className="text-green-800">
                    <strong>Success:</strong> {bulkResult.successCount}{" "}
                    player(s) processed successfully
                  </p>
                </div>

                {bulkResult.failureCount > 0 && (
                  <div className="bg-red-50 border border-red-200 px-4 py-3 rounded">
                    <p className="text-red-800 mb-2">
                      <strong>Failed:</strong> {bulkResult.failureCount}{" "}
                      player(s) failed
                    </p>
                    <ul className="text-sm text-red-700 list-disc list-inside">
                      {bulkResult.errors.map((err, idx) => (
                        <li key={idx}>
                          ID {err.id}: {err.error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <Button
                  variant="primary"
                  onClick={() => {
                    setShowBulkModal(false);
                    setBulkResult(null);
                    setBulkCategory("");
                  }}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
}
