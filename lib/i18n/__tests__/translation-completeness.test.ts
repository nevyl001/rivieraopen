/**
 * Property-Based Tests for Translation Completeness and Structure Consistency
 *
 * **Feature: english-translation, Property 1: Translation Completeness and Structure Consistency**
 * **Validates: Requirements 1.1, 1.5, 12.1, 12.4**
 *
 * Tests that for any translation key present in Spanish translations, the English translations
 * contain the same key with the same nested structure.
 */

import { describe, it, expect } from "@jest/globals";
import fc from "fast-check";

// Import Spanish translations
import esCommon from "@/lib/locales/es/common.json";
import esHome from "@/lib/locales/es/home.json";
import esTournaments from "@/lib/locales/es/tournaments.json";
import esRankings from "@/lib/locales/es/rankings.json";
import esGallery from "@/lib/locales/es/gallery.json";
import esContact from "@/lib/locales/es/contact.json";
import esSeo from "@/lib/locales/es/seo.json";

// Import English translations
import enCommon from "@/lib/locales/en/common.json";
import enHome from "@/lib/locales/en/home.json";
import enTournaments from "@/lib/locales/en/tournaments.json";
import enRankings from "@/lib/locales/en/rankings.json";
import enGallery from "@/lib/locales/en/gallery.json";
import enContact from "@/lib/locales/en/contact.json";
import enSeo from "@/lib/locales/en/seo.json";

