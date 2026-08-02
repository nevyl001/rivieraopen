/**
 * @jest-environment node
 */

/**
 * Security tests for POST /api/admin/upload
 *
 * Verifies the endpoint rejects unauthenticated, malformed, and oversized
 * requests before ever touching Cloudinary. No real network calls are made.
 *
 * Requirements: 8.1-8.6
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { NextRequest } from "next/server";
import { resetRateLimit } from "@/lib/admin/security/rateLimit";

jest.mock("@/lib/admin/auth/AdminAuthProvider", () => ({
  adminAuthProvider: {
    validateSession: jest.fn(),
  },
}));

jest.mock("@/lib/admin/services/FileUploadService", () => ({
  fileUploadService: {
    validateImage: jest.fn(),
    uploadImage: jest.fn(),
  },
}));

import { adminAuthProvider } from "@/lib/admin/auth/AdminAuthProvider";
import { fileUploadService } from "@/lib/admin/services/FileUploadService";
import { POST } from "../route";

const UPLOAD_URL = "https://www.rivieraopen.com/api/admin/upload";
const VALID_SESSION = "valid-session-id";

// A minimal valid PNG signature followed by padding bytes.
const PNG_BYTES = new Uint8Array([
  0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a,
  ...new Array(16).fill(0),
]);

function makeRequest(options: {
  cookie?: string;
  /** Explicit Content-Type override, e.g. to simulate a non-multipart request. */
  contentType?: string;
  contentLength?: string;
  body?: FormData;
}): NextRequest {
  const headers = new Headers();
  if (options.cookie) {
    headers.set("cookie", `admin_session=${options.cookie}`);
  }

  const request = new NextRequest(UPLOAD_URL, {
    method: "POST",
    headers,
    // When body is real FormData, let the runtime generate the correct
    // multipart Content-Type (with matching boundary) automatically.
    body: options.body,
  });

  if (options.contentType !== undefined) {
    // Overriding here (after construction) simulates a client sending a
    // mismatched/incorrect Content-Type without breaking multipart parsing
    // for tests that need a genuinely parseable body.
    request.headers.set("content-type", options.contentType);
  }
  if (options.contentLength !== undefined) {
    request.headers.set("content-length", options.contentLength);
  }

  return request;
}

function makeFormData(overrides?: {
  file?: File;
  folder?: string;
  omitFile?: boolean;
}): FormData {
  const formData = new FormData();
  if (!overrides?.omitFile) {
    const file =
      overrides?.file ??
      new File([PNG_BYTES], "test.png", { type: "image/png" });
    formData.append("file", file);
  }
  formData.append("folder", overrides?.folder ?? "gallery");
  return formData;
}

describe("POST /api/admin/upload", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await resetRateLimit(`unknown:${VALID_SESSION}:/api/admin/upload`);
    (fileUploadService.validateImage as jest.Mock).mockReturnValue({
      valid: true,
    });
    (fileUploadService.uploadImage as jest.Mock).mockResolvedValue({
      url: "https://res.cloudinary.com/demo/image/upload/v1/test.png",
      publicId: "test",
      width: 10,
      height: 10,
      format: "png",
      bytes: 24,
    });
  });

  it("rejects requests with no session cookie (401)", async () => {
    const request = makeRequest({
      body: makeFormData(),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(adminAuthProvider.validateSession).not.toHaveBeenCalled();
  });

  it("rejects requests with an invalid/fake session cookie (401)", async () => {
    (adminAuthProvider.validateSession as jest.Mock).mockResolvedValue(false);

    const request = makeRequest({
      cookie: "fake-session",
      body: makeFormData(),
    });

    const response = await POST(request);

    expect(response.status).toBe(401);
    expect(fileUploadService.uploadImage).not.toHaveBeenCalled();
  });

  it("rejects an authenticated request with the wrong Content-Type (415)", async () => {
    (adminAuthProvider.validateSession as jest.Mock).mockResolvedValue(true);

    const request = makeRequest({
      cookie: VALID_SESSION,
      contentType: "application/json",
    });

    const response = await POST(request);

    expect(response.status).toBe(415);
    expect(fileUploadService.uploadImage).not.toHaveBeenCalled();
  });

  it("rejects an authenticated request with an excessive Content-Length (413)", async () => {
    (adminAuthProvider.validateSession as jest.Mock).mockResolvedValue(true);

    const request = makeRequest({
      cookie: VALID_SESSION,
      contentLength: String(7 * 1024 * 1024),
      body: makeFormData(),
    });

    const response = await POST(request);

    expect(response.status).toBe(413);
    expect(fileUploadService.uploadImage).not.toHaveBeenCalled();
  });

  it("rejects an authenticated request with a disallowed folder (400)", async () => {
    (adminAuthProvider.validateSession as jest.Mock).mockResolvedValue(true);

    const request = makeRequest({
      cookie: VALID_SESSION,
      body: makeFormData({ folder: "../../etc" }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(fileUploadService.uploadImage).not.toHaveBeenCalled();
  });

  it("rejects an authenticated request when the file fails validation (400)", async () => {
    (adminAuthProvider.validateSession as jest.Mock).mockResolvedValue(true);
    (fileUploadService.validateImage as jest.Mock).mockReturnValue({
      valid: false,
      error: "File size exceeds 5MB limit",
    });

    const request = makeRequest({
      cookie: VALID_SESSION,
      body: makeFormData(),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(fileUploadService.uploadImage).not.toHaveBeenCalled();
  });

  it("rejects a file whose content does not match an allowed image signature (400)", async () => {
    (adminAuthProvider.validateSession as jest.Mock).mockResolvedValue(true);

    // Client claims PNG, but the bytes don't match the PNG magic number.
    const fakeFile = new File([new Uint8Array([0x00, 0x01, 0x02, 0x03])], "fake.png", {
      type: "image/png",
    });

    const request = makeRequest({
      cookie: VALID_SESSION,
      body: makeFormData({ file: fakeFile }),
    });

    const response = await POST(request);

    expect(response.status).toBe(400);
    expect(fileUploadService.uploadImage).not.toHaveBeenCalled();
  });

  it("processes a valid authenticated upload (200)", async () => {
    (adminAuthProvider.validateSession as jest.Mock).mockResolvedValue(true);

    const request = makeRequest({
      cookie: VALID_SESSION,
      body: makeFormData({ folder: "players" }),
    });

    const response = await POST(request);
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(fileUploadService.uploadImage).toHaveBeenCalledWith(
      expect.anything(),
      "players",
    );
    expect(body.url).toBe(
      "https://res.cloudinary.com/demo/image/upload/v1/test.png",
    );
  });
});
