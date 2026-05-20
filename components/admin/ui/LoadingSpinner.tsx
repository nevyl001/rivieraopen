interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function LoadingSpinner({
  size = "md",
  className = "",
}: LoadingSpinnerProps) {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div
        className={`${sizes[size]} border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin`}
      />
    </div>
  );
}

export function LoadingPage({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="min-h-[400px] flex flex-col items-center justify-center">
      <LoadingSpinner size="lg" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  );
}

export function SkeletonLoader({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse bg-gray-200 rounded ${className}`}
      style={{ minHeight: "1rem" }}
    />
  );
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <SkeletonLoader className="h-12 flex-1" />
          <SkeletonLoader className="h-12 w-24" />
          <SkeletonLoader className="h-12 w-32" />
        </div>
      ))}
    </div>
  );
}
