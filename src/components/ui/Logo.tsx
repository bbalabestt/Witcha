export type LogoVariant = "large" | "small" | "small-no-rules";
export type LogoTone = "blue" | "reversed";

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

const FILES: Record<LogoVariant, Record<LogoTone, string>> = {
  large: {
    blue: "/logos/witcha-matcha_large_blue.svg",
    reversed: "/logos/witcha-matcha_large_reversed-ivory-gold.svg",
  },
  small: {
    blue: "/logos/witcha-matcha_small_blue.svg",
    reversed: "/logos/witcha-matcha_small_reversed-ivory-gold.svg",
  },
  "small-no-rules": {
    blue: "/logos/witcha-matcha_small-no-rules_blue.svg",
    reversed: "/logos/witcha-matcha_small-no-rules_reversed-ivory.svg",
  },
};

/** Clamps a requested width to the brand minimum for the variant. */
export function resolveLogoWidth(variant: LogoVariant, requested: number): number {
  return Math.max(LOGO_MIN_WIDTH[variant], Math.round(requested));
}

type LogoProps = {
  variant?: LogoVariant;
  tone?: LogoTone;
  width?: number;
  className?: string;
};

export function Logo({ variant = "large", tone = "blue", width, className }: LogoProps) {
  const w = resolveLogoWidth(variant, width ?? LOGO_MIN_WIDTH[variant]);
  if (process.env.NODE_ENV !== "production" && width !== undefined && width < LOGO_MIN_WIDTH[variant]) {
    console.warn(`Logo "${variant}" requested at ${width}px; brand minimum is ${LOGO_MIN_WIDTH[variant]}px.`);
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- static brand SVG; next/image adds nothing here.
    <img
      src={FILES[variant][tone]}
      alt="WITCHA MATCHA"
      width={w}
      height={Math.round(w * ASPECT[variant])}
      className={className}
    />
  );
}
