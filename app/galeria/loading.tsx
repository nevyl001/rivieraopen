import { Container } from "@/components/ui";

export default function GaleriaLoading() {
  return (
    <div className="pt-32 pb-16 bg-gray-50">
      <Container>
        <div className="text-center mb-12">
          <div className="h-12 w-64 bg-gray-200 rounded-lg mx-auto mb-4 animate-pulse" />
          <div className="h-5 w-96 max-w-full bg-gray-200 rounded-lg mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl overflow-hidden shadow-md animate-pulse"
            >
              <div className="aspect-[4/3] bg-gray-200" />
              <div className="p-5 space-y-2">
                <div className="h-6 bg-gray-200 rounded w-3/4" />
                <div className="h-4 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </Container>
    </div>
  );
}
