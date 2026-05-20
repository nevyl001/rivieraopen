import { randomBytes } from "crypto";

// In-memory CSRF token store (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expiresAt: Date }>();

// CSRF token expiration: 1 hour
const CSRF_TOKEN_DURATION = 60 * 60 * 1000;

/**
 * Generate a new CSRF token for a session
 */
export function generateCsrfToken(sessionId: string): string {
  const token = randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + CSRF_TOKEN_DURATION);

  csrfTokens.set(sessionId, { token, expiresAt });

  return token;
}

/**
 * Validate a CSRF token for a session
 */
export function validateCsrfToken(sessionId: string, token: string): boolean {
  const storedToken = csrfTokens.get(sessionId);

  if (!storedToken) {
    return false;
  }

  // Check if token has expired
  if (new Date() > storedToken.expiresAt) {
    csrfTokens.delete(sessionId);
    return false;
  }

  // Validate token matches
  return storedToken.token === token;
}

/**
 * Clean up expired CSRF tokens
 */
export function cleanupExpiredCsrfTokens(): void {
  const now = new Date();
  for (const [sessionId, data] of csrfTokens.entries()) {
    if (now > data.expiresAt) {
      csrfTokens.delete(sessionId);
    }
  }
}

/**
 * Delete CSRF token for a session (on logout)
 */
export function deleteCsrfToken(sessionId: string): void {
  csrfTokens.delete(sessionId);
}

// Clean up expired tokens every 15 minutes
if (typeof setInterval !== "undefined") {
  setInterval(
    () => {
      cleanupExpiredCsrfTokens();
    },
    15 * 60 * 1000,
  );
}
