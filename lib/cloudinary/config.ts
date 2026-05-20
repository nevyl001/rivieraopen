/**
 * Cloudinary Configuration Module
 *
 * Configures the Cloudinary SDK with credentials from environment variables.
 * Implements singleton pattern to ensure configuration is loaded once.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4, 11.1, 11.2, 11.3, 11.4, 11.5
 */

import { v2 as cloudinary } from "cloudinary";

/**
 * Configuration state
 */
let isConfigured = false;

/**
 * Configure Cloudinary SDK with environment variables
 *
 * Preconditions:
 * - Environment variables CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET are defined
 * - Environment variables are non-empty strings
 * - Function is called before any upload operations
 *
 * Postconditions:
 * - Cloudinary SDK is configured with valid credentials
 * - Configuration is stored in singleton instance
 * - Subsequent upload operations can access configuration
 *
 * @throws {Error} If required environment variables are missing
 */
export function configureCloudinary(): void {
  // Only configure once (singleton pattern)
  if (isConfigured) {
    return;
  }

  // Validate environment variables
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || cloudName.trim() === "") {
    throw new Error(
      "CLOUDINARY_CLOUD_NAME environment variable is required. " +
        "Get your credentials from https://console.cloudinary.com/",
    );
  }

  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "CLOUDINARY_API_KEY environment variable is required. " +
        "Get your credentials from https://console.cloudinary.com/",
    );
  }

  if (!apiSecret || apiSecret.trim() === "") {
    throw new Error(
      "CLOUDINARY_API_SECRET environment variable is required. " +
        "Get your credentials from https://console.cloudinary.com/",
    );
  }

  // Configure Cloudinary SDK
  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true, // Always use HTTPS
  });

  isConfigured = true;
}

/**
 * Get the configured Cloudinary instance
 *
 * Preconditions:
 * - configureCloudinary() has been called
 *
 * Postconditions:
 * - Returns configured Cloudinary instance
 *
 * @returns Configured Cloudinary v2 instance
 * @throws {Error} If Cloudinary is not configured
 */
export function getCloudinaryInstance() {
  if (!isConfigured) {
    configureCloudinary();
  }
  return cloudinary;
}

/**
 * Check if Cloudinary is configured
 *
 * @returns True if Cloudinary is configured, false otherwise
 */
export function isCloudinaryConfigured(): boolean {
  return isConfigured;
}

/**
 * Reset configuration state (for testing purposes)
 *
 * @internal
 */
export function resetConfiguration(): void {
  isConfigured = false;
}
