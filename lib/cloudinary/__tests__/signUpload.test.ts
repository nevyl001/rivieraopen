/**
 * @jest-environment node
 */

import { describe, it, expect, beforeEach, afterEach } from "@jest/globals";
import {
  buildSignedUploadParams,
  generateSignedUploadCredentials,
  isAllowedUploadFolder,
  UPLOAD_SIGNATURE_TTL_SECONDS,
} from "../signUpload";
import { resetConfiguration } from "../config";

describe("signUpload", () => {
  const prev = {
    cloud: process.env.CLOUDINARY_CLOUD_NAME,
    key: process.env.CLOUDINARY_API_KEY,
    secret: process.env.CLOUDINARY_API_SECRET,
  };

  beforeEach(() => {
    resetConfiguration();
    process.env.CLOUDINARY_CLOUD_NAME = "test-cloud";
    process.env.CLOUDINARY_API_KEY = "test-key";
    process.env.CLOUDINARY_API_SECRET = "test-secret-do-not-leak";
  });

  afterEach(() => {
    resetConfiguration();
    process.env.CLOUDINARY_CLOUD_NAME = prev.cloud;
    process.env.CLOUDINARY_API_KEY = prev.key;
    process.env.CLOUDINARY_API_SECRET = prev.secret;
  });

  it("allowlists only known folders", () => {
    expect(isAllowedUploadFolder("players")).toBe(true);
    expect(isAllowedUploadFolder("tournaments")).toBe(true);
    expect(isAllowedUploadFolder("gallery")).toBe(true);
    expect(isAllowedUploadFolder("other")).toBe(false);
    expect(isAllowedUploadFolder("../x")).toBe(false);
  });

  it("signs only allowlisted parameters", () => {
    const params = buildSignedUploadParams("gallery", 1700000000);
    expect(Object.keys(params).sort()).toEqual([
      "allowed_formats",
      "folder",
      "overwrite",
      "timestamp",
      "unique_filename",
      "use_filename",
    ]);
    expect(params.folder).toBe("riviera-open/gallery");
    expect(params.overwrite).toBe("false");
    expect(params.unique_filename).toBe("true");
    expect(params.use_filename).toBe("false");
    expect(params.allowed_formats).toBe("jpg,png,webp");
  });

  it("generateSignedUploadCredentials never returns the API secret", () => {
    const creds = generateSignedUploadCredentials("players");
    const serialized = JSON.stringify(creds);
    expect(serialized).not.toContain("test-secret-do-not-leak");
    expect(creds).toEqual(
      expect.objectContaining({
        cloudName: "test-cloud",
        apiKey: "test-key",
        folder: "riviera-open/players",
        logicalFolder: "players",
      }),
    );
    expect(typeof creds.signature).toBe("string");
    expect(creds.signature.length).toBeGreaterThan(10);
    expect(creds.expiresAt).toBe(
      creds.timestamp + UPLOAD_SIGNATURE_TTL_SECONDS,
    );
  });
});
