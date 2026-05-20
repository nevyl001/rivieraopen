import { fc } from "@fast-check/jest";
import { getEnvironmentConfig, ConfigurationError } from "../environment";

describe("Environment Configuration - Property Tests", () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  /**
   * Feature: environment-data-layer, Property 12: Invalid Configuration Rejection
   *
   * For any invalid environment configuration (missing required variables, invalid values),
   * the configuration validation should throw a ConfigurationError with a descriptive message
   * before any data operations are attempted.
   */
  describe("Property 12: Invalid Configuration Rejection", () => {
    it("should reject any invalid NEXT_PUBLIC_ENV value with ConfigurationError", () => {
      fc.assert(
        fc.property(
          // Generate strings that are NOT 'dev' or 'prod'
          fc.string().filter((s) => s !== "dev" && s !== "prod"),
          (invalidEnv) => {
            process.env.NEXT_PUBLIC_ENV = invalidEnv;

            expect(() => getEnvironmentConfig()).toThrow(ConfigurationError);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should reject prod environment without DATABASE_URL", () => {
      fc.assert(
        fc.property(
          // Generate any string or undefined for DATABASE_URL
          fc.oneof(
            fc.constant(undefined),
            fc.constant(""),
            fc.constant(null as any)
          ),
          (invalidDatabaseUrl) => {
            process.env.NEXT_PUBLIC_ENV = "prod";

            if (
              invalidDatabaseUrl === undefined ||
              invalidDatabaseUrl === null
            ) {
              delete process.env.DATABASE_URL;
            } else {
              process.env.DATABASE_URL = invalidDatabaseUrl;
            }

            // Empty string should also fail
            if (invalidDatabaseUrl === "") {
              expect(() => getEnvironmentConfig()).toThrow(ConfigurationError);
            } else {
              expect(() => getEnvironmentConfig()).toThrow(ConfigurationError);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should include descriptive error message for any invalid configuration", () => {
      fc.assert(
        fc.property(
          fc.oneof(
            // Invalid NEXT_PUBLIC_ENV values
            fc.record({
              type: fc.constant("invalid-env"),
              env: fc.string().filter((s) => s !== "dev" && s !== "prod"),
            }),
            // Missing NEXT_PUBLIC_ENV
            fc.record({
              type: fc.constant("missing-env"),
              env: fc.constant(undefined),
            }),
            // Prod without DATABASE_URL
            fc.record({
              type: fc.constant("prod-no-db"),
              env: fc.constant("prod"),
            })
          ),
          (config) => {
            if (
              config.type === "invalid-env" ||
              config.type === "missing-env"
            ) {
              if (config.env === undefined) {
                delete process.env.NEXT_PUBLIC_ENV;
              } else {
                process.env.NEXT_PUBLIC_ENV = config.env;
              }
              delete process.env.DATABASE_URL;
            } else if (config.type === "prod-no-db") {
              process.env.NEXT_PUBLIC_ENV = "prod";
              delete process.env.DATABASE_URL;
            }

            try {
              getEnvironmentConfig();
              // Should not reach here
              expect(true).toBe(false);
            } catch (error) {
              expect(error).toBeInstanceOf(ConfigurationError);
              expect((error as Error).message).toBeTruthy();
              expect((error as Error).message.length).toBeGreaterThan(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should always throw before attempting any operations with invalid config", () => {
      fc.assert(
        fc.property(
          fc.record({
            env: fc.oneof(
              fc.constant(undefined),
              fc.string().filter((s) => s !== "dev" && s !== "prod"),
              fc.constant("prod")
            ),
            hasDatabase: fc.boolean(),
          }),
          (config) => {
            if (config.env === undefined) {
              delete process.env.NEXT_PUBLIC_ENV;
            } else {
              process.env.NEXT_PUBLIC_ENV = config.env;
            }

            if (config.hasDatabase) {
              process.env.DATABASE_URL = "postgresql://localhost:5432/test";
            } else {
              delete process.env.DATABASE_URL;
            }

            // Valid configurations: dev (any db), prod (with db)
            const isValid =
              config.env === "dev" ||
              (config.env === "prod" && config.hasDatabase);

            if (isValid) {
              expect(() => getEnvironmentConfig()).not.toThrow();
            } else {
              expect(() => getEnvironmentConfig()).toThrow(ConfigurationError);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
