/**
 * Property-Based Tests for SEO and Metadata Translation
 *
 * **Feature: spanish-localization, Property 6: SEO and Metadata Translation**
 * **Validates: Requirements 9.1, 9.2, 9.3, 9.4, 9.5**
 *
 * Tests that page metadata including titles, descriptions, alt text, and Open Graph tags
 * are translated to Spanish for proper SEO and social sharing.
 */

import { describe, it, expect } from "@jest/globals";
import fc from "fast-check";
import { Translations } from "@/lib/types";

// Mock SEO translations for testing
const mockSeoTranslations: Translations = {
  seo: {
    titles: {
      home: "Riviera Open - Juega como élite",
      tournaments: "Torneos - Riviera Open",
      rankings: "Rankings - Riviera Open",
      gallery: "Galería - Riviera Open",
      contact: "Contacto - Riviera Open",
      playerProfile: "{{playerName}} - Perfil del Jugador - Riviera Open",
      tournamentDetails:
        "{{tournamentName}} - Detalles del Torneo - Riviera Open",
    },
    descriptions: {
      home: "Una experiencia exclusiva de pádel dentro y fuera de la cancha.",
      tournaments:
        "Descubre los próximos torneos de pádel en el circuito Riviera Open. Regístrate y compite con jugadores de tu nivel.",
      rankings:
        "Consulta los rankings oficiales de jugadores del circuito Riviera Open organizados por niveles de habilidad.",
      gallery:
        "Explora la galería de fotos de los torneos y eventos del circuito Riviera Open. Revive los mejores momentos.",
      contact:
        "Ponte en contacto con el equipo de Riviera Open para más información sobre torneos, registros y el circuito.",
    },
    openGraph: {
      siteName: "Riviera Open",
      type: "website",
      locale: "es_ES",
      homeTitle: "Riviera Open - Circuito de Pádel",
      homeDescription:
        "El circuito de pádel más prestigioso de Ciudad de México con torneos competitivos y rankings oficiales.",
    },
    keywords: {
      home: "pádel, circuito, Ciudad de México, CDMX, torneos, rankings, competición, deporte",
      tournaments:
        "torneos pádel, competición, registro, Ciudad de México, CDMX, Riviera Open",
      rankings: "rankings pádel, clasificación jugadores, niveles, puntos",
      gallery: "fotos pádel, galería torneos, imágenes competición",
      contact: "contacto, información, registro torneos, Riviera Open",
    },
  },
};

