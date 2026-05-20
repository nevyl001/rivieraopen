/**
 * Unit Tests for ValidationService
 * Feature: admin-interface
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6
 */

import { describe, it, expect } from "@jest/globals";
import { ValidationService } from "../ValidationService";

describe("ValidationService - Unit Tests", () => {
  const validationService = new ValidationService();

  describe("Category Validation", () => {
    it("should accept valid category 'Open'", () => {
      const result = validationService.validateCategory("Open");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept valid category '1'", () => {
      const result = validationService.validateCategory("1");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept valid category '6'", () => {
      const result = validationService.validateCategory("6");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should reject invalid category 'Advanced'", () => {
      const result = validationService.validateCategory("Advanced");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      // Category validation error has empty field path since it's at root level
      expect(result.errors[0].field).toBe("");
    });

    it("should reject empty string category", () => {
      const result = validationService.validateCategory("");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should reject numeric category", () => {
      const result = validationService.validateCategory(7 as any);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Gender Validation", () => {
    it("should accept 'Male'", () => {
      const playerData = {
        firstName: "John",
        lastName: "Doe",
        photo: "https://example.com/photo.jpg",
        category: "Open",
        gender: "Male",
        points: 100,
        rank: 1,
        contact: {
          email: "john@example.com",
          phone: "1234567890",
        },
      };
      const result = validationService.validatePlayer(playerData);
      expect(result.valid).toBe(true);
    });

    it("should accept 'Female'", () => {
      const playerData = {
        firstName: "Jane",
        lastName: "Doe",
        photo: "https://example.com/photo.jpg",
        category: "Open",
        gender: "Female",
        points: 100,
        rank: 1,
        contact: {
          email: "jane@example.com",
          phone: "1234567890",
        },
      };
      const result = validationService.validatePlayer(playerData);
      expect(result.valid).toBe(true);
    });

    it("should reject invalid gender 'Other'", () => {
      const playerData = {
        firstName: "John",
        lastName: "Doe",
        photo: "https://example.com/photo.jpg",
        category: "Open",
        gender: "Other",
        points: 100,
        rank: 1,
        contact: {
          email: "john@example.com",
          phone: "1234567890",
        },
      };
      const result = validationService.validatePlayer(playerData);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field.includes("gender"))).toBe(true);
    });

    it("should reject lowercase gender", () => {
      const playerData = {
        firstName: "John",
        lastName: "Doe",
        photo: "https://example.com/photo.jpg",
        category: "Open",
        gender: "male",
        points: 100,
        rank: 1,
        contact: {
          email: "john@example.com",
          phone: "1234567890",
        },
      };
      const result = validationService.validatePlayer(playerData);
      expect(result.valid).toBe(false);
    });
  });

  describe("Email Format Validation", () => {
    it("should accept valid email 'user@example.com'", () => {
      const result = validationService.validateEmail("user@example.com");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept email with subdomain", () => {
      const result = validationService.validateEmail("user@mail.example.com");
      expect(result.valid).toBe(true);
    });

    it("should accept email with numbers", () => {
      const result = validationService.validateEmail("user123@example.com");
      expect(result.valid).toBe(true);
    });

    it("should accept email with dots in local part", () => {
      const result = validationService.validateEmail("first.last@example.com");
      expect(result.valid).toBe(true);
    });

    it("should reject email without @", () => {
      const result = validationService.validateEmail("userexample.com");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].field).toBe("email");
    });

    it("should reject email without domain", () => {
      const result = validationService.validateEmail("user@");
      expect(result.valid).toBe(false);
    });

    it("should reject email without local part", () => {
      const result = validationService.validateEmail("@example.com");
      expect(result.valid).toBe(false);
    });

    it("should reject email with spaces", () => {
      const result = validationService.validateEmail("user name@example.com");
      expect(result.valid).toBe(false);
    });

    it("should reject empty email", () => {
      const result = validationService.validateEmail("");
      expect(result.valid).toBe(false);
    });
  });

  describe("Phone Format Validation", () => {
    it("should accept numeric phone '1234567890'", () => {
      const result = validationService.validatePhone("1234567890");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept phone with dashes", () => {
      const result = validationService.validatePhone("123-456-7890");
      expect(result.valid).toBe(true);
    });

    it("should accept phone with spaces", () => {
      const result = validationService.validatePhone("123 456 7890");
      expect(result.valid).toBe(true);
    });

    it("should accept phone with parentheses", () => {
      const result = validationService.validatePhone("(123) 456-7890");
      expect(result.valid).toBe(true);
    });

    it("should accept phone with plus sign", () => {
      const result = validationService.validatePhone("+1234567890");
      expect(result.valid).toBe(true);
    });

    it("should reject phone with letters", () => {
      const result = validationService.validatePhone("123-ABC-7890");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].field).toBe("phone");
    });

    it("should reject phone with special characters", () => {
      const result = validationService.validatePhone("123#456@7890");
      expect(result.valid).toBe(false);
    });

    it("should reject empty phone", () => {
      const result = validationService.validatePhone("");
      expect(result.valid).toBe(false);
    });
  });

  describe("Points and Rank Validation", () => {
    it("should accept zero points", () => {
      const playerData = {
        firstName: "John",
        lastName: "Doe",
        photo: "https://example.com/photo.jpg",
        category: "Open",
        gender: "Male",
        points: 0,
        rank: 1,
        contact: {
          email: "john@example.com",
          phone: "1234567890",
        },
      };
      const result = validationService.validatePlayer(playerData);
      expect(result.valid).toBe(true);
    });

    it("should accept positive points", () => {
      const playerData = {
        firstName: "John",
        lastName: "Doe",
        photo: "https://example.com/photo.jpg",
        category: "Open",
        gender: "Male",
        points: 5000,
        rank: 1,
        contact: {
          email: "john@example.com",
          phone: "1234567890",
        },
      };
      const result = validationService.validatePlayer(playerData);
      expect(result.valid).toBe(true);
    });

    it("should reject negative points", () => {
      const playerData = {
        firstName: "John",
        lastName: "Doe",
        photo: "https://example.com/photo.jpg",
        category: "Open",
        gender: "Male",
        points: -100,
        rank: 1,
        contact: {
          email: "john@example.com",
          phone: "1234567890",
        },
      };
      const result = validationService.validatePlayer(playerData);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field.includes("points"))).toBe(true);
    });

    it("should accept zero rank", () => {
      const playerData = {
        firstName: "John",
        lastName: "Doe",
        photo: "https://example.com/photo.jpg",
        category: "Open",
        gender: "Male",
        points: 100,
        rank: 0,
        contact: {
          email: "john@example.com",
          phone: "1234567890",
        },
      };
      const result = validationService.validatePlayer(playerData);
      expect(result.valid).toBe(true);
    });

    it("should reject decimal points", () => {
      const playerData = {
        firstName: "John",
        lastName: "Doe",
        photo: "https://example.com/photo.jpg",
        category: "Open",
        gender: "Male",
        points: 100.5,
        rank: 1,
        contact: {
          email: "john@example.com",
          phone: "1234567890",
        },
      };
      const result = validationService.validatePlayer(playerData);
      expect(result.valid).toBe(false);
    });
  });

  describe("URL Validation", () => {
    it("should accept valid http URL", () => {
      const result = validationService.validateUrl("http://example.com");
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it("should accept valid https URL", () => {
      const result = validationService.validateUrl("https://example.com");
      expect(result.valid).toBe(true);
    });

    it("should accept URL with path", () => {
      const result = validationService.validateUrl(
        "https://example.com/path/to/page",
      );
      expect(result.valid).toBe(true);
    });

    it("should accept URL with query parameters", () => {
      const result = validationService.validateUrl(
        "https://example.com?param=value",
      );
      expect(result.valid).toBe(true);
    });

    it("should reject URL without protocol", () => {
      const result = validationService.validateUrl("example.com");
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].field).toBe("url");
    });

    it("should reject empty URL", () => {
      const result = validationService.validateUrl("");
      expect(result.valid).toBe(false);
    });

    it("should reject invalid URL format", () => {
      const result = validationService.validateUrl("not a url");
      expect(result.valid).toBe(false);
    });
  });

  describe("Player Validation - Edge Cases", () => {
    it("should reject player with missing firstName", () => {
      const playerData = {
        lastName: "Doe",
        photo: "https://example.com/photo.jpg",
        category: "Open",
        gender: "Male",
        points: 100,
        rank: 1,
        contact: {
          email: "john@example.com",
          phone: "1234567890",
        },
      };
      const result = validationService.validatePlayer(playerData as any);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field.includes("firstName"))).toBe(
        true,
      );
    });

    it("should reject player with empty firstName", () => {
      const playerData = {
        firstName: "",
        lastName: "Doe",
        photo: "https://example.com/photo.jpg",
        category: "Open",
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
    });

    it("should reject player with missing contact", () => {
      const playerData = {
        firstName: "John",
        lastName: "Doe",
        photo: "https://example.com/photo.jpg",
        category: "Open",
        gender: "Male",
        points: 100,
        rank: 1,
      };
      const result = validationService.validatePlayer(playerData as any);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field.includes("contact"))).toBe(true);
    });

    it("should accept player with any non-empty photo string", () => {
      // Photo field only requires non-empty string, not URL validation
      const playerData = {
        firstName: "John",
        lastName: "Doe",
        photo: "not-a-url",
        category: "Open",
        gender: "Male",
        points: 100,
        rank: 1,
        contact: {
          email: "john@example.com",
          phone: "1234567890",
        },
      };
      const result = validationService.validatePlayer(playerData);
      expect(result.valid).toBe(true);
    });

    it("should reject player with empty photo", () => {
      const playerData = {
        firstName: "John",
        lastName: "Doe",
        photo: "",
        category: "Open",
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
      expect(result.errors.some((e) => e.field.includes("photo"))).toBe(true);
    });
  });

  describe("Tournament Validation - Edge Cases", () => {
    it("should reject tournament with missing name", () => {
      const tournamentData = {
        date: new Date(),
        club: "Test Club",
        location: "Test Location",
        genre: "Open",
        status: "upcoming",
        registrationOpen: true,
      };
      const result = validationService.validateTournament(
        tournamentData as any,
      );
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field.includes("name"))).toBe(true);
    });

    it("should reject tournament with empty name", () => {
      const tournamentData = {
        name: "",
        date: new Date(),
        club: "Test Club",
        location: "Test Location",
        genre: "Open",
        status: "upcoming",
        registrationOpen: true,
      };
      const result = validationService.validateTournament(tournamentData);
      expect(result.valid).toBe(false);
    });

    it("should accept tournament with genre 'Open'", () => {
      const tournamentData = {
        name: "Test Tournament",
        date: new Date(),
        club: "Test Club",
        location: "Test Location",
        genre: "Open",
        status: "upcoming",
        registrationOpen: true,
      };
      const result = validationService.validateTournament(tournamentData);
      expect(result.valid).toBe(true);
    });

    it("should accept tournament with genre 'Women'", () => {
      const tournamentData = {
        name: "Test Tournament",
        date: new Date(),
        club: "Test Club",
        location: "Test Location",
        genre: "Women",
        status: "upcoming",
        registrationOpen: true,
      };
      const result = validationService.validateTournament(tournamentData);
      expect(result.valid).toBe(true);
    });

    it("should reject tournament with invalid genre", () => {
      const tournamentData = {
        name: "Test Tournament",
        date: new Date(),
        club: "Test Club",
        location: "Test Location",
        genre: "Mixed",
        status: "upcoming",
        registrationOpen: true,
      };
      const result = validationService.validateTournament(tournamentData);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field.includes("genre"))).toBe(true);
    });

    it("should accept tournament with status 'upcoming'", () => {
      const tournamentData = {
        name: "Test Tournament",
        date: new Date(),
        club: "Test Club",
        location: "Test Location",
        genre: "Open",
        status: "upcoming",
        registrationOpen: true,
      };
      const result = validationService.validateTournament(tournamentData);
      expect(result.valid).toBe(true);
    });

    it("should accept tournament with status 'in-progress'", () => {
      const tournamentData = {
        name: "Test Tournament",
        date: new Date(),
        club: "Test Club",
        location: "Test Location",
        genre: "Open",
        status: "in-progress",
        registrationOpen: false,
      };
      const result = validationService.validateTournament(tournamentData);
      expect(result.valid).toBe(true);
    });

    it("should accept tournament with status 'completed'", () => {
      const tournamentData = {
        name: "Test Tournament",
        date: new Date(),
        club: "Test Club",
        location: "Test Location",
        genre: "Open",
        status: "completed",
        registrationOpen: false,
      };
      const result = validationService.validateTournament(tournamentData);
      expect(result.valid).toBe(true);
    });

    it("should reject tournament with invalid status", () => {
      const tournamentData = {
        name: "Test Tournament",
        date: new Date(),
        club: "Test Club",
        location: "Test Location",
        genre: "Open",
        status: "cancelled",
        registrationOpen: true,
      };
      const result = validationService.validateTournament(tournamentData);
      expect(result.valid).toBe(false);
      expect(result.errors.some((e) => e.field.includes("status"))).toBe(true);
    });
  });

  describe("Validation Error Messages", () => {
    it("should provide descriptive error message for invalid category", () => {
      const result = validationService.validateCategory("Invalid");
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toBeTruthy();
      expect(result.errors[0].message.length).toBeGreaterThan(0);
    });

    it("should provide descriptive error message for invalid email", () => {
      const result = validationService.validateEmail("invalid-email");
      expect(result.valid).toBe(false);
      expect(result.errors[0].message).toBeTruthy();
      expect(result.errors[0].message.length).toBeGreaterThan(0);
    });

    it("should provide multiple error messages for multiple validation failures", () => {
      const playerData = {
        firstName: "",
        lastName: "",
        photo: "not-a-url",
        category: "Invalid",
        gender: "Other",
        points: -100,
        rank: -5,
        contact: {
          email: "invalid-email",
          phone: "ABC",
        },
      };
      const result = validationService.validatePlayer(playerData);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(1);
    });
  });
});
