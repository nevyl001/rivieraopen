/**
 * Property-based tests for translation system
 * Feature: spanish-localization, Property 7: Translation Fallback Behavior
 * Validates: Requirements 10.4
 */

import { describe, it, expect, beforeEach, jest } from "@jest/globals";
import fc from "fast-check";
import {
  getTranslationByPath,
  getNamespacedTranslation,
  loadTranslations,
  clearTranslationCache,
} from "../translations";
import { Translations } from "@/lib/types";

// Mock translations for testing
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

describe("Translation Fallback Behavior", () => {
  beforeEach(() => {
    clearTranslationCache();
    jest.clearAllMocks();
  });

  /**
   * Property 7: Translation Fallback Behavior
   * For any missing Spanish translation, the system should gracefully fall back
   * to English content without breaking functionality or layout
   */
  it("should return the key path when translation is missing", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 50 })
          .filter((s) => !s.includes(".")),
        fc
          .string({ minLength: 1, maxLength: 50 })
          .filter((s) => !s.includes(".")),
        fc
          .string({ minLength: 1, maxLength: 50 })
          .filter((s) => !s.includes(".")),
        (namespace, section, key) => {
          // Create a key path that doesn't exist in our mock translations
          const nonExistentKeyPath = `${namespace}.${section}.${key}`;

          const result = getTranslationByPath(
            mockTranslations,
            nonExistentKeyPath,
          );

          // Should return the key path as fallback
          expect(result).toBe(nonExistentKeyPath);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should return valid translations when they exist", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "common.navigation.home",
          "common.buttons.viewDetails",
          "home.hero.title",
          "tournaments.labels.winner",
          "rankings.levels.open",
          "gallery.filters.all",
          "contact.form.name",
          "seo.titles.home",
        ),
        (validKeyPath) => {
          const result = getTranslationByPath(mockTranslations, validKeyPath);

          // Should return a non-empty string that's not the key path
          expect(result).not.toBe(validKeyPath);
          expect(typeof result).toBe("string");
          expect(result.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should handle parameter interpolation correctly", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => /^[a-zA-Z]+$/.test(s)),
        fc
          .string({ minLength: 1, maxLength: 20 })
          .filter((s) => /^[a-zA-Z]+$/.test(s)),
        (playerName, tournamentName) => {
          const playerResult = getTranslationByPath(
            mockTranslations,
            "seo.titles.playerProfile",
            { playerName },
          );

          const tournamentResult = getTranslationByPath(
            mockTranslations,
            "seo.titles.tournamentDetails",
            { tournamentName },
          );

          // Should contain the interpolated values
          expect(playerResult).toContain(playerName);
          expect(tournamentResult).toContain(tournamentName);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should handle namespaced translations with fallback", () => {
    fc.assert(
      fc.property(
        fc.constantFrom(
          "common",
          "home",
          "tournaments",
          "rankings",
          "gallery",
          "contact",
          "seo",
        ),
        fc
          .string({ minLength: 1, maxLength: 30 })
          .filter((s) => !s.includes(".")),
        (validNamespace, invalidKey) => {
          const result = getNamespacedTranslation(
            mockTranslations,
            validNamespace as keyof Translations,
            invalidKey,
          );

          // Should return the full key path as fallback
          const expectedFallback = `${validNamespace}.${invalidKey}`;
          expect(result).toBe(expectedFallback);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should handle deeply nested missing keys", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc
            .string({ minLength: 1, maxLength: 20 })
            .filter((s) => /^[a-zA-Z]+$/.test(s)),
          { minLength: 2, maxLength: 5 },
        ),
        (keyParts) => {
          const keyPath = keyParts.join(".");
          const result = getTranslationByPath(mockTranslations, keyPath);

          // Should return the key path as fallback for non-existent nested keys
          expect(result).toBe(keyPath);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should handle empty or invalid parameters gracefully", () => {
    fc.assert(
      fc.property(
        fc.record({
          validParam: fc.string({ minLength: 1, maxLength: 20 }),
          invalidParam: fc.oneof(
            fc.constant(null),
            fc.constant(undefined),
            fc.constant(""),
          ),
        }),
        (params) => {
          const result = getTranslationByPath(
            mockTranslations,
            "seo.titles.playerProfile",
            params as any,
          );

          // Should handle invalid parameters without crashing
          expect(typeof result).toBe("string");
          expect(result.length).toBeGreaterThan(0);
        },
      ),
      { numRuns: 100 },
    );
  });

  it("should maintain consistent fallback behavior across multiple calls", () => {
    fc.assert(
      fc.property(
        fc
          .string({ minLength: 1, maxLength: 30 })
          .filter((s) => !s.includes(".")),
        (invalidKey) => {
          const result1 = getTranslationByPath(mockTranslations, invalidKey);
          const result2 = getTranslationByPath(mockTranslations, invalidKey);
          const result3 = getTranslationByPath(mockTranslations, invalidKey);

          // Should return consistent results
          expect(result1).toBe(result2);
          expect(result2).toBe(result3);
          expect(result1).toBe(invalidKey); // Should be the key as fallback
        },
      ),
      { numRuns: 100 },
    );
  });
});
