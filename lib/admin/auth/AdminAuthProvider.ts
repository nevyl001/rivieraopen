import { randomUUID } from "crypto";
import type { AdminCredentials, AdminSession, AdminUser } from "./types";

// In-memory session store (in production, use Redis or database)
const sessions = new Map<string, AdminSession>();

// Session expiration time: 24 hours
const SESSION_DURATION = 24 * 60 * 60 * 1000;

export class AdminAuthProvider {
  /**
   * Authenticate user with credentials
   */
  async login(credentials: AdminCredentials): Promise<AdminSession> {
    const { username, password } = credentials;

    // Get credentials from environment
    const validUsername = process.env.ADMIN_USERNAME || "admin";
    const validPassword = process.env.ADMIN_PASSWORD || "admin123";

    // Validate credentials
    if (username !== validUsername || password !== validPassword) {
      throw new Error("Invalid credentials");
    }

    // Create session
    const sessionId = randomUUID();
    const userId = randomUUID();
    const expiresAt = new Date(Date.now() + SESSION_DURATION);

    const session: AdminSession = {
      id: sessionId,
      userId,
      expiresAt,
    };

    // Store session
    sessions.set(sessionId, session);

    return session;
  }

  /**
   * Logout user and invalidate session
   */
  async logout(sessionId: string): Promise<void> {
    sessions.delete(sessionId);
  }

  /**
   * Validate if a session is still valid
   */
  async validateSession(sessionId: string): Promise<boolean> {
    const session = sessions.get(sessionId);

    if (!session) {
      return false;
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      sessions.delete(sessionId);
      return false;
    }

    return true;
  }

  /**
   * Get current user from session
   */
  async getCurrentUser(sessionId: string): Promise<AdminUser | null> {
    const isValid = await this.validateSession(sessionId);

    if (!isValid) {
      return null;
    }

    const session = sessions.get(sessionId);
    if (!session) {
      return null;
    }

    // Return admin user (in production, fetch from database)
    return {
      id: session.userId,
      username: process.env.ADMIN_USERNAME || "admin",
      role: "admin",
      createdAt: new Date(),
    };
  }

  /**
   * Clean up expired sessions (should be called periodically)
   */
  cleanupExpiredSessions(): void {
    const now = new Date();
    for (const [sessionId, session] of sessions.entries()) {
      if (now > session.expiresAt) {
        sessions.delete(sessionId);
      }
    }
  }
}

// Export singleton instance
export const adminAuthProvider = new AdminAuthProvider();

// Clean up expired sessions every hour
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      adminAuthProvider.cleanupExpiredSessions();
    },
    60 * 60 * 1000,
  );
}
