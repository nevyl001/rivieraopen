/**
 * Property-Based Tests for ValidationService
 * Feature: admin-interface
 *
 * Property 2: Player Data Integrity
 * Property 3: Tournament Data Integrity
 * Validates: Requirements 2.2, 2.3, 3.1-3.7, 4.2, 4.3, 5.1-5.5
 */

import { describe, it, expect } from "@jest/globals";
import * as fc from "fast-check";
import { ValidationService } from "../ValidationService";

describe("ValidationService - Property-Based Tests", () => {
  const validationService = new ValidationService();

  /**
   * Property 2: Player Data Integrity
   * For any player creation or update operation, if the operation succeeds,
   * then all required fields must be present and all field values must pass validation rules.
   */
  describe("Property 2: Player Data Integrity", () => {
    it("valid player data always passes validation", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            firstName: fc
              .string({ minLength: 1, maxLength: 100 })
              .filter((s) => s.trim().length > 0),
            lastName: fc
              .string({ minLength: 1, maxLength: 100 })
              .filter((s) => s.trim().length > 0),
            photo: fc.webUrl(),
            category: fc.constantFrom("Open", "1", "2", "3", "4", "5", "6"),
            gender: fc.constantFrom("Male", "Female"),
            points: fc.nat(),
            rank: fc.nat(),
            contact: fc.record({
              email: fc
                .tuple(
                  fc
                    .string({ minLength: 1, maxLength: 10 })
                    .map((s) => s.replace(/[^a-z0-9]/g, "a") || "a"),
                  fc
                    .string({ minLength: 2, maxLength: 5 })
                    .map((s) => s.replace(/[^a-z]/g, "a") || "aa"),
                  fc
                    .string({ minLength: 2, maxLength: 3 })
                    .map((s) => s.replace(/[^a-z]/g, "a") || "aa"),
                )
                .map(([local, domain, tld]) => `${local}@${domain}.${tld}`),
              phone: fc
                .string({ minLength: 10, maxLength: 15 })
                .map((s) => s.replace(/[^0-9]/g, "0")),
            }),
          }),
          async (playerData) => {
            const result = validationService.validatePlayer(playerData);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("invalid category always fails validation", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc
            .string()
            .filter((s) => !["Open", "1", "2", "3", "4", "5", "6"].includes(s)),
          async (invalidCategory) => {
            const playerData = {
              firstName: "John",
              lastName: "Doe",
              photo: "https://example.com/photo.jpg",
              category: invalidCategory,
              gender: "Male",
              points: 100,
              rank: 1,
              contact: {
                email: "john@example.com",
                phone: "1234567890",
              },
            };

            const result = validationService.validatePlayer(playerData);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("invalid gender always fails validation", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string().filter((s) => s !== "Male" && s !== "Female"),
          async (invalidGender) => {
            const playerData = {
              firstName: "John",
              lastName: "Doe",
              photo: "https://example.com/photo.jpg",
              category: "Open",
              gender: invalidGender,
              points: 100,
              rank: 1,
              contact: {
                email: "john@example.com",
                phone: "1234567890",
              },
            };

            const result = validationService.validatePlayer(playerData);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("negative points always fail validation", async () => {
      await fc.assert(
        fc.asyncProperty(fc.integer({ max: -1 }), async (negativePoints) => {
          const playerData = {
            firstName: "John",
            lastName: "Doe",
            photo: "https://example.com/photo.jpg",
            category: "Open",
            gender: "Male",
            points: negativePoints,
            rank: 1,
            contact: {
              email: "john@example.com",
              phone: "1234567890",
            },
          };

          const result = validationService.validatePlayer(playerData);
          expect(result.valid).toBe(false);
          expect(result.errors.some((e) => e.field.includes("points"))).toBe(
            true,
          );
        }),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Property 3: Tournament Data Integrity
   * For any tournament creation or update operation, if the operation succeeds,
   * then all required fields must be present and all field values must pass validation rules.
   */
  describe("Property 3: Tournament Data Integrity", () => {
    it("valid tournament data always passes validation", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            name: fc
              .string({ minLength: 1, maxLength: 200 })
              .filter((s) => s.trim().length > 0),
            date: fc.date().filter((d) => !isNaN(d.getTime())),
            club: fc
              .string({ minLength: 1, maxLength: 200 })
              .filter((s) => s.trim().length > 0),
            location: fc
              .string({ minLength: 1, maxLength: 200 })
              .filter((s) => s.trim().length > 0),
            genre: fc.constantFrom("Open", "Women"),
            status: fc.constantFrom("upcoming", "in-progress", "completed"),
            registrationOpen: fc.boolean(),
          }),
          async (tournamentData) => {
            const result = validationService.validateTournament(tournamentData);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("invalid genre always fails validation", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string().filter((s) => s !== "Open" && s !== "Women"),
          async (invalidGenre) => {
            const tournamentData = {
              name: "Test Tournament",
              date: new Date(),
              club: "Test Club",
              location: "Test Location",
              genre: invalidGenre,
              status: "upcoming",
              registrationOpen: true,
            };

            const result = validationService.validateTournament(tournamentData);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("invalid status always fails validation", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc
            .string()
            .filter(
              (s) => !["upcoming", "in-progress", "completed"].includes(s),
            ),
          async (invalidStatus) => {
            const tournamentData = {
              name: "Test Tournament",
              date: new Date(),
              club: "Test Club",
              location: "Test Location",
              genre: "Open",
              status: invalidStatus,
              registrationOpen: true,
            };

            const result = validationService.validateTournament(tournamentData);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Additional Property: Email Validation Consistency
   * For any string, validateEmail returns valid if and only if it's a valid email format
   */
  describe("Email Validation", () => {
    it("valid emails always pass validation", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc
            .tuple(
              fc
                .string({ minLength: 1, maxLength: 10 })
                .map((s) => s.replace(/[^a-z0-9]/g, "a") || "a"),
              fc
                .string({ minLength: 2, maxLength: 5 })
                .map((s) => s.replace(/[^a-z]/g, "a") || "aa"),
              fc
                .string({ minLength: 2, maxLength: 3 })
                .map((s) => s.replace(/[^a-z]/g, "a") || "aa"),
            )
            .map(([local, domain, tld]) => `${local}@${domain}.${tld}`),
          async (email) => {
            const result = validationService.validateEmail(email);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("strings without @ always fail email validation", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string().filter((s) => !s.includes("@")),
          async (invalidEmail) => {
            const result = validationService.validateEmail(invalidEmail);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Additional Property: Phone Validation Consistency
   * For any string containing only valid phone characters (min 7 chars), validation passes
   */
  describe("Phone Validation", () => {
    it("strings with only valid phone characters pass validation", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc
            .string({ minLength: 7 })
            .map((s) => s.replace(/[^0-9\s\-\+\(\)]/g, "0")),
          async (phone) => {
            if (phone.length >= 7) {
              const result = validationService.validatePhone(phone);
              expect(result.valid).toBe(true);
              expect(result.errors).toHaveLength(0);
            }
          },
        ),
        { numRuns: 100 },
      );
    });

    it("strings with invalid characters fail phone validation", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1 }).filter((s) => /[a-zA-Z]/.test(s)),
          async (invalidPhone) => {
            const result = validationService.validatePhone(invalidPhone);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Additional Property: URL Validation Consistency
   * For any valid URL, validation passes
   */
  describe("URL Validation", () => {
    it("valid URLs always pass validation", async () => {
      await fc.assert(
        fc.asyncProperty(fc.webUrl(), async (url) => {
          const result = validationService.validateUrl(url);
          expect(result.valid).toBe(true);
          expect(result.errors).toHaveLength(0);
        }),
        { numRuns: 100 },
      );
    });

    it("strings that are clearly not URLs fail validation", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.string({ minLength: 1, maxLength: 20 }).filter(
            (s) =>
              !s.includes("://") && // No protocol separator
              !s.includes(".") && // No domain separator
              !s.includes(":"), // No scheme separator
          ),
          async (invalidUrl) => {
            const result = validationService.validateUrl(invalidUrl);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });
  });

  /**
   * Additional Property: Category Validation Consistency
   * For any category value, validation passes if and only if it's in the valid set
   */
  describe("Category Validation", () => {
    it("valid categories always pass validation", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.constantFrom("Open", "1", "2", "3", "4", "5", "6"),
          async (category) => {
            const result = validationService.validateCategory(category);
            expect(result.valid).toBe(true);
            expect(result.errors).toHaveLength(0);
          },
        ),
        { numRuns: 100 },
      );
    });

    it("invalid categories always fail validation", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc
            .string()
            .filter((s) => !["Open", "1", "2", "3", "4", "5", "6"].includes(s)),
          async (invalidCategory) => {
            const result = validationService.validateCategory(invalidCategory);
            expect(result.valid).toBe(false);
            expect(result.errors.length).toBeGreaterThan(0);
          },
        ),
        { numRuns: 100 },
      );
    });
  });
});
