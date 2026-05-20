/**
 * Property-Based Tests for Cloudinary Configuration
 *
 * Tests universal properties that must hold for all inputs.
 * Uses fast-check for property-based testing.
 *
 * Property 1: Configuration requires all credentials
 * Validates: Requirements 1.2
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import * as fc from "fast-check";
import { configureCloudinary, resetConfiguration } from "../config";

describe("Cloudinary Configuration - Property Tests", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset configuration state before each test
    resetConfiguration();
    // Create a fresh copy of environment
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    // Restore original environment
    process.env = originalEnv;
    resetConfiguration();
  });

  /**
   * Property 1: Configuration requires all credentials
   *
   * ∀ cloudName, apiKey, apiSecret.
   *   (cloudName = null ∨ cloudName = "" ∨
   *    apiKey = null ∨ apiKey = "" ∨
   *    apiSecret = null ∨ apiSecret = "") ⟹
   *      configureCloudinary() throws Error
   */
  describe("Property 1: Configuration requires all credentials", () => {
    it("should throw error when CLOUDINARY_CLOUD_NAME is missing or empty", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.constant(undefined),
            fc.constant(""),
            fc.constant("   "), // whitespace only
          ),
          fc.string({ minLength: 1 }), // valid apiKey
          fc.string({ minLength: 1 }), // valid apiSecret
          (cloudName, apiKey, apiSecret) => {
            // Arrange
            if (cloudName !== undefined) {
              process.env.CLOUDINARY_CLOUD_NAME = cloudName;
            } else {
              delete process.env.CLOUDINARY_CLOUD_NAME;
            }
            process.env.CLOUDINARY_API_KEY = apiKey;
            process.env.CLOUDINARY_API_SECRET = apiSecret;

            // Act & Assert
            expect(() => configureCloudinary()).toThrow(
              /CLOUDINARY_CLOUD_NAME/,
            );

            // Reset for next iteration
            resetConfiguration();
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should throw error when CLOUDINARY_API_KEY is missing or empty", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0), // valid non-whitespace cloudName
          fc.oneof(
            fc.constant(undefined),
            fc.constant(""),
            fc.constant("   "), // whitespace only
          ),
          fc.string({ minLength: 1 }), // valid apiSecret
          (cloudName, apiKey, apiSecret) => {
            // Arrange
            process.env.CLOUDINARY_CLOUD_NAME = cloudName;
            if (apiKey !== undefined) {
              process.env.CLOUDINARY_API_KEY = apiKey;
            } else {
              delete process.env.CLOUDINARY_API_KEY;
            }
            process.env.CLOUDINARY_API_SECRET = apiSecret;

            // Act & Assert
            expect(() => configureCloudinary()).toThrow(/CLOUDINARY_API_KEY/);

            // Reset for next iteration
            resetConfiguration();
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should throw error when CLOUDINARY_API_SECRET is missing or empty", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0), // valid non-whitespace cloudName
          fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0), // valid non-whitespace apiKey
          fc.oneof(
            fc.constant(undefined),
            fc.constant(""),
            fc.constant("   "), // whitespace only
          ),
          (cloudName, apiKey, apiSecret) => {
            // Arrange
            process.env.CLOUDINARY_CLOUD_NAME = cloudName;
            process.env.CLOUDINARY_API_KEY = apiKey;
            if (apiSecret !== undefined) {
              process.env.CLOUDINARY_API_SECRET = apiSecret;
            } else {
              delete process.env.CLOUDINARY_API_SECRET;
            }

            // Act & Assert
            expect(() => configureCloudinary()).toThrow(
              /CLOUDINARY_API_SECRET/,
            );

            // Reset for next iteration
            resetConfiguration();
          },
        ),
        { numRuns: 100 },
      );
    });

    it("should succeed when all credentials are valid non-empty strings", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          fc.string({ minLength: 1 }).filter((s) => s.trim().length > 0),
          (cloudName, apiKey, apiSecret) => {
            // Arrange
            process.env.CLOUDINARY_CLOUD_NAME = cloudName;
            process.env.CLOUDINARY_API_KEY = apiKey;
            process.env.CLOUDINARY_API_SECRET = apiSecret;

            // Act & Assert
            expect(() => configureCloudinary()).not.toThrow();

            // Reset for next iteration
            resetConfiguration();
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
