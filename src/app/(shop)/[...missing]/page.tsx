import { notFound } from "next/navigation";

/** Always 404: nothing to validate for instant navigation. */
export const instant = false;

/** Unmatched URLs render the branded not-found page inside the shop layout (header, footer). */
export default function Missing() {
  notFound();
}
