'use client';

import { createContext, useContext, useEffect, useState } from 'react';

interface GuestModeContextType {
  isGuest: boolean;
  setGuest: (value: boolean) => void;
  exitGuestMode: () => void;
}

const GuestModeContext = createContext<GuestModeContextType>({
  isGuest: false,
  setGuest: () => {},
  exitGuestMode: () => {},
});

export function GuestModeProvider({ children }: { children: React.ReactNode }) {
  const [isGuest, setIsGuest] = useState(false);

  useEffect(() => {
    // Read from cookie (set by /api/auth/guest)
    const hasCookie = document.cookie.split(';').some(c => c.trim().startsWith('guest_mode=true'));
    if (hasCookie) setIsGuest(true);
  }, []);

  const setGuest = (value: boolean) => {
    setIsGuest(value);
  };

  const exitGuestMode = () => {
    setGuest(false);
    window.location.href = '/';
  };

  return (
    <GuestModeContext.Provider value={{ isGuest, setGuest, exitGuestMode }}>
      {children}
    </GuestModeContext.Provider>
  );
}

export function useGuestMode() {
  return useContext(GuestModeContext);
}
