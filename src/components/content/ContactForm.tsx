"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Select, TextInput, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import { isEmail } from "@/lib/http/validate";
import styles from "./ContactForm.module.css";

const TOPICS = [
  { value: "order", label: "An order" },
  { value: "tea", label: "Our teas" },
  { value: "gift", label: "Gifts" },
  { value: "other", label: "Something else" },
];

type Errors = Partial<Record<"name" | "email" | "message" | "form", string>>;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [errors, setErrors] = useState<Errors>({});

  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget)) as Record<string, string>;
    const next: Errors = {};
    if (!data.name?.trim()) next.name = "Tell us your name.";
    if (!isEmail(data.email ?? "")) next.email = "Check the email address, e.g. name@example.com.";
    if (!data.message?.trim()) next.message = "Write a short message.";
    setErrors(next);
    if (Object.keys(next).length) return;
    setStatus("sending");
    const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }).catch(() => null);
    if (!res?.ok) {
      setStatus("idle");
      setErrors({ form: "Your message didn’t send. Please try again, or email us directly." });
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <p role="status" className={styles.sent}>
        <Icon name="check" size={28} />
        Thank you. We’ll reply by email soon.
      </p>
    );
  }

  return (
    <form onSubmit={submit} noValidate className={styles.form}>
      <TextInput name="name" label="Name" autoComplete="name" error={errors.name} />
      <TextInput name="email" type="email" label="Email" autoComplete="email" error={errors.email} />
      <TextInput name="orderNumber" label="Order number (optional)" />
      <Select name="topic" label="Topic" options={TOPICS} defaultValue="order" />
      <Textarea name="message" label="Message" rows={5} error={errors.message} />
      {errors.form ? (
        <p role="alert" className={styles.error}>
          <Icon name="alert" size={18} />
          {errors.form}
        </p>
      ) : null}
      <div>
        <Button type="submit" size="xl" status={status === "sending" ? "loading" : "idle"} disabled={status === "sending"}>
          Send message
        </Button>
      </div>
    </form>
  );
}
