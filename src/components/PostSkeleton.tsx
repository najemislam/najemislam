import { Skeleton } from "@/components/ui/skeleton";

export function PostSkeleton() {
  return (
    <div className="p-4 border-b border-black/[0.05] dark:border-white/[0.05] animate-pulse">
      <div className="flex items-start gap-3">
        {/* Avatar Skeleton */}
        <Skeleton className="w-10 h-10 rounded-full shrink-0 bg-zinc-200 dark:bg-zinc-800" />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {/* Name and Username Skeleton */}
            <Skeleton className="h-4 w-24 bg-zinc-200 dark:bg-zinc-800" />
            <Skeleton className="h-3 w-16 bg-zinc-100 dark:bg-zinc-900" />
          </div>
          
          {/* Content Lines Skeleton */}
          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-full bg-zinc-100 dark:bg-zinc-900" />
            <Skeleton className="h-4 w-[90%] bg-zinc-100 dark:bg-zinc-900" />
            <Skeleton className="h-4 w-[70%] bg-zinc-100 dark:bg-zinc-900" />
          </div>
          
          {/* Media Placeholder (Optional-looking) */}
          <Skeleton className="h-48 w-full rounded-2xl mb-4 bg-zinc-100 dark:bg-zinc-900" />
          
          {/* Actions Skeleton */}
          <div className="flex items-center justify-between max-w-xs pt-2">
            <Skeleton className="h-4 w-8 bg-zinc-100 dark:bg-zinc-900" />
            <Skeleton className="h-4 w-8 bg-zinc-100 dark:bg-zinc-900" />
            <Skeleton className="h-4 w-8 bg-zinc-100 dark:bg-zinc-900" />
            <Skeleton className="h-4 w-8 bg-zinc-100 dark:bg-zinc-900" />
          </div>
        </div>
      </div>
    </div>
  );
}
