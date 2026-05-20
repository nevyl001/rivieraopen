/**
 * Unit Tests for AdminAuthProvider
 * Tests specific examples and edge cases
 * Requirements: 1.2, 1.3, 1.5
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { AdminAuthProvider } from "../AdminAuthProvider";

describe("AdminAuthProvider - Unit Tests", () => {
  let authProvider: AdminAuthProvider;

  beforeEach(() => {
    authProvider = new AdminAuthProvider();
    // Set environment variables for testing
    process.env.ADMIN_USERNAME = "admin";
    process.env.ADMIN_PASSWORD = "admin123";
  });

  describe("login", () => {
    it("should successfully login with valid credentials", async () => {
      const credentials = {
        username: "admin",
        password: "admin123",
      };

      const session = await authProvider.login(credentials);

      expect(session).toBeDefined();
      expect(session.id).toBeDefined();
      expect(session.userId).toBeDefined();
      expect(session.expiresAt).toBeInstanceOf(Date);
      expect(session.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it("should fail login with invalid username", async () => {
      const credentials = {
        username: "wronguser",
        password: "admin123",
      };

      await expect(authProvider.login(credentials)).rejects.toThrow(
        "Invalid credentials",
      );
    });

    it("should fail login with invalid password", async () => {
      const credentials = {
        username: "admin",
        password: "wrongpassword",
      };

      await expect(authProvider.login(credentials)).rejects.toThrow(
        "Invalid credentials",
      );
    });

    it("should fail login with both invalid credentials", async () => {
      const credentials = {
        username: "wronguser",
        password: "wrongpassword",
      };

      await expect(authProvider.login(credentials)).rejects.toThrow(
        "Invalid credentials",
      );
    });

    it("should create unique session IDs for multiple logins", async () => {
      const credentials = {
        username: "admin",
        password: "admin123",
      };

      const session1 = await authProvider.login(credentials);
      const session2 = await authProvider.login(credentials);

      expect(session1.id).not.toBe(session2.id);

      // Clean up
      await authProvider.logout(session1.id);
      await authProvider.logout(session2.id);
    });
  });

  describe("validateSession", () => {
    it("should return true for valid session", async () => {
      const credentials = {
        username: "admin",
        password: "admin123",
      };

      const session = await authProvider.login(credentials);
      const isValid = await authProvider.validateSession(session.id);

      expect(isValid).toBe(true);

      // Clean up
      await authProvider.logout(session.id);
    });

    it("should return false for non-existent session", async () => {
      const isValid = await authProvider.validateSession(
        "non-existent-session-id",
      );

      expect(isValid).toBe(false);
    });

    it("should return false for expired session", async () => {
      const credentials = {
        username: "admin",
        password: "admin123",
      };

      const session = await authProvider.login(credentials);

      // Manually expire the session
      session.expiresAt = new Date(Date.now() - 1000);

      const isValid = await authProvider.validateSession(session.id);

      expect(isValid).toBe(false);
    });
  });

  describe("logout", () => {
    it("should invalidate session after logout", async () => {
      const credentials = {
        username: "admin",
        password: "admin123",
      };

      const session = await authProvider.login(credentials);

      // Verify session is valid before logout
      const isValidBefore = await authProvider.validateSession(session.id);
      expect(isValidBefore).toBe(true);

      // Logout
      await authProvider.logout(session.id);

      // Verify session is invalid after logout
      const isValidAfter = await authProvider.validateSession(session.id);
      expect(isValidAfter).toBe(false);
    });

    it("should not throw error when logging out non-existent session", async () => {
      await expect(
        authProvider.logout("non-existent-session-id"),
      ).resolves.not.toThrow();
    });

    it("should allow logout multiple times for same session", async () => {
      const credentials = {
        username: "admin",
        password: "admin123",
      };

      const session = await authProvider.login(credentials);

      await authProvider.logout(session.id);
      await expect(authProvider.logout(session.id)).resolves.not.toThrow();
    });
  });

  describe("getCurrentUser", () => {
    it("should return user for valid session", async () => {
      const credentials = {
        username: "admin",
        password: "admin123",
      };

      const session = await authProvider.login(credentials);
      const user = await authProvider.getCurrentUser(session.id);

      expect(user).not.toBeNull();
      expect(user?.id).toBe(session.userId);
      expect(user?.username).toBe("admin");
      expect(user?.role).toBe("admin");
      expect(user?.createdAt).toBeInstanceOf(Date);

      // Clean up
      await authProvider.logout(session.id);
    });

    it("should return null for invalid session", async () => {
      const user = await authProvider.getCurrentUser("non-existent-session-id");

      expect(user).toBeNull();
    });

    it("should return null for expired session", async () => {
      const credentials = {
        username: "admin",
        password: "admin123",
      };

      const session = await authProvider.login(credentials);

      // Manually expire the session
      session.expiresAt = new Date(Date.now() - 1000);

      const user = await authProvider.getCurrentUser(session.id);

      expect(user).toBeNull();
    });
  });

  describe("cleanupExpiredSessions", () => {
    it("should remove expired sessions", async () => {
      const credentials = {
        username: "admin",
        password: "admin123",
      };

      const session = await authProvider.login(credentials);

      // Manually expire the session
      session.expiresAt = new Date(Date.now() - 1000);

      // Clean up expired sessions
      authProvider.cleanupExpiredSessions();

      // Session should no longer be valid
      const isValid = await authProvider.validateSession(session.id);
      expect(isValid).toBe(false);
    });

    it("should not remove valid sessions", async () => {
      const credentials = {
        username: "admin",
        password: "admin123",
      };

      const session = await authProvider.login(credentials);

      // Clean up expired sessions
      authProvider.cleanupExpiredSessions();

      // Session should still be valid
      const isValid = await authProvider.validateSession(session.id);
      expect(isValid).toBe(true);

      // Clean up
      await authProvider.logout(session.id);
    });
  });
});
