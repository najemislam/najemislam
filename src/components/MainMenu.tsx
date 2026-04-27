'use client';

import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Settings, Settings2, LogOut, Plus, Home, Bell, UserCircle, PlusSquare } from 'lucide-react';
import { useTheme } from 'next-themes';
import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface MainMenuProps {
  open: boolean;
  onClose: () => void;
  avatarSrc: string;
  feedMode?: string;
  onFeedModeChange?: (mode: 'trending' | 'explore') => void;
}

export function MainMenu({ open, onClose, avatarSrc, feedMode, onFeedModeChange }: MainMenuProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [alertsEnabled, setAlertsEnabled] = useState(true);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <AnimatePresence>
      {open && (
        <div key="main-menu-overlay" className="fixed inset-0 z-[70]">
          <motion.div
            key="main-menu-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            key="main-menu-content"
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute top-0 left-0 h-full w-[85%] max-w-[320px] bg-white dark:bg-black shadow-2xl flex flex-col"
          >
            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto flex flex-col">

              {/* ── 1. Search bar (same as search page) ── */}
              <div className="h-16 shrink-0 flex items-center px-3 ">
                <div
                  className="flex-1 relative flex items-center bg-zinc-100 dark:bg-zinc-900 rounded-full px-3 h-12 cursor-pointer"
                  onClick={() => { onClose(); router.push('/search'); }}
                >
                  <Search size={24} strokeWidth={1.5} className="text-zinc-400 shrink-0" />
                  <span className="flex-1 px-2 text-sm text-zinc-400 select-none">Search Sharable</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); onClose(); router.push('/settings'); }}
                    className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors shrink-0"
                  >
                    <Settings2 size={24} strokeWidth={1.5} className="text-zinc-400" />
                  </button>
                </div>
              </div>

              {/* ── 2. Ranked / Explore pills (only on home feed) ── */}
              {onFeedModeChange && (
                <div className="h-16 shrink-0 flex items-center gap-3 px-4 ">
                  <button
                    onClick={() => { onFeedModeChange('trending'); onClose(); }}
                    className={`flex-1 h-10 rounded-full text-sm font-semibold transition-all ${
                      feedMode === 'trending'
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                    }`}
                  >
                    Ranked
                  </button>
                  <button
                    onClick={() => { onFeedModeChange('explore'); onClose(); }}
                    className={`flex-1 h-10 rounded-full text-sm font-semibold transition-all ${
                      feedMode === 'explore'
                        ? 'bg-black dark:bg-white text-white dark:text-black'
                        : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                    }`}
                  >
                    Explore
                  </button>
                </div>
              )}

              {/* ── 3. Post create shortcut — avatar 40px, text beside it ── */}
              <div className="h-16 shrink-0 flex items-center gap-3 px-4 ">
                <div className="shrink-0 w-10 h-10 rounded-full overflow-hidden bg-zinc-300 dark:bg-zinc-700">
                  <img src={avatarSrc} alt="Profile" className="w-full h-full object-cover" />
                </div>
                <Link
                  href="/post/create"
                  onClick={onClose}
                  className="flex-1 flex items-center justify-between h-11 bg-zinc-100 dark:bg-zinc-900 rounded-full px-4 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all"
                >
                  <span className="text-sm font-medium text-zinc-500 dark:text-zinc-400 truncate">Anything Sharable Today?</span>
                  <Plus size={18} className="text-zinc-500 dark:text-zinc-400 shrink-0 ml-2" />
                </Link>
              </div>

              {/* ── 4. Nav shortcuts ── */}
              <div className="h-16 shrink-0 flex items-center justify-around px-2">
                {[
                  { href: '/home', icon: Home, label: 'Home' },
                  { href: '/search', icon: Search, label: 'Search' },
                  { href: '/post/create', icon: PlusSquare, label: 'Create' },
                  { href: '/alerts', icon: Bell, label: 'Alerts' },
                  { href: '/profile', icon: UserCircle, label: 'Profile' },
                ].map(({ href, icon: Icon, label }) => {
                  const isActive = pathname === href;
                  return (
                    <button
                      key={href}
                      onClick={() => { onClose(); router.push(href); }}
                      className="flex flex-col items-center justify-center gap-0.5 w-12 h-12 rounded-xl transition-all"
                      title={label}
                    >
                      <div className={`flex items-center justify-center w-9 h-9 rounded-xl transition-all ${isActive ? 'bg-black/10 dark:bg-white/10' : 'hover:bg-zinc-100 dark:hover:bg-zinc-900'}`}>
                        <Icon
                          size={22}
                          strokeWidth={isActive ? 2.5 : 2}
                          className={isActive ? 'text-black dark:text-white' : 'text-zinc-500 dark:text-zinc-400'}
                          fill={isActive ? 'currentColor' : 'none'}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* ── 5. Shortcuts label ── */}
              <div className="px-4 pt-5 pb-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-zinc-400 dark:text-zinc-600">Shortcuts</p>
              </div>

              {/* Alerts toggle */}
              <div className="mx-4 mb-2 px-4 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Alerts</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{alertsEnabled ? 'Notifications on' : 'Notifications off'}</p>
                  </div>
                  <button
                    onClick={() => setAlertsEnabled(prev => !prev)}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${alertsEnabled ? 'bg-black dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-black shadow transition-transform ${alertsEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Dark Mode toggle */}
              <div className="mx-4 mb-2 px-4 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Dark Mode</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">{theme === 'dark' ? 'Dark theme active' : 'Dark theme deactivate'}</p>
                  </div>
                  <button
                    onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                    className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${theme === 'dark' ? 'bg-black dark:bg-white' : 'bg-zinc-300 dark:bg-zinc-700'}`}
                  >
                    <span className={`inline-block h-5 w-5 transform rounded-full bg-white dark:bg-black shadow transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Settings */}
              <button
                onClick={() => { onClose(); router.push('/settings'); }}
                className="mx-4 mb-2 px-4 py-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center gap-3 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all text-left"
              >
                <Settings size={20} className="text-zinc-700 dark:text-zinc-300 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">Settings</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">App preferences</p>
                </div>
              </button>

              {/* Spacer */}
              <div className="h-24 shrink-0" />
            </div>

            {/* ── Fixed Logout ── */}
            <div className="shrink-0 px-4 py-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/50 hover:bg-red-100 dark:hover:bg-red-950/40 transition-all"
              >
                <LogOut size={20} className="text-red-600 dark:text-red-400 shrink-0" />
                <div className="text-left">
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">Log out</p>
                  <p className="text-xs text-red-400 dark:text-red-600 mt-0.5">Sign out of your account</p>
                </div>
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
