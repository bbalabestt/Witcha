"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motionAllowed, onFrame } from "./runtime";

/**
 * Running text that speeds up (and leans slightly) with scroll velocity. The content is rendered twice for a
 * seamless loop; the copy is hidden from assistive technology. Static under reduced motion.
 */
export function Marquee({
  children,
  direction = 1,
  skew = true,
  speed = 0.7,
  paused = false,
  className,
}: {
  children: ReactNode;
  direction?: 1 | -1;
  skew?: boolean;
  speed?: number;
  paused?: boolean;
  className?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const held = useRef(paused);

  useEffect(() => {
    held.current = paused;
  }, [paused]);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let offset = 0;
    return onFrame(({ velocity }) => {
      if (!motionAllowed() || held.current) return;
      const half = el.scrollWidth / 2 || 1;
      offset = (((offset + (speed + Math.min(14, Math.abs(velocity) * 0.35)) * direction) % half) + half) % half;
      const lean = skew ? Math.max(-10, Math.min(10, velocity * 0.4)) * -direction : 0;
      el.style.transform = `translateX(${(direction > 0 ? -offset : offset - half).toFixed(1)}px) skewX(${lean.toFixed(2)}deg)`;
    });
  }, [direction, skew, speed]);

  return (
    <div ref={track} className={className} style={{ display: "flex", width: "max-content", willChange: "transform" }}>
      <div style={{ display: "flex", flex: "none" }}>{children}</div>
      <div style={{ display: "flex", flex: "none" }} aria-hidden="true">
        {children}
      </div>
    </div>
  );
}
