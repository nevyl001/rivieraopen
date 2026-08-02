import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, RateLimitConfig } from "./rateLimit";

/**
 * Get client IP address from request
 */
export function getClientIp(request: NextRequest): string {
  // Try to get IP from various headers (for proxies/load balancers)
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  const realIp = request.headers.get("x-real-ip");
  if (realIp) {
    return realIp;
  }

  // Fallback to a default (in development)
  return "unknown";
}

/**
 * Rate limiting middleware for API routes
 *
 * @param extraIdentifier - additional identifier component (e.g. an admin
 * session id) mixed into the rate limit key alongside the client IP.
 */
export async function rateLimitMiddleware(
  request: NextRequest,
  config: RateLimitConfig,
  extraIdentifier?: string,
): Promise<NextResponse | null> {
  const clientIp = getClientIp(request);
  const identifier = extraIdentifier
    ? `${clientIp}:${extraIdentifier}:${request.nextUrl.pathname}`
    : `${clientIp}:${request.nextUrl.pathname}`;

  const result = await checkRateLimit(identifier, config);

  if (!result.allowed) {
    const retryAfter = Math.ceil(
      (result.resetAt.getTime() - Date.now()) / 1000,
    );

    return NextResponse.json(
      {
        error: {
          code: "RATE_LIMIT_EXCEEDED",
          message: "Too many requests. Please try again later.",
          retryAfter,
        },
      },
      {
        status: 429,
        headers: {
          "Retry-After": retryAfter.toString(),
          "X-RateLimit-Limit": config.maxRequests.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": result.resetAt.toISOString(),
        },
      },
    );
  }

  // Request is allowed, return null to continue
  return null;
}
