"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlayerForm } from "@/components/admin/forms/PlayerForm";
import type { CreatePlayerData } from "@/lib/admin/validation/schemas";

export default function NewPlayerPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (data: CreatePlayerData) => {
    setError(null);

    try {
      const response = await fetch("/api/admin/players", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create player");
      }

      // Success - redirect to players list
      router.push("/admin/players");
    } catch (err) {
      // Re-throw to let form handle validation errors
      throw err;
    }
  };

  const handleCancel = () => {
    router.push("/admin/players");
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Player</h1>
        <p className="mt-2 text-gray-600">
          Create a new player profile with contact and social media information.
        </p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-6">
        <PlayerForm onSubmit={handleSubmit} onCancel={handleCancel} />
      </div>
    </div>
  );
}
