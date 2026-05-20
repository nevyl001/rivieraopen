"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Player } from "@/lib/types";
import { Button } from "@/components/admin/ui/Button";
import { Modal } from "@/components/admin/ui/Modal";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/admin/ui/Card";

interface PlayerDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function PlayerDetailPage({ params }: PlayerDetailPageProps) {
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Unwrap the params promise
    params.then(({ id }) => {
      setPlayerId(id);
    });
  }, [params]);

  useEffect(() => {
    if (playerId) {
      loadPlayer();
    }
  }, [playerId]);

  const loadPlayer = async () => {
    if (!playerId) return;

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/admin/players/${playerId}`);
      if (!response.ok) {
        if (response.status === 404) {
          setError("Player not found");
        } else {
          throw new Error("Failed to fetch player");
        }
        return;
      }

      const result = await response.json();
      setPlayer(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load player");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!player) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/players/${player.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete player");
      }

      // Success - redirect to players list
      router.push("/admin/players");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete player");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Player Details
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Loading player...</p>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Player Details
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-red-600">Error: {error || "Player not found"}</p>
          <div className="mt-4 flex gap-2">
            <Button onClick={loadPlayer}>Retry</Button>
            <Link href="/admin/players">
              <Button variant="secondary">Back to Players</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          {player.firstName} {player.lastName}
        </h1>
        <div className="flex gap-2">
          <Link href={`/admin/players/${player.id}/edit`}>
            <Button variant="primary">Edit Player</Button>
          </Link>
          <Button
            variant="danger"
            onClick={() => setShowDeleteModal(true)}
            disabled={isDeleting}
          >
            Delete Player
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
                <p className="text-gray-900">
                  {player.firstName} {player.lastName}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Category
                </label>
                <p className="text-gray-900">{player.category}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Gender
                </label>
                <p className="text-gray-900">{player.gender}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Points
                </label>
                <p className="text-gray-900">{player.points}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">
                  Rank
                </label>
                <p className="text-gray-900">{player.rank}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Photo */}
        <Card>
          <CardHeader>
            <CardTitle>Photo</CardTitle>
          </CardHeader>
          <CardContent>
            {player.photo ? (
              <img
                src={player.photo}
                alt={`${player.firstName} ${player.lastName}`}
                className="w-full h-64 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">No photo available</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {player.contact?.email && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Email
                  </label>
                  <p className="text-gray-900">
                    <a
                      href={`mailto:${player.contact.email}`}
                      className="text-blue-600 hover:underline"
                    >
                      {player.contact.email}
                    </a>
                  </p>
                </div>
              )}
              {player.contact?.phone && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Phone
                  </label>
                  <p className="text-gray-900">
                    <a
                      href={`tel:${player.contact.phone}`}
                      className="text-blue-600 hover:underline"
                    >
                      {player.contact.phone}
                    </a>
                  </p>
                </div>
              )}
              {!player.contact?.email && !player.contact?.phone && (
                <p className="text-gray-500">
                  No contact information available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <CardTitle>Social Media</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {player.socials?.instagram && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Instagram
                  </label>
                  <p className="text-gray-900">
                    <a
                      href={player.socials.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {player.socials.instagram}
                    </a>
                  </p>
                </div>
              )}
              {player.socials?.facebook && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Facebook
                  </label>
                  <p className="text-gray-900">
                    <a
                      href={player.socials.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {player.socials.facebook}
                    </a>
                  </p>
                </div>
              )}
              {player.socials?.twitter && (
                <div>
                  <label className="text-sm font-medium text-gray-500">
                    Twitter
                  </label>
                  <p className="text-gray-900">
                    <a
                      href={player.socials.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {player.socials.twitter}
                    </a>
                  </p>
                </div>
              )}
              {!player.socials?.instagram &&
                !player.socials?.facebook &&
                !player.socials?.twitter && (
                  <p className="text-gray-500">
                    No social media links available
                  </p>
                )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Link href="/admin/players">
          <Button variant="secondary">Back to Players</Button>
        </Link>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Player"
      >
        <div className="space-y-4">
          <p className="text-gray-700">
            Are you sure you want to delete{" "}
            <strong>
              {player.firstName} {player.lastName}
            </strong>
            ? This action cannot be undone and will remove all associated data.
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
              {isDeleting ? "Deleting..." : "Delete Player"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
