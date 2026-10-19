"use client";

import { usePathname } from "next/navigation";
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

type ShopUI = {
  menuOpen: boolean;
  setMenuOpen: (open: boolean) => void;
  searchOpen: boolean;
  setSearchOpen: (open: boolean) => void;
  /** Bottom offset for floating controls when the PDP buy bar is showing. */
  stickyBarVisible: boolean;
  setStickyBarVisible: (visible: boolean) => void;
};

const Ctx = createContext<ShopUI | null>(null);

export function ShopUIProvider({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [stickyBarVisible, setStickyBarVisible] = useState(false);
  const pathname = usePathname();
  const [shownPath, setShownPath] = useState(pathname);

  // Any navigation closes the overlays (state adjusted during render, not in an effect).
  if (shownPath !== pathname) {
    setShownPath(pathname);
    setMenuOpen(false);
    setSearchOpen(false);
    setStickyBarVisible(false);
  }

  // The toast region lives outside this provider; it reads the sticky bar from <html>.
  useEffect(() => {
    document.documentElement.toggleAttribute("data-sticky-bar", stickyBarVisible);
  }, [stickyBarVisible]);

  const value = useMemo(
    () => ({ menuOpen, setMenuOpen, searchOpen, setSearchOpen, stickyBarVisible, setStickyBarVisible }),
    [menuOpen, searchOpen, stickyBarVisible],
  );
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShopUI(): ShopUI {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShopUI must be used inside <ShopUIProvider>");
  return ctx;
}
