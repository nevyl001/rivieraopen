"use client";

import Link from "next/link";
import { Container, Button } from "@/components/ui";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background py-16">
      <Container size="sm">
        <div className="text-center">
          <h1 className="font-heading text-9xl font-bold text-accent mb-4">
            404
          </h1>
          <h2 className="font-heading text-3xl font-semibold text-primary mb-4">
            Página No Encontrada
          </h2>
          <p className="text-lg text-text-secondary mb-8 max-w-md mx-auto">
            Lo sentimos, no pudimos encontrar la página que buscas. Puede haber
            sido movida o eliminada.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button variant="primary" className="flex items-center gap-2">
                <Home size={20} />
                Ir al Inicio
              </Button>
            </Link>
            <button
              onClick={() => window.history.back()}
              className="flex items-center gap-2 justify-center px-6 py-3 border-2 border-accent text-accent hover:bg-accent hover:text-primary rounded-lg font-medium transition-colors"
            >
              <ArrowLeft size={20} />
              Volver
            </button>
          </div>
        </div>
      </Container>
    </div>
  );
}
