"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { FilterChip } from "@/components/ui/Badge";
import { OptionPillGroup, QuantityStepper, type PillOption } from "@/components/ui/Controls";
import { Dialog, type DialogPlacement } from "@/components/ui/Dialog";
import { Checkbox, Textarea } from "@/components/ui/Field";
import { LoadMore } from "@/components/ui/Navigation";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import styles from "./page.module.css";

const SIZES: PillOption[] = [
  { value: "30g", label: "30 g", sub: "$[48.00]", available: true },
  { value: "100g", label: "100 g", sub: "+$[92.00]", available: false },
];

function Steppers() {
  const [a, setA] = useState(1);
  const [b, setB] = useState(12);
  return (
    <div className={styles.row}>
      <QuantityStepper value={a} max={12} onChange={setA} />
      <QuantityStepper value={b} max={12} onChange={setB} label="Quantity at stock cap" />
      <QuantityStepper value={1} max={3} onChange={() => {}} size="compact" />
      <QuantityStepper value={1} max={3} onChange={() => {}} disabled label="Disabled quantity" />
    </div>
  );
}

function Pills() {
  const [v, setV] = useState("30g");
  return <OptionPillGroup label="Size" options={SIZES} value={v} onChange={setV} />;
}

function Chips() {
  const methods = ["All", "Whisk", "Frother", "Shaker", "Iced"];
  const [active, setActive] = useState("All");
  return (
    <div className={styles.row}>
      {methods.map((m) => (
        <FilterChip key={m} pressed={active === m} onClick={() => setActive(m)}>
          {m}
        </FilterChip>
      ))}
    </div>
  );
}

function GiftNoteDemo() {
  const [on, setOn] = useState(false);
  const [note, setNote] = useState("");
  return (
    <div className={styles.stack}>
      <Checkbox checked={on} onChange={(e) => setOn(e.target.checked)}>
        This is a gift
      </Checkbox>
      {on ? (
        <Textarea
          label="Gift note"
          value={note}
          maxLength={150}
          onChange={(e) => setNote(e.target.value.slice(0, 150))}
          aside={`${note.length} / 150`}
          hint="No prices on the packing slip."
        />
      ) : null}
    </div>
  );
}

function AtcStates() {
  const [status, setStatus] = useState<"idle" | "loading" | "success">("idle");
  function run() {
    if (status !== "idle") return;
    setStatus("loading");
    window.setTimeout(() => {
      setStatus("success");
      window.setTimeout(() => setStatus("idle"), 2000);
    }, 700);
  }
  const label = status === "loading" ? "Adding…" : status === "success" ? "Added" : "Add to cart · $[48.00]";
  return (
    <Button status={status} onClick={run} aria-live="polite">
      {label}
    </Button>
  );
}

function Dialogs() {
  const [open, setOpen] = useState<DialogPlacement | null>(null);
  const placements: DialogPlacement[] = ["right", "left", "top", "center"];
  return (
    <div className={styles.row}>
      {placements.map((p) => (
        <Button key={p} variant="secondary" size="md" onClick={() => setOpen(p)}>
          Open {p}
        </Button>
      ))}
      {placements.map((p) => (
        <Dialog key={p} open={open === p} onClose={() => setOpen(null)} placement={p} title={`Dialog · ${p}`}>
          <div className={styles.dialogBody}>
            <p>Tab stays inside. Esc or the backdrop closes it, and focus returns to the button.</p>
            <Button onClick={() => setOpen(null)}>Done</Button>
          </div>
        </Dialog>
      ))}
    </div>
  );
}

function ToastButtons() {
  const toast = useToast();
  return (
    <div className={styles.row}>
      <Button variant="secondary" size="md" onClick={() => toast.show("Into the cart it goes.", "success")}>
        Success toast
      </Button>
      <Button variant="secondary" size="md" onClick={() => toast.show("Gift note saved.")}>
        Info toast
      </Button>
      <Button
        variant="secondary"
        size="md"
        onClick={() => toast.show("We couldn't update your cart. Check your connection and try again.", "error")}
      >
        Error toast
      </Button>
    </div>
  );
}

function LoadMoreDemo() {
  const [shown, setShown] = useState(12);
  const [loading, setLoading] = useState(false);
  return (
    <LoadMore
      shown={shown}
      total={30}
      loading={loading}
      onLoadMore={() => {
        setLoading(true);
        window.setTimeout(() => {
          setShown((s) => Math.min(30, s + 12));
          setLoading(false);
        }, 600);
      }}
    />
  );
}

export function DevDemos() {
  return (
    <ToastProvider>
      <section className={styles.section}>
        <h2 className="heading-2">Interactive controls</h2>
        <p className="label">Quantity stepper</p>
        <Steppers />
        <p className="label">Option pills</p>
        <Pills />
        <p className="label">Filter chips</p>
        <Chips />
        <p className="label">Gift note (checkbox + counted textarea)</p>
        <GiftNoteDemo />
        <p className="label">Add to cart states</p>
        <AtcStates />
        <p className="label">Dialogs</p>
        <Dialogs />
        <p className="label">Toasts</p>
        <ToastButtons />
        <p className="label">Load more</p>
        <LoadMoreDemo />
      </section>
    </ToastProvider>
  );
}
