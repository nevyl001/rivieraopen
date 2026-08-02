import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseAdminClient } from "@/lib/supabaseAdminClient";
import type { RateLimitConfig, RateLimitResult, RateLimitStore } from "./rateLimitStore";

const TABLE = "admin_rate_limits";

interface RateLimitRow {
  identifier: string;
  count: number;
  reset_at: string;
}

/**
 * Persists rate-limit counters in Supabase (admin_rate_limits table) so the
 * limit is enforced consistently across serverless instances. See
 * supabase/admin_sessions_and_rate_limits.sql for the table definition.
 *
 * Note: this is a read-then-write increment, not a single atomic SQL
 * statement. For the low request volumes these limits are designed for
 * (10 uploads/hour, 5 logins/15min, effectively one admin user) a race
 * between two near-simultaneous requests could let one extra request
 * through; it cannot let an unbounded number through. If this ever needs
 * to be exact under high concurrency, replace this with a Postgres
 * function that does the increment in one statement.
 */
export class SupabaseRateLimitStore implements RateLimitStore {
  constructor(private readonly client?: SupabaseClient) {}

  private getClient(): SupabaseClient | null {
    return this.client ?? getSupabaseAdminClient();
  }

  async increment(
    identifier: string,
    config: RateLimitConfig,
  ): Promise<RateLimitResult> {
    const client = this.getClient();
    if (!client) {
      // No persistent store available - fail open rather than blocking
      // every admin request. Callers should prefer a configured store.
      return {
        allowed: true,
        remaining: config.maxRequests,
        resetAt: new Date(Date.now() + config.windowMs),
      };
    }

    const now = new Date();
    const { data, error } = await client
      .from(TABLE)
      .select("identifier, count, reset_at")
      .eq("identifier", identifier)
      .maybeSingle();

    if (error) {
      // e.g. the admin_rate_limits table hasn't been created yet. Fail
      // open (treat as a fresh window) rather than blocking every admin
      // request, but log it so a missing migration is visible.
      console.error("SupabaseRateLimitStore.increment select failed:", error);
    }

    const existing = data as RateLimitRow | null;

    if (!existing || new Date(existing.reset_at) <= now) {
      const resetAt = new Date(now.getTime() + config.windowMs);
      await client.from(TABLE).upsert({
        identifier,
        count: 1,
        reset_at: resetAt.toISOString(),
      });
      return { allowed: true, remaining: config.maxRequests - 1, resetAt };
    }

    const resetAt = new Date(existing.reset_at);

    if (existing.count >= config.maxRequests) {
      return { allowed: false, remaining: 0, resetAt };
    }

    const newCount = existing.count + 1;
    await client
      .from(TABLE)
      .update({ count: newCount })
      .eq("identifier", identifier);

    return {
      allowed: true,
      remaining: config.maxRequests - newCount,
      resetAt,
    };
  }

  async reset(identifier: string): Promise<void> {
    const client = this.getClient();
    if (!client) return;
    await client.from(TABLE).delete().eq("identifier", identifier);
  }
}
