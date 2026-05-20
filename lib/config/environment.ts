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

function resolveEnvironment(): Environment {
  const explicit = process.env.NEXT_PUBLIC_ENV as Environment | undefined;

  if (explicit && ["dev", "prod"].includes(explicit)) {
    return explicit;
  }

  // Vercel: infer when NEXT_PUBLIC_ENV is not set in project settings
  if (process.env.VERCEL_ENV === "production") {
    return "prod";
  }
  if (
    process.env.VERCEL_ENV === "preview" ||
    process.env.VERCEL_ENV === "development"
  ) {
    return "dev";
  }

  throw new ConfigurationError(
    'NEXT_PUBLIC_ENV must be set to "dev" or "prod"'
  );
}

export function getEnvironmentConfig(): EnvironmentConfig {
  const env = resolveEnvironment();

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
