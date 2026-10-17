"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { holdHidden, isHeld, markSeen, motionAllowed, playReveal, release, startAmbient } from "./runtime";

/**
 * Scans the page for `data-reveal` and ambient-motion attributes after each navigation. Server components stay
 * plain markup; this one island animates them. Under reduced motion it does nothing, so everything is static.
 */
export function MotionRuntime() {
  const pathname = usePathname();

  useEffect(() => {
    if (!motionAllowed()) return;
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((en) => {
          if (!en.isIntersecting) return;
          playReveal(en.target as HTMLElement);
          io.unobserve(en.target);
        }),
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" },
    );

    const scan = () => {
      startAmbient(document);
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (!markSeen(el)) return;
        if (el.closest("dialog") || el.dataset.reveal === "manual") return;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          playReveal(el);
          return;
        }
        holdHidden(el);
        io.observe(el);
      });
    };

    scan();
    // Client islands (filters, tabs, drawers) and streamed sections add markup after the first scan.
    const mo = new MutationObserver(() => scan());
    mo.observe(document.body, { childList: true, subtree: true });
    // Safety net: anything still held but on screen after 1.2 s is shown.
    const safety = window.setInterval(() => {
      document.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el) => {
        if (!isHeld(el)) return;
        const r = el.getBoundingClientRect();
        if (r.top < window.innerHeight && r.bottom > 0) {
          release(el);
          io.unobserve(el);
        }
      });
    }, 1200);

    return () => {
      io.disconnect();
      mo.disconnect();
      window.clearInterval(safety);
    };
  }, [pathname]);

  return null;
}
