import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const tokens = JSON.parse(
  readFileSync(path.join(root, "witcha-matcha-brand-ci/tokens.json"), "utf8")
);

function resolveValue(value, colorMap) {
  const ref = /^\{(.+)\}$/.exec(value);
  return ref ? colorMap[ref[1]] ?? value : value;
}

const colorMap = {};
for (const t of tokens.color.tokens) colorMap[t.name] = t.value;

const lines = [":root {"];
for (const t of tokens.color.tokens) {
  lines.push(`  --${t.name}: ${resolveValue(t.value, colorMap)};`);
}
for (const t of tokens.spacing.tokens) {
  lines.push(`  --${t.name}: ${t.value};`);
}
for (const t of tokens.radius.tokens) {
  lines.push(`  --${t.name}: ${t.value};`);
}
// Values used by the prototype that tokens.json lacks. Logged in docs/DEVIATIONS.md (D-03).
const extensions = {
  "action-primary-hover": "#1f4560",
  "action-primary-active": "#183850",
  "feedback-error": "#9c3b2e",
  "surface-overlay": "rgba(42, 86, 116, 0.4)",
  "line-muted": "rgba(42, 86, 116, 0.55)",
  "line-on-dark": "rgba(250, 246, 238, 0.5)",
  "opacity-disabled": "0.35",
  "ease-out": "cubic-bezier(0.2, 0.7, 0.2, 1)",
  "duration-drawer": "220ms",
  "duration-reveal": "820ms",
  "gutter": "clamp(16px, 4.4vw, 64px)",
  "content-max": "1440px",
  "touch-target": "44px",
};
for (const [name, value] of Object.entries(extensions)) lines.push(`  --${name}: ${value};`);
// next/font/local exposes hashed families via these variables (see src/app/fonts.ts).
lines.push(`  --font-display: var(--wm-font-display), ${tokens.type.families.display};`);
lines.push(`  --font-serif: var(--wm-font-serif), ${tokens.type.families.serif};`);
lines.push(`  --font-sans: var(--wm-font-sans), ${tokens.type.families.sans};`);
lines.push("}", "");

// Prototype V4 theme layer (docs/DEVIATIONS.md D-13): the V4 defaults are a Midnight primary and the Cream
// surface, with Witcha blue moved to the secondary fill. Every semantic colour derives from --wm-primary so
// a different primary from the V4 board is one variable. `data-surface="teal"` restores the brand-CI surfaces.
const theme = {
  root: {
    "wm-primary": "#23395b",
    "text-primary": "var(--wm-primary)",
    "action-primary": "var(--wm-primary)",
    "line-control": "var(--wm-primary)",
    "action-primary-hover": "color-mix(in srgb, var(--wm-primary) 76%, #000)",
    "action-primary-active": "color-mix(in srgb, var(--wm-primary) 64%, #000)",
    "line-hairline": "color-mix(in srgb, var(--wm-primary) 25%, transparent)",
    "line-muted": "color-mix(in srgb, var(--wm-primary) 55%, transparent)",
    "surface-overlay": "color-mix(in srgb, var(--wm-primary) 40%, transparent)",
    "surface-overlay-strong": "color-mix(in srgb, var(--wm-primary) 62%, transparent)",
    "surface-inverse": "var(--wm-primary)",
    "surface-page": "#fffdf8",
    "surface-brand": "#f6f0e4",
    "surface-soft": "#fbf7ef",
    "surface-card": "#ffffff",
    "surface-muted": "#f6f0e4",
    "surface-blush": "#f2d6cf",
    "surface-hover": "var(--brand-witcha-blue)",
    "action-secondary-fill": "var(--brand-witcha-blue)",
    "text-unread": "#658399",
    "foam-dark": "#3f5c17",
    "foam-mid": "#5f7f26",
    "foam-light": "#7e9b3a",
    "foam-bubble": "#a9bf6a",
    "foam-bubble-line": "#6e8b30",
    "foam-swirl-1": "#c9d98f",
    "foam-swirl-2": "#b3c878",
    "foam-swirl-3": "#9fb765",
  },
  teal: {
    "surface-page": "var(--brand-ivory)",
    "surface-brand": "var(--brand-witcha-blue)",
    "surface-soft": "var(--brand-aqua-light)",
    "surface-muted": "#f3f0e8",
    "surface-blush": "var(--brand-blush)",
    "action-secondary-fill": "transparent",
  },
};
lines.push(":root {");
for (const [name, value] of Object.entries(theme.root)) lines.push(`  --${name}: ${value};`);
lines.push("}", "");
lines.push(':root[data-surface="teal"] {');
for (const [name, value] of Object.entries(theme.teal)) lines.push(`  --${name}: ${value};`);
lines.push("}", "");

const mobileOverrides = {
  "display-xl": "44px",
  "heading-1": "34px",
};

for (const group of tokens.type.groups) {
  for (const style of group.styles) {
    const family =
      style.family === "serif"
        ? "var(--font-serif)"
        : style.family === "display"
          ? "var(--font-display)"
          : group.family === "display"
            ? "var(--font-display)"
            : "var(--font-sans)";
    lines.push(`.${style.name} {`);
    lines.push(`  font-family: ${family};`);
    lines.push(`  font-size: ${style.fontSize};`);
    lines.push(`  line-height: ${style.lineHeight};`);
    lines.push(`  font-weight: ${style.fontWeight};`);
    if (style.letterSpacing) lines.push(`  letter-spacing: ${style.letterSpacing};`);
    if (style.fontStyle) lines.push(`  font-style: ${style.fontStyle};`);
    if (style.name === "label") lines.push(`  text-transform: uppercase;`);
    lines.push("}");
    if (mobileOverrides[style.name]) {
      lines.push(`@media (max-width: 767px) {`);
      lines.push(`  .${style.name} { font-size: ${mobileOverrides[style.name]}; }`);
      lines.push(`}`);
    }
  }
}

mkdirSync(path.join(root, "src/styles"), { recursive: true });
writeFileSync(path.join(root, "src/styles/tokens.css"), lines.join("\n") + "\n");
console.log("Wrote src/styles/tokens.css");
