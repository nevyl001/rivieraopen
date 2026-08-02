import type { AdminSession } from "./types";

export interface AdminSessionStore {
  get(sessionId: string): Promise<AdminSession | null>;
  set(session: AdminSession): Promise<void>;
  delete(sessionId: string): Promise<void>;
  deleteExpired(): Promise<void>;
}

/**
 * Process-memory session store. Only valid within a single, long-lived
 * process (local dev). In serverless, each invocation can land on a
 * different instance with its own memory, so sessions written by one
 * invocation may be invisible to another - do not rely on this in
 * production. See SupabaseAdminSessionStore for the persistent option.
 */
export class InMemoryAdminSessionStore implements AdminSessionStore {
  private sessions = new Map<string, AdminSession>();

  async get(sessionId: string): Promise<AdminSession | null> {
    return this.sessions.get(sessionId) ?? null;
  }

  async set(session: AdminSession): Promise<void> {
    this.sessions.set(session.id, session);
  }

  async delete(sessionId: string): Promise<void> {
    this.sessions.delete(sessionId);
  }

  async deleteExpired(): Promise<void> {
    const now = new Date();
    for (const [id, session] of this.sessions.entries()) {
      if (now > session.expiresAt) {
        this.sessions.delete(id);
      }
    }
  }
}
