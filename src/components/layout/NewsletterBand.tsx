"use client";

import Link from "next/link";
import { useId, useState, type FormEvent } from "react";
import { Icon } from "@/components/ui/Icon";
import { LIVE } from "@/lib/config/launch";
import { isEmail } from "@/lib/http/validate";
import styles from "./NewsletterBand.module.css";

type Status = "idle" | "loading" | "ok" | "error" | "failed";

/** "Keep in the loop." Live only once sign-ups save to Shopify with consent and the Privacy Policy is published. */
export function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const id = useId();

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
    } catch {
      setStatus("failed");
    }
  }

  const invalid = status === "error" || status === "failed";

  return (
    <section className={styles.band} aria-labelledby={`${id}-title`}>
      <div className={`container ${styles.inner}`}>
        <h2 id={`${id}-title`} className="heading-2">
          Keep in the loop.
        </h2>
        <p>New teas, recipes and news from the Academy, straight to your inbox.</p>
        {status === "ok" ? (
          <p className={styles.success} role="status">
            You’re on the list. Welcome to the Academy.
          </p>
        ) : (
          <form className={styles.form} onSubmit={submit} noValidate>
            <label htmlFor={`${id}-email`} className="visually-hidden">
              Email address
            </label>
            <div className={styles.row}>
              <input
                id={`${id}-email`}
                type="email"
                autoComplete="email"
                placeholder="Email address"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (status !== "loading") setStatus("idle");
                }}
                aria-invalid={invalid || undefined}
                aria-describedby={invalid ? `${id}-error` : undefined}
                className={styles.input}
              />
              <button type="submit" className={`${styles.submit} on-primary`} aria-busy={status === "loading" || undefined}>
                Sign me up
              </button>
            </div>
            {invalid ? (
              <p id={`${id}-error`} className={styles.error}>
                <Icon name="alert" size={18} />
                <span>{status === "error" ? "Enter an email address." : "We couldn’t sign you up just now. Please try again in a moment."}</span>
              </p>
            ) : null}
            <p className="body-small">
              By signing up, you agree to receive news and marketing emails from WITCHA MATCHA. Unsubscribe at any time. See our{" "}
              {LIVE.policies ? (
                <Link href="/policies/privacy-policy" className="text-link">
                  Privacy Policy
                </Link>
              ) : (
                "Privacy Policy"
              )}
              .
            </p>
          </form>
        )}
      </div>
    </section>
  );
}
