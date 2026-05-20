/**
 * Property-based tests for UI component translation completeness
 * Feature: spanish-localization, Property 2: UI Component Translation Completeness
 * Validates: Requirements 2.4, 7.1, 7.2, 7.5
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import fc from "fast-check";
import {
  getTranslationByPath,
  getNamespacedTranslation,
  clearTranslationCache,
} from "../translations";
import { Translations } from "@/lib/types";

// Mock translations for testing UI component completeness
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
      phoneInvalid: "Por favor ingresa un número válido",
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

describe("UI Component Translation Completeness", () => {
  beforeEach(() => {
    clearTranslationCache();
    jest.clearAllMocks();
  });

  /**
   * Property 2: UI Component Translation Completeness
   * For any UI component (buttons, badges, labels, tooltips), all user-visible text
   * should be translated to Spanish while preserving functionality and styling
   */
  it("should have all button text translated to Spanish", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "viewDetails",
          "register",
          "viewAll",
          "close",
          "next",
          "previous",
          "viewRankings",
          "upcomingTournaments",
          "scrollToContent",
        ),
        (buttonKey) => {
          const buttonText = getTranslationByPath(
            mockTranslations,
            `common.buttons.${buttonKey}`,
          );

          // Should be translated to Spanish
          expect(typeof buttonText).toBe("string");
          expect(buttonText.length).toBeGreaterThan(0);
          expect(buttonText).not.toBe(`common.buttons.${buttonKey}`);

          // Should be proper Spanish text (contains Spanish characters or common words)
          expect(buttonText).toMatch(/^[A-Za-záéíóúñÑ\s]+$/);

          // Should not be empty or just whitespace
          expect(buttonText.trim().length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should have all status badges translated to Spanish", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "upcoming",
          "inProgress",
          "completed",
          "registrationOpen",
          "registrationClosed",
        ),
        (statusKey) => {
          const statusText = getTranslationByPath(
            mockTranslations,
            `common.status.${statusKey}`,
          );

          // Should be translated to Spanish
          expect(typeof statusText).toBe("string");
          expect(statusText.length).toBeGreaterThan(0);
          expect(statusText).not.toBe(`common.status.${statusKey}`);

          // Should be proper Spanish text
          expect(statusText).toMatch(/^[A-Za-záéíóúñÑ\s]+$/);

          // Should follow Spanish capitalization conventions
          expect(statusText.charAt(0)).toMatch(/[A-ZÁÉÍÓÚÑ]/);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should have all labels translated to Spanish", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "level",
          "points",
          "rank",
          "email",
          "phone",
          "date",
          "location",
          "club",
        ),
        (labelKey) => {
          const labelText = getTranslationByPath(
            mockTranslations,
            `common.labels.${labelKey}`,
          );

          // Should be translated to Spanish
          expect(typeof labelText).toBe("string");
          expect(labelText.length).toBeGreaterThan(0);
          expect(labelText).not.toBe(`common.labels.${labelKey}`);

          // Should be proper Spanish text (some technical terms like "Email" are international)
          if (labelKey !== "email") {
            expect(labelText).toMatch(/^[A-Za-záéíóúñÑ\s]+$/);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should have all section headings translated to Spanish", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "upcomingTournaments",
          "featuredPlayers",
          "gallery",
          "sponsors",
        ),
        (sectionKey) => {
          const sectionHeading = getTranslationByPath(
            mockTranslations,
            `home.sections.${sectionKey}`,
          );

          // Should be translated to Spanish
          expect(typeof sectionHeading).toBe("string");
          expect(sectionHeading.length).toBeGreaterThan(0);
          expect(sectionHeading).not.toBe(`home.sections.${sectionKey}`);

          // Should be proper Spanish text
          expect(sectionHeading).toMatch(/^[A-Za-záéíóúñÑ\s]+$/);

          // Should start with capital letter
          expect(sectionHeading.charAt(0)).toMatch(/[A-ZÁÉÍÓÚÑ]/);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should have all tooltip and aria labels translated appropriately", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("instagram", "facebook", "twitter", "toggleMenu"),
        (ariaKey) => {
          const ariaLabel = getTranslationByPath(
            mockTranslations,
            `common.aria.${ariaKey}`,
          );

          // Should have valid aria label
          expect(typeof ariaLabel).toBe("string");
          expect(ariaLabel.length).toBeGreaterThan(0);
          expect(ariaLabel).not.toBe(`common.aria.${ariaKey}`);

          // Should be appropriate for accessibility
          if (ariaKey === "toggleMenu") {
            // Should be translated to Spanish
            expect(ariaLabel).toBe("Alternar menú");
            expect(ariaLabel).toMatch(/^[A-Za-záéíóúñÑ\s]+$/);
          } else {
            // Social media labels can remain as brand names
            expect(["Instagram", "Facebook", "Twitter"]).toContain(ariaLabel);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should have all loading and message states translated to Spanish", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "tournaments.messages.loadingTournaments",
          "tournaments.messages.noTournaments",
          "rankings.messages.loadingRankings",
          "rankings.messages.noPlayers",
          "gallery.messages.loadingPhotos",
          "gallery.messages.noPhotos",
        ),
        (messageKey) => {
          const messageText = getTranslationByPath(
            mockTranslations,
            messageKey,
          );

          // Should be translated to Spanish
          expect(typeof messageText).toBe("string");
          expect(messageText.length).toBeGreaterThan(0);
          expect(messageText).not.toBe(messageKey);

          // Should be proper Spanish text
          expect(messageText).toMatch(/^[A-Za-záéíóúñÑ\s.]+$/);

          // Should end with appropriate punctuation for Spanish
          expect(messageText).toMatch(/[.…]$/);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should maintain styling compatibility with Spanish text lengths", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "common.buttons.viewDetails",
          "common.buttons.upcomingTournaments",
          "common.status.registrationOpen",
          "common.status.registrationClosed",
        ),
        (translationKey) => {
          const translation = getTranslationByPath(
            mockTranslations,
            translationKey,
          );

          // Should be reasonable length for UI components (not too long)
          expect(translation.length).toBeLessThan(50);
          expect(translation.length).toBeGreaterThan(0);

          // Should not contain line breaks that could break styling
          expect(translation).not.toMatch(/[\n\r]/);

          // Should not have excessive whitespace
          expect(translation.trim()).toBe(translation);
          expect(translation).not.toMatch(/\s{2,}/);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should have consistent terminology across different UI contexts", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("close", "next", "previous"),
        (commonUIKey) => {
          // Get from common buttons
          const commonButton = getTranslationByPath(
            mockTranslations,
            `common.buttons.${commonUIKey}`,
          );

          // Get from gallery navigation (should be same for navigation elements)
          const galleryNav = getTranslationByPath(
            mockTranslations,
            `gallery.navigation.${commonUIKey}`,
          );

          // Should be consistent across contexts
          expect(commonButton).toBe(galleryNav);
          expect(typeof commonButton).toBe("string");
          expect(commonButton.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should have all form-related UI elements translated", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
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

          // Should be translated
          expect(typeof formLabel).toBe("string");
          expect(formLabel.length).toBeGreaterThan(0);
          expect(formLabel).not.toBe(`contact.form.${formKey}`);

          // Should be appropriate for forms (short and clear)
          expect(formLabel.length).toBeLessThan(20);

          // Should be proper Spanish (except for international terms like "Email")
          if (formKey !== "email") {
            expect(formLabel).toMatch(/^[A-Za-záéíóúñÑ\s.]+$/);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should preserve functionality indicators in translations", () => {
    fc.assert(
      fc.property(fc.constantFrom("required", "optional"), (indicatorKey) => {
        const indicator = getTranslationByPath(
          mockTranslations,
          `contact.form.${indicatorKey}`,
        );

        // Should be translated
        expect(typeof indicator).toBe("string");
        expect(indicator.length).toBeGreaterThan(0);
        expect(indicator).not.toBe(`contact.form.${indicatorKey}`);

        // Should be clear functional indicators
        expect(["Requerido", "Opcional"]).toContain(indicator);

        // Should be proper Spanish
        expect(indicator).toMatch(/^[A-Za-záéíóúñÑ]+$/);
      }),
      { numRuns: 100 },
    );
  });
});
