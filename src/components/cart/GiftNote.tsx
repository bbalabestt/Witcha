"use client";

import { useEffect, useRef, useState } from "react";
import { Checkbox, Textarea } from "@/components/ui/Field";
import { Icon } from "@/components/ui/Icon";
import type { CartAttributes } from "@/lib/data/types";
import { useCart } from "./CartProvider";
import styles from "./Cart.module.css";

const MAX = 150;
const SAVE_AFTER_MS = 700;

/** "This is a gift" + 150-character note, saved to cart attributes `gift` / `gift_note`. */
export function GiftNote({ attributes }: { attributes: CartAttributes }) {
  const { setAttributes } = useCart();
  const [note, setNote] = useState(attributes.giftNote);
  const [editing, setEditing] = useState(false);
  const saved = useRef(attributes.giftNote);
  const timer = useRef<number | undefined>(undefined);

  // Adopt the server value when it changes elsewhere (another tab, a reload), never mid-typing.
  const [seen, setSeen] = useState(attributes.giftNote);
  if (seen !== attributes.giftNote && !editing) {
    setSeen(attributes.giftNote);
    setNote(attributes.giftNote);
  }

  useEffect(() => () => window.clearTimeout(timer.current), []);

  function save(next: string) {
    window.clearTimeout(timer.current);
    if (next === saved.current) return;
    saved.current = next;
    void setAttributes({ gift: true, giftNote: next });
  }

  return (
    <div className={styles.gift}>
      <Checkbox
        checked={attributes.gift}
        onChange={(e) => {
          window.clearTimeout(timer.current);
          saved.current = e.target.checked ? note : "";
          void setAttributes({ gift: e.target.checked, giftNote: e.target.checked ? note : "" });
        }}
      >
        <span className={styles.giftLabel}>
          <Icon name="gift" size={20} />
          This is a gift
        </span>
      </Checkbox>
      {attributes.gift ? (
        <Textarea
          label="Gift note"
          rows={3}
          maxLength={MAX}
          value={note}
          aside={`${note.length} / ${MAX}`}
          hint="No prices on the packing slip."
          onChange={(e) => {
            const v = e.target.value.slice(0, MAX);
            setNote(v);
            window.clearTimeout(timer.current);
            timer.current = window.setTimeout(() => save(v), SAVE_AFTER_MS);
          }}
          onFocus={() => setEditing(true)}
          onBlur={() => {
            setEditing(false);
            save(note);
          }}
        />
      ) : null}
    </div>
  );
}
