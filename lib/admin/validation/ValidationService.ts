import { z } from "zod";
import {
  createPlayerSchema,
  updatePlayerSchema,
  createTournamentSchema,
  updateTournamentSchema,
  categorySchema,
  winnerDataSchema,
  emailSchema,
  phoneSchema,
  urlSchema,
} from "./schemas";

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

export class ValidationService {
  private handleZodError(error: z.ZodError): ValidationError[] {
    return error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
      code: issue.code,
    }));
  }

  /**
   * Validate player data for creation
   */
  validatePlayer(data: unknown): ValidationResult {
    try {
      createPlayerSchema.parse(data);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: this.handleZodError(error),
        };
      }
      return {
        valid: false,
        errors: [
          { field: "unknown", message: "Validation failed", code: "unknown" },
        ],
      };
    }
  }

  /**
   * Validate player data for update
   */
  validatePlayerUpdate(data: unknown): ValidationResult {
    try {
      updatePlayerSchema.parse(data);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: this.handleZodError(error),
        };
      }
      return {
        valid: false,
        errors: [
          { field: "unknown", message: "Validation failed", code: "unknown" },
        ],
      };
    }
  }

  /**
   * Validate tournament data for creation
   */
  validateTournament(data: unknown): ValidationResult {
    try {
      createTournamentSchema.parse(data);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: this.handleZodError(error),
        };
      }
      return {
        valid: false,
        errors: [
          { field: "unknown", message: "Validation failed", code: "unknown" },
        ],
      };
    }
  }

  /**
   * Validate tournament data for update
   */
  validateTournamentUpdate(data: unknown): ValidationResult {
    try {
      updateTournamentSchema.parse(data);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: this.handleZodError(error),
        };
      }
      return {
        valid: false,
        errors: [
          { field: "unknown", message: "Validation failed", code: "unknown" },
        ],
      };
    }
  }

  /**
   * Validate category
   */
  validateCategory(category: unknown): ValidationResult {
    try {
      categorySchema.parse(category);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: this.handleZodError(error),
        };
      }
      return {
        valid: false,
        errors: [
          {
            field: "category",
            message: "Invalid category",
            code: "invalid_type",
          },
        ],
      };
    }
  }

  /**
   * Validate winner data
   */
  validateWinner(data: unknown): ValidationResult {
    try {
      winnerDataSchema.parse(data);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        return {
          valid: false,
          errors: this.handleZodError(error),
        };
      }
      return {
        valid: false,
        errors: [
          { field: "unknown", message: "Validation failed", code: "unknown" },
        ],
      };
    }
  }

  /**
   * Validate email
   */
  validateEmail(email: unknown): ValidationResult {
    try {
      emailSchema.parse(email);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issue = error.issues[0];
        return {
          valid: false,
          errors: [
            { field: "email", message: issue.message, code: issue.code },
          ],
        };
      }
      return {
        valid: false,
        errors: [
          { field: "email", message: "Invalid email", code: "invalid_type" },
        ],
      };
    }
  }

  /**
   * Validate phone
   */
  validatePhone(phone: unknown): ValidationResult {
    try {
      phoneSchema.parse(phone);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issue = error.issues[0];
        return {
          valid: false,
          errors: [
            { field: "phone", message: issue.message, code: issue.code },
          ],
        };
      }
      return {
        valid: false,
        errors: [
          { field: "phone", message: "Invalid phone", code: "invalid_type" },
        ],
      };
    }
  }

  /**
   * Validate URL
   */
  validateUrl(url: unknown): ValidationResult {
    try {
      urlSchema.parse(url);
      return { valid: true, errors: [] };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const issue = error.issues[0];
        return {
          valid: false,
          errors: [{ field: "url", message: issue.message, code: issue.code }],
        };
      }
      return {
        valid: false,
        errors: [
          { field: "url", message: "Invalid URL", code: "invalid_type" },
        ],
      };
    }
  }
}

// Export singleton instance
export const validationService = new ValidationService();
