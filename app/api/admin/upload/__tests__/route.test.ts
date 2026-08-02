/**
 * @jest-environment node
 */

import { describe, it, expect, beforeEach } from "@jest/globals";
import { NextRequest } from "next/server";
import { POST, GET } from "../route";

const URL = "https://www.rivieraopen.com/api/admin/upload";

describe("POST /api/admin/upload (retired)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("returns 410 Gone without requiring a body", async () => {
    const request = new NextRequest(URL, { method: "POST" });
    const response = await POST();
    expect(response.status).toBe(410);
    const json = await response.json();
    expect(json.code).toBe("UPLOAD_ENDPOINT_GONE");
    // Ensure handler ignores request body entirely (no formData access).
    expect(request.body).toBeNull();
  });

  it("returns 410 for GET", async () => {
    const response = await GET();
    expect(response.status).toBe(410);
  });
});
