"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TournamentForm } from "@/components/admin/forms/TournamentForm";
import { Button } from "@/components/admin/ui/Button";
import Link from "next/link";
import type { CreateTournamentData } from "@/lib/admin/validation/schemas";

export default function NewTournamentPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreateTournamentData) => {
    setError(null);

    try {
      const response = await fetch("/api/admin/tournaments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create tournament");
      }

      const tournament = await response.json();

      // Success - redirect to tournament detail page
      router.push(`/admin/tournaments/${tournament.id}`);
    } catch (err) {
      // Re-throw to let form handle validation errors
      throw err;
    }
  };

  const handleCancel = () => {
    router.push("/admin/tournaments");
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">
          Create New Tournament
        </h1>
        <p className="mt-2 text-gray-600">Add a new tournament to the system</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <TournamentForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
