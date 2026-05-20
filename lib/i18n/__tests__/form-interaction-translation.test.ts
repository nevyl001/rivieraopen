/**
 * Property-based tests for form and interaction translation
 * Feature: spanish-localization, Property 3: Form and Interaction Translation
 * Validates: Requirements 6.1, 6.2, 6.4, 6.5
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import fc from "fast-check";
import {
  getTranslationByPath,
  getNamespacedTranslation,
  clearTranslationCache,
} from "../translations";
import { Translations } from "@/lib/types";

// Mock translations for testing form and interaction translation
const mockTranslations: Translations = {
  common: {
    navigation: {
      home: "Inicio",
      tournaments: "Torneos",
      rankings: "Rankings",
      gallery: "Galería",
      contact: "Contacto",
    },
    buttons: {
      viewDetails: "Ver Detalles",
      register: "Registrarse",
      viewAll: "Ver Todos",
      close: "Cerrar",
      next: "Siguiente",
      previous: "Anterior",
      viewRankings: "Ver Rankings",
      upcomingTournaments: "Próximos Torneos",
      scrollToContent: "Desplazarse al contenido",
    },
    status: {
      upcoming: "Próximo",
      inProgress: "En Progreso",
      completed: "Completado",
      registrationOpen: "Registro Abierto",
      registrationClosed: "Registro Cerrado",
    },
    labels: {
      level: "Nivel",
      points: "Puntos",
      rank: "Ranking",
      email: "Email",
      phone: "Teléfono",
      date: "Fecha",
      location: "Ubicación",
      club: "Club",
    },
    aria: {
      instagram: "Instagram",
      facebook: "Facebook",
      twitter: "Twitter",
      toggleMenu: "Alternar menú",
    },
  },
  home: {
    hero: {
      title: "Riviera Open",
      subtitle: "Juega como élite",
      description:
        "Una experiencia exclusiva de pádel dentro y fuera de la cancha.",
      cta: {
        viewRankings: "Ver Rankings",
        upcomingTournaments: "Próximos Torneos",
      },
    },
    sections: {
      upcomingTournaments: "Próximos Torneos",
      upcomingTournamentsDescription:
        "Regístrate ahora para nuestros próximos torneos.",
      featuredPlayers: "Jugadores Destacados",
      featuredPlayersDescription:
        "Conoce a los mejores jugadores del circuito.",
      gallery: "Galería",
      galleryDescription: "Revive los mejores momentos de nuestros torneos.",
      sponsors: "Patrocinadores",
      sponsorsDescription: "Conoce a nuestros patrocinadores.",
    },
  },
  tournaments: {
    labels: {
      tournamentDetails: "Detalles del Torneo",
      registrationStatus: "Estado de Registro",
      participants: "Participantes",
      results: "Resultados",
      photoGallery: "Galería de Fotos",
      winner: "Ganador",
      runnerUp: "Subcampeón",
      firstPlace: "1er Lugar",
      secondPlace: "2do Lugar",
    },
    status: {
      registrationOpen: "Registro Abierto",
      registrationClosed: "Registro Cerrado",
      upcoming: "Próximo",
      inProgress: "En Progreso",
      completed: "Completado",
    },
    levels: {
      open: "Abierto",
      level1: "Nivel 1",
      level2: "Nivel 2",
      level3: "Nivel 3",
      level4: "Nivel 4",
      level5: "Nivel 5",
      level6: "Nivel 6",
    },
    messages: {
      noTournaments: "No hay torneos disponibles.",
      loadingTournaments: "Cargando torneos...",
      registrationSuccess: "Registro exitoso.",
      registrationError: "Error en el registro.",
    },
  },
  rankings: {
    labels: {
      playerRankings: "Rankings de Jugadores",
      levelCategories: "Categorías por Nivel",
      playerProfile: "Perfil del Jugador",
      totalPoints: "Puntos Totales",
      currentRank: "Ranking Actual",
      tournamentHistory: "Historial de Torneos",
      achievements: "Logros",
      contactInfo: "Información de Contacto",
      socialMedia: "Redes Sociales",
      winLossRecord: "Récord de Victorias/Derrotas",
      bestFinishes: "Mejores Resultados",
    },
    levels: {
      open: "Abierto",
      level1: "Nivel 1",
      level2: "Nivel 2",
      level3: "Nivel 3",
      level4: "Nivel 4",
      level5: "Nivel 5",
      level6: "Nivel 6",
    },
    placementIndicators: {
      first: "1er Lugar",
      second: "2do Lugar",
      third: "3er Lugar",
      finalist: "Finalista",
      semifinalist: "Semifinalista",
    },
    messages: {
      noPlayers: "No hay jugadores en esta categoría.",
      loadingRankings: "Cargando rankings...",
      playerNotFound: "Jugador no encontrado.",
    },
  },
  gallery: {
    labels: {
      photoGallery: "Galería de Fotos",
      tournamentPhotos: "Fotos de Torneos",
      eventPhotos: "Fotos de Eventos",
      filterPhotos: "Filtrar Fotos",
      viewLarger: "Ver Más Grande",
      downloadPhoto: "Descargar Foto",
      sharePhoto: "Compartir Foto",
    },
    filters: {
      all: "Todas",
      byTournament: "Por Torneo",
      byYear: "Por Año",
      byEvent: "Por Evento",
      recent: "Recientes",
    },
    navigation: {
      previous: "Anterior",
      next: "Siguiente",
      close: "Cerrar",
      viewAll: "Ver Todas",
    },
    metadata: {
      tournament: "Torneo",
      date: "Fecha",
      location: "Ubicación",
      photographer: "Fotógrafo",
    },
    messages: {
      noPhotos: "No hay fotos disponibles.",
      loadingPhotos: "Cargando fotos...",
      photoLoadError: "Error al cargar la foto.",
    },
  },
  contact: {
    form: {
      contactUs: "Contáctanos",
      getInTouch: "Ponte en Contacto",
      name: "Nombre",
      email: "Email",
      phone: "Teléfono",
      subject: "Asunto",
      message: "Mensaje",
      send: "Enviar",
      sending: "Enviando...",
      required: "Requerido",
      optional: "Opcional",
    },
    placeholders: {
      enterName: "Ingresa tu nombre",
      enterEmail: "Ingresa tu email",
      enterPhone: "Ingresa tu teléfono",
      enterSubject: "Ingresa el asunto",
      enterMessage: "Ingresa tu mensaje",
    },
    validation: {
      nameRequired: "El nombre es requerido",
      emailRequired: "El email es requerido",
      emailInvalid: "Por favor ingresa un email válido",
      messageRequired: "El mensaje es requerido",
      phoneInvalid: "Por favor ingresa un número de teléfono válido",
    },
    success: {
      messageSent: "Mensaje enviado exitosamente",
      thankYou: "Gracias por contactarnos",
      willRespond: "Te responderemos pronto",
    },
    error: {
      sendFailed: "Error al enviar el mensaje",
      tryAgain: "Por favor intenta nuevamente",
      networkError: "Error de conexión",
    },
    info: {
      contactInfo: "Información de Contacto",
      address: "Dirección",
      hours: "Horarios",
      followUs: "Síguenos",
    },
  },
  seo: {
    titles: {
      home: "Riviera Open - Juega como élite",
      tournaments: "Torneos - Riviera Open",
      rankings: "Rankings - Riviera Open",
      gallery: "Galería - Riviera Open",
      contact: "Contacto - Riviera Open",
      about: "Acerca de - Riviera Open",
      playerProfile: "{{playerName}} - Perfil del Jugador",
      tournamentDetails: "{{tournamentName}} - Detalles del Torneo",
    },
    descriptions: {
      home: "Una experiencia exclusiva de pádel dentro y fuera de la cancha.",
      tournaments: "Descubre los próximos torneos de pádel.",
      rankings: "Consulta los rankings oficiales de jugadores.",
      gallery: "Explora la galería de fotos de los torneos.",
      contact: "Ponte en contacto con el equipo de Riviera Open.",
      about: "Conoce más sobre el circuito Riviera Open.",
      playerProfile: "Perfil completo de {{playerName}}.",
      tournamentDetails: "Información completa sobre {{tournamentName}}.",
    },
    openGraph: {
      siteName: "Riviera Open",
      type: "website",
      locale: "es_ES",
      homeTitle: "Riviera Open - Juega como élite",
      homeDescription:
        "El circuito de pádel más prestigioso de Ciudad de México.",
    },
    keywords: {
      home: "pádel, circuito, Ciudad de México, CDMX, torneos, rankings",
      tournaments: "torneos pádel, competición, registro",
      rankings: "rankings pádel, clasificación jugadores",
      gallery: "fotos pádel, galería torneos",
      contact: "contacto, información, registro torneos",
    },
  },
};

describe("Form and Interaction Translation", () => {
  beforeEach(() => {
    clearTranslationCache();
    jest.clearAllMocks();
  });

  /**
   * Property 3: Form and Interaction Translation
   * For any form element, validation message, or interactive component,
   * all text should be in Spanish including labels, placeholders, error messages, and success confirmations
   */
  it("should have all form labels translated to Spanish", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "contactUs",
          "getInTouch",
          "name",
          "email",
          "phone",
          "subject",
          "message",
          "send",
          "sending",
        ),
        (formKey) => {
          const formLabel = getTranslationByPath(
            mockTranslations,
            `contact.form.${formKey}`,
          );

          // Should be translated to Spanish
          expect(typeof formLabel).toBe("string");
          expect(formLabel.length).toBeGreaterThan(0);
          expect(formLabel).not.toBe(`contact.form.${formKey}`);

          // Should be appropriate for forms (clear and concise)
          expect(formLabel.length).toBeLessThan(30);

          // Should be proper Spanish (except for international terms like "Email")
          if (formKey !== "email") {
            expect(formLabel).toMatch(/^[A-Za-záéíóúñÑ\s.]+$/);
          }

          // Should not contain English form terms
          const englishFormTerms = [
            "Contact Us",
            "Get In Touch",
            "Name",
            "Phone",
            "Subject",
            "Message",
            "Send",
            "Sending",
          ];
          englishFormTerms.forEach((englishTerm) => {
            if (formKey !== "email") {
              // Email is international
              expect(formLabel).not.toBe(englishTerm);
            }
          });
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should have all form placeholders translated to Spanish", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "enterName",
          "enterEmail",
          "enterPhone",
          "enterSubject",
          "enterMessage",
        ),
        (placeholderKey) => {
          const placeholder = getTranslationByPath(
            mockTranslations,
            `contact.placeholders.${placeholderKey}`,
          );

          // Should be translated to Spanish
          expect(typeof placeholder).toBe("string");
          expect(placeholder.length).toBeGreaterThan(0);
          expect(placeholder).not.toBe(
            `contact.placeholders.${placeholderKey}`,
          );

          // Should start with "Ingresa" (Spanish convention for form placeholders)
          expect(placeholder).toMatch(/^Ingresa/);

          // Should be proper Spanish
          expect(placeholder).toMatch(/^[A-Za-záéíóúñÑ\s]+$/);

          // Should be instructional and clear
          expect(placeholder.length).toBeLessThan(50);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should have all validation messages translated to Spanish", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "nameRequired",
          "emailRequired",
          "emailInvalid",
          "messageRequired",
          "phoneInvalid",
        ),
        (validationKey) => {
          const validationMessage = getTranslationByPath(
            mockTranslations,
            `contact.validation.${validationKey}`,
          );

          // Should be translated to Spanish
          expect(typeof validationMessage).toBe("string");
          expect(validationMessage.length).toBeGreaterThan(0);
          expect(validationMessage).not.toBe(
            `contact.validation.${validationKey}`,
          );

          // Should be proper Spanish
          expect(validationMessage).toMatch(/^[A-Za-záéíóúñÑ\s.]+$/);

          // Should be clear and helpful for users
          expect(validationMessage.length).toBeGreaterThan(10);
          expect(validationMessage.length).toBeLessThan(100);

          // Should follow Spanish validation message conventions
          if (validationKey.includes("Required")) {
            expect(validationMessage).toMatch(/requerido/i);
          }
          if (validationKey.includes("Invalid")) {
            expect(validationMessage).toMatch(/válido/i);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should have all success messages translated to Spanish", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("messageSent", "thankYou", "willRespond"),
        (successKey) => {
          const successMessage = getTranslationByPath(
            mockTranslations,
            `contact.success.${successKey}`,
          );

          // Should be translated to Spanish
          expect(typeof successMessage).toBe("string");
          expect(successMessage.length).toBeGreaterThan(0);
          expect(successMessage).not.toBe(`contact.success.${successKey}`);

          // Should be proper Spanish
          expect(successMessage).toMatch(/^[A-Za-záéíóúñÑ\s.]+$/);

          // Should be positive and reassuring
          expect(successMessage.length).toBeGreaterThan(5);
          expect(successMessage.length).toBeLessThan(80);

          // Should follow Spanish success message conventions
          if (successKey === "thankYou") {
            expect(successMessage).toMatch(/gracias/i);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should have all error messages translated to Spanish", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("sendFailed", "tryAgain", "networkError"),
        (errorKey) => {
          const errorMessage = getTranslationByPath(
            mockTranslations,
            `contact.error.${errorKey}`,
          );

          // Should be translated to Spanish
          expect(typeof errorMessage).toBe("string");
          expect(errorMessage.length).toBeGreaterThan(0);
          expect(errorMessage).not.toBe(`contact.error.${errorKey}`);

          // Should be proper Spanish
          expect(errorMessage).toMatch(/^[A-Za-záéíóúñÑ\s.]+$/);

          // Should be helpful and clear
          expect(errorMessage.length).toBeGreaterThan(10);
          expect(errorMessage.length).toBeLessThan(100);

          // Should follow Spanish error message conventions
          if (errorKey === "tryAgain") {
            expect(errorMessage).toMatch(/intenta/i);
          }
          if (errorKey.includes("Error")) {
            expect(errorMessage).toMatch(/error/i);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should have all interactive element indicators translated", () => {
    fc.assert(
      fc.property(fc.constantFrom("required", "optional"), (indicatorKey) => {
        const indicator = getTranslationByPath(
          mockTranslations,
          `contact.form.${indicatorKey}`,
        );

        // Should be translated to Spanish
        expect(typeof indicator).toBe("string");
        expect(indicator.length).toBeGreaterThan(0);
        expect(indicator).not.toBe(`contact.form.${indicatorKey}`);

        // Should be proper Spanish
        expect(indicator).toMatch(/^[A-Za-záéíóúñÑ]+$/);

        // Should be clear functional indicators
        const expectedTranslations = {
          required: "Requerido",
          optional: "Opcional",
        };

        expect(indicator).toBe(
          expectedTranslations[
            indicatorKey as keyof typeof expectedTranslations
          ],
        );
      }),
      { numRuns: 100 },
    );
  });

  it("should maintain consistent interaction terminology across contexts", () => {
    fc.assert(
      fc.property(fc.constantFrom("close"), (actionKey) => {
        // Get from common buttons
        const commonAction = getTranslationByPath(
          mockTranslations,
          `common.buttons.${actionKey}`,
        );

        // Get from gallery navigation (should be consistent for common actions)
        const galleryAction = getTranslationByPath(
          mockTranslations,
          `gallery.navigation.${actionKey}`,
        );

        // Should be consistent across contexts
        expect(commonAction).toBe(galleryAction);

        // Should be valid Spanish
        expect(typeof commonAction).toBe("string");
        expect(commonAction.length).toBeGreaterThan(0);
        expect(commonAction).toMatch(/^[A-Za-záéíóúñÑ\s.]+$/);
      }),
      { numRuns: 100 },
    );
  });

  it("should have proper Spanish grammar in all form interactions", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "contact.form.contactUs",
          "contact.form.getInTouch",
          "contact.validation.nameRequired",
          "contact.success.thankYou",
          "contact.error.tryAgain",
        ),
        (translationKey) => {
          const translation = getTranslationByPath(
            mockTranslations,
            translationKey,
          );

          // Should be proper Spanish text
          expect(typeof translation).toBe("string");
          expect(translation.length).toBeGreaterThan(0);
          expect(translation).toMatch(/^[A-Za-záéíóúñÑ\s.]+$/);

          // Should not have double spaces or formatting issues
          expect(translation).not.toMatch(/\s{2,}/);
          expect(translation.trim()).toBe(translation);

          // Should start with capital letter (Spanish convention)
          expect(translation.charAt(0)).toMatch(/[A-ZÁÉÍÓÚÑ]/);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should handle form state transitions with Spanish text", () => {
    fc.assert(
      fc.property(fc.constantFrom("send", "sending"), (stateKey) => {
        const stateText = getTranslationByPath(
          mockTranslations,
          `contact.form.${stateKey}`,
        );

        // Should be translated to Spanish
        expect(typeof stateText).toBe("string");
        expect(stateText.length).toBeGreaterThan(0);
        expect(stateText).not.toBe(`contact.form.${stateKey}`);

        // Should be appropriate for button states
        expect(stateText.length).toBeLessThan(20);

        // Should indicate action state appropriately
        if (stateKey === "sending") {
          expect(stateText).toMatch(/\.\.\.$/); // Should end with ellipsis for loading state
        }

        // Should be proper Spanish
        expect(stateText.replace(/\.\.\.$/, "")).toMatch(
          /^[A-Za-záéíóúñÑ\s]+$/,
        );
      }),
      { numRuns: 100 },
    );
  });

  it("should provide clear Spanish instructions in all interactive elements", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "contact.placeholders.enterName",
          "contact.placeholders.enterEmail",
          "contact.placeholders.enterMessage",
        ),
        (instructionKey) => {
          const instruction = getTranslationByPath(
            mockTranslations,
            instructionKey,
          );

          // Should be clear instruction in Spanish
          expect(typeof instruction).toBe("string");
          expect(instruction.length).toBeGreaterThan(0);
          expect(instruction).toMatch(/^[A-Za-záéíóúñÑ\s]+$/);

          // Should be imperative form (giving instruction)
          expect(instruction).toMatch(/^Ingresa/);

          // Should be concise but clear
          expect(instruction.length).toBeGreaterThan(10);
          expect(instruction.length).toBeLessThan(30);

          // Should not contain English instruction words
          expect(instruction).not.toMatch(/enter|type|input/i);
        },
      ),
      { numRuns: 100 },
    );
  });
});
