"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/admin/ui/Button";
import { Input } from "@/components/admin/ui/Input";
import type {
  Tournament,
  TournamentGenre,
  TournamentStatus,
} from "@/lib/types";
import type { CreateTournamentData } from "@/lib/admin/validation/schemas";

interface TournamentFormProps {
  tournament?: Tournament;
  onSubmit: (data: CreateTournamentData) => Promise<void>;
  onCancel: () => void;
}

export function TournamentForm({
  tournament,
  onSubmit,
  onCancel,
}: TournamentFormProps) {
  const [formData, setFormData] = useState<CreateTournamentData>({
    name: tournament?.name || "",
    date: tournament?.date ? new Date(tournament.date) : new Date(),
    club: tournament?.club || "",
    location: tournament?.location || "",
    genre: tournament?.genre || "Open",
    status: tournament?.status || "upcoming",
    registrationOpen: tournament?.registrationOpen ?? true,
    description: tournament?.description || "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value, type } = e.target;

    let newValue: any = value;

    if (type === "checkbox") {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (type === "date") {
      newValue = new Date(value);
    }

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError(null);
    setErrors({});

    try {
      await onSubmit(formData);
    } catch (error) {
      if (error instanceof Error) {
        setSubmitError(error.message);

        // Try to parse validation errors
        if (error.message.includes("Validation failed:")) {
          const errorParts = error.message
            .replace("Validation failed: ", "")
            .split(", ");
          const newErrors: Record<string, string> = {};
          errorParts.forEach((part) => {
            const [field, message] = part.split(": ");
            if (field && message) {
              newErrors[field] = message;
            }
          });
          setErrors(newErrors);
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Format date for input (YYYY-MM-DD)
  const formatDateForInput = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {submitError}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tournament Name */}
        <div className="md:col-span-2">
          <Input
            label="Tournament Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="e.g., February Tournament at MyPadel"
          />
        </div>

        {/* Date */}
        <div>
          <Input
            label="Date"
            name="date"
            type="date"
            value={formatDateForInput(formData.date)}
            onChange={handleChange}
            error={errors.date}
            required
          />
        </div>

        {/* Club */}
        <div>
          <Input
            label="Club"
            name="club"
            value={formData.club}
            onChange={handleChange}
            error={errors.club}
            required
            placeholder="e.g., MyPadel"
          />
        </div>

        {/* Location */}
        <div className="md:col-span-2">
          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            error={errors.location}
            required
            placeholder="e.g., Playa del Carmen, Mexico"
          />
        </div>

        {/* Genre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Genre <span className="text-red-500">*</span>
          </label>
          <select
            name="genre"
            value={formData.genre}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.genre ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="Open">Open</option>
            <option value="Women">Women</option>
          </select>
          {errors.genre && (
            <p className="mt-1 text-sm text-red-600">{errors.genre}</p>
          )}
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Status <span className="text-red-500">*</span>
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.status ? "border-red-500" : "border-gray-300"
            }`}
          >
            <option value="upcoming">Upcoming</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          {errors.status && (
            <p className="mt-1 text-sm text-red-600">{errors.status}</p>
          )}
        </div>

        {/* Registration Open */}
        <div className="md:col-span-2">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="registrationOpen"
              checked={formData.registrationOpen}
              onChange={handleChange}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Registration Open
            </span>
          </label>
        </div>

        {/* Description */}
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={4}
            className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              errors.description ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Optional tournament description..."
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-600">{errors.description}</p>
          )}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-4 border-t">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting
            ? "Saving..."
            : tournament
              ? "Update Tournament"
              : "Create Tournament"}
        </Button>
      </div>
    </form>
  );
}
