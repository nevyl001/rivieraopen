/**
 * Data source indicator — app uses in-memory mock data only.
 */

export interface DataSourceInfo {
  source: "mock";
  timestamp: string;
}

export function getDataSourceInfo(): DataSourceInfo {
  return {
    source: "mock",
    timestamp: new Date().toISOString(),
  };
}

export function isUsingDatabase(): boolean {
  return false;
}

export function isUsingMockData(): boolean {
  return true;
}

export function getDataSourceLabel(): string {
  return "📊 Mock Data (In-Memory)";
}
