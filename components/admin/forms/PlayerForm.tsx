"use client";

import { useState, FormEvent } from "react";
import { Button } from "@/components/admin/ui/Button";
import { Input } from "@/components/admin/ui/Input";
import type { Player } from "@/lib/types";
import type { CreatePlayerData } from "@/lib/admin/validation/schemas";

interface PlayerFormProps {
  player?: Player; // If provided, form is in edit mode
  onSubmit: (data: CreatePlayerData) => Promise<void>;
  onCancel: () => void;
}

export function PlayerForm({ player, onSubmit, onCancel }: PlayerFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string>("");

  // Form state
  const [formData, setFormData] = useState<CreatePlayerData>({
    firstName: player?.firstName || "",
    lastName: player?.lastName || "",
    photo: player?.photo || "",
    category: player?.category || "Open",
    gender: player?.gender || "Male",
    points: player?.points || 0,
    contact: {
      email: player?.contact?.email || "",
      phone: player?.contact?.phone || "",
    },
    socials: {
      instagram: player?.socials?.instagram || "",
      facebook: player?.socials?.facebook || "",
      twitter: player?.socials?.twitter || "",
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadError("");

    try {
      const { uploadAdminImageDirect } = await import(
        "@/lib/admin/client/directCloudinaryUpload"
      );
      const result = await uploadAdminImageDirect(file, "players");
      updateField("photo", result.url);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : "Failed to upload image",
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    // Validate photo is uploaded
    if (!formData.photo) {
      setErrors({ photo: "Please upload a photo before submitting" });
      setIsSubmitting(false);
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      // Parse validation errors from error message
      if (error instanceof Error) {
        const errorMessage = error.message;
        if (errorMessage.includes("Validation failed:")) {
          const errorParts = errorMessage
            .replace("Validation failed: ", "")
            .split(", ");
          const parsedErrors: Record<string, string> = {};
          errorParts.forEach((part) => {
            const [field, message] = part.split(": ");
            if (field && message) {
              parsedErrors[field] = message;
            }
          });
          setErrors(parsedErrors);
        } else {
          setErrors({ general: errorMessage });
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateField = (
    field: keyof CreatePlayerData,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error for this field when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const updateContactField = (field: "email" | "phone", value: string) => {
    setFormData((prev) => ({
      ...prev,
      contact: { ...prev.contact, [field]: value },
    }));
    const errorKey = `contact.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const updateSocialField = (
    field: "instagram" | "facebook" | "twitter",
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      socials: { ...prev.socials, [field]: value },
    }));
    const errorKey = `socials.${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {errors.general}
        </div>
      )}

      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Basic Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={formData.firstName}
            onChange={(e) => updateField("firstName", e.target.value)}
            error={errors.firstName}
            required
          />

          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => updateField("lastName", e.target.value)}
            error={errors.lastName}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Photo <span className="text-red-500">*</span>
          </label>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            onChange={handleFileUpload}
            disabled={isUploading}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {isUploading && (
            <p className="mt-1 text-sm text-blue-600">Uploading...</p>
          )}
          {uploadError && (
            <p className="mt-1 text-sm text-red-600">{uploadError}</p>
          )}
          {formData.photo && !isUploading && (
            <div className="mt-2">
              <img
                src={formData.photo}
                alt="Preview"
                className="h-20 w-20 object-cover rounded-md"
              />
              <p className="mt-1 text-xs text-gray-500">Current photo</p>
            </div>
          )}
          {errors.photo && (
            <p className="mt-1 text-sm text-red-600">{errors.photo}</p>
          )}
          <p className="mt-1 text-sm text-gray-500">
            Max 5MB. Allowed: JPEG, PNG, WebP
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) => updateField("category", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Open">Open</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-600">{errors.category}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Gender <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.gender}
              onChange={(e) => updateField("gender", e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
            {errors.gender && (
              <p className="mt-1 text-sm text-red-600">{errors.gender}</p>
            )}
          </div>

          <Input
            label="Points"
            type="number"
            value={formData.points}
            onChange={(e) => updateField("points", parseInt(e.target.value))}
            error={errors.points}
            min={0}
            required
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Contact Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Email"
            type="email"
            value={formData.contact.email}
            onChange={(e) => updateContactField("email", e.target.value)}
            error={errors["contact.email"]}
            required
          />

          <Input
            label="Phone"
            type="tel"
            value={formData.contact.phone}
            onChange={(e) => updateContactField("phone", e.target.value)}
            error={errors["contact.phone"]}
            helperText="Format: +1234567890 or (123) 456-7890"
            required
          />
        </div>
      </div>

      {/* Social Media */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">
          Social Media (Optional)
        </h3>

        <Input
          label="Instagram URL"
          value={formData.socials?.instagram || ""}
          onChange={(e) => updateSocialField("instagram", e.target.value)}
          error={errors["socials.instagram"]}
          helperText="Full URL (e.g., https://instagram.com/username)"
        />

        <Input
          label="Facebook URL"
          value={formData.socials?.facebook || ""}
          onChange={(e) => updateSocialField("facebook", e.target.value)}
          error={errors["socials.facebook"]}
          helperText="Full URL (e.g., https://facebook.com/username)"
        />

        <Input
          label="Twitter URL"
          value={formData.socials?.twitter || ""}
          onChange={(e) => updateSocialField("twitter", e.target.value)}
          error={errors["socials.twitter"]}
          helperText="Full URL (e.g., https://twitter.com/username)"
        />
      </div>

      {/* Form Actions */}
      <div className="flex gap-3 pt-4 border-t">
        <Button type="submit" disabled={isSubmitting || isUploading}>
          {isSubmitting
            ? "Saving..."
            : isUploading
              ? "Uploading photo..."
              : player
                ? "Update Player"
                : "Create Player"}
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
