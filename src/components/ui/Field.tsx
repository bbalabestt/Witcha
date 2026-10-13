import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { Icon } from "./Icon";
import styles from "./Field.module.css";

type FieldChrome = {
  label: string;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: string;
  /** Right-aligned text in the label row, e.g. a character counter. */
  aside?: ReactNode;
  className?: string;
};

function describedBy(...ids: Array<string | false | undefined>) {
  const v = ids.filter(Boolean).join(" ");
  return v || undefined;
}

function Chrome({
  id,
  label,
  hideLabel,
  hint,
  error,
  aside,
  className,
  children,
}: FieldChrome & { id: string; children: ReactNode }) {
  return (
    <div className={[styles.field, className].filter(Boolean).join(" ")}>
      <div className={[styles.labelRow, hideLabel ? "visually-hidden" : undefined].filter(Boolean).join(" ")}>
        <label htmlFor={id} className={styles.label}>
          {label}
        </label>
        {aside ? <span className={styles.counter}>{aside}</span> : null}
      </div>
      {children}
      {error ? (
        <p id={`${id}-error`} className={styles.error}>
          <Icon name="alert" size={18} />
          <span>{error}</span>
        </p>
      ) : null}
      {hint ? (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

type TextInputProps = FieldChrome &
  Omit<InputHTMLAttributes<HTMLInputElement>, "className" | "size"> & { size?: "md" | "lg" };

export function TextInput({ label, hideLabel, hint, error, aside, className, size = "md", id, ...rest }: TextInputProps) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <Chrome id={fid} label={label} hideLabel={hideLabel} hint={hint} error={error} aside={aside} className={className}>
      <input
        {...rest}
        id={fid}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(error && `${fid}-error`, hint !== undefined && `${fid}-hint`)}
        className={[styles.control, size === "lg" ? styles.tall : undefined, error ? styles.invalid : undefined].filter(Boolean).join(" ")}
      />
    </Chrome>
  );
}

type TextareaProps = FieldChrome & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "className">;

export function Textarea({ label, hideLabel, hint, error, aside, className, id, rows = 3, ...rest }: TextareaProps) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <Chrome id={fid} label={label} hideLabel={hideLabel} hint={hint} error={error} aside={aside} className={className}>
      <textarea
        {...rest}
        id={fid}
        rows={rows}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(error && `${fid}-error`, hint !== undefined && `${fid}-hint`)}
        className={[styles.control, styles.textarea, error ? styles.invalid : undefined].filter(Boolean).join(" ")}
      />
    </Chrome>
  );
}

type SelectProps = FieldChrome &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, "className"> & { options: Array<{ value: string; label: string }> };

export function Select({ label, hideLabel, hint, error, aside, className, id, options, ...rest }: SelectProps) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <Chrome id={fid} label={label} hideLabel={hideLabel} hint={hint} error={error} aside={aside} className={className}>
      <span className={styles.selectWrap}>
        <select
          {...rest}
          id={fid}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(error && `${fid}-error`, hint !== undefined && `${fid}-hint`)}
          className={[styles.control, styles.select, error ? styles.invalid : undefined].filter(Boolean).join(" ")}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <span className={styles.selectIcon}>
          <Icon name="chevron-down" size={20} />
        </span>
      </span>
    </Chrome>
  );
}

type CheckboxProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "className" | "children"> & {
  children: ReactNode;
  className?: string;
};

/** Never pre-ticked by default: callers must pass `defaultChecked`/`checked` explicitly. */
export function Checkbox({ children, className, ...rest }: CheckboxProps) {
  return (
    <label className={[styles.checkbox, className].filter(Boolean).join(" ")}>
      <input {...rest} type="checkbox" className={styles.checkboxInput} />
      <span className={styles.box} aria-hidden="true">
        <Icon name="check" size={14} strokeWidth={2} />
      </span>
      <span>{children}</span>
    </label>
  );
}
