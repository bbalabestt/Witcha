"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { requestBackInStock } from "@/lib/cart/actions";
import { cueFamiliar } from "@/lib/familiar";
import styles from "./Pdp.module.css";

/** Sold-out sizes: one email field, never an active Add to cart. */
export function NotifyMe({ variantId, productHandle }: { variantId: string; productHandle: string }) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ kind: "idle" | "loading" | "done" } | { kind: "error"; message: string }>({ kind: "idle" });

  async function submit(e: FormEvent) {
    e.preventDefault();
    setState({ kind: "loading" });
    const r = await requestBackInStock({ email, variantId, productHandle });
    setState(r.ok ? { kind: "done" } : { kind: "error", message: r.error });
    if (r.ok) cueFamiliar({ say: "I’ll keep watch.", ms: 2000 });
  }

  if (state.kind === "done") {
    return (
      <p className={styles.notified} role="status">
        <Icon name="check" size={20} />
        We’ll email you when this size is back.
      </p>
    );
  }

  return (
    <form id="notify" className={styles.notify} onSubmit={submit} noValidate>
      <div className={styles.notifyRow}>
        <label className="visually-hidden" htmlFor="notify-email">
          Email for restock alert
        </label>
        <input
          id="notify-email"
          type="email"
          autoComplete="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={state.kind === "error" || undefined}
          aria-describedby={state.kind === "error" ? "notify-error" : undefined}
          className={styles.notifyInput}
        />
        <Button type="submit" size="xl" status={state.kind === "loading" ? "loading" : "idle"} disabled={state.kind === "loading"}>
          Notify me
        </Button>
      </div>
      {state.kind === "error" ? (
        <p id="notify-error" className={styles.error} role="alert">
          <Icon name="alert" size={18} />
          {state.message}
        </p>
      ) : null}
    </form>
  );
}
