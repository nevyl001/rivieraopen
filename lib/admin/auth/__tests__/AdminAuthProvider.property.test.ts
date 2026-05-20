/**
 * Property-Based Tests for AdminAuthProvider
 * Feature: admin-interface
 *
 * Property 1: Authentication Session Validity
 * Property 20: Session Expiration Enforcement
 * Validates: Requirements 1.1, 1.4
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import * as fc from "fast-check";
import { AdminAuthProvider } from "../AdminAuthProvider";
import type { AdminCredentials } from "../types";

describe("AdminAuthProvider - Property-Based Tests", () => {
  let authProvider: AdminAuthProvider;

  beforeEach(() => {
    authProvider = new AdminAuthProvider();
    // Set environment variables for testing
    process.env.ADMIN_USERNAME = "testadmin";
    process.env.ADMIN_PASSWORD = "testpass123";
  });

  /**
   * Property 1: Authentication Session Validity
   * For any admin session, if the session is valid, then the session expiration
   * time must be in the future and the session must exist in the session store.
   */
  it("Property 1: valid sessions have future expiration times", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.constant("testadmin"),
          password: fc.constant("testpass123"),
        }),
        async (credentials: AdminCredentials) => {
          // Create a session by logging in
          const session = await authProvider.login(credentials);

          // Validate the session
          const isValid = await authProvider.validateSession(session.id);

          // If session is valid, expiration must be in the future
          if (isValid) {
            const now = new Date();
            expect(session.expiresAt.getTime()).toBeGreaterThan(now.getTime());
          }

          // Clean up
          await authProvider.logout(session.id);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Property 20: Session Expiration Enforcement
   * For any admin request, if the session has expired, the request must be
   * rejected and the user must be redirected to login.
   */
  it("Property 20: expired sessions are rejected", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.constant("testadmin"),
          password: fc.constant("testpass123"),
        }),
        async (credentials: AdminCredentials) => {
          // Create a session
          const session = await authProvider.login(credentials);

          // Manually expire the session by setting expiration to the past
          session.expiresAt = new Date(Date.now() - 1000);

          // Try to validate the expired session
          const isValid = await authProvider.validateSession(session.id);

          // Expired session must be invalid
          expect(isValid).toBe(false);

          // Trying to get current user with expired session should return null
          const user = await authProvider.getCurrentUser(session.id);
          expect(user).toBeNull();
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Additional Property: Session validation consistency
   * For any session, validateSession and getCurrentUser must be consistent
   */
  it("Property: session validation and getCurrentUser are consistent", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.constant("testadmin"),
          password: fc.constant("testpass123"),
        }),
        async (credentials: AdminCredentials) => {
          // Create a session
          const session = await authProvider.login(credentials);

          // Check validation
          const isValid = await authProvider.validateSession(session.id);
          const user = await authProvider.getCurrentUser(session.id);

          // If session is valid, getCurrentUser should return a user
          // If session is invalid, getCurrentUser should return null
          if (isValid) {
            expect(user).not.toBeNull();
            expect(user?.username).toBe("testadmin");
          } else {
            expect(user).toBeNull();
          }

          // Clean up
          await authProvider.logout(session.id);
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Additional Property: Invalid credentials always fail
   * For any invalid credentials, login must fail
   */
  it("Property: invalid credentials always fail", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.string().filter((s) => s !== "testadmin"),
          password: fc.string(),
        }),
        async (credentials: AdminCredentials) => {
          // Try to login with invalid credentials
          await expect(authProvider.login(credentials)).rejects.toThrow(
            "Invalid credentials",
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  /**
   * Additional Property: Logout invalidates session
   * For any session, after logout, the session must be invalid
   */
  it("Property: logout invalidates session", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          username: fc.constant("testadmin"),
          password: fc.constant("testpass123"),
        }),
        async (credentials: AdminCredentials) => {
          // Create a session
          const session = await authProvider.login(credentials);

          // Verify session is valid
          const isValidBefore = await authProvider.validateSession(session.id);
          expect(isValidBefore).toBe(true);

          // Logout
          await authProvider.logout(session.id);

          // Verify session is now invalid
          const isValidAfter = await authProvider.validateSession(session.id);
          expect(isValidAfter).toBe(false);
        },
      ),
      { numRuns: 100 },
    );
  });
});