describe("Translation Completeness and Structure Consistency", () => {
  /**
   * Property 1: Translation Completeness and Structure Consistency
   * For any translation key present in Spanish translations, the English translations
   * should contain the same key with the same nested structure
   */

  // Helper function to get all keys from a nested object
  function getAllKeys(obj: any, prefix = ""): string[] {
    const keys: string[] = [];

    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;

      if (
        typeof obj[key] === "object" &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        keys.push(...getAllKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }

    return keys;
  }

  // Helper function to get value by key path
  function getValueByPath(obj: any, path: string): any {
    const keys = path.split(".");
    let value = obj;

    for (const key of keys) {
      if (value && typeof value === "object" && key in value) {
        value = value[key];
      } else {
        return undefined;
      }
    }

    return value;
  }

  it("should have all Spanish common.json keys in English common.json", () => {
    const esKeys = getAllKeys(esCommon);
    const enKeys = getAllKeys(enCommon);

    fc.assert(
      fc.property(fc.constantFrom(...esKeys), (key) => {
        // English should have the same key
        expect(enKeys).toContain(key);

        // Both should have string values
        const esValue = getValueByPath(esCommon, key);
        const enValue = getValueByPath(enCommon, key);

        expect(typeof esValue).toBe("string");
        expect(typeof enValue).toBe("string");

        // English value should not be empty
        expect(enValue.trim().length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("should have all Spanish home.json keys in English home.json", () => {
    const esKeys = getAllKeys(esHome);
    const enKeys = getAllKeys(enHome);

    fc.assert(
      fc.property(fc.constantFrom(...esKeys), (key) => {
        expect(enKeys).toContain(key);

        const esValue = getValueByPath(esHome, key);
        const enValue = getValueByPath(enHome, key);

        expect(typeof esValue).toBe("string");
        expect(typeof enValue).toBe("string");
        expect(enValue.trim().length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("should have all Spanish tournaments.json keys in English tournaments.json", () => {
    const esKeys = getAllKeys(esTournaments);
    const enKeys = getAllKeys(enTournaments);

    fc.assert(
      fc.property(fc.constantFrom(...esKeys), (key) => {
        expect(enKeys).toContain(key);

        const esValue = getValueByPath(esTournaments, key);
        const enValue = getValueByPath(enTournaments, key);

        expect(typeof esValue).toBe("string");
        expect(typeof enValue).toBe("string");
        expect(enValue.trim().length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("should have all Spanish rankings.json keys in English rankings.json", () => {
    const esKeys = getAllKeys(esRankings);
    const enKeys = getAllKeys(enRankings);

    fc.assert(
      fc.property(fc.constantFrom(...esKeys), (key) => {
        expect(enKeys).toContain(key);

        const esValue = getValueByPath(esRankings, key);
        const enValue = getValueByPath(enRankings, key);

        expect(typeof esValue).toBe("string");
        expect(typeof enValue).toBe("string");
        expect(enValue.trim().length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("should have all Spanish gallery.json keys in English gallery.json", () => {
    const esKeys = getAllKeys(esGallery);
    const enKeys = getAllKeys(enGallery);

    fc.assert(
      fc.property(fc.constantFrom(...esKeys), (key) => {
        expect(enKeys).toContain(key);

        const esValue = getValueByPath(esGallery, key);
        const enValue = getValueByPath(enGallery, key);

        expect(typeof esValue).toBe("string");
        expect(typeof enValue).toBe("string");
        expect(enValue.trim().length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("should have all Spanish contact.json keys in English contact.json", () => {
    const esKeys = getAllKeys(esContact);
    const enKeys = getAllKeys(enContact);

    fc.assert(
      fc.property(fc.constantFrom(...esKeys), (key) => {
        expect(enKeys).toContain(key);

        const esValue = getValueByPath(esContact, key);
        const enValue = getValueByPath(enContact, key);

        expect(typeof esValue).toBe("string");
        expect(typeof enValue).toBe("string");
        expect(enValue.trim().length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("should have all Spanish seo.json keys in English seo.json", () => {
    const esKeys = getAllKeys(esSeo);
    const enKeys = getAllKeys(enSeo);

    fc.assert(
      fc.property(fc.constantFrom(...esKeys), (key) => {
        expect(enKeys).toContain(key);

        const esValue = getValueByPath(esSeo, key);
        const enValue = getValueByPath(enSeo, key);

        expect(typeof esValue).toBe("string");
        expect(typeof enValue).toBe("string");
        expect(enValue.trim().length).toBeGreaterThan(0);
      }),
      { numRuns: 100 }
    );
  });

  it("should have matching structure depth between Spanish and English translations", () => {
    const translationPairs = [
      { es: esCommon, en: enCommon, name: "common" },
      { es: esHome, en: enHome, name: "home" },
      { es: esTournaments, en: enTournaments, name: "tournaments" },
      { es: esRankings, en: enRankings, name: "rankings" },
      { es: esGallery, en: enGallery, name: "gallery" },
      { es: esContact, en: enContact, name: "contact" },
      { es: esSeo, en: enSeo, name: "seo" },
    ];

    fc.assert(
      fc.property(fc.constantFrom(...translationPairs), (pair) => {
        const esKeys = getAllKeys(pair.es);
        const enKeys = getAllKeys(pair.en);

        // Both should have the same number of keys
        expect(enKeys.length).toBe(esKeys.length);

        // All Spanish keys should exist in English
        esKeys.forEach((key) => {
          expect(enKeys).toContain(key);
        });
      }),
      { numRuns: 100 }
    );
  });

  it("should not have any extra keys in English that don't exist in Spanish", () => {
    const translationPairs = [
      { es: esCommon, en: enCommon, name: "common" },
      { es: esHome, en: enHome, name: "home" },
      { es: esTournaments, en: enTournaments, name: "tournaments" },
      { es: esRankings, en: enRankings, name: "rankings" },
      { es: esGallery, en: enGallery, name: "gallery" },
      { es: esContact, en: enContact, name: "contact" },
      { es: esSeo, en: enSeo, name: "seo" },
    ];

    fc.assert(
      fc.property(fc.constantFrom(...translationPairs), (pair) => {
        const esKeys = getAllKeys(pair.es);
        const enKeys = getAllKeys(pair.en);

        // All English keys should exist in Spanish
        enKeys.forEach((key) => {
          expect(esKeys).toContain(key);
        });
      }),
      { numRuns: 100 }
    );
  });

  it("should preserve parameter placeholders in English translations", () => {
    const translationPairs = [{ es: esSeo, en: enSeo, name: "seo" }];

    fc.assert(
      fc.property(fc.constantFrom(...translationPairs), (pair) => {
        const esKeys = getAllKeys(pair.es);

        esKeys.forEach((key) => {
          const esValue = getValueByPath(pair.es, key);
          const enValue = getValueByPath(pair.en, key);

          // Check for parameter placeholders like {{playerName}}
          const esPlaceholders = esValue.match(/\{\{(\w+)\}\}/g) || [];
          const enPlaceholders = enValue.match(/\{\{(\w+)\}\}/g) || [];

          // Both should have the same placeholders
          expect(enPlaceholders.sort()).toEqual(esPlaceholders.sort());
        });
      }),
      { numRuns: 100 }
    );
  });
});
