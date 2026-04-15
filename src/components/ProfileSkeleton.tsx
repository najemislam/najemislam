import { Skeleton } from "@/components/ui/skeleton";

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-black animate-pulse">
      {/* Header Skeleton */}
      <div className="h-16 border-b border-black/[0.05] dark:border-white/[0.05] flex items-center justify-between px-4">
        <Skeleton className="h-6 w-24 bg-zinc-200 dark:bg-zinc-800" />
        <Skeleton className="h-8 w-8 rounded-full bg-zinc-200 dark:bg-zinc-800" />
      </div>

      <div className="max-w-xl mx-auto">
        {/* Cover Skeleton */}
        <Skeleton className="h-48 w-full bg-zinc-100 dark:bg-zinc-900" />

        <div className="px-4 -mt-12 relative z-10">
          <div className="flex justify-between items-end mb-4">
            {/* Avatar Skeleton */}
            <Skeleton className="w-24 h-24 rounded-full border-4 border-white dark:border-black bg-zinc-200 dark:bg-zinc-800" />
            {/* Edit Button Skeleton */}
            <Skeleton className="h-10 w-28 rounded-full bg-zinc-200 dark:bg-zinc-800 mb-2" />
          </div>

          {/* Info Skeletons */}
          <div className="space-y-2 mb-6">
            <Skeleton className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800" />
            <Skeleton className="h-4 w-32 bg-zinc-100 dark:bg-zinc-900" />
          </div>

          <div className="space-y-2 mb-6">
            <Skeleton className="h-4 w-full bg-zinc-100 dark:bg-zinc-900" />
            <Skeleton className="h-4 w-3/4 bg-zinc-100 dark:bg-zinc-900" />
          </div>

          {/* Stats Skeletons */}
          <div className="flex gap-4 mb-8">
            <Skeleton className="h-4 w-20 bg-zinc-100 dark:bg-zinc-900" />
            <Skeleton className="h-4 w-20 bg-zinc-100 dark:bg-zinc-900" />
          </div>

          {/* Tabs Skeleton */}
          <div className="flex border-b border-black/[0.05] dark:border-white/[0.05] mb-4">
            <Skeleton className="h-10 w-1/3 bg-zinc-100 dark:bg-zinc-900" />
            <Skeleton className="h-10 w-1/3 bg-zinc-100 dark:bg-zinc-900" />
            <Skeleton className="h-10 w-1/3 bg-zinc-100 dark:bg-zinc-900" />
          </div>

          {/* Content Skeletons */}
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-3 py-4">
                <Skeleton className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-1/4 bg-zinc-200 dark:bg-zinc-800" />
                  <Skeleton className="h-4 w-full bg-zinc-100 dark:bg-zinc-900" />
                  <Skeleton className="h-32 w-full rounded-xl bg-zinc-100 dark:bg-zinc-900" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
