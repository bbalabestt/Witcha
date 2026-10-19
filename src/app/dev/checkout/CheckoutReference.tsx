"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { addMoney, formatMoney, zeroMoney } from "@/lib/data/money";
import type { Cart, SiteSettings } from "@/lib/data/types";
import { completeReferenceOrder } from "./actions";
import styles from "./checkout.module.css";

type Order = { no: string; lines: Array<{ qty: number; title: string; size: string }>; total: string; gift: string };

function orderNumber(): string {
  return `#WM${1000 + Math.floor(Math.random() * 900)}`;
}

export function CheckoutReference({ cart, settings }: { cart: Cart | null; settings: SiteSettings }) {
  const [ship, setShip] = useState<"standard" | "express">("standard");
  const [order, setOrder] = useState<Order | null>(null);
  const subtotal = cart?.subtotal ?? zeroMoney(true);
  const free = subtotal.amount >= settings.freeShippingThreshold.amount;
  const shipping = ship === "express" ? settings.expressShipping : free ? zeroMoney(subtotal.placeholder) : settings.standardShipping;
  const total = addMoney(subtotal, shipping);

  return (
    <div className={styles.page}>
      <div className={styles.banner}>Shopify-hosted · layout not custom · brand settings only</div>
      <header className={styles.header}>
        <Link href="/" aria-label="WITCHA MATCHA home">
          <Logo variant="small" width={120} />
        </Link>
        <Link href="/cart" aria-label="Back to cart" className={styles.iconLink}>
          <Icon name="cart" />
        </Link>
      </header>

      {order ? (
        <section className={styles.confirm}>
          <div className={styles.confirmHead}>
            <span className={styles.check}>
              <Icon name="check" size={28} />
            </span>
            <div>
              <span className="body-small">Order {order.no}</span>
              <h1 className="heading-1">Thank you. The Academy is packing your tea.</h1>
            </div>
          </div>
          <ol className={styles.next}>
            <li>
              <Icon name="sealed" />
              <b className="label">1 · Dispatch</b>
              <span className="body-small">
                Within {settings.dispatchDays} business days from {settings.dispatchCity}.
              </span>
            </li>
            <li>
              <Icon name="mail" />
              <b className="label">2 · Tracking</b>
              <span className="body-small">We email a tracking link the day it leaves.</span>
            </li>
            <li>
              <Icon name="truck" />
              <b className="label">3 · Arrives</b>
              <span className="body-small">About {settings.deliveryDays} business days, metro.</span>
            </li>
          </ol>
          <div className={styles.orderSummary}>
            <span className="label">Order summary</span>
            {order.lines.map((l, i) => (
              <span key={i} className="body-small">
                {l.qty} × {l.title} {l.size ? `· ${l.size}` : ""}
              </span>
            ))}
            <div className={styles.paid}>
              <span>Total paid</span>
              <span>{order.total}</span>
            </div>
            {order.gift ? (
              <p className={`body-small ${styles.giftLine}`}>
                <Icon name="gift" size={20} />
                Gift note: “{order.gift}” · no prices on the slip
              </p>
            ) : null}
          </div>
          <div className={styles.actions}>
            <Link href="/blogs/brewing-guides" className={`${styles.primary} on-primary`}>
              Make it at home
            </Link>
            <span className={styles.secondary}>Create an account (optional)</span>
          </div>
        </section>
      ) : (
        <section className={styles.grid}>
          <div className={styles.form}>
            <div className={styles.group}>
              <span className={styles.center}>Express checkout</span>
              <div className={styles.express}>
                <span>Shop Pay</span>
                <span>Apple Pay</span>
                <span>PayPal</span>
              </div>
            </div>
            <div className={styles.group}>
              <h2 className="heading-3">Contact</h2>
              <input className={styles.input} placeholder="Email" aria-label="Email" type="email" />
              <label className={styles.tick}>
                <input type="checkbox" />
                Email me with news and offers
              </label>
            </div>
            <div className={styles.group}>
              <h2 className="heading-3">Delivery</h2>
              <select className={styles.input} aria-label="Country">
                <option>Australia</option>
              </select>
              <input className={styles.input} placeholder="Address" aria-label="Address" />
              <div className={styles.three}>
                <input className={styles.input} placeholder="Suburb" aria-label="Suburb" />
                <input className={styles.input} placeholder="State" aria-label="State" />
                <input className={styles.input} placeholder="Postcode" aria-label="Postcode" />
              </div>
            </div>
            <fieldset className={styles.group}>
              <legend className="heading-3">Shipping method</legend>
              <div className={styles.methods}>
                <label>
                  <input type="radio" name="ship" checked={ship === "standard"} onChange={() => setShip("standard")} />
                  <span>Standard · {settings.deliveryDays} business days</span>
                  <b>{free ? "Free" : formatMoney(settings.standardShipping)}</b>
                </label>
                <label>
                  <input type="radio" name="ship" checked={ship === "express"} onChange={() => setShip("express")} />
                  <span>Express · {settings.expressDays} business days</span>
                  <b>{formatMoney(settings.expressShipping)}</b>
                </label>
              </div>
            </fieldset>
            <div className={styles.group}>
              <h2 className="heading-3">Payment</h2>
              <p className={`body-small ${styles.secure}`}>
                <Icon name="lock" size={18} />
                All transactions are secure and encrypted.
              </p>
              <input className={styles.input} placeholder="Card number" aria-label="Card number" />
              <div className={styles.two}>
                <input className={styles.input} placeholder="Expiry (MM / YY)" aria-label="Expiry" />
                <input className={styles.input} placeholder="Security code" aria-label="Security code" />
              </div>
              <p className="body-small">Also: Apple Pay · Google Pay · Shop Pay · PayPal · Afterpay</p>
            </div>
            <button
              type="button"
              className={`${styles.pay} on-primary`}
              disabled={!cart || cart.lines.length === 0}
              onClick={async () => {
                if (!cart) return;
                setOrder({
                  no: orderNumber(),
                  lines: cart.lines.map((l) => ({ qty: l.quantity, title: l.product.title, size: l.variant.title })),
                  total: formatMoney(total),
                  gift: cart.gift ? cart.giftNote || "(no message)" : "",
                });
                await completeReferenceOrder();
              }}
            >
              Pay now · {formatMoney(total)}
            </button>
          </div>
          <aside className={styles.summary}>
            <div className={styles.summaryInner}>
              {cart && cart.lines.length ? (
                cart.lines.map((l) => (
                  <div key={l.id} className={styles.line}>
                    <span className={styles.thumb}>
                      {l.product.tin ? <Image src={l.product.tin.url} alt="" fill sizes="64px" className={styles.contain} /> : null}
                      <span className={styles.qty}>{l.quantity}</span>
                    </span>
                    <span className={styles.lineText}>
                      <b>{l.product.title}</b>
                      <span>{l.variant.title}</span>
                    </span>
                    <span className="body-small">{formatMoney(l.cost)}</span>
                  </div>
                ))
              ) : (
                <p className="body-small">
                  Your cart is empty.{" "}
                  <Link href="/collections/matcha" className="text-link">
                    Shop matcha
                  </Link>
                </p>
              )}
              <div className={styles.discount}>
                <input className={styles.input} placeholder="Discount code" aria-label="Discount code" />
                <span>Apply</span>
              </div>
              <div className={styles.row}>
                <span>Subtotal</span>
                <span>{formatMoney(subtotal)}</span>
              </div>
              <div className={styles.row}>
                <span>Shipping</span>
                <span>{shipping.amount === 0 ? "Free" : formatMoney(shipping)}</span>
              </div>
              <div className={styles.total}>
                <span>Total</span>
                <span>
                  <small>AUD</small> {formatMoney(total)}
                </span>
              </div>
              <p className="body-small">
                Including GST. Reference frame: layout is Shopify’s; we set logo, colours, button style, 4 px radius and fonts where the plan allows.
              </p>
            </div>
          </aside>
        </section>
      )}
    </div>
  );
}
