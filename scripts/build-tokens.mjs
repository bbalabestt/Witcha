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
lines.push(`  --font-display: ${tokens.type.families.display};`);
lines.push(`  --font-serif: ${tokens.type.families.serif};`);
lines.push(`  --font-sans: ${tokens.type.families.sans};`);
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
