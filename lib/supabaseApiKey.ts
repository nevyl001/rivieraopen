/**
 * sb_publishable_ / sb_secret_ no son JWT.
 * Authorization solo puede llevar un JWT de sesión, nunca la clave nueva.
 */
export function isJwtCredential(value: string): boolean {
  const parts = value.split(".");
  if (parts.length !== 3 || !parts[0].startsWith("eyJ")) return false;
  return parts.every((part) => part.length > 0 && !/\s/.test(part));
}

export function stripNonJwtAuthorization(headers: Headers, apiKey?: string): Headers {
  const next = new Headers(headers);
  if (apiKey && !next.has("apikey")) next.set("apikey", apiKey);
  const authorization = next.get("Authorization");
  if (!authorization) return next;
  const token = authorization.replace(/^Bearer\s+/i, "").trim();
  if (!isJwtCredential(token)) next.delete("Authorization");
  return next;
}

export function sanitizeSupabaseFetch(
  apiKey: string,
  baseFetch: typeof fetch = fetch
): typeof fetch {
  return (input, init) => {
    const headers = stripNonJwtAuthorization(new Headers(init?.headers), apiKey);
    return baseFetch(input, { ...init, headers });
  };
}
