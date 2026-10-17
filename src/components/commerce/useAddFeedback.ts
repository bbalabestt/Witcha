"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCart, type LinePreview } from "./CartProvider";

export type AddState = "idle" | "loading" | "added";

/**
 * Adding… → Added ✓ (2 s) → back to the label. The drawer opens 0.6 s after "Added ✓"
 * (changed from the brief's 2 s in V2.1 so the confirmation and the drawer do not compete).
 */
export function useAddFeedback(drawerDelayMs = 600) {
  const { add, setOpen } = useCart();
  const [state, setState] = useState<AddState>("idle");
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  const run = useCallback(
    async (preview: LinePreview, quantity = 1) => {
      if (state !== "idle") return;
      setState("loading");
      const ok = await add(preview, quantity, { openDrawer: false });
      if (!ok) {
        setState("idle");
        return;
      }
      setState("added");
      timers.current.push(
        window.setTimeout(() => setOpen(true), drawerDelayMs),
        window.setTimeout(() => setState("idle"), 2000),
      );
    },
    [add, setOpen, state, drawerDelayMs],
  );

  return { state, run };
}

export function addLabel(state: AddState, idle: string): string {
  return state === "loading" ? "Adding…" : state === "added" ? "Added ✓" : idle;
}
