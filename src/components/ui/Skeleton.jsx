/**
 * Skeleton Loader Components
 * Placeholder loading states for better UX
 */

// Base skeleton with shimmer animation
export function Skeleton({ className = "", style = {} }) {
  return (
    <div
      className={`bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] animate-shimmer rounded ${className}`}
      style={style}
    />
  );
}

// Text line skeleton
export function SkeletonText({ lines = 1, className = "" }) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className="h-4"
          style={{ width: i === lines - 1 && lines > 1 ? "75%" : "100%" }}
        />
      ))}
    </div>
  );
}

// Heading skeleton
export function SkeletonHeading({ size = "md", className = "" }) {
  const heights = {
    sm: "h-6",
    md: "h-8",
    lg: "h-10",
    xl: "h-12",
  };
  return <Skeleton className={`${heights[size]} w-3/4 ${className}`} />;
}

// Card skeleton
export function SkeletonCard({ className = "" }) {
  return (
    <div className={`rounded-2xl border border-gray-100 p-xl ${className}`}>
      <Skeleton className="w-12 h-12 rounded-xl mb-lg" />
      <SkeletonHeading size="sm" className="mb-md" />
      <SkeletonText lines={3} />
    </div>
  );
}

// Image skeleton
export function SkeletonImage({ aspectRatio = "video", className = "" }) {
  const ratios = {
    square: "aspect-square",
    video: "aspect-video",
    portrait: "aspect-[3/4]",
    wide: "aspect-[21/9]",
  };
  return <Skeleton className={`${ratios[aspectRatio]} w-full rounded-2xl ${className}`} />;
}

// Hero section skeleton
export function SkeletonHero() {
  return (
    <div className="min-h-[60vh] flex items-center pt-32 pb-16">
      <div className="container">
        <div className="max-w-3xl">
          <Skeleton className="h-5 w-32 mb-md rounded-full" />
          <SkeletonHeading size="xl" className="mb-lg" />
          <SkeletonHeading size="xl" className="mb-xl w-1/2" />
          <SkeletonText lines={2} className="max-w-xl mb-xl" />
          <Skeleton className="h-14 w-48 rounded-full" />
        </div>
      </div>
    </div>
  );
}

// Stats bar skeleton
export function SkeletonStats({ count = 4 }) {
  return (
    <div className="py-xl border-y border-gray-100">
      <div className="container">
        <div className={`grid grid-cols-2 md:grid-cols-${count} gap-lg`}>
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="text-center">
              <Skeleton className="h-12 w-24 mx-auto mb-sm" />
              <Skeleton className="h-4 w-20 mx-auto" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Grid of cards skeleton
export function SkeletonCardGrid({ count = 6, cols = 3 }) {
  return (
    <div className={`grid md:grid-cols-2 lg:grid-cols-${cols} gap-xl`}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

// Add shimmer animation to CSS
export const shimmerStyles = `
@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
.animate-shimmer {
  animation: shimmer 1.5s ease-in-out infinite;
}
`;

export default Skeleton;