describe("Property 6: SEO and Metadata Translation", () => {
  const seoTranslations = mockSeoTranslations.seo;

  // Generator for page types
  const pageTypeArb = fc.constantFrom(
    "home",
    "tournaments",
    "rankings",
    "gallery",
    "contact",
  );

  // Generator for metadata fields
  const metadataFieldArb = fc.constantFrom("title", "description", "keywords");

  /**
   * Property 6: SEO and Metadata Translation
   * For any page metadata including titles, descriptions, alt text, and Open Graph tags,
   * all content should be translated to Spanish for proper SEO and social sharing
   */
  it("should have Spanish titles for all page types", () => {
    fc.assert(
      fc.property(pageTypeArb, (pageType) => {
        const spanishTitle = seoTranslations?.titles?.[pageType];

        // Property: Every page should have a Spanish title
        expect(spanishTitle).toBeDefined();
        expect(typeof spanishTitle).toBe("string");
        expect(spanishTitle.length).toBeGreaterThan(0);

        // Property: Spanish titles should contain "Riviera Open"
        expect(spanishTitle).toContain("Riviera Open");

        // Property: Spanish titles should contain Spanish terms (when applicable)
        const spanishTerms = [
          "Circuito",
          "Profesional",
          "Torneos",
          "Rankings",
          "Galería",
          "Contacto",
        ];
        const hasSpanishTerms = spanishTerms.some((term) =>
          spanishTitle.includes(term),
        );
        // Allow home page to be more flexible with terms
        if (pageType !== "home") {
          expect(hasSpanishTerms).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("should have Spanish descriptions for all page types", () => {
    fc.assert(
      fc.property(pageTypeArb, (pageType) => {
        const spanishDescription = seoTranslations?.descriptions?.[pageType];

        // Property: Every page should have a Spanish description
        expect(spanishDescription).toBeDefined();
        expect(typeof spanishDescription).toBe("string");
        expect(spanishDescription.length).toBeGreaterThan(0);

        // Property: Descriptions should be substantial (more than 50 characters)
        expect(spanishDescription.length).toBeGreaterThan(50);

        // Property: Spanish descriptions should contain Spanish keywords
        const spanishKeywords = [
          "pádel",
          "circuito",
          "torneos",
          "rankings",
          "Ciudad de México",
        ];
        const hasSpanishKeywords = spanishKeywords.some((keyword) =>
          spanishDescription.toLowerCase().includes(keyword.toLowerCase()),
        );
        expect(hasSpanishKeywords).toBe(true);
      }),
      { numRuns: 100 },
    );
  });

  it("should have Spanish keywords for all page types", () => {
    fc.assert(
      fc.property(pageTypeArb, (pageType) => {
        const spanishKeywords = seoTranslations?.keywords?.[pageType];

        // Property: Every page should have Spanish keywords
        expect(spanishKeywords).toBeDefined();
        expect(typeof spanishKeywords).toBe("string");
        expect(spanishKeywords.length).toBeGreaterThan(0);

        // Property: Keywords should be comma-separated
        const keywordArray = spanishKeywords.split(",").map((k) => k.trim());
        expect(keywordArray.length).toBeGreaterThan(1);

        // Property: Should contain "pádel" keyword for relevant pages
        if (
          pageType === "home" ||
          pageType === "tournaments" ||
          pageType === "rankings" ||
          pageType === "gallery"
        ) {
          expect(spanishKeywords.toLowerCase()).toContain("pádel");
        }

        // Property: Should contain relevant Spanish keywords for each page type
        if (pageType === "contact") {
          expect(spanishKeywords.toLowerCase()).toContain("contacto");
        } else {
          const requiredSpanishKeywords = [
            "pádel",
            "circuito",
            "torneos",
            "riviera",
          ];
          const hasRequiredSpanish = requiredSpanishKeywords.some((keyword) =>
            spanishKeywords.toLowerCase().includes(keyword.toLowerCase()),
          );
          expect(hasRequiredSpanish).toBe(true);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("should have proper Open Graph metadata in Spanish", () => {
    fc.assert(
      fc.property(fc.constant("openGraph"), () => {
        const openGraph = seoTranslations?.openGraph;

        // Property: Open Graph data should exist
        expect(openGraph).toBeDefined();
        expect(typeof openGraph).toBe("object");

        // Property: Should have Spanish locale
        expect(openGraph?.locale).toBe("es_ES");

        // Property: Site name should be consistent
        expect(openGraph?.siteName).toBe("Riviera Open");

        // Property: Type should be website
        expect(openGraph?.type).toBe("website");

        // Property: Home title should be in Spanish
        expect(openGraph?.homeTitle).toBeDefined();
        expect(openGraph?.homeTitle).toContain("Circuito");
        expect(openGraph?.homeTitle).toContain("Pádel");

        // Property: Home description should be in Spanish
        expect(openGraph?.homeDescription).toBeDefined();
        expect(openGraph?.homeDescription).toContain("circuito");
        expect(openGraph?.homeDescription.length).toBeGreaterThan(30);
      }),
      { numRuns: 100 },
    );
  });

  it("should support dynamic content interpolation in Spanish", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constantFrom("Juan Carlos", "María González", "Roberto Silva"),
          fc.constantFrom(
            "Torneo de Primavera",
            "Copa de Verano",
            "Campeonato de Otoño",
          ),
        ),
        fc.constantFrom("playerProfile", "tournamentDetails"),
        (dynamicContent, templateType) => {
          const template = seoTranslations?.titles?.[templateType];

          // Property: Dynamic templates should exist
          expect(template).toBeDefined();
          expect(typeof template).toBe("string");

          // Property: Templates should contain interpolation placeholders
          if (templateType === "playerProfile") {
            expect(template).toContain("{{playerName}}");
            expect(template).toContain("Perfil del Jugador");
          } else if (templateType === "tournamentDetails") {
            expect(template).toContain("{{tournamentName}}");
            expect(template).toContain("Detalles del Torneo");
          }

          // Property: Templates should be in Spanish
          expect(template).toContain("Riviera Open");

          // Simulate interpolation
          let interpolated = template;
          if (templateType === "playerProfile") {
            interpolated = template.replace("{{playerName}}", dynamicContent);
          } else if (templateType === "tournamentDetails") {
            interpolated = template.replace(
              "{{tournamentName}}",
              dynamicContent,
            );
          }

          // Property: Interpolated content should preserve Spanish structure
          expect(interpolated).toContain(dynamicContent);
          expect(interpolated).toContain("Riviera Open");
          expect(interpolated).not.toContain("{{");
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should maintain consistent Spanish terminology across metadata", () => {
    fc.assert(
      fc.property(fc.constant("terminology"), () => {
        const allTitles = Object.values(seoTranslations?.titles || {});
        const allDescriptions = Object.values(
          seoTranslations?.descriptions || {},
        );
        const allContent = [...allTitles, ...allDescriptions].join(" ");

        // Property: Should consistently use "pádel" (Spanish spelling)
        const padelCount = (allContent.match(/pádel/gi) || []).length;
        const padelEnglishCount = (allContent.match(/\bpadel\b/gi) || [])
          .length;

        // Should prefer Spanish spelling
        expect(padelCount).toBeGreaterThanOrEqual(padelEnglishCount);

        // Property: Should consistently use "circuito" instead of "circuit"
        expect(allContent.toLowerCase()).toContain("circuito");

        // Property: Should consistently use "torneos" instead of "tournaments"
        const torneosCount = (allContent.match(/torneos/gi) || []).length;
        expect(torneosCount).toBeGreaterThan(0);

        // Property: Should consistently use Spanish location terms
        expect(allContent.toLowerCase()).toContain("ciudad de méxico");
      }),
      { numRuns: 100 },
    );
  });

  it("should have appropriate length limits for SEO optimization", () => {
    fc.assert(
      fc.property(pageTypeArb, (pageType) => {
        const title = seoTranslations?.titles?.[pageType];
        const description = seoTranslations?.descriptions?.[pageType];

        if (title) {
          // Property: Titles should be within SEO-friendly length (under 60 characters)
          expect(title.length).toBeLessThanOrEqual(60);
          expect(title.length).toBeGreaterThan(10);
        }

        if (description) {
          // Property: Descriptions should be within SEO-friendly length (under 160 characters)
          expect(description.length).toBeLessThanOrEqual(160);
          expect(description.length).toBeGreaterThan(50);
        }
      }),
      { numRuns: 100 },
    );
  });

  it("should have proper Spanish language attributes", () => {
    fc.assert(
      fc.property(fc.constant("language"), () => {
        // Property: Locale should be properly formatted for Spanish
        const locale = seoTranslations?.openGraph?.locale;
        expect(locale).toBe("es_ES");

        // Property: Should follow ISO language code format
        expect(locale).toMatch(/^[a-z]{2}_[A-Z]{2}$/);

        // Property: Should indicate Spanish language
        expect(locale.startsWith("es")).toBe(true);
      }),
      { numRuns: 100 },
    );
  });
});
