import { Container } from "@/components/ui";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Container>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-accent border-t-transparent mb-4" />
          <p className="text-text-secondary">Cargando...</p>
        </div>
      </Container>
    </div>
  );
}
