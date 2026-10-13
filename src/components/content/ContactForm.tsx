"use client";

import { useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Select, TextInput, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import styles from "./Content.module.css";

const TOPICS = [
  { value: "order", label: "An order" },
  { value: "tea", label: "A tea or how to make it" },
  { value: "gift", label: "A gift" },
  { value: "review", label: "A review of a tea" },
  { value: "other", label: "Something else" },
];

type Errors = Partial<Record<"name" | "email" | "message" | "form", string>>;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContact(v: { name: string; email: string; message: string }): Errors {
  const e: Errors = {};
  if (!v.name.trim()) e.name = "Add your name.";
  if (!EMAIL_RE.test(v.email.trim())) e.email = "Check the email address, e.g. name@example.com.";
  if (v.message.trim().length < 10) e.message = "Tell us a little more (at least 10 characters).";
  return e;
}

export function ContactForm({ topic, product }: { topic: string | null; product: string | null }) {
  const [values, setValues] = useState({
    name: "",
    email: "",
    order: "",
    topic: TOPICS.some((t) => t.value === topic) ? (topic as string) : "order",
    message: product ? `About ${product}: ` : "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");

  const set = (k: keyof typeof values) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const found = validateContact(values);
    setErrors(found);
    if (Object.keys(found).length) {
      const first = e.currentTarget.querySelector<HTMLElement>("[aria-invalid='true']");
      first?.focus();
      return;
    }
    setState("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, company: new FormData(e.currentTarget).get("company") }),
      });
      if (res.ok) {
        setState("sent");
        return;
      }
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      setErrors({ form: body.error ?? "We couldn’t send that just now. Try again in a moment." });
    } catch {
      setErrors({ form: "No connection. Check your internet and try again." });
    }
    setState("idle");
  }

  if (state === "sent") {
    return (
      <div className={styles.formOk} role="status">
        <Icon name="check" size={28} />
        <div>
          <p className="heading-3">Thanks, your message is on its way.</p>
          <p className={styles.small}>We’ll reply to {values.email}.</p>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.form} onSubmit={submit} noValidate>
      <TextInput label="Name" name="name" autoComplete="name" value={values.name} onChange={set("name")} error={errors.name} required />
      <TextInput label="Email" name="email" type="email" autoComplete="email" value={values.email} onChange={set("email")} error={errors.email} required />
      <Select label="What’s it about?" name="topic" value={values.topic} onChange={set("topic")} options={TOPICS} />
      <TextInput label="Order number (optional)" name="order" value={values.order} onChange={set("order")} />
      <Textarea label="Message" name="message" rows={5} value={values.message} onChange={set("message")} error={errors.message} required />
      <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden="true" className="visually-hidden" />
      {errors.form ? (
        <p className={styles.formError} role="alert">
          <Icon name="alert" size={18} />
          {errors.form}
        </p>
      ) : null}
      <div>
        <Button type="submit" status={state === "sending" ? "loading" : "idle"} disabled={state === "sending"}>
          Send message
        </Button>
      </div>
    </form>
  );
}

/** Prefills the topic from `?topic=` (e.g. "Write a review" on a product page). Needs <Suspense>. */
export function ContactFormFromUrl() {
  const params = useSearchParams();
  return <ContactForm topic={params.get("topic")} product={params.get("product")} />;
}
