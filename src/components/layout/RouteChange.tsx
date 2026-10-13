"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useRef } from "react";

function Watcher({ onChange }: { onChange: (pathname: string) => void }) {
  const pathname = usePathname();
  const first = useRef(true);
  const cb = useRef(onChange);
  useEffect(() => {
    cb.current = onChange;
  });
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    cb.current(pathname);
  }, [pathname]);
  return null;
}

/**
 * Calls `onChange` after client navigations. Reading the pathname needs a Suspense boundary; keeping
 * it in this null-rendering leaf means the visible UI around it is never inside one (no hydration
 * swaps of the header or drawer).
 */
export function RouteChange({ onChange }: { onChange: (pathname: string) => void }) {
  return (
    <Suspense fallback={null}>
      <Watcher onChange={onChange} />
    </Suspense>
  );
}
