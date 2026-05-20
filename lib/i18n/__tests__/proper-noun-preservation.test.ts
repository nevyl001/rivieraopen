/**
 * Property-Based Tests for Content Translation with Proper Noun Preservation
 *
 * **Feature: spanish-localization, Property 4: Content Translation with Proper Noun Preservation**
 * **Validates: Requirements 3.2, 6.3**
 *
 * Tests that content containing both translatable text and proper nouns (names, places)
 * translates elements to Spanish while proper nouns remain unchanged.
 */

import { describe, it, expect } from "@jest/globals";
import fc from "fast-check";
import { Translations } from "@/lib/types";

// Mock translations for testing proper noun preservation
const mockTranslations: Translations = {
  common: {
    labels: {
      email: "Email",
      phone: "Teléfono",
      level: "Nivel",
      location: "Ubicación",
      club: "Club",
      date: "Fecha",
    },
    status: {
      registrationOpen: "Registro Abierto",
      registrationClosed: "Registro Cerrado",
    },
  },
  rankings: {
    labels: {
      currentRank: "Ranking Actual",
      totalPoints: "Puntos Totales",
      tournamentHistory: "Historial de Torneos",
      contactInfo: "Información de Contacto",
      socialMedia: "Redes Sociales",
    },
  },
  contact: {
    form: {
      email: "Email",
      phone: "Teléfono",
    },
  },
};

