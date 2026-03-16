'use client';

import { usePathname } from 'next/navigation';
import { useGuestMode } from '@/context/GuestModeContext';
import { GuestBanner } from './GuestBanner';

const LANDING_PATHS = ['/', '/about', '/contact', '/privacy-policy', '/terms-of-service', '/community-guidelines'];

export function GuestBannerWrapper() {
  const { isGuest } = useGuestMode();
  const pathname = usePathname();

  if (!isGuest) return null;
  if (LANDING_PATHS.includes(pathname)) return null;

  return <GuestBanner />;
}
