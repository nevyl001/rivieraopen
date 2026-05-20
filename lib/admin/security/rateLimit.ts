/**
 * Rate limiting implementation for API routes
 * Tracks requests per IP address and enforces limits
 */

interface RateLimitEntry {
  count: number;
  resetAt: Date;
}

// In-memory rate limit store (in production, use Redis)
const rateLimitStore = new Map<string, RateLimitEntry>();

export interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: Date;
}

/**
 * Check if a request is allowed based on rate limits
 */
export function checkRateLimit(
  identifier: string,
  config: RateLimitConfig,
): RateLimitResult {
  const now = new Date();
  const entry = rateLimitStore.get(identifier);

  // If no entry or entry has expired, create new entry
  if (!entry || now > entry.resetAt) {
    const resetAt = new Date(now.getTime() + config.windowMs);
    rateLimitStore.set(identifier, { count: 1, resetAt });

    return {
      allowed: true,
      remaining: config.maxRequests - 1,
      resetAt,
    };
  }

  // Check if limit exceeded
  if (entry.count >= config.maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt,
    };
  }

  // Increment count
  entry.count++;
  rateLimitStore.set(identifier, entry);

  return {
    allowed: true,
    remaining: config.maxRequests - entry.count,
    resetAt: entry.resetAt,
  };
}

/**
 * Clean up expired rate limit entries
 */
export function cleanupExpiredRateLimits(): void {
  const now = new Date();
  for (const [identifier, entry] of rateLimitStore.entries()) {
    if (now > entry.resetAt) {
      rateLimitStore.delete(identifier);
    }
  }
}

/**
 * Reset rate limit for an identifier (useful for testing)
 */
export function resetRateLimit(identifier: string): void {
  rateLimitStore.delete(identifier);
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      cleanupExpiredRateLimits();
    },
    5 * 60 * 1000,
  );
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
