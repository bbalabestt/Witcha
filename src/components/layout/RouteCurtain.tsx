"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Logo } from "@/components/ui/Logo";
import { RouteChange } from "./RouteChange";
import styles from "./RouteCurtain.module.css";

const EASE = "cubic-bezier(.7,0,.2,1)";
const IN_MS = 520;
const HOLD_MS = 140;
const OUT_MS = 620;
const SAFETY_MS = 4000;

/** Same-tab, same-origin page links that should get the curtain (not cart, search, anchors or downloads). */
export function curtainTarget(e: MouseEvent, origin: string, current: string): string | null {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return null;
  const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
  if (!a || a.target === "_blank" || a.hasAttribute("download") || a.dataset.noCurtain !== undefined) return null;
  let url: URL;
  try {
    url = new URL(a.href, origin);
  } catch {
    return null;
  }
  if (url.origin !== origin) return null;
  if (url.pathname === current) return null; // same page (sort, filter, anchors)
  if (url.pathname === "/cart" || url.pathname.startsWith("/search") || url.pathname.startsWith("/api/") || url.pathname === "/account") return null;
  return `${url.pathname}${url.search}${url.hash}`;
}

/**
 * Prototype V2 page transition: an arch-topped Witcha-blue sheet with the logo rises over the page,
 * the route changes underneath, then the sheet lifts away. Skipped under reduced motion.
 */
export function RouteCurtain() {
  const router = useRouter();
  const sheet = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const safety = useRef<number | undefined>(undefined);

  function lift() {
    const el = sheet.current;
    window.clearTimeout(safety.current);
    if (!el || !busy.current) return;
    window.setTimeout(() => {
      const out = el.animate([{ transform: "translateY(-12%)" }, { transform: "translateY(-130%)" }], { duration: OUT_MS, easing: EASE, fill: "forwards" });
      out.onfinish = () => {
        el.getAnimations().forEach((a) => a.cancel());
        busy.current = false;
      };
    }, HOLD_MS);
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (busy.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const href = curtainTarget(e, window.location.origin, window.location.pathname);
      const el = sheet.current;
      if (!href || !el) return;
      // Capture phase: stop the link (and Next's Link handler) so the sheet covers first.
      e.preventDefault();
      e.stopPropagation();
      busy.current = true;
      router.prefetch(href);
      const cover = el.animate([{ transform: "translateY(110%)" }, { transform: "translateY(-12%)" }], { duration: IN_MS, easing: EASE, fill: "forwards" });
      cover.onfinish = () => {
        router.push(href);
        safety.current = window.setTimeout(lift, SAFETY_MS);
      };
    };
    document.addEventListener("click", onClick, true);
    return () => {
      document.removeEventListener("click", onClick, true);
      window.clearTimeout(safety.current);
    };
  }, [router]);

  return (
    <>
      <RouteChange onChange={() => lift()} />
      <div ref={sheet} className={styles.curtain} aria-hidden="true">
        <Logo variant="large" width={200} className={styles.logo} />
      </div>
    </>
  );
}
