import { Skeleton } from "@/components/ui/skeleton";
import { PostSkeleton } from "./PostSkeleton";

export function ProfileSkeleton() {
  return (
    <div className="min-h-screen bg-white dark:bg-black animate-pulse pb-20">
      <div className="max-w-xl mx-auto">
        {/* 16:9 Cover Skeleton */}
        <div className="relative w-full aspect-[16/9]">
          <Skeleton className="absolute inset-0 w-full h-full bg-zinc-100 dark:bg-zinc-900" />
        </div>

        <div className="px-4 -mt-10 relative z-10">
          <div className="flex justify-between items-end mb-4">
            {/* Avatar Skeleton */}
            <Skeleton className="w-20 h-20 rounded-full border-4 border-white dark:border-black bg-zinc-200 dark:bg-zinc-800" />
            
            {/* Buttons Skeleton: Icon and Label */}
            <div className="flex items-center gap-2 mb-2">
              <Skeleton className="h-9 w-9 rounded-full bg-zinc-200 dark:bg-zinc-800" />
              <Skeleton className="h-9 w-24 rounded-full bg-zinc-200 dark:bg-zinc-800" />
            </div>
          </div>

          {/* Full Name Skeleton */}
          <div className="mb-4">
            <Skeleton className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800" />
          </div>

          {/* Stats Skeletons: posts, followers, following */}
          <div className="flex gap-4 mb-6">
            <Skeleton className="h-4 w-16 bg-zinc-100 dark:bg-zinc-900" />
            <Skeleton className="h-4 w-20 bg-zinc-100 dark:bg-zinc-900" />
            <Skeleton className="h-4 w-20 bg-zinc-100 dark:bg-zinc-900" />
          </div>

          {/* Bio Skeleton: 3 lines */}
          <div className="space-y-2 mb-8">
            <Skeleton className="h-4 w-full bg-zinc-100 dark:bg-zinc-900" />
            <Skeleton className="h-4 w-[90%] bg-zinc-100 dark:bg-zinc-900" />
            <Skeleton className="h-4 w-[40%] bg-zinc-100 dark:bg-zinc-900" />
          </div>

          {/* Tabs Skeleton: Posts, Saved, About */}
          <div className="flex border-b border-black/[0.05] dark:border-white/[0.05] mb-2">
            <div className="flex-1 flex flex-col items-center py-3 gap-2">
              <Skeleton className="h-4 w-12 bg-zinc-200 dark:bg-zinc-800" />
            </div>
            <div className="flex-1 flex flex-col items-center py-3 gap-2">
              <Skeleton className="h-4 w-12 bg-zinc-100 dark:bg-zinc-900" />
            </div>
            <div className="flex-1 flex flex-col items-center py-3 gap-2">
              <Skeleton className="h-4 w-12 bg-zinc-100 dark:bg-zinc-900" />
            </div>
          </div>

          {/* Post Skeletons */}
          <div className="-mx-4">
            {[...Array(3)].map((_, i) => (
              <PostSkeleton key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
