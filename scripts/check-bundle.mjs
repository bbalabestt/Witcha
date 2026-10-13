// Fails if anything server-only leaks into the client bundle (.next/static).
// Run after `pnpm build`. Checks for secret env names, the private-token header, and the
// actual secret values when they are set in the environment.
import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";

const ROOT = ".next/static";
const NEEDLES = [
  "SHOPIFY_STOREFRONT_PRIVATE_TOKEN",
  "SHOPIFY_REVALIDATION_SECRET",
  "Shopify-Storefront-Private-Token",
  "KLAVIYO_PRIVATE_API_KEY",
  "RESEND_API_KEY",
];
for (const key of ["SHOPIFY_STOREFRONT_PRIVATE_TOKEN", "SHOPIFY_REVALIDATION_SECRET", "KLAVIYO_PRIVATE_API_KEY", "RESEND_API_KEY"]) {
  const v = process.env[key];
  if (v && v.length >= 8) NEEDLES.push(v);
}

async function* walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else if (/\.(js|css|json|html|txt)$/.test(entry.name)) yield p;
  }
}

let files = 0;
const hits = [];
try {
  for await (const file of walk(ROOT)) {
    files++;
    const text = await readFile(file, "utf8");
    for (const n of NEEDLES) if (text.includes(n)) hits.push(`${file}: contains ${n.startsWith("SHOPIFY") || n.includes("-") || n.endsWith("KEY") ? n : "a secret value"}`);
  }
} catch (err) {
  console.error(`Could not read ${ROOT}. Run \`pnpm build\` first.`, err.message);
  process.exit(2);
}

if (hits.length) {
  console.error(`Secrets found in client bundle:\n${hits.join("\n")}`);
  process.exit(1);
}
console.log(`Client bundle clean (${files} files checked).`);
