export type Environment = "dev" | "prod";

export interface EnvironmentConfig {
  env: Environment;
  databaseUrl?: string;
}

export class ConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConfigurationError";
  }
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const env = process.env.NEXT_PUBLIC_ENV as Environment;

  if (!env || !["dev", "prod"].includes(env)) {
    throw new ConfigurationError(
      'NEXT_PUBLIC_ENV must be set to "dev" or "prod"'
    );
  }

  if (env === "prod") {
    const databaseUrl = process.env.DATABASE_URL;
    if (!databaseUrl) {
      throw new ConfigurationError(
        'DATABASE_URL must be set when NEXT_PUBLIC_ENV is "prod"'
      );
    }
    return { env, databaseUrl };
  }

  return { env };
}
