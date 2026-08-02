/**
 * Rate limiting implementation for API routes
 * Tracks requests per IP address (and session, for admin routes) and
 * enforces limits.
 */

import type { RateLimitConfig, RateLimitResult, RateLimitStore } from "./rateLimitStore";
import { InMemoryRateLimitStore } from "./rateLimitStore";
import { SupabaseRateLimitStore } from "./supabaseRateLimitStore";
import { getSupabaseAdminClient } from "@/lib/supabaseAdminClient";

export type { RateLimitConfig, RateLimitResult } from "./rateLimitStore";

/**
 * Picks a rate limit store: Supabase-backed when SUPABASE_SERVICE_ROLE_KEY
 * is configured (consistent across serverless instances), otherwise an
 * in-memory Map (only valid for a single long-lived process, e.g. local
 * dev).
 */
function defaultStore(): RateLimitStore {
  if (getSupabaseAdminClient()) {
    return new SupabaseRateLimitStore();
  }

  if (process.env.NODE_ENV === "production") {
    console.error(
      "rateLimit: SUPABASE_SERVICE_ROLE_KEY no configurada. Los límites " +
        "se aplican en memoria de proceso y pueden no ser consistentes " +
        "entre instancias serverless.",
    );
  }

  return new InMemoryRateLimitStore();
}

let store: RateLimitStore = defaultStore();

/**
 * Check if a request is allowed based on rate limits
 */
export async function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): Promise<RateLimitResult> {
  return store.increment(identifier, config);
}

/**
 * Reset rate limit for an identifier (useful for testing)
 */
export async function resetRateLimit(identifier: string): Promise<void> {
  await store.reset(identifier);
}

/**
 * Test-only hook to swap the underlying store (e.g. a shared in-memory
 * store to simulate two serverless instances, or a mocked Supabase store).
 */
export function __setRateLimitStoreForTests(newStore: RateLimitStore): void {
  store = newStore;
}

// Predefined rate limit configurations
export const RATE_LIMITS = {
  // Login attempts: 5 per 15 minutes
  LOGIN: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 5,
  },
  // API requests: 100 per minute
  API: {
    windowMs: 60 * 1000,
    maxRequests: 100,
  },
  // File uploads: 10 per hour
  UPLOAD: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 10,
  },
  // Bulk operations: 5 per hour
  BULK: {
    windowMs: 60 * 60 * 1000,
    maxRequests: 5,
  },
} as const;
