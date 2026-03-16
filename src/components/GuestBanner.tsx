'use client';

import { Eye, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function GuestBanner() {
  const router = useRouter();

  const handleSignUp = async () => {
    await fetch('/api/auth/guest', { method: 'DELETE' });
    router.push('/');
  };

  return (
    <div className="fixed bottom-[64px] left-0 right-0 z-40 px-3 pb-2 pointer-events-none">
      <div className="max-w-xl mx-auto pointer-events-auto">
        <div className="flex items-center justify-between gap-3 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black rounded-2xl px-4 py-3 shadow-xl shadow-black/20">
          <div className="flex items-center gap-2 min-w-0">
            <Eye size={16} className="shrink-0 opacity-70" />
            <span className="text-sm font-medium truncate opacity-90">
              You&apos;re browsing as a guest
            </span>
          </div>
          <button
            onClick={handleSignUp}
            className="flex items-center gap-1.5 shrink-0 bg-white dark:bg-black text-black dark:text-white text-xs font-bold px-3 py-1.5 rounded-full hover:opacity-80 transition-opacity"
          >
            <UserPlus size={13} />
            Sign up
          </button>
        </div>
      </div>
    </div>
  );
}
