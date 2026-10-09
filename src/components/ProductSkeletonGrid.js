export default function ProductSkeletonGrid({ count = 8 }) {
  return <div aria-label="Loading products" aria-busy="true" className="mt-6 grid gap-x-4 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{Array.from({ length: count }, (_, index) => <div key={index} className="animate-pulse"><div className="skeleton-shimmer aspect-[.78]"/><div className="mt-4 space-y-3"><div className="skeleton-shimmer h-2 w-20"/><div className="skeleton-shimmer h-4 w-4/5"/><div className="skeleton-shimmer h-3 w-16"/></div></div>)}</div>;
}
