export type LogoVariant = "large" | "small" | "small-no-rules";

export const LOGO_MIN_WIDTH: Record<LogoVariant, number> = {
  large: 160,
  small: 100,
  "small-no-rules": 64,
};

const ASPECT: Record<LogoVariant, number> = {
  large: 122.327 / 441.366,
  small: 125.339 / 472.8,
  "small-no-rules": 125.339 / 472.8,
};

const FILES: Record<LogoVariant, string> = {
  large: "/logos/witcha-matcha_large_charcoal.svg",
  small: "/logos/witcha-matcha_small_charcoal.svg",
  "small-no-rules": "/logos/witcha-matcha_small-no-rules_charcoal.svg",
};

/** Clamps a requested width to the brand minimum for the variant. */
export function resolveLogoWidth(variant: LogoVariant, requested: number): number {
  return Math.max(LOGO_MIN_WIDTH[variant], Math.round(requested));
}

type LogoProps = {
  variant?: LogoVariant;
  width?: number;
  className?: string;
};

export function Logo({ variant = "large", width, className }: LogoProps) {
  const w = resolveLogoWidth(variant, width ?? LOGO_MIN_WIDTH[variant]);
  if (process.env.NODE_ENV !== "production" && width !== undefined && width < LOGO_MIN_WIDTH[variant]) {
    console.warn(`Logo "${variant}" requested at ${width}px; brand minimum is ${LOGO_MIN_WIDTH[variant]}px.`);
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand SVG; next/image adds nothing here.
    <img
      src={FILES[variant]}
      alt="WITCHA MATCHA"
      width={w}
      height={Math.round(w * ASPECT[variant])}
      className={className}
    />
  );
}
