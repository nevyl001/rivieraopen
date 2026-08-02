import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/supabaseAdminClient";
import type { AdminSession } from "./types";
import type { AdminSessionStore } from "./sessionStore";

const TABLE = "admin_sessions";

interface AdminSessionRow {
  id: string;
  user_id: string;
  expires_at: string;
}

/**
 * Persists admin sessions in Supabase (admin_sessions table) so any
 * serverless instance can validate a session created by another one.
 * Requires SUPABASE_SERVICE_ROLE_KEY - see supabase/admin_sessions_and_rate_limits.sql
 * for the table definition (RLS enabled, service-role only).
 */
export class SupabaseAdminSessionStore implements AdminSessionStore {
  constructor(private readonly client?: SupabaseClient) {}

  private getClient(): SupabaseClient | null {
    return this.client ?? getSupabaseAdminClient();
  }

  async get(sessionId: string): Promise<AdminSession | null> {
    const client = this.getClient();
    if (!client) return null;

    const { data, error } = await client
      .from(TABLE)
      .select("id, user_id, expires_at")
      .eq("id", sessionId)
      .maybeSingle();

    if (error) {
      // maybeSingle() reports no-rows-found as error === null, so any
      // error here is unexpected (e.g. the admin_sessions table hasn't
      // been created yet). Log it loudly instead of silently treating
      // every session as invalid.
      console.error("SupabaseAdminSessionStore.get failed:", error);
    }
    if (error || !data) return null;

    const row = data as AdminSessionRow;
    return {
      id: row.id,
      userId: row.user_id,
      expiresAt: new Date(row.expires_at),
    };
  }

  async set(session: AdminSession): Promise<void> {
    const client = this.getClient();
    if (!client) return;

    const { error } = await client.from(TABLE).upsert({
      id: session.id,
      user_id: session.userId,
      expires_at: session.expiresAt.toISOString(),
    });

    if (error) {
      console.error("SupabaseAdminSessionStore.set failed:", error);
    }
  }

  async delete(sessionId: string): Promise<void> {
    const client = this.getClient();
    if (!client) return;

    await client.from(TABLE).delete().eq("id", sessionId);
  }

  async deleteExpired(): Promise<void> {
    const client = this.getClient();
    if (!client) return;

    await client.from(TABLE).delete().lt("expires_at", new Date().toISOString());
  }
}
