"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { useToast } from "@/components/ui/Toast";
import { isEmail } from "@/lib/http/validate";
import styles from "./NewsletterBand.module.css";

export const NEWSLETTER_INPUT_ID = "nl-email";

type Status = "idle" | "loading" | "ok" | "error" | "failed";

/** "Letters from the Academy": one calm band, no pop-ups, no discount. */
export function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const errorId = useId();
  const toast = useToast();

  async function submit(e: FormEvent) {
    e.preventDefault();
    if (!isEmail(email)) {
      setStatus("error");
      return;
    }
    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("ok");
      toast.show("You’re on the list. Look out for a letter.", "success");
    } catch {
      setStatus("failed");
    }
  }

  const invalid = status === "error" || status === "failed";

  return (
    <section className={styles.band} aria-labelledby={`${errorId}-title`}>
      <div className={styles.arches} aria-hidden="true">
        <span className={styles.archSoft} data-reveal="rise" />
        <span className={styles.archIvory} data-reveal="rise" data-delay="150" />
      </div>
      <div className={`container ${styles.inner}`}>
        <div className={styles.copy}>
          <span className="label" data-reveal="up">
            Letters from the Academy
          </span>
          <h2 id={`${errorId}-title`} className="heading-1" data-reveal="up">
            New teas, artwork reveals and restock alerts.
          </h2>
          <p data-reveal="up">A few letters a season. No pop-ups, no countdowns.</p>
          {status === "ok" ? (
            <div className={styles.success} role="status">
              <Icon name="check" size={28} />
              <div>
                <p className="heading-3">You’re on the list.</p>
                <p className="body-small">Look out for a letter from the Academy.</p>
              </div>
            </div>
          ) : (
            <form className={styles.form} onSubmit={submit} noValidate data-reveal="up">
              <label htmlFor={NEWSLETTER_INPUT_ID} className={styles.label}>
                Email
              </label>
              <div className={styles.row}>
                <input
                  id={NEWSLETTER_INPUT_ID}
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (status !== "loading") setStatus("idle");
                  }}
                  aria-invalid={invalid || undefined}
                  aria-describedby={invalid ? errorId : undefined}
                  className={styles.input}
                />
                <button type="submit" className={`${styles.submit} on-primary`} aria-busy={status === "loading" || undefined}>
                  {status === "loading" ? <span className={styles.spinner} aria-hidden="true" /> : "Subscribe"}
                  {status === "loading" ? <span className="visually-hidden">Subscribing</span> : null}
                </button>
              </div>
              {invalid ? (
                <p id={errorId} className={styles.error}>
                  <Icon name="alert" size={18} />
                  <span>
                    {status === "error"
                      ? "Check the email address, e.g. name@example.com."
                      : "We couldn’t sign you up just now. Please try again in a moment."}
                  </span>
                </p>
              ) : null}
              <p className="body-small">
                Unsubscribe any time. Read our{" "}
                <Link href="/policies/privacy-policy" className="text-link">
                  Privacy Policy
                </Link>
                .
              </p>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
