"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="text-center max-w-md">
        <h1 className="font-heading text-3xl font-bold text-text mb-4">
          Algo salió mal
        </h1>
        <p className="text-text-secondary mb-6">
          No pudimos cargar esta página. Intenta de nuevo.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-3 rounded-full bg-accent text-white font-medium hover:bg-accent-hover transition-colors"
          >
            Reintentar
          </button>
          <Link
            href="/"
            className="px-6 py-3 rounded-full border-2 border-primary text-primary font-medium hover:bg-primary hover:text-white transition-colors"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}
