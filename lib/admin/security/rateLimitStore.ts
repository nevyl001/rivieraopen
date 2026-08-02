export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

export interface RateLimitStore {
  increment(identifier: string, config: RateLimitConfig): Promise<RateLimitResult>;
  reset(identifier: string): Promise<void>;
}

interface RateLimitEntry {
  count: number;
  resetAt: Date;
}

/**
 * Process-memory rate limit store. Only correct within a single, long-lived
 * process (local dev) - in serverless, concurrent/sequential requests can
 * land on different instances that don't share this Map, so a limit can be
 * bypassed or, after the security fix that made every admin request pass
 * through it, incorrectly reset. See SupabaseRateLimitStore for the
 * persistent option.
 */
export class InMemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, RateLimitEntry>();

  async increment(
    identifier: string,
    config: RateLimitConfig,
  ): Promise<RateLimitResult> {
    const now = new Date();
    const entry = this.store.get(identifier);

    if (!entry || now > entry.resetAt) {
      const resetAt = new Date(now.getTime() + config.windowMs);
      this.store.set(identifier, { count: 1, resetAt });
      return { allowed: true, remaining: config.maxRequests - 1, resetAt };
    }

    if (entry.count >= config.maxRequests) {
      return { allowed: false, remaining: 0, resetAt: entry.resetAt };
    }

    entry.count++;
    this.store.set(identifier, entry);

    return {
      allowed: true,
      remaining: config.maxRequests - entry.count,
      resetAt: entry.resetAt,
    };
  }

  async reset(identifier: string): Promise<void> {
    this.store.delete(identifier);
  }

  deleteExpired(): void {
    const now = new Date();
    for (const [identifier, entry] of this.store.entries()) {
      if (now > entry.resetAt) {
        this.store.delete(identifier);
      }
    }
  }
}
