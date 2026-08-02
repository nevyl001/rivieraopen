/**
 * @jest-environment node
 */

/**
 * Security/behavior tests for POST /api/contact.
 *
 * The endpoint is intentionally public (contact form) - these tests make
 * sure it still rejects abusive/malformed traffic before it ever reaches
 * Resend, and that a legitimate submission is unaffected.
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { NextRequest } from "next/server";
import { resetRateLimit } from "@/lib/admin/security/rateLimit";

const mockSend = jest.fn();

jest.mock("resend", () => ({
  Resend: jest.fn().mockImplementation(() => ({
    emails: { send: mockSend },
  })),
}));

import { POST } from "../route";

const CONTACT_URL = "https://www.rivieraopen.com/api/contact";
const RATE_LIMIT_KEY = "unknown:/api/contact";

function makeRequest(options: {
  body?: unknown;
  rawBody?: string;
  contentType?: string;
  contentLength?: string;
}): NextRequest {
  const headers = new Headers();
  headers.set("content-type", options.contentType ?? "application/json");

  const bodyString =
    options.rawBody ?? (options.body !== undefined ? JSON.stringify(options.body) : undefined);

  if (options.contentLength !== undefined) {
    headers.set("content-length", options.contentLength);
  } else if (bodyString !== undefined) {
    headers.set("content-length", String(Buffer.byteLength(bodyString)));
  }

  return new NextRequest(CONTACT_URL, {
    method: "POST",
    headers,
    body: bodyString,
  });
}

function validPayload(overrides?: Record<string, unknown>) {
  return {
    nombre: "Juan Pérez",
    email: "juan@example.com",
    mensaje: "Hola, quisiera más información sobre el torneo de este mes.",
    ...overrides,
  };
}

describe("POST /api/contact", () => {
  beforeEach(async () => {
    jest.clearAllMocks();
    await resetRateLimit(RATE_LIMIT_KEY);
    process.env.RESEND_API_KEY = "test-key";
    mockSend.mockResolvedValue({ data: { id: "email-1" }, error: null });
  });

  it("rejects the 6th request within the window (429)", async () => {
    for (let i = 0; i < 5; i++) {
      const response = await POST(makeRequest({ body: validPayload() }));
      expect(response.status).toBe(200);
    }

    const sixth = await POST(makeRequest({ body: validPayload() }));
    expect(sixth.status).toBe(429);
    expect(mockSend).toHaveBeenCalledTimes(5);
  });

  it("rejects the wrong Content-Type (415)", async () => {
    const response = await POST(
      makeRequest({ contentType: "text/plain", rawBody: JSON.stringify(validPayload()) }),
    );

    expect(response.status).toBe(415);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("rejects an excessive Content-Length (413)", async () => {
    const response = await POST(
      makeRequest({
        body: validPayload(),
        contentLength: String(20 * 1024),
      }),
    );

    expect(response.status).toBe(413);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("rejects invalid JSON (400)", async () => {
    const response = await POST(makeRequest({ rawBody: "{not valid json" }));

    expect(response.status).toBe(400);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("rejects fields that are too long (400)", async () => {
    const response = await POST(
      makeRequest({ body: validPayload({ nombre: "a".repeat(81) }) }),
    );

    expect(response.status).toBe(400);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("rejects a message that is too short (400)", async () => {
    const response = await POST(
      makeRequest({ body: validPayload({ mensaje: "short" }) }),
    );

    expect(response.status).toBe(400);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("rejects an invalid email format (400)", async () => {
    const response = await POST(
      makeRequest({ body: validPayload({ email: "not-an-email" }) }),
    );

    expect(response.status).toBe(400);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("rejects unexpected fields (400)", async () => {
    const response = await POST(
      makeRequest({ body: validPayload({ isAdmin: true }) }),
    );

    expect(response.status).toBe(400);
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("returns a neutral success response when the honeypot is filled, without emailing", async () => {
    const response = await POST(
      makeRequest({ body: validPayload({ website: "http://spam.example" }) }),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(mockSend).not.toHaveBeenCalled();
  });

  it("calls Resend exactly once for a valid submission", async () => {
    const response = await POST(makeRequest({ body: validPayload() }));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body).toEqual({ success: true });
    expect(mockSend).toHaveBeenCalledTimes(1);
    expect(mockSend).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "rivieraopen@gmail.com",
        subject: expect.stringContaining("Juan Pérez"),
        text: expect.stringContaining("Hola, quisiera más información"),
      }),
    );
  });

  it("returns a controlled error when Resend fails, without leaking details", async () => {
    mockSend.mockResolvedValue({
      data: null,
      error: { name: "internal_error", message: "secret internal detail" },
    });

    const response = await POST(makeRequest({ body: validPayload() }));
    const body = await response.json();

    expect(response.status).toBe(500);
    expect(body.error).toBe("No se pudo enviar el mensaje");
    expect(JSON.stringify(body)).not.toContain("secret internal detail");
  });
});
