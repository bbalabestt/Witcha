import { NEWSLETTER_INPUT_ID } from "@/components/layout/NewsletterBand";
import { motionAllowed } from "@/components/motion/runtime";

/** "Get the letter": scroll to the newsletter email field and focus it. */
export function focusNewsletter() {
  const el = document.getElementById(NEWSLETTER_INPUT_ID);
  if (!el) return;
  window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 200, behavior: motionAllowed() ? "smooth" : "auto" });
  window.setTimeout(() => el.focus({ preventScroll: true }), motionAllowed() ? 700 : 0);
}
