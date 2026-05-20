/**
 * Property-Based Tests for English Formatting
 *
 * **Feature: english-translation**
 * Tests English date, number, time, and relative time formatting
 */

import { describe, it, expect } from "@jest/globals";
import fc from "fast-check";
import {
  formatDate,
  formatNumber,
  formatTime,
  formatRelativeTime,
} from "@/lib/i18n/formatters";

describe("English Date Formatting", () => {
  /**
   * Property 6: English Date Formatting
   * For any date value, when English locale is active, formatting should use
   * English month names and month/day/year convention
   * Validates: Requirements 6.2, 10.1, 10.2
   */
  it("should format dates with English month names", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2020, max: 2030 }),
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 1, max: 28 }),
        (year, month, day) => {
          const date = new Date(year, month, day);
          const formatted = formatDate(date, "en");

          // Should contain English month names
          const englishMonths = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December",
          ];

          const hasEnglishMonth = englishMonths.some((m) =>
            formatted.includes(m)
          );
          expect(hasEnglishMonth).toBe(true);

          // Should not contain Spanish month names
          const spanishMonths = [
            "enero",
            "febrero",
            "marzo",
            "abril",
            "mayo",
            "junio",
            "julio",
            "agosto",
            "septiembre",
            "octubre",
            "noviembre",
            "diciembre",
          ];

          const hasSpanishMonth = spanishMonths.some((m) =>
            formatted.toLowerCase().includes(m)
          );
          expect(hasSpanishMonth).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should format dates differently from Spanish", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2020, max: 2030 }),
        fc.integer({ min: 0, max: 11 }),
        fc.integer({ min: 1, max: 28 }),
        (year, month, day) => {
          const date = new Date(year, month, day);
          const enFormatted = formatDate(date, "en");
          const esFormatted = formatDate(date, "es");

          // English and Spanish formats should be different
          expect(enFormatted).not.toBe(esFormatted);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("English Number Formatting", () => {
  /**
   * Property 7: English Number Formatting
   * For any number value, when English locale is active, formatting should use
   * period for decimal separator and comma for thousands separator
   * Validates: Requirements 6.3, 10.3
   */
  it("should use comma for thousands separator in English", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1000, max: 999999 }), (number) => {
        const formatted = formatNumber(number, "en");

        // Should contain comma as thousands separator
        expect(formatted).toContain(",");
      }),
      { numRuns: 100 }
    );
  });

  it("should use period for decimal separator in English", () => {
    fc.assert(
      fc.property(
        fc.double({
          min: 0.01,
          max: 999.99,
          noNaN: true,
          noDefaultInfinity: true,
        }),
        (number) => {
          const formatted = formatNumber(number, "en");

          // Round to 2 decimal places to match formatter behavior
          const rounded = Math.round(number * 100) / 100;

          // If the rounded number has decimals, formatted string should contain period
          if (rounded % 1 !== 0) {
            expect(formatted).toContain(".");
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should format numbers differently from Spanish", () => {
    fc.assert(
      fc.property(
        fc.double({
          min: 1000.5,
          max: 9999.99,
          noNaN: true,
          noDefaultInfinity: true,
        }),
        (number) => {
          const enFormatted = formatNumber(number, "en");
          const esFormatted = formatNumber(number, "es");

          // English uses comma for thousands, period for decimal
          // Spanish uses period for thousands, comma for decimal
          // So they should be different
          expect(enFormatted).not.toBe(esFormatted);
        }
      ),
      { numRuns: 100 }
    );
  });
});

describe("Relative Time Formatting", () => {
  /**
   * Property 11: Relative Time Formatting
   * For any date value, when English locale is active, relative time formatting
   * should use English indicators
   * Validates: Requirements 10.4
   */
  it("should use English relative time indicators for past dates", () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 365 }), (daysAgo) => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - daysAgo);

        const formatted = formatRelativeTime(pastDate, "en");

        // Should contain "ago" or other English indicators
        const englishIndicators = ["ago", "yesterday", "last"];
        const hasEnglishIndicator = englishIndicators.some((ind) =>
          formatted.toLowerCase().includes(ind)
        );
        expect(hasEnglishIndicator).toBe(true);

        // Should not contain Spanish indicators
        expect(formatted.toLowerCase()).not.toContain("hace");
      }),
      { numRuns: 100 }
    );
  });

  it("should use English relative time indicators for future dates", () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 365 }), (daysAhead) => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAhead);

        const formatted = formatRelativeTime(futureDate, "en");

        // Should contain "in" or other English indicators
        const englishIndicators = ["in", "tomorrow", "next"];
        const hasEnglishIndicator = englishIndicators.some((ind) =>
          formatted.toLowerCase().includes(ind)
        );
        expect(hasEnglishIndicator).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  it("should format relative time differently from Spanish", () => {
    fc.assert(
      fc.property(fc.integer({ min: 2, max: 365 }), (daysOffset) => {
        const date = new Date();
        date.setDate(date.getDate() + daysOffset);

        const enFormatted = formatRelativeTime(date, "en");
        const esFormatted = formatRelativeTime(date, "es");

        // English and Spanish should format differently
        expect(enFormatted).not.toBe(esFormatted);
      }),
      { numRuns: 100 }
    );
  });
});

describe("12-Hour Time Formatting", () => {
  /**
   * Property 12: 12-Hour Time Formatting
   * For any time value, when English locale is active, time formatting should use
   * 12-hour format with AM/PM indicators
   * Validates: Requirements 10.5
   */
  it("should use 12-hour format with AM/PM for English", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 23 }),
        fc.integer({ min: 0, max: 59 }),
        (hour, minute) => {
          const date = new Date(2024, 0, 1, hour, minute);
          const formatted = formatTime(date, "en");

          // Should contain AM or PM
          const hasAMPM =
            formatted.includes("AM") ||
            formatted.includes("PM") ||
            formatted.includes("am") ||
            formatted.includes("pm") ||
            formatted.includes("a.m.") ||
            formatted.includes("p.m.") ||
            formatted.includes("a. m.") ||
            formatted.includes("p. m.");

          expect(hasAMPM).toBe(true);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should use 24-hour format for Spanish", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 0, max: 23 }),
        fc.integer({ min: 0, max: 59 }),
        (hour, minute) => {
          const date = new Date(2024, 0, 1, hour, minute);
          const formatted = formatTime(date, "es");

          // Should NOT contain AM or PM
          const hasAMPM =
            formatted.includes("AM") ||
            formatted.includes("PM") ||
            formatted.includes("am") ||
            formatted.includes("pm") ||
            formatted.includes("a.m.") ||
            formatted.includes("p.m.") ||
            formatted.includes("a. m.") ||
            formatted.includes("p. m.");

          expect(hasAMPM).toBe(false);
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should format time differently between English and Spanish", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 13, max: 23 }),
        fc.integer({ min: 0, max: 59 }),
        (hour, minute) => {
          const date = new Date(2024, 0, 1, hour, minute);
          const enFormatted = formatTime(date, "en");
          const esFormatted = formatTime(date, "es");

          // For afternoon/evening times, formats should be different
          // English: 1:00 PM, Spanish: 13:00
          expect(enFormatted).not.toBe(esFormatted);
        }
      ),
      { numRuns: 100 }
    );
  });
});
