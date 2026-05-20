/**
 * Unit Tests for Cloudinary Configuration
 *
 * Tests specific examples and edge cases for configuration module.
 *
 * Requirements: 1.1, 1.2, 1.3, 1.4
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import {
  configureCloudinary,
  getCloudinaryInstance,
  isCloudinaryConfigured,
  resetConfiguration,
} from "../config";

describe("Cloudinary Configuration - Unit Tests", () => {
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

  describe("configureCloudinary", () => {
    it("should configure Cloudinary with valid credentials", () => {
      // Arrange
      process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
      process.env.CLOUDINARY_API_KEY = "test-key";
      process.env.CLOUDINARY_API_SECRET = "test-secret";

      // Act
      configureCloudinary();

      // Assert
      expect(isCloudinaryConfigured()).toBe(true);
    });

    it("should throw error when CLOUDINARY_CLOUD_NAME is missing", () => {
      // Arrange
      delete process.env.CLOUDINARY_CLOUD_NAME;
      process.env.CLOUDINARY_API_KEY = "test-key";
      process.env.CLOUDINARY_API_SECRET = "test-secret";

      // Act & Assert
      expect(() => configureCloudinary()).toThrow(
        /CLOUDINARY_CLOUD_NAME environment variable is required/,
      );
    });

    it("should throw error when CLOUDINARY_CLOUD_NAME is empty string", () => {
      // Arrange
      process.env.CLOUDINARY_CLOUD_NAME = "";
      process.env.CLOUDINARY_API_KEY = "test-key";
      process.env.CLOUDINARY_API_SECRET = "test-secret";

      // Act & Assert
      expect(() => configureCloudinary()).toThrow(
        /CLOUDINARY_CLOUD_NAME environment variable is required/,
      );
    });

    it("should throw error when CLOUDINARY_CLOUD_NAME is whitespace only", () => {
      // Arrange
      process.env.CLOUDINARY_CLOUD_NAME = "   ";
      process.env.CLOUDINARY_API_KEY = "test-key";
      process.env.CLOUDINARY_API_SECRET = "test-secret";

      // Act & Assert
      expect(() => configureCloudinary()).toThrow(
        /CLOUDINARY_CLOUD_NAME environment variable is required/,
      );
    });

    it("should throw error when CLOUDINARY_API_KEY is missing", () => {
      // Arrange
      process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
      delete process.env.CLOUDINARY_API_KEY;
      process.env.CLOUDINARY_API_SECRET = "test-secret";

      // Act & Assert
      expect(() => configureCloudinary()).toThrow(
        /CLOUDINARY_API_KEY environment variable is required/,
      );
    });

    it("should throw error when CLOUDINARY_API_KEY is empty string", () => {
      // Arrange
      process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
      process.env.CLOUDINARY_API_KEY = "";
      process.env.CLOUDINARY_API_SECRET = "test-secret";

      // Act & Assert
      expect(() => configureCloudinary()).toThrow(
        /CLOUDINARY_API_KEY environment variable is required/,
      );
    });

    it("should throw error when CLOUDINARY_API_SECRET is missing", () => {
      // Arrange
      process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
      process.env.CLOUDINARY_API_KEY = "test-key";
      delete process.env.CLOUDINARY_API_SECRET;

      // Act & Assert
      expect(() => configureCloudinary()).toThrow(
        /CLOUDINARY_API_SECRET environment variable is required/,
      );
    });

    it("should throw error when CLOUDINARY_API_SECRET is empty string", () => {
      // Arrange
      process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
      process.env.CLOUDINARY_API_KEY = "test-key";
      process.env.CLOUDINARY_API_SECRET = "";

      // Act & Assert
      expect(() => configureCloudinary()).toThrow(
        /CLOUDINARY_API_SECRET environment variable is required/,
      );
    });

    it("should only configure once (singleton pattern)", () => {
      // Arrange
      process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
      process.env.CLOUDINARY_API_KEY = "test-key";
      process.env.CLOUDINARY_API_SECRET = "test-secret";

      // Act
      configureCloudinary();
      const firstCheck = isCloudinaryConfigured();

      // Change environment variables
      process.env.CLOUDINARY_CLOUD_NAME = "different-cloud";

      // Call configure again
      configureCloudinary();
      const secondCheck = isCloudinaryConfigured();

      // Assert
      expect(firstCheck).toBe(true);
      expect(secondCheck).toBe(true);
      // Configuration should not be called again (singleton)
    });

    it("should include helpful error message with Cloudinary console URL", () => {
      // Arrange
      delete process.env.CLOUDINARY_CLOUD_NAME;
      process.env.CLOUDINARY_API_KEY = "test-key";
      process.env.CLOUDINARY_API_SECRET = "test-secret";

      // Act & Assert
      expect(() => configureCloudinary()).toThrow(
        /https:\/\/console\.cloudinary\.com\//,
      );
    });
  });

  describe("getCloudinaryInstance", () => {
    it("should return Cloudinary instance after configuration", () => {
      // Arrange
      process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
      process.env.CLOUDINARY_API_KEY = "test-key";
      process.env.CLOUDINARY_API_SECRET = "test-secret";
      configureCloudinary();

      // Act
      const instance = getCloudinaryInstance();

      // Assert
      expect(instance).toBeDefined();
      expect(instance.config()).toBeDefined();
    });

    it("should auto-configure if not already configured", () => {
      // Arrange
      process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
      process.env.CLOUDINARY_API_KEY = "test-key";
      process.env.CLOUDINARY_API_SECRET = "test-secret";

      // Act
      const instance = getCloudinaryInstance();

      // Assert
      expect(instance).toBeDefined();
      expect(isCloudinaryConfigured()).toBe(true);
    });

    it("should return same instance on multiple calls (singleton)", () => {
      // Arrange
      process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
      process.env.CLOUDINARY_API_KEY = "test-key";
      process.env.CLOUDINARY_API_SECRET = "test-secret";

      // Act
      const instance1 = getCloudinaryInstance();
      const instance2 = getCloudinaryInstance();

      // Assert
      expect(instance1).toBe(instance2);
    });
  });

  describe("isCloudinaryConfigured", () => {
    it("should return false before configuration", () => {
      // Act
      const result = isCloudinaryConfigured();

      // Assert
      expect(result).toBe(false);
    });

    it("should return true after successful configuration", () => {
      // Arrange
      process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
      process.env.CLOUDINARY_API_KEY = "test-key";
      process.env.CLOUDINARY_API_SECRET = "test-secret";
      configureCloudinary();

      // Act
      const result = isCloudinaryConfigured();

      // Assert
      expect(result).toBe(true);
    });

    it("should return false after reset", () => {
      // Arrange
      process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
      process.env.CLOUDINARY_API_KEY = "test-key";
      process.env.CLOUDINARY_API_SECRET = "test-secret";
      configureCloudinary();

      // Act
      resetConfiguration();
      const result = isCloudinaryConfigured();

      // Assert
      expect(result).toBe(false);
    });
  });

  describe("resetConfiguration", () => {
    it("should reset configuration state", () => {
      // Arrange
      process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
      process.env.CLOUDINARY_API_KEY = "test-key";
      process.env.CLOUDINARY_API_SECRET = "test-secret";
      configureCloudinary();
      expect(isCloudinaryConfigured()).toBe(true);

      // Act
      resetConfiguration();

      // Assert
      expect(isCloudinaryConfigured()).toBe(false);
    });

    it("should allow reconfiguration after reset", () => {
      // Arrange
      process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
      process.env.CLOUDINARY_API_KEY = "test-key";
      process.env.CLOUDINARY_API_SECRET = "test-secret";
      configureCloudinary();
      resetConfiguration();

      // Act
      configureCloudinary();

      // Assert
      expect(isCloudinaryConfigured()).toBe(true);
    });
  });
});
