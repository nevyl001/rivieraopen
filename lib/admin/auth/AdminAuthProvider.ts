import { randomUUID } from "crypto";
import type { AdminCredentials, AdminSession, AdminUser } from "./types";
import type { AdminSessionStore } from "./sessionStore";
import { InMemoryAdminSessionStore } from "./sessionStore";
import { SupabaseAdminSessionStore } from "./supabaseSessionStore";
import { getSupabaseAdminClient } from "@/lib/supabaseAdminClient";

// Session expiration time: 24 hours
const SESSION_DURATION = 24 * 60 * 60 * 1000;

/**
 * Picks a session store: Supabase-backed when SUPABASE_SERVICE_ROLE_KEY is
 * configured (works correctly across serverless instances), otherwise an
 * in-memory Map (only valid for a single long-lived process, e.g. local
 * dev). Falling back silently in production would reintroduce intermittent
 * 401s, so that case is logged loudly.
 */
function defaultStore(): AdminSessionStore {
  if (getSupabaseAdminClient()) {
    return new SupabaseAdminSessionStore();
  }

  if (process.env.NODE_ENV === "production") {
    console.error(
      "AdminAuthProvider: SUPABASE_SERVICE_ROLE_KEY no configurada. " +
        "Las sesiones administrativas se guardan en memoria de proceso y " +
        "pueden no ser reconocidas por otras instancias serverless " +
        "(401 intermitentes en el panel admin).",
    );
  }

  return new InMemoryAdminSessionStore();
}

export class AdminAuthProvider {
  private readonly store: AdminSessionStore;

  constructor(store?: AdminSessionStore) {
    this.store = store ?? defaultStore();
  }

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

    // Persist session
    await this.store.set(session);

    return session;
  }

  /**
   * Logout user and invalidate session
   */
  async logout(sessionId: string): Promise<void> {
    await this.store.delete(sessionId);
  }

  /**
   * Validate if a session is still valid
   */
  async validateSession(sessionId: string): Promise<boolean> {
    const session = await this.store.get(sessionId);

    if (!session) {
      return false;
    }

    // Check if session has expired
    if (new Date() > session.expiresAt) {
      await this.store.delete(sessionId);
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

    const session = await this.store.get(sessionId);
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
  async cleanupExpiredSessions(): Promise<void> {
    await this.store.deleteExpired();
  }
}

// Export singleton instance
export const adminAuthProvider = new AdminAuthProvider();

// Best-effort periodic cleanup. This only reaches every session in
// long-lived processes (local dev); in serverless it opportunistically
// trims whichever instance happens to stay warm - validateSession already
// rejects expired sessions regardless, so this is table/memory hygiene,
// not a correctness requirement.
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      adminAuthProvider.cleanupExpiredSessions().catch((error) => {
        console.error("AdminAuthProvider: cleanup de sesiones falló:", error);
      });
    },
    60 * 60 * 1000,
  );
}
