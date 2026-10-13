"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import styles from "./NewsletterBand.module.css";

type State = { kind: "idle" } | { kind: "loading" } | { kind: "error"; message: string } | { kind: "ok" };

export const NEWSLETTER_EMAIL_ID = "nl-email";
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<State>({ kind: "idle" });

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setState({ kind: "error", message: "Check the email address, e.g. name@example.com." });
      return;
    }
    setState({ kind: "loading" });
    const company = new FormData(e.currentTarget).get("company");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), source: "newsletter-band", company }),
      });
      if (res.ok) {
        setState({ kind: "ok" });
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setState({ kind: "error", message: body.error ?? "We couldn’t sign you up just now. Try again in a moment." });
    } catch {
      setState({ kind: "error", message: "No connection. Check your internet and try again." });
    }
  }

  if (state.kind === "ok") {
    return (
      <div className={styles.ok} role="status">
        <Icon name="check" size={28} />
        <div>
          <p className="heading-3">You’re on the list.</p>
          <p className={styles.small}>Look out for a letter from the Academy.</p>
        </div>
      </div>
    );
  }

  const error = state.kind === "error" ? state.message : null;
  return (
    <form className={styles.form} onSubmit={onSubmit} noValidate>
      <label htmlFor={NEWSLETTER_EMAIL_ID} className={styles.label}>
        Email
      </label>
      <div className={styles.row}>
        <input
          id={NEWSLETTER_EMAIL_ID}
          type="email"
          name="email"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (state.kind === "error") setState({ kind: "idle" });
          }}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? "nl-error" : "nl-hint"}
          className={[styles.input, error ? styles.invalid : undefined].filter(Boolean).join(" ")}
        />
        {/* Honeypot, hidden from people and assistive tech. */}
        <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className={styles.honeypot} />
        <Button type="submit" size="xl" status={state.kind === "loading" ? "loading" : "idle"} disabled={state.kind === "loading"} className={styles.submit}>
          {state.kind === "loading" ? <span className="visually-hidden">Subscribing</span> : "Subscribe"}
        </Button>
      </div>
      {error ? (
        <p id="nl-error" className={styles.error} role="alert">
          <Icon name="alert" size={18} />
          <span>{error}</span>
        </p>
      ) : null}
      <p id="nl-hint" className={styles.small}>
        Unsubscribe any time. Read our <Link href="/policies/privacy-policy">Privacy Policy</Link>.
      </p>
    </form>
  );
}
