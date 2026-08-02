/**
 * @jest-environment node
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import {
  uploadAdminImageDirect,
  validateAdminUploadFile,
  ClientUploadValidationError,
} from "../directCloudinaryUpload";

describe("directCloudinaryUpload", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it("rejects files larger than 5MB", () => {
    const big = new File([new Uint8Array(5 * 1024 * 1024 + 1)], "big.jpg", {
      type: "image/jpeg",
    });
    expect(() => validateAdminUploadFile(big)).toThrow(
      ClientUploadValidationError,
    );
    expect(() => validateAdminUploadFile(big)).toThrow(/5MB/);
  });

  it("rejects SVG files", () => {
    const svg = new File(["<svg></svg>"], "x.svg", { type: "image/svg+xml" });
    expect(() => validateAdminUploadFile(svg)).toThrow(/SVG/);
  });

  it("uploads directly to Cloudinary and never calls /api/admin/upload", async () => {
    const file = new File([new Uint8Array([1, 2, 3])], "photo.png", {
      type: "image/png",
    });

    const fetchMock = jest.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url.includes("/api/admin/upload-signature")) {
        return new Response(
          JSON.stringify({
            signature: "sig",
            timestamp: 1700000000,
            cloudName: "demo",
            apiKey: "key",
            folder: "riviera-open/gallery",
            expiresAt: 1700000300,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      if (url.includes("api.cloudinary.com")) {
        expect(init?.method).toBe("POST");
        expect(init?.body).toBeInstanceOf(FormData);
        return new Response(
          JSON.stringify({
            secure_url: "https://res.cloudinary.com/demo/image/upload/x.png",
            public_id: "riviera-open/gallery/x",
            width: 10,
            height: 10,
            format: "png",
            bytes: 3,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      throw new Error(`Unexpected fetch: ${url}`);
    });
    global.fetch = fetchMock as typeof fetch;

    const result = await uploadAdminImageDirect(file, "gallery");
    expect(result.url).toContain("cloudinary.com");

    const urls = fetchMock.mock.calls.map((c) => {
      const input = c[0];
      return typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : (input as Request).url;
    });
    expect(urls.some((u) => u.includes("/api/admin/upload-signature"))).toBe(
      true,
    );
    expect(urls.some((u) => u.includes("api.cloudinary.com"))).toBe(true);
    expect(urls.some((u) => /\/api\/admin\/upload$/.test(u))).toBe(false);
  });

  it("does not retry infinitely on Cloudinary errors", async () => {
    const file = new File([new Uint8Array([1])], "photo.png", {
      type: "image/png",
    });

    let cloudinaryCalls = 0;
    global.fetch = jest.fn(async (input: RequestInfo | URL) => {
      const url =
        typeof input === "string"
          ? input
          : input instanceof URL
            ? input.toString()
            : input.url;

      if (url.includes("/api/admin/upload-signature")) {
        return new Response(
          JSON.stringify({
            signature: "sig",
            timestamp: 1,
            cloudName: "demo",
            apiKey: "key",
            folder: "riviera-open/players",
            expiresAt: 301,
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }
      if (url.includes("api.cloudinary.com")) {
        cloudinaryCalls += 1;
        return new Response(JSON.stringify({ error: { message: "Nope" } }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
      throw new Error(`Unexpected fetch: ${url}`);
    }) as typeof fetch;

    await expect(uploadAdminImageDirect(file, "players")).rejects.toThrow(
      /Nope|Cloudinary/,
    );
    expect(cloudinaryCalls).toBe(1);
  });
});
