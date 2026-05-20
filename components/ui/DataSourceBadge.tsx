"use client";

import { useEffect, useState } from "react";

interface DataSourceInfo {
  source: "mock" | "database";
  environment: "dev" | "prod";
}

export function DataSourceBadge() {
  const [dataSource, setDataSource] = useState<DataSourceInfo | null>(null);

  useEffect(() => {
    // Get environment from client-side
    const env = process.env.NEXT_PUBLIC_ENV as "dev" | "prod";
    setDataSource({
      source: env === "dev" ? "mock" : "database",
      environment: env,
    });
  }, []);

  // Only show badge in dev environment
  if (!dataSource || dataSource.environment === "prod") return null;

  const isDev = dataSource.environment === "dev";
  const bgColor = isDev ? "bg-blue-500" : "bg-green-600";
  const icon = isDev ? "📊" : "🗄️";
  const label = isDev ? "Mock Data" : "Database";

  return (
    <div
      className={`fixed bottom-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium z-50 flex items-center gap-2`}
    >
      <span>{icon}</span>
      <span>{label}</span>
      <span className="text-xs opacity-75">({dataSource.environment})</span>
    </div>
  );
}
