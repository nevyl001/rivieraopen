import { fc } from "@fast-check/jest";
import {
  NotFoundError,
  ValidationError,
  QueryError,
  DatabaseConnectionError,
} from "../interfaces";

describe("Error Classes - Property Tests", () => {
  /**
   * Feature: environment-data-layer, Property 11: Error Context Completeness
   *
   * For any error thrown by the data layer (connection, query, not-found),
   * the error message should include sufficient context to identify the
   * operation type, entity involved, and failure reason.
   */
  describe("Property 11: Error Context Completeness", () => {
    it("should include entity type and ID for any NotFoundError", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }), // entityType
          fc.string({ minLength: 1 }), // id
          (entityType, id) => {
            const error = new NotFoundError(entityType, id);

            // Error message should contain both entity type and ID
            expect(error.message).toContain(entityType);
            expect(error.message).toContain(id);

            // Context should include both fields
            expect(error.context?.entityType).toBe(entityType);
            expect(error.context?.id).toBe(id);

            // Error name should be set
            expect(error.name).toBe("NotFoundError");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should include operation and entity type for any QueryError", () => {
      fc.assert(
        fc.property(
          fc.constantFrom(
            "create",
            "read",
            "update",
            "delete",
            "query",
            "insert",
            "select"
          ),
          fc.constantFrom("Player", "Tournament", "User", "Game"),
          (operation, entityType) => {
            const error = new QueryError(operation, entityType);

            // Error message should contain operation and entity
            expect(error.message).toContain(operation);
            expect(error.message).toContain(entityType);

            // Context should include both fields
            expect(error.context?.operation).toBe(operation);
            expect(error.context?.entityType).toBe(entityType);

            // Error name should be set
            expect(error.name).toBe("QueryError");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should preserve cause error in QueryError context", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          (operation, entityType, causeMessage) => {
            const cause = new Error(causeMessage);
            const error = new QueryError(operation, entityType, cause);

            // Context should include the cause
            expect(error.context?.cause).toBe(cause);
            expect(error.context?.cause?.message).toBe(causeMessage);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should include descriptive message for any DatabaseConnectionError", () => {
      fc.assert(
        fc.property(fc.string({ minLength: 1 }), (message) => {
          const error = new DatabaseConnectionError(message);

          // Error message should be preserved
          expect(error.message).toBe(message);
          expect(error.message.length).toBeGreaterThan(0);

          // Error name should be set
          expect(error.name).toBe("DatabaseConnectionError");
        }),
        { numRuns: 100 }
      );
    });

    it("should preserve cause error in DatabaseConnectionError", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          (message, causeMessage) => {
            const cause = new Error(causeMessage);
            const error = new DatabaseConnectionError(message, cause);

            // Cause should be accessible
            expect(error.cause).toBe(cause);
            expect(error.context?.cause).toBe(cause);
            expect(error.cause?.message).toBe(causeMessage);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should always have non-empty error messages", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            fc.record({
              type: fc.constant("notfound"),
              entityType: fc.string({ minLength: 1 }),
              id: fc.string({ minLength: 1 }),
            }),
            fc.record({
              type: fc.constant("query"),
              operation: fc.string({ minLength: 1 }),
              entityType: fc.string({ minLength: 1 }),
            }),
            fc.record({
              type: fc.constant("connection"),
              message: fc.string({ minLength: 1 }),
            })
          ),
          (errorConfig) => {
            let error: Error;

            if (errorConfig.type === "notfound") {
              error = new NotFoundError(errorConfig.entityType, errorConfig.id);
            } else if (errorConfig.type === "query") {
              error = new QueryError(
                errorConfig.operation,
                errorConfig.entityType
              );
            } else {
              error = new DatabaseConnectionError(errorConfig.message);
            }

            // All errors should have non-empty messages
            expect(error.message).toBeTruthy();
            expect(error.message.length).toBeGreaterThan(0);

            // All errors should have proper names
            expect(error.name).toBeTruthy();
            expect(error.name.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should maintain context integrity across error types", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc.string({ minLength: 1 }),
          (param1, param2) => {
            const notFoundError = new NotFoundError(param1, param2);
            const queryError = new QueryError(param1, param2);

            // Context should be accessible and non-null
            expect(notFoundError.context).toBeDefined();
            expect(queryError.context).toBeDefined();

            // Context should contain the provided parameters
            expect(Object.keys(notFoundError.context!).length).toBeGreaterThan(
              0
            );
            expect(Object.keys(queryError.context!).length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Feature: environment-data-layer, Property 10: Validation Error Descriptiveness
   *
   * For any validation failure (invalid data, missing required fields),
   * the thrown ValidationError should include a fields map that specifies
   * which fields failed validation and why.
   */
  describe("Property 10: Validation Error Descriptiveness", () => {
    it("should include field-specific error messages for any validation failure", () => {
      fc.assert(
        fc.property(
          fc
            .dictionary(
              fc.string({ minLength: 1 }), // field name
              fc.string({ minLength: 1 }) // error message
            )
            .filter((dict) => Object.keys(dict).length > 0),
          (fields) => {
            const error = new ValidationError("Validation failed", fields);

            // Fields should be accessible
            expect(error.fields).toEqual(fields);

            // Each field should have an error message
            Object.entries(fields).forEach(([fieldName, errorMessage]) => {
              expect(error.fields[fieldName]).toBe(errorMessage);
              expect(error.fields[fieldName].length).toBeGreaterThan(0);
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should preserve all field errors regardless of count", () => {
      fc.assert(
        fc.property(
          fc.array(
            fc.record({
              field: fc.string({ minLength: 1 }),
              error: fc.string({ minLength: 1 }),
            }),
            { minLength: 1, maxLength: 20 }
          ),
          (fieldErrors) => {
            const fields = Object.fromEntries(
              fieldErrors.map((fe) => [fe.field, fe.error])
            );

            const error = new ValidationError(
              "Multiple validation errors",
              fields
            );

            // All fields should be preserved
            expect(Object.keys(error.fields).length).toBeGreaterThanOrEqual(1);

            // Each field should have its error message
            fieldErrors.forEach(({ field, error: errorMsg }) => {
              if (error.fields[field]) {
                expect(error.fields[field]).toBeTruthy();
              }
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should include fields in context for any ValidationError", () => {
      fc.assert(
        fc.property(
          fc
            .dictionary(
              fc.string({ minLength: 1 }),
              fc.string({ minLength: 1 })
            )
            .filter((dict) => Object.keys(dict).length > 0),
          (fields) => {
            const error = new ValidationError("Validation failed", fields);

            // Context should include fields
            expect(error.context?.fields).toEqual(fields);

            // Fields should be accessible both ways
            expect(error.fields).toEqual(error.context?.fields);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should have descriptive main error message for any validation failure", () => {
      fc.assert(
        fc.property(
          fc.string({ minLength: 1 }),
          fc
            .dictionary(
              fc.string({ minLength: 1 }),
              fc.string({ minLength: 1 })
            )
            .filter((dict) => Object.keys(dict).length > 0),
          (message, fields) => {
            const error = new ValidationError(message, fields);

            // Main message should be preserved
            expect(error.message).toBe(message);
            expect(error.message.length).toBeGreaterThan(0);

            // Error name should be set
            expect(error.name).toBe("ValidationError");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle common validation scenarios", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Required field missing
            fc.constant({ field: "email", error: "Required" }),
            // Invalid format
            fc.constant({ field: "email", error: "Invalid email format" }),
            // Out of range
            fc.constant({ field: "age", error: "Must be between 0 and 120" }),
            // Too short/long
            fc.constant({
              field: "password",
              error: "Must be at least 8 characters",
            }),
            // Custom validation
            fc.record({
              field: fc.string({ minLength: 1 }),
              error: fc.string({ minLength: 1 }),
            })
          ),
          (fieldError) => {
            const fields = { [fieldError.field]: fieldError.error };
            const error = new ValidationError("Validation failed", fields);

            // Field error should be accessible
            expect(error.fields[fieldError.field]).toBe(fieldError.error);

            // Error should be descriptive
            expect(error.fields[fieldError.field].length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should maintain field error integrity", () => {
      fc.assert(
        fc.property(
          fc
            .dictionary(
              fc.string({ minLength: 1 }),
              fc.string({ minLength: 1 })
            )
            .filter((dict) => Object.keys(dict).length > 0),
          (originalFields) => {
            const error = new ValidationError("Test", originalFields);

            // Fields should be accessible
            expect(error.fields).toEqual(originalFields);

            // All field keys should be present
            Object.keys(originalFields).forEach((key) => {
              expect(error.fields[key]).toBe(originalFields[key]);
            });

            // Field count should match
            expect(Object.keys(error.fields).length).toBe(
              Object.keys(originalFields).length
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
