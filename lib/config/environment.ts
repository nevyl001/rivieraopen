/** App always uses in-memory mock data (editable via admin panel). */
export type Environment = "dev";

export interface EnvironmentConfig {
  env: Environment;
}

export function getEnvironmentConfig(): EnvironmentConfig {
  return { env: "dev" };
}
