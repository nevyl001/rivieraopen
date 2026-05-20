import {
  DataLayerError,
  NotFoundError,
  ValidationError,
  QueryError,
  DatabaseConnectionError,
} from "../interfaces";

describe("Error Classes", () => {
  describe("DataLayerError", () => {
    it("should create error with message", () => {
      const message = "Test error message";
      const error = new DataLayerError(message);

      expect(error.message).toBe(message);
      expect(error.name).toBe("DataLayerError");
    });

    it("should create error with context", () => {
      const message = "Test error";
      const context = { key: "value", count: 42 };
      const error = new DataLayerError(message, context);

      expect(error.context).toEqual(context);
    });

    it("should be instance of Error", () => {
      const error = new DataLayerError("Test");

      expect(error).toBeInstanceOf(Error);
    });

    it("should preserve context object", () => {
      const context = { operation: "read", entity: "Player" };
      const error = new DataLayerError("Failed", context);

      expect(error.context?.operation).toBe("read");
      expect(error.context?.entity).toBe("Player");
    });
  });

  describe("NotFoundError", () => {
    it("should format error message with entity type and ID", () => {
      const error = new NotFoundError("Player", "123");

      expect(error.message).toBe("Player with id 123 not found");
    });

    it("should have correct error name", () => {
      const error = new NotFoundError("Tournament", "456");

      expect(error.name).toBe("NotFoundError");
    });

    it("should include entity type in context", () => {
      const error = new NotFoundError("Player", "789");

      expect(error.context?.entityType).toBe("Player");
    });

    it("should include ID in context", () => {
      const error = new NotFoundError("Tournament", "abc-123");

      expect(error.context?.id).toBe("abc-123");
    });

    it("should be instance of DataLayerError", () => {
      const error = new NotFoundError("Player", "1");

      expect(error).toBeInstanceOf(DataLayerError);
    });

    it("should handle different entity types", () => {
      const playerError = new NotFoundError("Player", "1");
      const tournamentError = new NotFoundError("Tournament", "2");

      expect(playerError.message).toContain("Player");
      expect(tournamentError.message).toContain("Tournament");
    });
  });

  describe("ValidationError", () => {
    it("should create error with message and fields", () => {
      const message = "Validation failed";
      const fields = { email: "Invalid email format" };
      const error = new ValidationError(message, fields);

      expect(error.message).toBe(message);
      expect(error.fields).toEqual(fields);
    });

    it("should have correct error name", () => {
      const error = new ValidationError("Invalid", {});

      expect(error.name).toBe("ValidationError");
    });

    it("should include fields in context", () => {
      const fields = { name: "Required", age: "Must be positive" };
      const error = new ValidationError("Validation failed", fields);

      expect(error.context?.fields).toEqual(fields);
    });

    it("should preserve multiple field errors", () => {
      const fields = {
        firstName: "Required",
        lastName: "Required",
        email: "Invalid format",
      };
      const error = new ValidationError("Multiple errors", fields);

      expect(error.fields).toEqual(fields);
      expect(Object.keys(error.fields)).toHaveLength(3);
    });

    it("should be instance of DataLayerError", () => {
      const error = new ValidationError("Test", {});

      expect(error).toBeInstanceOf(DataLayerError);
    });
  });

  describe("QueryError", () => {
    it("should format error message with operation and entity type", () => {
      const error = new QueryError("create", "Player");

      expect(error.message).toBe("Failed to create Player");
    });

    it("should have correct error name", () => {
      const error = new QueryError("update", "Tournament");

      expect(error.name).toBe("QueryError");
    });

    it("should include operation in context", () => {
      const error = new QueryError("delete", "Player");

      expect(error.context?.operation).toBe("delete");
    });

    it("should include entity type in context", () => {
      const error = new QueryError("read", "Tournament");

      expect(error.context?.entityType).toBe("Tournament");
    });

    it("should include cause error when provided", () => {
      const cause = new Error("Database connection failed");
      const error = new QueryError("query", "Player", cause);

      expect(error.context?.cause).toBe(cause);
    });

    it("should work without cause error", () => {
      const error = new QueryError("insert", "Player");

      expect(error.context?.cause).toBeUndefined();
    });

    it("should be instance of DataLayerError", () => {
      const error = new QueryError("select", "Player");

      expect(error).toBeInstanceOf(DataLayerError);
    });
  });

  describe("DatabaseConnectionError", () => {
    it("should create error with message", () => {
      const message = "Connection timeout";
      const error = new DatabaseConnectionError(message);

      expect(error.message).toBe(message);
    });

    it("should have correct error name", () => {
      const error = new DatabaseConnectionError("Connection failed");

      expect(error.name).toBe("DatabaseConnectionError");
    });

    it("should include cause error when provided", () => {
      const cause = new Error("Network error");
      const error = new DatabaseConnectionError("Failed to connect", cause);

      expect(error.cause).toBe(cause);
    });

    it("should include cause in context", () => {
      const cause = new Error("Timeout");
      const error = new DatabaseConnectionError("Connection error", cause);

      expect(error.context?.cause).toBe(cause);
    });

    it("should work without cause error", () => {
      const error = new DatabaseConnectionError("Connection failed");

      expect(error.cause).toBeUndefined();
    });

    it("should be instance of DataLayerError", () => {
      const error = new DatabaseConnectionError("Test");

      expect(error).toBeInstanceOf(DataLayerError);
    });
  });

  describe("Error inheritance chain", () => {
    it("should maintain proper inheritance for all error types", () => {
      const errors = [
        new NotFoundError("Player", "1"),
        new ValidationError("Invalid", {}),
        new QueryError("select", "Player"),
        new DatabaseConnectionError("Failed"),
      ];

      errors.forEach((error) => {
        expect(error).toBeInstanceOf(DataLayerError);
        expect(error).toBeInstanceOf(Error);
      });
    });

    it("should allow catching specific error types", () => {
      const throwNotFound = () => {
        throw new NotFoundError("Player", "1");
      };

      try {
        throwNotFound();
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error).toBeInstanceOf(DataLayerError);
      }
    });
  });
});
