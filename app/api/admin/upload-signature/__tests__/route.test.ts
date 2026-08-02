/**
 * @jest-environment node
 */

/**
 * Security tests for POST /api/admin/upload-signature
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { NextRequest } from "next/server";
import { resetRateLimit, RATE_LIMITS } from "@/lib/admin/security/rateLimit";

jest.mock("@/lib/admin/auth/AdminAuthProvider", () => ({
  adminAuthProvider: {
    validateSession: jest.fn(),
  },
}));

jest.mock("@/lib/cloudinary/signUpload", () => {
  const actual = jest.requireActual<typeof import("@/lib/cloudinary/signUpload")>(
    "@/lib/cloudinary/signUpload",
  );
  return {
    ...actual,
    generateSignedUploadCredentials: jest.fn(),
  };
});

import { adminAuthProvider } from "@/lib/admin/auth/AdminAuthProvider";
import { generateSignedUploadCredentials } from "@/lib/cloudinary/signUpload";
import { POST } from "../route";

const URL = "https://www.rivieraopen.com/api/admin/upload-signature";
const VALID_SESSION = "valid-session-id";
const SECRET_MARKER = "CLOUDINARY_API_SECRET_VALUE_NEVER_LEAK";

function makeRequest(options: {
  cookie?: string;
  contentType?: string;
  body?: unknown;
}): NextRequest {
  const headers = new Headers();
  if (options.cookie) {
    headers.set("cookie", `admin_session=${options.cookie}`);
  }
  headers.set(
    "content-type",
    options.contentType ?? "application/json",
  );

  return new NextRequest(URL, {
    method: "POST",
    headers,
    body:
      options.body === undefined
        ? JSON.stringify({ folder: "gallery" })
        : typeof options.body === "string"
          ? options.body
          : JSON.stringify(options.body),
  });
}

describe("POST /api/admin/upload-signature", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await resetRateLimit(`unknown:${VALID_SESSION}:/api/admin/upload-signature`);
    (adminAuthProvider.validateSession as jest.Mock).mockResolvedValue(true);
    (generateSignedUploadCredentials as jest.Mock).mockReturnValue({
      signature: "abc123",
      timestamp: 1_700_000_000,
      cloudName: "demo",
      apiKey: "123456789012345",
      folder: "riviera-open/gallery",
      logicalFolder: "gallery",
      expiresAt: 1_700_000_300,
    });
  });

  it("returns 401 without session", async () => {
    const response = await POST(makeRequest({}));
    expect(response.status).toBe(401);
    expect(generateSignedUploadCredentials).not.toHaveBeenCalled();
  });

  it("returns 401 for invalid session", async () => {
    (adminAuthProvider.validateSession as jest.Mock).mockResolvedValue(false);
    const response = await POST(makeRequest({ cookie: "bogus" }));
    expect(response.status).toBe(401);
    expect(generateSignedUploadCredentials).not.toHaveBeenCalled();
  });

  it("returns 415 for non-JSON content type", async () => {
    const response = await POST(
      makeRequest({
        cookie: VALID_SESSION,
        contentType: "multipart/form-data; boundary=x",
        body: "{}",
      }),
    );
    expect(response.status).toBe(415);
  });

  it("returns 400 for invalid folder", async () => {
    const response = await POST(
      makeRequest({
        cookie: VALID_SESSION,
        body: { folder: "../etc" },
      }),
    );
    expect(response.status).toBe(400);
    expect(generateSignedUploadCredentials).not.toHaveBeenCalled();
  });

  it("returns signature payload without secrets", async () => {
    const response = await POST(
      makeRequest({ cookie: VALID_SESSION, body: { folder: "players" } }),
    );
    expect(response.status).toBe(200);
    const json = await response.json();
    expect(json).toEqual({
      signature: "abc123",
      timestamp: 1_700_000_000,
      cloudName: "demo",
      apiKey: "123456789012345",
      folder: "riviera-open/gallery",
      expiresAt: 1_700_000_300,
    });
    expect(json).not.toHaveProperty("apiSecret");
    expect(json).not.toHaveProperty("api_secret");
    const serialized = JSON.stringify(json);
    expect(serialized).not.toContain(SECRET_MARKER);
    expect(serialized).not.toContain("api_secret");
    expect(serialized).not.toContain("API_SECRET");
    expect(serialized).not.toContain("service_role");
    expect(generateSignedUploadCredentials).toHaveBeenCalledWith("players");
  });

  it("returns 429 after exceeding upload rate limit", async () => {
    for (let i = 0; i < RATE_LIMITS.UPLOAD.maxRequests; i++) {
      const ok = await POST(
        makeRequest({ cookie: VALID_SESSION, body: { folder: "gallery" } }),
      );
      expect(ok.status).toBe(200);
    }
    const blocked = await POST(
      makeRequest({ cookie: VALID_SESSION, body: { folder: "gallery" } }),
    );
    expect(blocked.status).toBe(429);
  });
});
