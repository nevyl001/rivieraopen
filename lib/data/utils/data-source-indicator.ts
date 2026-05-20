/**
 * Data Source Indicator Utility
 * Helps identify whether data is coming from mock or database
 */

import { getEnvironmentConfig } from "@/lib/config/environment";

export interface DataSourceInfo {
  source: "mock" | "database";
  environment: "dev" | "prod";
  timestamp: string;
}

/**
 * Get current data source information
 */
export function getDataSourceInfo(): DataSourceInfo {
  const config = getEnvironmentConfig();

  return {
    source: config.env === "dev" ? "mock" : "database",
    environment: config.env,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Check if currently using database
 */
export function isUsingDatabase(): boolean {
  const config = getEnvironmentConfig();
  return config.env === "prod";
}

/**
 * Check if currently using mock data
 */
export function isUsingMockData(): boolean {
  const config = getEnvironmentConfig();
  return config.env === "dev";
}

/**
 * Get a human-readable data source label
 */
export function getDataSourceLabel(): string {
  const info = getDataSourceInfo();
  return info.source === "mock"
    ? "📊 Mock Data (In-Memory)"
    : "🗄️ Database (PostgreSQL)";
}