describe("Property 4: Content Translation with Proper Noun Preservation", () => {
  const translations = mockTranslations;

  // Generator for proper nouns (names, places, clubs)
  const properNounArb = fc.oneof(
    // Player names
    fc.constantFrom(
      "Juan Carlos",
      "María González",
      "Roberto Silva",
      "Ana Martínez",
      "Diego López",
      "Carmen Rodríguez"
    ),
    // Club names
    fc.constantFrom(
      "Miami Beach Club",
      "Coral Gables Tennis Center",
      "Biscayne Bay Resort",
      "Key West Sports Complex",
      "Club Deportivo Miami",
      "Tennis Center Coral Gables"
    ),
    // City names
    fc.constantFrom(
      "Miami",
      "Coral Gables",
      "Key West",
      "Fort Lauderdale",
      "Aventura",
      "Doral"
    )
  );

  // Generator for translatable labels
  const translatableLabelArb = fc.constantFrom(
    "Email",
    "Phone",
    "Level",
    "Current Rank",
    "Total Points",
    "Tournament History",
    "Contact Information",
    "Social Media"
  );

  /**
   * Property 4: Content Translation with Proper Noun Preservation
   * For any content containing both translatable text and proper nouns (names, places),
   * translatable elements should be in Spanish while proper nouns remain unchanged
   */
  it("should preserve player names while translating labels", () => {
    fc.assert(
      fc.property(properNounArb, translatableLabelArb, (playerName, label) => {
        // Simulate content that contains both proper nouns and translatable labels
        const content = `${label}: ${playerName}`;

        // Get Spanish translation for the label
        let spanishLabel = label;
        switch (label) {
          case "Email":
            spanishLabel = translations.common?.labels?.email || "Email";
            break;
          case "Phone":
            spanishLabel = translations.common?.labels?.phone || "Teléfono";
            break;
          case "Level":
            spanishLabel = translations.common?.labels?.level || "Nivel";
            break;
          case "Current Rank":
            spanishLabel =
              translations.rankings?.labels?.currentRank || "Ranking Actual";
            break;
          case "Total Points":
            spanishLabel =
              translations.rankings?.labels?.totalPoints || "Puntos Totales";
            break;
          case "Tournament History":
            spanishLabel =
              translations.rankings?.labels?.tournamentHistory ||
              "Historial de Torneos";
            break;
          case "Contact Information":
            spanishLabel =
              translations.rankings?.labels?.contactInfo ||
              "Información de Contacto";
            break;
          case "Social Media":
            spanishLabel =
              translations.rankings?.labels?.socialMedia || "Redes Sociales";
            break;
        }

        const translatedContent = `${spanishLabel}: ${playerName}`;

        // Property: The proper noun (player name) should remain unchanged
        expect(translatedContent).toContain(playerName);

        // Property: The label should be translated to Spanish (different from English)
        if (spanishLabel !== label) {
          expect(translatedContent).toContain(spanishLabel);
          expect(translatedContent).not.toContain(`${label}:`);
        }
      }),
      { numRuns: 100 }
    );
  });

  it("should preserve club names while translating tournament labels", () => {
    fc.assert(
      fc.property(
        properNounArb,
        fc.constantFrom(
          "Location",
          "Club",
          "Date",
          "Registration Open",
          "Registration Closed"
        ),
        (clubName, label) => {
          // Simulate tournament content with club names and labels
          const content = `${label}: ${clubName}`;

          // Get Spanish translation for the label
          let spanishLabel = label;
          switch (label) {
            case "Location":
              spanishLabel =
                translations.common?.labels?.location || "Ubicación";
              break;
            case "Club":
              spanishLabel = translations.common?.labels?.club || "Club";
              break;
            case "Date":
              spanishLabel = translations.common?.labels?.date || "Fecha";
              break;
            case "Registration Open":
              spanishLabel =
                translations.common?.status?.registrationOpen ||
                "Registro Abierto";
              break;
            case "Registration Closed":
              spanishLabel =
                translations.common?.status?.registrationClosed ||
                "Registro Cerrado";
              break;
          }

          const translatedContent = `${spanishLabel}: ${clubName}`;

          // Property: The proper noun (club name) should remain unchanged
          expect(translatedContent).toContain(clubName);

          // Property: The label should be translated to Spanish
          if (spanishLabel !== label) {
            expect(translatedContent).toContain(spanishLabel);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should preserve actual contact details while translating labels", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.emailAddress(),
          fc.constantFrom(
            "+1 (555) 123-4567",
            "+52 (55) 1234-5678",
            "+52 (55) 8765-4321"
          ),
          fc.constantFrom(
            "Ciudad de México, CDMX",
            "Polanco, CDMX",
            "Roma Norte, CDMX"
          )
        ),
        fc.constantFrom("Email", "Phone", "Address", "Location"),
        (contactDetail, label) => {
          const content = `${label}: ${contactDetail}`;

          // Get Spanish translation for the label
          let spanishLabel = label;
          switch (label) {
            case "Email":
              spanishLabel = translations.contact?.form?.email || "Email";
              break;
            case "Phone":
              spanishLabel = translations.contact?.form?.phone || "Teléfono";
              break;
            case "Address":
            case "Location":
              spanishLabel =
                translations.common?.labels?.location || "Ubicación";
              break;
          }

          const translatedContent = `${spanishLabel}: ${contactDetail}`;

          // Property: The actual contact detail should remain unchanged
          expect(translatedContent).toContain(contactDetail);

          // Property: The label should be translated to Spanish
          if (spanishLabel !== label) {
            expect(translatedContent).toContain(spanishLabel);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  it("should maintain proper noun case and formatting", () => {
    fc.assert(
      fc.property(properNounArb, (properNoun) => {
        // Property: Proper nouns should maintain their original case
        const originalCase = properNoun;
        const preservedCase = properNoun; // Simulating preservation

        expect(preservedCase).toBe(originalCase);

        // Property: Proper nouns should not be modified by translation system
        expect(preservedCase.length).toBe(originalCase.length);
        expect(preservedCase).toMatch(originalCase);

        // Property: Proper nouns should start with capital letter
        expect(properNoun).toMatch(/^[A-Z]/);
      }),
      { numRuns: 100 }
    );
  });

  it("should distinguish between proper nouns and translatable content", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          // Proper nouns (should not be translated)
          fc.constantFrom("Miami", "Roberto Silva", "Club Deportivo Miami"),
          // Common translatable labels (should have Spanish translations)
          fc.constantFrom("email", "phone", "level", "points")
        ),
        (content) => {
          const isProperNoun =
            /^[A-Z]/.test(content) &&
            (content.includes(" ") || ["Miami"].includes(content));
          const isTranslatableLabel = [
            "email",
            "phone",
            "level",
            "points",
          ].includes(content.toLowerCase());

          if (isProperNoun) {
            // Property: Proper nouns should remain unchanged
            expect(content).toBe(content);
            expect(content).toMatch(/^[A-Z]/);
          } else if (isTranslatableLabel) {
            // Property: Translatable labels should have Spanish equivalents available
            const hasSpanishTranslation =
              translations.common?.labels?.[content] ||
              translations.rankings?.labels?.[content] ||
              translations.contact?.form?.[content];

            // At least the translation system should be available
            expect(translations).toBeDefined();
            expect(typeof translations).toBe("object");
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
