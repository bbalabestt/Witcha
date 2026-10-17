"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { motionAllowed } from "./runtime";
import styles from "./RouteCurtain.module.css";

const RISE_MS = 520;
const HOLD_MS = 140;
const LIFT_MS = 620;
const EASE = "cubic-bezier(.7,0,.2,1)";

/** Routes that open in place and never get the curtain (V4 1.6). */
const SKIP = [/^\/cart$/, /^\/search/, /^\/account/, /^\/api\//, /^\/dev\//];

/**
 * Arch curtain in the brand surface between pages: rise 520 ms, hold 140 ms, lift 620 ms. Skipped for cart, search and
 * account, links inside an open dialog, same-page and modified or new-tab clicks; never shown under reduced motion.
 */
export function RouteCurtain() {
  const router = useRouter();
  const pathname = usePathname();
  const ref = useRef<HTMLDivElement>(null);
  const pending = useRef<string | null>(null);
  const busy = useRef(false);
  const stuck = useRef(0);

  function lift(el: HTMLDivElement) {
    window.clearTimeout(stuck.current);
    el.animate([{ transform: "translateY(-12%)" }, { transform: "translateY(-130%)" }], { duration: LIFT_MS, easing: EASE, fill: "forwards" }).onfinish = () => {
      el.getAnimations().forEach((a) => a.cancel());
      busy.current = false;
      pending.current = null;
    };
  }

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      if (busy.current || !motionAllowed()) return;
      const a = (e.target as Element | null)?.closest?.("a");
      if (!a || a.target === "_blank" || a.hasAttribute("download") || a.closest("dialog[open]")) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      if (SKIP.some((re) => re.test(url.pathname))) return;
      const el = ref.current;
      if (!el) return;

      e.preventDefault();
      busy.current = true;
      pending.current = url.pathname;
      el.animate([{ transform: "translateY(110%)" }, { transform: "translateY(-12%)" }], { duration: RISE_MS, easing: EASE, fill: "forwards" }).onfinish = () => {
        router.push(url.pathname + url.search + url.hash);
        // If the navigation never lands (offline, error), lift anyway so the page is never covered.
        stuck.current = window.setTimeout(() => lift(el), 4000);
      };
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [router]);

  // Lift once the new route has rendered.
  useEffect(() => {
    const el = ref.current;
    if (!el || !busy.current || pending.current !== pathname) return;
    window.scrollTo({ top: 0, behavior: "auto" });
    const t = window.setTimeout(() => lift(el), HOLD_MS);
    return () => window.clearTimeout(t);
  }, [pathname]);

  return (
    <div ref={ref} className={styles.curtain} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- supplied logo SVG on the curtain */}
      <img src="/logos/witcha-matcha_large_blue.svg" alt="" width={200} height={55} className={styles.logo} />
    </div>
  );
}
