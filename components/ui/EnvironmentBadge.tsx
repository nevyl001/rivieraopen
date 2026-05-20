"use client";

import { useEffect, useState } from "react";

export function EnvironmentBadge() {
  const [env, setEnv] = useState<string | null>(null);

  useEffect(() => {
    // Get environment from window (client-side)
    const currentEnv = process.env.NEXT_PUBLIC_ENV;
    setEnv(currentEnv || null);
  }, []);

  // Only show badge in dev environment
  if (env !== "dev") {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-yellow-500 text-black px-4 py-2 rounded-full shadow-lg font-bold text-sm flex items-center gap-2">
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-yellow-300"></span>
        </span>
        DEV ENVIRONMENT
      </div>
    </div>
  );
}
