"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PlayerForm } from "@/components/admin/forms/PlayerForm";
import { Button } from "@/components/admin/ui/Button";
import Link from "next/link";
import type { Player } from "@/lib/types";
import type { CreatePlayerData } from "@/lib/admin/validation/schemas";

interface EditPlayerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditPlayerPage({ params }: EditPlayerPageProps) {
  const router = useRouter();
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [player, setPlayer] = useState<Player | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (data: CreatePlayerData) => {
    if (!playerId) return;

    setError(null);

    try {
      const response = await fetch(`/api/admin/players/${playerId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update player");
      }

      // Success - redirect to player detail page
      router.push(`/admin/players/${playerId}`);
    } catch (err) {
      // Re-throw to let form handle validation errors
      throw err;
    }
  };

  const handleCancel = () => {
    if (!playerId) return;
    router.push(`/admin/players/${playerId}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Player</h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Loading player...</p>
        </div>
      </div>
    );
  }

  if (error || !player) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Edit Player</h1>
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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Player</h1>
        <p className="mt-2 text-gray-600">
          Update {player.firstName} {player.lastName}'s information
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <PlayerForm
          player={player}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
