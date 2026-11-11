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
// Values tokens.json lacks. Colours are colour set v2 only.
const extensions = {
  "action-primary-hover": "#555450",
  "action-primary-active": "#383832",
  "feedback-error": "#8e3328",
  "surface-overlay": "color-mix(in srgb, #383832 40%, transparent)",
  "line-muted": "#555450",
  "line-on-mint": "#383832",
  "tea-matcha": "#648612",
  "tea-hojicha": "#93723c",
  "opacity-disabled": "0.35",
  "ease-out": "cubic-bezier(0.2, 0.7, 0.2, 1)",
  "duration-drawer": "220ms",
  "duration-reveal": "820ms",
  "gutter": "clamp(16px, 4.4vw, 64px)",
  "content-max": "1440px",
  "touch-target": "44px",
  // Control scale (2026-10-19 polish): two heights only, and buttons never hug their label.
  "control-lg": "52px",
  "control-md": "44px",
  "control-min-w-lg": "200px",
  "control-min-w-md": "136px",
  "control-pad-x": "24px",
  "header-height": "76px",
};
for (const [name, value] of Object.entries(extensions)) lines.push(`  --${name}: ${value};`);
// next/font/local exposes hashed families via these variables (see src/app/fonts.ts).
lines.push(`  --font-display: var(--wm-font-display), ${tokens.type.families.display};`);
lines.push(`  --font-serif: var(--wm-font-serif), ${tokens.type.families.serif};`);
lines.push(`  --font-sans: var(--wm-font-sans), ${tokens.type.families.sans};`);
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
