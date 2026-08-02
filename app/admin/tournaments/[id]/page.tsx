"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tournament } from "@/lib/types";
import { Button } from "@/components/admin/ui/Button";
import { Modal } from "@/components/admin/ui/Modal";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/admin/ui/Card";
import { optimizeImage, formatFileSize } from "@/lib/utils/imageOptimization";

interface TournamentDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function TournamentDetailPage({
  params,
}: TournamentDetailPageProps) {
  const router = useRouter();
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showDeleteCategoryModal, setShowDeleteCategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [newCategory, setNewCategory] = useState<string>("");
  const [categoryError, setCategoryError] = useState<string | null>(null);
  const [isProcessingCategory, setIsProcessingCategory] = useState(false);
  const [showSetWinnerModal, setShowSetWinnerModal] = useState(false);
  const [winnerCategory, setWinnerCategory] = useState<string>("");
  const [winnerPlacement, setWinnerPlacement] = useState<1 | 2>(1);
  const [playerSearch, setPlayerSearch] = useState("");
  const [searchResults, setSearchResults] = useState<
    Array<{ id: string; name: string; category: string; photo: string }>
  >([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [winnerError, setWinnerError] = useState<string | null>(null);
  const [isProcessingWinner, setIsProcessingWinner] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [draggedPhotoIndex, setDraggedPhotoIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    // Unwrap the params promise
    params.then(({ id }) => {
      setTournamentId(id);
    });
  }, [params]);

  const loadTournament = async () => {
    if (!tournamentId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/tournaments/${tournamentId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Tournament not found");
        } else {
          throw new Error("Failed to fetch tournament");
        }
        return;
      }

      const result = await response.json();
      setTournament(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load tournament",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tournamentId) {
      loadTournament();
    }
  }, [tournamentId]);

  const handleDelete = async () => {
    if (!tournament) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/tournaments/${tournament.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete tournament");
      }

      // Success - redirect to tournaments list
      router.push("/admin/tournaments");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete tournament",
      );
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleAddCategory = async () => {
    if (!tournament || !newCategory) return;

    setIsProcessingCategory(true);
    setCategoryError(null);

    try {
      const response = await fetch(
        `/api/admin/tournaments/${tournament.id}/categories`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category: newCategory }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to add category");
      }

      const updatedTournament = await response.json();
      setTournament(updatedTournament);
      setShowAddCategoryModal(false);
      setNewCategory("");
    } catch (err) {
      setCategoryError(
        err instanceof Error ? err.message : "Failed to add category",
      );
    } finally {
      setIsProcessingCategory(false);
    }
  };

  const handleRemoveCategory = async () => {
    if (!tournament || !selectedCategory) return;

    setIsProcessingCategory(true);
    setCategoryError(null);

    try {
      const response = await fetch(
        `/api/admin/tournaments/${tournament.id}/categories`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category: selectedCategory }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove category");
      }

      const updatedTournament = await response.json();
      setTournament(updatedTournament);
      setShowDeleteCategoryModal(false);
      setSelectedCategory("");
    } catch (err) {
      setCategoryError(
        err instanceof Error ? err.message : "Failed to remove category",
      );
    } finally {
      setIsProcessingCategory(false);
    }
  };

  const handlePlayerSearch = async (query: string) => {
    if (!tournament || query.length < 2) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/admin/tournaments/${tournament.id}/search-players?query=${encodeURIComponent(query)}`,
      );

      if (!response.ok) {
        throw new Error("Failed to search players");
      }

      const results = await response.json();
      setSearchResults(results);
    } catch (err) {
      console.error("Player search error:", err);
      setSearchResults([]);
    }
  };

  const handleSetWinner = async () => {
    if (!tournament || !winnerCategory || !selectedPlayer) return;

    setIsProcessingWinner(true);
    setWinnerError(null);

    try {
      const response = await fetch(
        `/api/admin/tournaments/${tournament.id}/winners`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            category: winnerCategory,
            playerId: selectedPlayer,
            placement: winnerPlacement,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to set winner");
      }

      const updatedTournament = await response.json();
      setTournament(updatedTournament);
      setShowSetWinnerModal(false);
      setWinnerCategory("");
      setSelectedPlayer("");
      setPlayerSearch("");
      setSearchResults([]);
    } catch (err) {
      setWinnerError(
        err instanceof Error ? err.message : "Failed to set winner",
      );
    } finally {
      setIsProcessingWinner(false);
    }
  };

  const handleRemoveWinner = async (category: string, placement: 1 | 2) => {
    if (!tournament) return;

    try {
      const response = await fetch(
        `/api/admin/tournaments/${tournament.id}/winners`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ category, placement }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove winner");
      }

      const updatedTournament = await response.json();
      setTournament(updatedTournament);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove winner");
    }
  };

  const handlePhotoUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!tournament || !event.target.files || event.target.files.length === 0)
      return;

    const file = event.target.files[0];
    setIsUploadingPhoto(true);
    setPhotoError(null);

    try {
      // Get original file size
      const originalSize = file.size;

      // Optimize image before upload
      const optimizedFile = await optimizeImage(file, {
        maxWidth: 1920,
        maxHeight: 1920,
        quality: 0.85,
      });

      const optimizedSize = optimizedFile.size;
      const savings = ((originalSize - optimizedSize) / originalSize) * 100;

      console.log(
        `Image optimized: ${formatFileSize(originalSize)} → ${formatFileSize(optimizedSize)} (${savings.toFixed(1)}% reduction)`,
      );

      const { uploadAdminImageDirect } = await import(
        "@/lib/admin/client/directCloudinaryUpload"
      );
      const { url } = await uploadAdminImageDirect(optimizedFile, "tournaments");

      // Add photo to tournament
      const addPhotoResponse = await fetch(
        `/api/admin/tournaments/${tournament.id}/photos`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ photoUrl: url }),
        },
      );

      if (!addPhotoResponse.ok) {
        const errorData = await addPhotoResponse.json();
        throw new Error(errorData.error || "Failed to add photo to tournament");
      }

      const updatedTournament = await addPhotoResponse.json();
      setTournament(updatedTournament);

      // Reset file input
      event.target.value = "";
    } catch (err) {
      setPhotoError(
        err instanceof Error ? err.message : "Failed to upload photo",
      );
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handleRemovePhoto = async (photoUrl: string) => {
    if (!tournament) return;

    try {
      const response = await fetch(
        `/api/admin/tournaments/${tournament.id}/photos`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ photoUrl }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove photo");
      }

      const updatedTournament = await response.json();
      setTournament(updatedTournament);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove photo");
    }
  };

  const handlePhotoDragStart = (index: number) => {
    setDraggedPhotoIndex(index);
  };

  const handlePhotoDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handlePhotoDrop = async (dropIndex: number) => {
    if (
      !tournament ||
      draggedPhotoIndex === null ||
      draggedPhotoIndex === dropIndex
    ) {
      setDraggedPhotoIndex(null);
      return;
    }

    const photos = [...(tournament.photos || [])];
    const [draggedPhoto] = photos.splice(draggedPhotoIndex, 1);
    photos.splice(dropIndex, 0, draggedPhoto);

    try {
      const response = await fetch(
        `/api/admin/tournaments/${tournament.id}/photos`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ photoUrls: photos }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to reorder photos");
      }

      const updatedTournament = await response.json();
      setTournament(updatedTournament);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reorder photos");
    } finally {
      setDraggedPhotoIndex(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Tournament Details
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Tournament Details
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-red-600">
            Error: {error || "Tournament not found"}
          </p>
          <div className="mt-4 flex gap-2">
            <Button onClick={loadTournament}>Retry</Button>
            <Link href="/admin/tournaments">
              <Button variant="secondary">Back to Tournaments</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{tournament.name}</h1>
        <div className="flex gap-2">
          <Link href={`/admin/tournaments/${tournament.id}/edit`}>
            <Button variant="primary">Edit Tournament</Button>
          </Link>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
          >
            Delete Tournament
          </Button>
        </div>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Name
                </label>
                <p className="text-gray-900">{tournament.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Date
                </label>
                <p className="text-gray-900">{formatDate(tournament.date)}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Location
                </label>
                <p className="text-gray-900">{tournament.location}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Genre
                </label>
                <p className="text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {tournament.genre}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Status
                </label>
                <p className="text-gray-900">
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
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Registration Open
                </label>
                <p className="text-gray-900">
                  {tournament.registrationOpen ? "Yes" : "No"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-900 whitespace-pre-wrap">
              {tournament.description || "No description available"}
            </p>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Categories</CardTitle>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowAddCategoryModal(true)}
              >
                Add Category
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {tournament.categories.length > 0 ? (
              <div className="space-y-3">
                {tournament.categories.map((cat) => (
                  <div
                    key={cat.category}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <span className="font-medium text-gray-900">
                      {cat.category}
                    </span>
                    <div className="flex gap-2 items-center">
                      <span className="text-sm text-gray-600">
                        {cat.results ? "Has winners" : "No winners yet"}
                      </span>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory(cat.category);
                          setShowDeleteCategoryModal(true);
                        }}
                      >
                        Remove
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No categories added yet</p>
            )}
          </CardContent>
        </Card>

        {/* Winners */}
        <Card>
          <CardHeader>
            <CardTitle>Winners</CardTitle>
          </CardHeader>
          <CardContent>
            {tournament.categories.length > 0 ? (
              <div className="space-y-4">
                {tournament.categories.map((cat) => (
                  <div
                    key={cat.category}
                    className="border-b pb-3 last:border-b-0"
                  >
                    <h4 className="font-medium text-gray-900 mb-2">
                      {cat.category}
                    </h4>
                    <div className="space-y-2 text-sm">
                      {/* First Place */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-yellow-600 font-medium">
                            🥇 1st:
                          </span>
                          {cat.results?.first ? (
                            <>
                              <span className="text-gray-900">
                                {cat.results.first.playerName}
                              </span>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  handleRemoveWinner(cat.category, 1)
                                }
                              >
                                Remove
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setWinnerCategory(cat.category);
                                setWinnerPlacement(1);
                                setShowSetWinnerModal(true);
                              }}
                            >
                              Set Winner
                            </Button>
                          )}
                        </div>
                      </div>

                      {/* Second Place */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-gray-400 font-medium">
                            🥈 2nd:
                          </span>
                          {cat.results?.second ? (
                            <>
                              <span className="text-gray-900">
                                {cat.results.second.playerName}
                              </span>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() =>
                                  handleRemoveWinner(cat.category, 2)
                                }
                              >
                                Remove
                              </Button>
                            </>
                          ) : (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => {
                                setWinnerCategory(cat.category);
                                setWinnerPlacement(2);
                                setShowSetWinnerModal(true);
                              }}
                            >
                              Set Winner
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">
                No categories added yet. Add categories to set winners.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Photos */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Photos</CardTitle>
              <div>
                <input
                  type="file"
                  id="photo-upload"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  disabled={isUploadingPhoto}
                />
                <label htmlFor="photo-upload">
                  <span
                    className={`inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 px-3 py-1.5 text-sm cursor-pointer ${
                      isUploadingPhoto
                        ? "bg-blue-400 text-white cursor-not-allowed"
                        : "bg-blue-600 text-white hover:bg-blue-700"
                    }`}
                  >
                    {isUploadingPhoto ? "Uploading..." : "Upload Photo"}
                  </span>
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {photoError && (
              <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {photoError}
              </div>
            )}
            {tournament.photos && tournament.photos.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {tournament.photos.map((photo, index) => (
                  <div
                    key={index}
                    className="relative aspect-square group cursor-move"
                    draggable
                    onDragStart={() => handlePhotoDragStart(index)}
                    onDragOver={handlePhotoDragOver}
                    onDrop={() => handlePhotoDrop(index)}
                  >
                    <img
                      src={photo}
                      alt={`${tournament.name} photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity rounded-lg flex items-center justify-center">
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => handleRemovePhoto(photo)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Delete
                      </Button>
                    </div>
                    <div className="absolute top-2 left-2 bg-white bg-opacity-75 px-2 py-1 rounded text-xs font-medium">
                      {index + 1}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No photos uploaded yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Link href="/admin/tournaments">
          <Button variant="secondary">Back to Tournaments</Button>
        </Link>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Tournament"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete <strong>{tournament.name}</strong>?
            This action cannot be undone and will remove all associated data
            including categories, winners, and photos.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? "Deleting..." : "Delete Tournament"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Add Category Modal */}
      <Modal
        isOpen={showAddCategoryModal}
        onClose={() => {
          setShowAddCategoryModal(false);
          setNewCategory("");
          setCategoryError(null);
        }}
        title="Add Category"
      >
        <div className="space-y-4">
          {categoryError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {categoryError}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              <option value="Open">Open</option>
              <option value="1">Category 1</option>
              <option value="2">Category 2</option>
              <option value="3">Category 3</option>
              <option value="4">Category 4</option>
              <option value="5">Category 5</option>
              <option value="6">Category 6</option>
            </select>
          </div>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowAddCategoryModal(false);
                setNewCategory("");
                setCategoryError(null);
              }}
              disabled={isProcessingCategory}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleAddCategory}
              disabled={isProcessingCategory || !newCategory}
            >
              {isProcessingCategory ? "Adding..." : "Add Category"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Category Modal */}
      <Modal
        isOpen={showDeleteCategoryModal}
        onClose={() => {
          setShowDeleteCategoryModal(false);
          setSelectedCategory("");
          setCategoryError(null);
        }}
        title="Remove Category"
      >
        <div className="space-y-4">
          {categoryError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {categoryError}
            </div>
          )}
          <p className="text-gray-700">
            Are you sure you want to remove the{" "}
            <strong>{selectedCategory}</strong> category? This will also remove
            all associated winners and results.
          </p>
          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowDeleteCategoryModal(false);
                setSelectedCategory("");
                setCategoryError(null);
              }}
              disabled={isProcessingCategory}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRemoveCategory}
              disabled={isProcessingCategory}
            >
              {isProcessingCategory ? "Removing..." : "Remove Category"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Set Winner Modal */}
      <Modal
        isOpen={showSetWinnerModal}
        onClose={() => {
          setShowSetWinnerModal(false);
          setWinnerCategory("");
          setSelectedPlayer("");
          setPlayerSearch("");
          setSearchResults([]);
          setWinnerError(null);
        }}
        title={`Set ${winnerPlacement === 1 ? "1st" : "2nd"} Place Winner - ${winnerCategory}`}
      >
        <div className="space-y-4">
          {winnerError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {winnerError}
            </div>
          )}

          {/* Player Search */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Search Player
            </label>
            <input
              type="text"
              value={playerSearch}
              onChange={(e) => {
                setPlayerSearch(e.target.value);
                handlePlayerSearch(e.target.value);
              }}
              placeholder="Type player name..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="border border-gray-200 rounded-md max-h-60 overflow-y-auto">
              {searchResults.map((player) => (
                <button
                  key={player.id}
                  onClick={() => {
                    setSelectedPlayer(player.id);
                    setPlayerSearch(player.name);
                    setSearchResults([]);
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 border-b last:border-b-0 ${
                    selectedPlayer === player.id ? "bg-blue-50" : ""
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={player.photo}
                      alt={player.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <div className="font-medium text-gray-900">
                        {player.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        Category: {player.category}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Selected Player */}
          {selectedPlayer && searchResults.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 px-4 py-3 rounded">
              <p className="text-sm text-blue-800">
                Selected: <strong>{playerSearch}</strong>
              </p>
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <Button
              variant="secondary"
              onClick={() => {
                setShowSetWinnerModal(false);
                setWinnerCategory("");
                setSelectedPlayer("");
                setPlayerSearch("");
                setSearchResults([]);
                setWinnerError(null);
              }}
              disabled={isProcessingWinner}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSetWinner}
              disabled={isProcessingWinner || !selectedPlayer}
            >
              {isProcessingWinner ? "Setting..." : "Set Winner"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
