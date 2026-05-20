/**
 * Property-based tests for navigation translation consistency
 * Feature: spanish-localization, Property 1: Navigation Translation Consistency
 * Validates: Requirements 1.1, 1.2, 1.4
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import fc from "fast-check";
import {
  getTranslationByPath,
  getNamespacedTranslation,
  clearTranslationCache,
} from "../translations";
import { Translations } from "@/lib/types";

// Mock translations for testing navigation consistency
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

describe("Navigation Translation Consistency", () => {
  beforeEach(() => {
    clearTranslationCache();
    jest.clearAllMocks();
  });

  /**
   * Property 1: Navigation Translation Consistency
   * For any navigation element across desktop and mobile interfaces,
   * all menu items should display Spanish text and maintain consistent terminology throughout the site
   */
  it("should maintain consistent navigation terminology across all contexts", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "home",
          "tournaments",
          "rankings",
          "gallery",
          "contact",
        ),
        (navKey) => {
          // Get navigation translation from common namespace
          const navTranslation = getNamespacedTranslation(
            mockTranslations,
            "common",
            `navigation.${navKey}`,
          );

          // Get the same translation using direct path
          const directTranslation = getTranslationByPath(
            mockTranslations,
            `common.navigation.${navKey}`,
          );

          // Should be consistent regardless of access method
          expect(navTranslation).toBe(directTranslation);

          // Should be in Spanish (not English)
          expect(navTranslation).not.toBe(navKey);
          expect(typeof navTranslation).toBe("string");
          expect(navTranslation.length).toBeGreaterThan(0);

          // Should be valid Spanish translations (some words like "Rankings" are the same in both languages)
          const expectedSpanishTranslations = {
            home: "Inicio",
            tournaments: "Torneos",
            rankings: "Rankings", // Same in both languages
            gallery: "Galería",
            contact: "Contacto",
          };

          expect(navTranslation).toBe(
            expectedSpanishTranslations[
              navKey as keyof typeof expectedSpanishTranslations
            ],
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should have all required navigation items translated", () => {
    const requiredNavItems = [
      "home",
      "tournaments",
      "rankings",
      "gallery",
      "contact",
    ];

    fc.assert(
      fc.property(fc.constant(requiredNavItems), (navItems) => {
        navItems.forEach((item) => {
          const translation = getTranslationByPath(
            mockTranslations,
            `common.navigation.${item}`,
          );

          // Should have a valid Spanish translation
          expect(translation).not.toBe(`common.navigation.${item}`);
          expect(typeof translation).toBe("string");
          expect(translation.length).toBeGreaterThan(0);

          // Should be in Spanish based on expected translations
          const expectedTranslations = {
            home: "Inicio",
            tournaments: "Torneos",
            rankings: "Rankings",
            gallery: "Galería",
            contact: "Contacto",
          };

          expect(translation).toBe(
            expectedTranslations[item as keyof typeof expectedTranslations],
          );
        });
      }),
      { numRuns: 100 },
    );
  });

  it("should maintain consistent button terminology across contexts", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "viewDetails",
          "register",
          "viewAll",
          "close",
          "next",
          "previous",
        ),
        (buttonKey) => {
          const buttonTranslation = getTranslationByPath(
            mockTranslations,
            `common.buttons.${buttonKey}`,
          );

          // Should be consistently translated
          expect(typeof buttonTranslation).toBe("string");
          expect(buttonTranslation.length).toBeGreaterThan(0);
          expect(buttonTranslation).not.toBe(`common.buttons.${buttonKey}`);

          // Should not be English
          const englishButtons = [
            "View Details",
            "Register",
            "View All",
            "Close",
            "Next",
            "Previous",
          ];
          englishButtons.forEach((englishButton) => {
            expect(buttonTranslation).not.toBe(englishButton);
          });
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should maintain consistent status terminology across different sections", () => {
    fc.assert(
      fc.property(
        fc.constantFrom("upcoming", "inProgress", "completed"),
        (statusKey) => {
          // Get status from common section
          const commonStatus = getTranslationByPath(
            mockTranslations,
            `common.status.${statusKey}`,
          );

          // Get status from tournaments section (should be same)
          const tournamentStatus = getTranslationByPath(
            mockTranslations,
            `tournaments.status.${statusKey}`,
          );

          // Should be consistent across sections
          expect(commonStatus).toBe(tournamentStatus);
          expect(typeof commonStatus).toBe("string");
          expect(commonStatus.length).toBeGreaterThan(0);

          // Should be in Spanish
          const expectedTranslations = {
            upcoming: "Próximo",
            inProgress: "En Progreso",
            completed: "Completado",
          };

          expect(commonStatus).toBe(
            expectedTranslations[
              statusKey as keyof typeof expectedTranslations
            ],
          );
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should maintain consistent level terminology across rankings and tournaments", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "open",
          "level1",
          "level2",
          "level3",
          "level4",
          "level5",
          "level6",
        ),
        (levelKey) => {
          // Get level from tournaments section
          const tournamentLevel = getTranslationByPath(
            mockTranslations,
            `tournaments.levels.${levelKey}`,
          );

          // Get level from rankings section
          const rankingLevel = getTranslationByPath(
            mockTranslations,
            `rankings.levels.${levelKey}`,
          );

          // Should be consistent across sections
          expect(tournamentLevel).toBe(rankingLevel);
          expect(typeof tournamentLevel).toBe("string");
          expect(tournamentLevel.length).toBeGreaterThan(0);

          // Should follow Spanish level naming convention
          if (levelKey === "open") {
            expect(tournamentLevel).toBe("Abierto");
          } else {
            expect(tournamentLevel).toMatch(/^Nivel \d$/);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should have consistent aria labels for accessibility", () => {
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

          // Should be appropriate for Spanish accessibility
          if (ariaKey === "toggleMenu") {
            expect(ariaLabel).toBe("Alternar menú");
          } else {
            // Social media labels can remain as brand names
            expect(["Instagram", "Facebook", "Twitter"]).toContain(ariaLabel);
          }
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should maintain translation consistency across multiple calls", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "common.navigation.home",
          "common.buttons.viewDetails",
          "common.status.upcoming",
          "tournaments.levels.open",
          "rankings.labels.totalPoints",
        ),
        (translationKey) => {
          // Call translation multiple times
          const result1 = getTranslationByPath(
            mockTranslations,
            translationKey,
          );
          const result2 = getTranslationByPath(
            mockTranslations,
            translationKey,
          );
          const result3 = getTranslationByPath(
            mockTranslations,
            translationKey,
          );

          // Should be consistent across calls
          expect(result1).toBe(result2);
          expect(result2).toBe(result3);
          expect(typeof result1).toBe("string");
          expect(result1.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should ensure all navigation translations are proper Spanish", () => {
    const navigationKeys = [
      "home",
      "tournaments",
      "rankings",
      "gallery",
      "contact",
    ];

    fc.assert(
      fc.property(fc.constant(navigationKeys), (keys) => {
        keys.forEach((key) => {
          const translation = getTranslationByPath(
            mockTranslations,
            `common.navigation.${key}`,
          );

          // Should be valid Spanish text
          expect(translation).toMatch(/^[A-Za-záéíóúñÑ\s]+$/);

          // Should not be empty or just whitespace
          expect(translation.trim().length).toBeGreaterThan(0);

          // Should start with capital letter (Spanish convention)
          expect(translation.charAt(0)).toMatch(/[A-ZÁÉÍÓÚÑ]/);
        });
      }),
      { numRuns: 100 },
    );
  });
});
