"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";

type ChromeState = {
  menuOpen: boolean;
  searchOpen: boolean;
  openMenu: () => void;
  closeMenu: () => void;
  openSearch: () => void;
  closeSearch: () => void;
};

const ChromeContext = createContext<ChromeState | null>(null);

/** Shared open/closed state for the site chrome overlays (menu drawer, search). */
export function ChromeProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const value = useMemo<ChromeState>(
    () => ({
      menuOpen,
      searchOpen,
      openMenu: () => {
        setSearchOpen(false);
        setMenuOpen(true);
      },
      closeMenu: () => setMenuOpen(false),
      openSearch: () => {
        setMenuOpen(false);
        setSearchOpen(true);
      },
      closeSearch: () => setSearchOpen(false),
    }),
    [menuOpen, searchOpen],
  );
  return <ChromeContext.Provider value={value}>{children}</ChromeContext.Provider>;
}

export function useChrome(): ChromeState {
  const ctx = useContext(ChromeContext);
  if (!ctx) throw new Error("useChrome must be used inside <ChromeProvider>");
  return ctx;
}
