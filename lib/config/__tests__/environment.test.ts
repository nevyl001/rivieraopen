import { getEnvironmentConfig, ConfigurationError } from "../environment";

describe("Environment Configuration", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    // Reset environment before each test
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    // Restore original environment
    process.env = originalEnv;
  });

  describe("Dev environment selection", () => {
    it('should use dev environment when NEXT_PUBLIC_ENV is "dev"', () => {
      process.env.NEXT_PUBLIC_ENV = "dev";

      const config = getEnvironmentConfig();

      expect(config.env).toBe("dev");
      expect(config.databaseUrl).toBeUndefined();
    });

    it("should not require DATABASE_URL in dev environment", () => {
      process.env.NEXT_PUBLIC_ENV = "dev";
      delete process.env.DATABASE_URL;

      expect(() => getEnvironmentConfig()).not.toThrow();
    });
  });

  describe("Prod environment selection with DATABASE_URL", () => {
    it('should use prod environment when NEXT_PUBLIC_ENV is "prod" and DATABASE_URL is provided', () => {
      process.env.NEXT_PUBLIC_ENV = "prod";
      process.env.DATABASE_URL = "postgresql://localhost:5432/test";

      const config = getEnvironmentConfig();

      expect(config.env).toBe("prod");
      expect(config.databaseUrl).toBe("postgresql://localhost:5432/test");
    });

    it("should include DATABASE_URL in config for prod environment", () => {
      process.env.NEXT_PUBLIC_ENV = "prod";
      process.env.DATABASE_URL = "postgresql://user:pass@host:5432/db";

      const config = getEnvironmentConfig();

      expect(config.databaseUrl).toBeDefined();
      expect(config.databaseUrl).toContain("postgresql://");
    });
  });

  describe("Configuration error when prod missing DATABASE_URL", () => {
    it('should throw ConfigurationError when NEXT_PUBLIC_ENV is "prod" but DATABASE_URL is missing', () => {
      process.env.NEXT_PUBLIC_ENV = "prod";
      delete process.env.DATABASE_URL;

      expect(() => getEnvironmentConfig()).toThrow(ConfigurationError);
    });

    it("should throw descriptive error message when DATABASE_URL is missing in prod", () => {
      process.env.NEXT_PUBLIC_ENV = "prod";
      delete process.env.DATABASE_URL;

      expect(() => getEnvironmentConfig()).toThrow(
        'DATABASE_URL must be set when NEXT_PUBLIC_ENV is "prod"'
      );
    });

    it("should throw ConfigurationError when NEXT_PUBLIC_ENV is missing", () => {
      delete process.env.NEXT_PUBLIC_ENV;

      expect(() => getEnvironmentConfig()).toThrow(ConfigurationError);
    });

    it("should throw ConfigurationError when NEXT_PUBLIC_ENV is invalid", () => {
      process.env.NEXT_PUBLIC_ENV = "staging";

      expect(() => getEnvironmentConfig()).toThrow(ConfigurationError);
    });

    it("should throw descriptive error message when NEXT_PUBLIC_ENV is invalid", () => {
      process.env.NEXT_PUBLIC_ENV = "invalid";

      expect(() => getEnvironmentConfig()).toThrow(
        'NEXT_PUBLIC_ENV must be set to "dev" or "prod"'
      );
    });
  });

  describe("ConfigurationError class", () => {
    it("should have correct error name", () => {
      const error = new ConfigurationError("Test error");

      expect(error.name).toBe("ConfigurationError");
    });

    it("should preserve error message", () => {
      const message = "Custom configuration error";
      const error = new ConfigurationError(message);

      expect(error.message).toBe(message);
    });

    it("should be instance of Error", () => {
      const error = new ConfigurationError("Test");

      expect(error).toBeInstanceOf(Error);
    });
  });
});
