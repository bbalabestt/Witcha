import { Icon } from "@/components/ui/Icon";
import type { StockState } from "@/lib/data/product";
import styles from "./StockNotice.module.css";

/** Driven by `stockState()`, the same function that decides whether Add to cart shows. */
export function StockNotice({ state, size }: { state: StockState; size: string }) {
  return (
    <p className={styles.notice} role="status">
      {state.kind === "in-stock" ? (
        <>
          <Icon name="check" size={20} />
          <span>
            <b>In stock.</b> Ready to dispatch.
          </span>
        </>
      ) : state.kind === "low" ? (
        <>
          <Icon name="info" size={20} />
          <b>
            Only {state.remaining} left in {size}.
          </b>
        </>
      ) : (
        <>
          <Icon name="info" size={20} />
          <span>
            <b>Sold out in {size}.</b> Leave your email and we’ll tell you when it’s back.
          </span>
        </>
      )}
    </p>
  );
}
