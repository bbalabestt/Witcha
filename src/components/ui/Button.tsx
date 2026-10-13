import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";
import { Icon } from "./Icon";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary" | "placeholder" | "link";
export type ButtonSize = "sm" | "md" | "lg" | "xl";
export type ButtonStatus = "idle" | "loading" | "success";

type CommonProps = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  status?: ButtonStatus;
  className?: string;
  children: ReactNode;
};

type AsButton = CommonProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & { href?: undefined };
type AsLink = CommonProps & { href: string; prefetch?: boolean };

export type ButtonProps = AsButton | AsLink;

export function buttonClassName({
  variant = "primary",
  size = "xl",
  fullWidth = false,
  className,
}: Pick<CommonProps, "variant" | "size" | "fullWidth" | "className">): string {
  return [styles.button, styles[variant], variant === "link" ? undefined : styles[size], fullWidth ? styles.full : undefined, className]
    .filter(Boolean)
    .join(" ");
}

function StatusAdornment({ status }: { status: ButtonStatus }) {
  if (status === "loading") return <span className={styles.spinner} aria-hidden="true" />;
  if (status === "success") return <Icon name="check" size={18} strokeWidth={2} />;
  return null;
}

function LinkButton({ href, prefetch, variant, size, fullWidth, className, children }: AsLink) {
  return (
    <Link href={href} prefetch={prefetch} className={buttonClassName({ variant, size, fullWidth, className })}>
      {children}
    </Link>
  );
}

function NativeButton({ variant, size, fullWidth, status = "idle", className, children, type, ...rest }: AsButton) {
  return (
    <button
      {...rest}
      type={type ?? "button"}
      className={buttonClassName({ variant, size, fullWidth, className })}
      aria-busy={status === "loading" || undefined}
    >
      <StatusAdornment status={status} />
      {children}
    </button>
  );
}

export function Button(props: ButtonProps) {
  return props.href !== undefined ? <LinkButton {...props} /> : <NativeButton {...props} />;
}

type IconButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "aria-label"> & {
  label: string;
  children: ReactNode;
  onDark?: boolean;
};

/** 44 × 44 px square control; the label is required because the content is an icon. */
export function IconButton({ label, children, onDark, className, type, ...rest }: IconButtonProps) {
  return (
    <button
      {...rest}
      type={type ?? "button"}
      aria-label={label}
      className={[styles.iconButton, onDark ? styles.onDark : undefined, className].filter(Boolean).join(" ")}
    >
      {children}
    </button>
  );
}
