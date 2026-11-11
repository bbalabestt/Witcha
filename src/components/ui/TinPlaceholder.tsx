import Image from "next/image";
import blackTin from "@/assets/mockups/tin-black.png";
import whiteTin from "@/assets/mockups/tin-white.png";
import type { TeaType } from "@/lib/data/types";
import styles from "./TinPlaceholder.module.css";

/**
 * Stand-in until pack shots exist: a mock-up of the tin with no cat (white for matcha, black for hojicha, as
 * the vendor list specifies), faded so it reads as a placeholder. No caption, no claim. Sits on the slot's
 * cream backdrop, where the final photos will be shot. Rebuilt by `scripts/build-tin-mockups.mjs`.
 * Hovering the surrounding link lifts the tin.
 */
export function TinPlaceholder({ teaType, className }: { teaType: TeaType | null; className?: string }) {
  return (
    <Image
      src={teaType === "hojicha" ? blackTin : whiteTin}
      alt=""
      aria-hidden="true"
      sizes="(max-width: 767px) 50vw, 25vw"
      className={[styles.tin, className].filter(Boolean).join(" ")}
    />
  );
}
