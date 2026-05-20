"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { TournamentForm } from "@/components/admin/forms/TournamentForm";
import { Button } from "@/components/admin/ui/Button";
import Link from "next/link";
import type { Tournament } from "@/lib/types";
import type { CreateTournamentData } from "@/lib/admin/validation/schemas";

interface EditTournamentPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditTournamentPage({
  params,
}: EditTournamentPageProps) {
  const router = useRouter();
  const [tournamentId, setTournamentId] = useState<string | null>(null);
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleSubmit = async (data: CreateTournamentData) => {
    if (!tournamentId) return;

    setError(null);

    try {
      const response = await fetch(`/api/admin/tournaments/${tournamentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update tournament");
      }

      // Success - redirect to tournament detail page
      router.push(`/admin/tournaments/${tournamentId}`);
    } catch (err) {
      // Re-throw to let form handle validation errors
      throw err;
    }
  };

  const handleCancel = () => {
    if (!tournamentId) return;
    router.push(`/admin/tournaments/${tournamentId}`);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Edit Tournament
        </h1>
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-600">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (error || !tournament) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Edit Tournament
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
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Edit Tournament</h1>
        <p className="mt-2 text-gray-600">Update {tournament.name}</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <TournamentForm
          tournament={tournament}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
}
