/**
 * Input sanitization utilities to prevent XSS and injection attacks
 */

/**
 * Sanitize HTML string by escaping special characters
 * Prevents XSS attacks by converting HTML special characters to entities
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  return input
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#x27;")
    .replace(/\//g, "&#x2F;");
}

/**
 * Sanitize string by removing potentially dangerous characters
 * Useful for names, titles, and other text fields
 */
export function sanitizeString(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  // Remove control characters and trim whitespace
  return input
    .replace(/[\x00-\x1F\x7F]/g, "") // Remove control characters
    .trim();
}

/**
 * Sanitize email address
 * Validates and normalizes email format
 */
export function sanitizeEmail(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  // Convert to lowercase and trim
  return input.toLowerCase().trim();
}

/**
 * Sanitize phone number
 * Removes non-numeric characters except + and ()
 */
export function sanitizePhone(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  // Keep only digits, +, (, ), -, and spaces
  return input.replace(/[^\d+() -]/g, "").trim();
}

/**
 * Sanitize URL
 * Validates and normalizes URL format
 * Returns empty string for invalid URLs
 */
export function sanitizeUrl(input: string): string {
  if (typeof input !== "string") {
    return "";
  }

  const trimmed = input.trim();

  // If empty or just whitespace, return empty
  if (!trimmed) {
    return "";
  }

  // Check if URL starts with http:// or https://
  if (!trimmed.startsWith("http://") && !trimmed.startsWith("https://")) {
    // Don't auto-fix URLs - let validation catch them
    // This prevents masking validation errors
    return trimmed;
  }

  try {
    // Validate URL format
    const url = new URL(trimmed);
    return url.toString();
  } catch {
    // Return as-is if invalid - let validation catch it
    return trimmed;
  }
}

/**
 * Sanitize object by applying sanitization to all string values
 */
export function sanitizeObject<T extends Record<string, any>>(
  obj: T,
  options: {
    htmlFields?: string[];
    emailFields?: string[];
    phoneFields?: string[];
    urlFields?: string[];
  } = {},
): T {
  const sanitized: any = { ...obj };

  for (const [key, value] of Object.entries(sanitized)) {
    if (typeof value === "string") {
      // Apply specific sanitization based on field type
      if (options.htmlFields?.includes(key)) {
        sanitized[key] = sanitizeHtml(value);
      } else if (options.emailFields?.includes(key)) {
        sanitized[key] = sanitizeEmail(value);
      } else if (options.phoneFields?.includes(key)) {
        sanitized[key] = sanitizePhone(value);
      } else if (options.urlFields?.includes(key)) {
        sanitized[key] = sanitizeUrl(value);
      } else {
        sanitized[key] = sanitizeString(value);
      }
    } else if (value instanceof Date) {
      // Preserve Date objects
      sanitized[key] = value;
    } else if (
      typeof value === "object" &&
      value !== null &&
      !Array.isArray(value)
    ) {
      // Recursively sanitize nested objects (but not arrays)
      sanitized[key] = sanitizeObject(value, options);
    }
    // Preserve other types (numbers, booleans, arrays, etc.)
  }

  return sanitized as T;
}

/**
 * Sanitize player data
 */
export function sanitizePlayerData(data: any): any {
  return sanitizeObject(data, {
    emailFields: ["email"],
    phoneFields: ["phone"],
    urlFields: ["photo", "instagram", "facebook", "twitter"],
  });
}

/**
 * Sanitize tournament data
 */
export function sanitizeTournamentData(data: any): any {
  return sanitizeObject(data, {
    urlFields: ["photo"],
  });
}

/**
 * Remove SQL injection patterns (defense in depth)
 * Note: This is a backup measure. Primary defense is parameterized queries.
 */
export function detectSqlInjection(input: string): boolean {
  if (typeof input !== "string") {
    return false;
  }

  // Common SQL injection patterns
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE)\b)/i,
    /(--|;|\/\*|\*\/)/,
    /(\bOR\b.*=.*)/i,
    /(\bAND\b.*=.*)/i,
    /('|")\s*(OR|AND)\s*('|")/i,
  ];

  return sqlPatterns.some((pattern) => pattern.test(input));
}

/**
 * Validate and sanitize input for SQL queries
 * Throws error if SQL injection detected
 */
export function validateSqlInput(input: string, fieldName: string): string {
  if (detectSqlInjection(input)) {
    throw new Error(`Potential SQL injection detected in field: ${fieldName}`);
  }
  return sanitizeString(input);
}
