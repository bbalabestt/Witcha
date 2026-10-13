import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { formatMoney } from "@/lib/data/money";
import type { SiteSettings } from "@/lib/data/types";
import styles from "./ShippingPromise.module.css";

/**
 * One source of truth for dispatch, delivery, free-shipping and returns copy (site settings), used on
 * the PDP, cart and Shipping & Returns page so they can never contradict each other.
 */
export function shippingPromise(s: SiteSettings) {
  return {
    dispatch: { lead: `Dispatched within ${s.dispatchDays} business days`, rest: ` from ${s.dispatchCity}.` },
    delivery: `Arrives in about ${s.deliveryDays} business days in metro Australia.`,
    free: `Free shipping over ${formatMoney(s.freeShippingThreshold)}. Otherwise ${formatMoney(s.standardShipping)}.`,
    returns: `Unopened tins can be returned within ${s.returnsDays} days.`,
    trio: {
      dispatch: `Within ${s.dispatchDays} business days from ${s.dispatchCity}.`,
      delivery: `About ${s.deliveryDays} business days, metro Australia. Free over ${formatMoney(s.freeShippingThreshold)}.`,
      returns: `Unopened tins within ${s.returnsDays} days.`,
    },
  };
}

export function ShippingPromise({ settings, variant = "panel" }: { settings: SiteSettings; variant?: "panel" | "trio" }) {
  const p = shippingPromise(settings);
  if (variant === "trio") {
    const items: Array<[IconName, string, string]> = [
      ["truck", "Dispatch", p.trio.dispatch],
      ["clock", "Delivery", p.trio.delivery],
      ["return", "Returns", p.trio.returns],
    ];
    return (
      <section className={styles.trioBand} aria-label="Shipping and returns">
        <ul className={styles.trio}>
          {items.map(([icon, title, text]) => (
            <li key={title}>
              <Icon name={icon} />
              <span className="label">{title}</span>
              <span>{text}</span>
            </li>
          ))}
        </ul>
      </section>
    );
  }
  return (
    <ul className={styles.panel} aria-label="Shipping and returns">
      <li>
        <Icon name="truck" size={20} />
        <span>
          <b>{p.dispatch.lead}</b>
          {p.dispatch.rest}
        </span>
      </li>
      <li>
        <Icon name="clock" size={20} />
        <span>{p.delivery}</span>
      </li>
      <li>
        <Icon name="gift" size={20} />
        <span>{p.free}</span>
      </li>
      <li>
        <Icon name="return" size={20} />
        <span>
          {p.returns} <Link href="/pages/shipping-returns">Shipping &amp; Returns</Link>
        </span>
      </li>
    </ul>
  );
}
