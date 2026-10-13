import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import styles from "./Header.module.css";

/** Header cart control. The drawer opener replaces the link in M6; the link stays as the no-JS fallback. */
export function CartButton({ count }: { count: number }) {
  const label = count > 0 ? `Cart, ${count} ${count === 1 ? "item" : "items"}` : "Cart, empty";
  return (
    <Link href="/cart" className={styles.iconLink} aria-label={label}>
      <Icon name="cart" />
      {count > 0 ? (
        <span className={styles.count} aria-hidden="true">
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </Link>
  );
}
