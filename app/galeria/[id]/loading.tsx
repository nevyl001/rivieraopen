import { Container } from "@/components/ui";

export default function GaleriaEventLoading() {
  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <Container>
        <div className="h-5 w-40 bg-gray-200 rounded mb-8 animate-pulse" />
        <div className="h-10 w-80 max-w-full bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="h-5 w-48 bg-gray-200 rounded mb-10 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div
              key={i}
              className="aspect-square bg-gray-200 rounded-2xl animate-pulse"
            />
          ))}
        </div>
      </Container>
    </div>
  );
}
